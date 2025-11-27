import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AzureCommitsResponse, AzureDataResponse, ParsedCommit } from "@/types";

/**
 * GET /api/azure
 * Fetches commits from Azure DevOps for the authenticated user.
 * Credentials are passed via HTTP headers for security.
 */
export async function GET(request: NextRequest): Promise<NextResponse<AzureDataResponse>> {
  try {
    // Extract credentials from headers
    const azurePat = request.headers.get("x-azure-pat");
    const organization = request.headers.get("x-azure-organization");
    const project = request.headers.get("x-azure-project");
    const repository = request.headers.get("x-azure-repository");
    const userEmail = request.headers.get("x-azure-user-email");

    // Validate required headers
    if (!azurePat || !organization || !project || !repository) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuração incompleta",
          details: "PAT, Organização, Projeto e Repositório são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Get date range (last 24 hours by default)
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const fromDate = new Date(targetDate);
    fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(targetDate);
    toDate.setHours(23, 59, 59, 999);

    // Build Azure DevOps API URL
    const baseUrl = `https://dev.azure.com/${encodeURIComponent(organization)}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repository)}/commits`;

    const params = new URLSearchParams({
      "api-version": "7.1",
      "searchCriteria.fromDate": fromDate.toISOString(),
      "searchCriteria.toDate": toDate.toISOString(),
      $top: "100",
    });

    // Add author filter if email is provided
    if (userEmail) {
      params.append("searchCriteria.author", userEmail);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Create Basic Auth header
    const authHeader = `Basic ${Buffer.from(`:${azurePat}`).toString("base64")}`;

    // Fetch commits from Azure DevOps
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "Token inválido ou expirado",
            details: "Verifique seu Personal Access Token do Azure DevOps",
          },
          { status: 401 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Recurso não encontrado",
            details: "Verifique o nome da organização, projeto e repositório",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar commits",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: AzureCommitsResponse = await response.json();

    // Parse commits into a cleaner format
    const commits: ParsedCommit[] = data.value.map((commit) => ({
      id: commit.commitId.substring(0, 8),
      message: commit.comment.split("\n")[0], // First line only
      author: commit.author.name,
      date: new Date(commit.author.date).toLocaleString("pt-BR"),
      changes: `+${commit.changeCounts?.Add || 0} ~${commit.changeCounts?.Edit || 0} -${commit.changeCounts?.Delete || 0}`,
    }));

    return NextResponse.json({
      success: true,
      commits,
    });
  } catch (error) {
    console.error("Azure API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
