import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAzureCommits } from "@/lib/azure-service";
import { AIServiceError, generateDailyWithAI } from "@/lib/ai-service";
import { generateDailyPrompt, generateProfessionalPrompt } from "@/lib/constants";
import { fetchHarvestEntries } from "@/lib/harvest-service";
import type {
  GenerateDailyRequest,
  GenerateDailyResponse,
  GenerationMode,
  ParsedCommit,
  ParsedTimeEntry,
  ReportFormat,
} from "@/types";

interface DataSources {
  azure?: ParsedCommit[];
  harvest?: ParsedTimeEntry[];
}

const generateDailySchema = z
  .object({
    mode: z.enum(["azure-only", "harvest-only", "combined-auto", "combined-custom"]),
    customPrompt: z.string().trim().max(10_000).optional(),
    periodHours: z.number().int().min(1).max(720).optional(),
    reportFormat: z.enum(["standard", "professional"]).optional(),
    date: z.string().optional(),
    period: z.enum(["24h", "48h", "72h", "7d", "14d", "30d"]).optional(),
  })
  .strict();

async function fetchAzureData(
  request: NextRequest,
  periodHours: number
): Promise<ParsedCommit[] | null> {
  const pat = request.headers.get("x-azure-pat") || "";
  const organization = request.headers.get("x-azure-organization") || "";
  const project = request.headers.get("x-azure-project") || "";
  const repository = request.headers.get("x-azure-repository") || "";
  const userEmail = request.headers.get("x-azure-user-email") || "";

  if (!pat) {
    return null;
  }

  console.log(`[Generate API] Fetching Azure data directly via service`);

  const result = await fetchAzureCommits(
    {
      pat,
      organization,
      project,
      repository,
      userEmail: userEmail || undefined,
    },
    periodHours
  );

  if (!result.success) {
    console.error(`[Generate API] Azure error: ${result.error} - ${result.details}`);
    return null;
  }

  console.log(`[Generate API] Azure returned ${result.commits?.length || 0} commits`);
  return result.commits || null;
}

async function fetchHarvestData(
  request: NextRequest,
  periodHours: number
): Promise<ParsedTimeEntry[] | null> {
  const token = request.headers.get("x-harvest-token") || "";
  const accountId = request.headers.get("x-harvest-account-id") || "";

  if (!token) {
    return null;
  }

  console.log(`[Generate API] Fetching Harvest data directly via service`);

  const result = await fetchHarvestEntries(
    {
      token,
      accountId,
    },
    periodHours
  );

  if (!result.success) {
    console.error(`[Generate API] Harvest error: ${result.error} - ${result.details}`);
    return null;
  }

  console.log(`[Generate API] Harvest returned ${result.entries?.length || 0} entries`);
  return result.entries || null;
}

async function fetchDataByMode(
  mode: GenerationMode,
  request: NextRequest,
  periodHours: number
): Promise<DataSources> {
  const sources: DataSources = {};

  const hasAzureConfig = request.headers.get("x-azure-pat");
  const hasHarvestConfig = request.headers.get("x-harvest-token");

  switch (mode) {
    case "azure-only":
      if (hasAzureConfig) {
        sources.azure = (await fetchAzureData(request, periodHours)) || undefined;
      }
      break;

    case "harvest-only":
      if (hasHarvestConfig) {
        sources.harvest = (await fetchHarvestData(request, periodHours)) || undefined;
      }
      break;

    case "combined-auto":
    case "combined-custom": {
      const [azureData, harvestData] = await Promise.all([
        hasAzureConfig ? fetchAzureData(request, periodHours) : Promise.resolve(null),
        hasHarvestConfig ? fetchHarvestData(request, periodHours) : Promise.resolve(null),
      ]);

      if (azureData) sources.azure = azureData;
      if (harvestData) sources.harvest = harvestData;
      break;
    }
  }

  return sources;
}

function getSystemPrompt(
  periodHours: number,
  reportFormat: ReportFormat,
  customPrompt?: string
): string {
  if (customPrompt) {
    return customPrompt;
  }

  return reportFormat === "professional"
    ? generateProfessionalPrompt(periodHours)
    : generateDailyPrompt(periodHours);
}

function buildPrompt(
  sources: DataSources,
  periodHours: number,
  reportFormat: ReportFormat,
  customPrompt?: string
): string {
  const parts: string[] = [];

  parts.push(getSystemPrompt(periodHours, reportFormat, customPrompt));
  parts.push("\n---\n");
  parts.push("## Dados disponíveis:\n");

  if (sources.azure && sources.azure.length > 0) {
    parts.push("### Commits do Azure DevOps:\n");
    for (const commit of sources.azure) {
      parts.push(`- **${commit.id}**: ${commit.message}`);
      parts.push(`  - Autor: ${commit.author} | Data: ${commit.date}`);
      parts.push(`  - Alterações: ${commit.changes}\n`);
    }
  } else {
    parts.push("### Commits do Azure DevOps:\n");
    parts.push("_Nenhum commit encontrado no período._\n");
  }

  if (sources.harvest && sources.harvest.length > 0) {
    parts.push("\n### Registros de Tempo (Harvest):\n");

    const byProject = sources.harvest.reduce(
      (acc, entry) => {
        if (!acc[entry.project]) {
          acc[entry.project] = [];
        }
        acc[entry.project].push(entry);
        return acc;
      },
      {} as Record<string, ParsedTimeEntry[]>
    );

    for (const [project, entries] of Object.entries(byProject)) {
      const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
      parts.push(`\n**${project}** (${totalHours.toFixed(2)}h total):`);

      for (const entry of entries) {
        parts.push(`- ${entry.task}: ${entry.hours}h`);
        if (entry.notes !== "Sem descrição") {
          parts.push(`  - Notas: ${entry.notes}`);
        }
      }
    }
  } else {
    parts.push("\n### Registros de Tempo (Harvest):\n");
    parts.push("_Nenhum registro de tempo encontrado no período._\n");
  }

  parts.push("\n---\n");
  parts.push("Com base nesses dados, gere o relatório conforme as instruções acima:");

  return parts.join("\n");
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateDailyResponse>> {
  try {
    const rawBody = (await request.json()) as GenerateDailyRequest;
    const parsedBody = generateDailySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload inválido",
          details: parsedBody.error.issues.map((issue) => issue.message).join("; "),
        },
        { status: 400 }
      );
    }

    const { mode, customPrompt, periodHours = 24, reportFormat = "standard" } = parsedBody.data;

    const sources = await fetchDataByMode(mode, request, periodHours);

    const hasAzureData = sources.azure && sources.azure.length > 0;
    const hasHarvestData = sources.harvest && sources.harvest.length > 0;

    if (!hasAzureData && !hasHarvestData) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum dado encontrado",
          details: "Não foram encontrados commits ou registros de tempo para o período selecionado",
          sources,
        },
        { status: 404 }
      );
    }

    const prompt = buildPrompt(
      sources,
      periodHours,
      reportFormat,
      mode === "combined-custom" ? customPrompt : undefined
    );

    const daily = await generateDailyWithAI(prompt);

    return NextResponse.json({
      success: true,
      daily,
      sources,
    });
  } catch (error) {
    console.error("Generate API Error:", error);

    if (error instanceof AIServiceError) {
      if (error.code === "INVALID_API_KEY") {
        return NextResponse.json(
          {
            success: false,
            error: "API Key do Hugging Face inválida",
            details: "Verifique se a variável HUGGINGFACE_API_KEY está correta",
          },
          { status: 401 }
        );
      }

      if (error.code === "RATE_LIMIT") {
        return NextResponse.json(
          {
            success: false,
            error: "Limite da API excedido",
            details: "Aguarde alguns minutos e tente novamente",
          },
          { status: 429 }
        );
      }

      if (error.code === "PROVIDER_UNAVAILABLE") {
        return NextResponse.json(
          {
            success: false,
            error: "Serviço de IA indisponível",
            details: "Verifique a configuração da API e tente novamente",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao gerar daily",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
