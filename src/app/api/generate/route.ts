import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateDailyPrompt, generateProfessionalPrompt } from "@/lib/constants";
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

async function fetchAzureData(
  headers: Headers,
  periodHours: number
): Promise<ParsedCommit[] | null> {
  try {
    const baseUrl = new URL("/api/azure", "http://localhost:3000");
    baseUrl.searchParams.set("periodHours", periodHours.toString());

    const response = await fetch(baseUrl.toString(), {
      method: "GET",
      headers: {
        "x-azure-pat": headers.get("x-azure-pat") || "",
        "x-azure-organization": headers.get("x-azure-organization") || "",
        "x-azure-project": headers.get("x-azure-project") || "",
        "x-azure-repository": headers.get("x-azure-repository") || "",
        "x-azure-user-email": headers.get("x-azure-user-email") || "",
      },
    });

    const data = await response.json();
    return data.success ? data.commits : null;
  } catch (error) {
    console.error("Error fetching Azure data:", error);
    return null;
  }
}

async function fetchHarvestData(
  headers: Headers,
  periodHours: number
): Promise<ParsedTimeEntry[] | null> {
  try {
    const baseUrl = new URL("/api/harvest", "http://localhost:3000");
    baseUrl.searchParams.set("periodHours", periodHours.toString());

    const response = await fetch(baseUrl.toString(), {
      method: "GET",
      headers: {
        "x-harvest-token": headers.get("x-harvest-token") || "",
        "x-harvest-account-id": headers.get("x-harvest-account-id") || "",
      },
    });

    const data = await response.json();
    return data.success ? data.entries : null;
  } catch (error) {
    console.error("Error fetching Harvest data:", error);
    return null;
  }
}

async function fetchDataByMode(
  mode: GenerationMode,
  headers: Headers,
  periodHours: number
): Promise<DataSources> {
  const sources: DataSources = {};

  const hasAzureConfig = headers.get("x-azure-pat");
  const hasHarvestConfig = headers.get("x-harvest-token");

  switch (mode) {
    case "azure-only":
      if (hasAzureConfig) {
        sources.azure = (await fetchAzureData(headers, periodHours)) || undefined;
      }
      break;

    case "harvest-only":
      if (hasHarvestConfig) {
        sources.harvest = (await fetchHarvestData(headers, periodHours)) || undefined;
      }
      break;

    case "combined-auto":
    case "combined-custom": {
      const [azureData, harvestData] = await Promise.all([
        hasAzureConfig ? fetchAzureData(headers, periodHours) : Promise.resolve(null),
        hasHarvestConfig ? fetchHarvestData(headers, periodHours) : Promise.resolve(null),
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
    const body: GenerateDailyRequest = await request.json();
    const { mode, customPrompt, periodHours = 24, reportFormat = "standard" } = body;

    if (!mode) {
      return NextResponse.json(
        {
          success: false,
          error: "Modo de geração não especificado",
        },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY environment variable is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Serviço de IA indisponível",
          details: "Entre em contato com o administrador do sistema",
        },
        { status: 503 }
      );
    }

    const sources = await fetchDataByMode(mode, request.headers, periodHours);

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

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const daily = response.text();

    return NextResponse.json({
      success: true,
      daily,
      sources,
    });
  } catch (error) {
    console.error("Generate API Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API_KEY_INVALID")) {
        return NextResponse.json(
          {
            success: false,
            error: "API Key do Gemini inválida",
            details: "Verifique se a API Key está correta",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("QUOTA_EXCEEDED")) {
        return NextResponse.json(
          {
            success: false,
            error: "Quota da API excedida",
            details: "Aguarde alguns minutos e tente novamente",
          },
          { status: 429 }
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
