import type { AzureCommitsResponse, ParsedCommit } from "@/types";

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
  periodHours: number
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
    const now = new Date();

    const toDate = new Date(now);
    toDate.setHours(23, 59, 59, 999);

    const fromDate = new Date(now);
    if (periodHours === 0) {
      fromDate.setHours(0, 0, 0, 0);
    } else {
      fromDate.setTime(fromDate.getTime() - periodHours * 60 * 60 * 1000);
      fromDate.setHours(0, 0, 0, 0);
    }

    console.log(
      `[Azure Service] Searching commits from ${fromDate.toISOString()} to ${toDate.toISOString()}`
    );

    const baseUrl = `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repository)}/commits`;

    const params = new URLSearchParams({
      "api-version": "7.1",
      "searchCriteria.fromDate": fromDate.toISOString(),
      "searchCriteria.toDate": toDate.toISOString(),
      $top: "100",
    });

    if (userEmail) {
      params.append("searchCriteria.author", userEmail);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log(`[Azure Service] Request URL: ${apiUrl}`);

    const authHeader = `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Azure Service] Error ${response.status}: ${errorText}`);

      if (response.status === 401) {
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
        details: errorText,
      };
    }

    const data: AzureCommitsResponse = await response.json();
    console.log(`[Azure Service] Found ${data.value?.length || 0} commits`);

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
    console.error("[Azure Service] Error:", error);

    return {
      success: false,
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
