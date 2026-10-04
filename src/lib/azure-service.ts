import type { AzureCommitsResponse, ParsedCommit, SourceWindow } from "@/types";

export interface AzureConfig {
  pat: string;
  organization: string;
  project: string;
  repository: string;
  userEmail?: string;
}

export interface AzureResult {
  success: boolean;
  commits?: ParsedCommit[];
  error?: string;
  details?: string;
}

export async function fetchAzureCommits(
  config: AzureConfig,
  periodHours: number,
  options: { window?: SourceWindow; test?: boolean; signal?: AbortSignal } = {}
): Promise<AzureResult> {
  const { pat, organization, project, repository, userEmail } = config;

  if (!pat || !organization || !project || !repository) {
    return {
      success: false,
      error: "Configuração incompleta",
      details: "PAT, Organização, Projeto e Repositório são obrigatórios",
    };
  }

  try {
    const end = options.window?.end ?? new Date().toISOString();
    const start =
      options.window?.start ??
      new Date(
        new Date(end).getTime() - Math.max(1, Math.min(720, periodHours || 24)) * 3_600_000
      ).toISOString();
    // Helper function to safely decode URI components that might be double-encoded
    // Some environments (like Azure App Service) may pre-encode header values
    const safeEncode = (value: string): string => {
      try {
        // First, try to decode in case it's already encoded
        const decoded = decodeURIComponent(value);
        // Then encode it properly
        return encodeURIComponent(decoded);
      } catch {
        // If decoding fails, the value wasn't encoded, so just encode it
        return encodeURIComponent(value);
      }
    };

    // The project name may contain special characters that need URL encoding
    // We need to encode each path segment for the URL
    const baseUrl = `https://dev.azure.com/${safeEncode(organization)}/${safeEncode(project)}/_apis/git/repositories/${safeEncode(repository)}/commits`;

    const params = new URLSearchParams({
      "api-version": "7.1",
      "searchCriteria.fromDate": start,
      "searchCriteria.toDate": end,
      $top: options.test ? "1" : "100",
    });

    if (userEmail) {
      params.append("searchCriteria.author", userEmail);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    const authHeader = `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
      signal: options.signal
        ? AbortSignal.any([AbortSignal.timeout(15_000), options.signal])
        : AbortSignal.timeout(15_000),
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Check content type before trying to parse JSON
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: "Token inválido ou expirado",
          details:
            "Verifique seu Personal Access Token do Azure DevOps. Ele pode ter expirado ou não ter permissões suficientes (Code > Read).",
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Recurso não encontrado",
          details: "Verifique o nome da organização, projeto e repositório",
        };
      }

      return {
        success: false,
        error: "Erro ao buscar commits",
        details: `A consulta ao Azure DevOps falhou (HTTP ${response.status}). Tente novamente.`,
      };
    }

    // Verify response is JSON before parsing
    if (!contentType.includes("application/json")) {
      return {
        success: false,
        error: "Resposta inesperada do Azure DevOps",
        details: "O servidor não retornou dados JSON válidos.",
      };
    }

    const data: AzureCommitsResponse = await response.json();

    if (!Array.isArray(data.value)) throw new Error("Invalid response");
    if (options.test) return { success: true, commits: [] };

    const commits: ParsedCommit[] = data.value.map((commit) => ({
      id: commit.commitId.substring(0, 8),
      message: commit.comment.split("\n")[0],
      author: commit.author.name,
      date: new Date(commit.author.date).toLocaleString("pt-BR"),
      changes: `+${commit.changeCounts?.Add || 0} ~${commit.changeCounts?.Edit || 0} -${commit.changeCounts?.Delete || 0}`,
    }));

    return {
      success: true,
      commits,
    };
  } catch (error) {
    return {
      success: false,
      error: "Erro interno do servidor",
      details:
        error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
          ? "A consulta excedeu o tempo limite. Tente novamente."
          : "Não foi possível consultar a fonte. Verifique a configuração e tente novamente.",
    };
  }
}
