import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { HarvestDataResponse, HarvestTimeEntriesResponse, ParsedTimeEntry } from "@/types";

/**
 * GET /api/harvest
 * Fetches time entries from Harvest for the authenticated user.
 * Credentials are passed via HTTP headers for security.
 */
export async function GET(request: NextRequest): Promise<NextResponse<HarvestDataResponse>> {
  try {
    // Extract credentials from headers
    const harvestToken = request.headers.get("x-harvest-token");
    const accountId = request.headers.get("x-harvest-account-id");

    // Validate required headers
    if (!harvestToken || !accountId) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuração incompleta",
          details: "Token e Account ID do Harvest são obrigatórios",
        },
        { status: 400 }
      );
    }

    // Get date range based on period (default: 24 hours)
    const searchParams = request.nextUrl.searchParams;
    const periodHours = parseInt(searchParams.get("periodHours") || "24", 10);

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setTime(fromDate.getTime() - periodHours * 60 * 60 * 1000);

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    // Build Harvest API URL
    const baseUrl = "https://api.harvestapp.com/v2/time_entries";
    const params = new URLSearchParams({
      from: formatDate(fromDate),
      to: formatDate(toDate),
    });

    const apiUrl = `${baseUrl}?${params.toString()}`;

    // Fetch time entries from Harvest
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${harvestToken}`,
        "Harvest-Account-Id": accountId,
        "Content-Type": "application/json",
        "User-Agent": "Auto Daily App (contact@example.com)",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "Token inválido ou expirado",
            details: "Verifique seu Token de acesso do Harvest",
          },
          { status: 401 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            error: "Acesso negado",
            details: "Verifique o Account ID do Harvest",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar registros de tempo",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: HarvestTimeEntriesResponse = await response.json();

    // Parse time entries into a cleaner format
    const entries: ParsedTimeEntry[] = data.time_entries.map((entry) => ({
      id: entry.id,
      project: entry.project.name,
      task: entry.task.name,
      hours: entry.hours,
      notes: entry.notes || "Sem descrição",
      client: entry.client.name,
      date: new Date(entry.spent_date).toLocaleDateString("pt-BR"),
    }));

    return NextResponse.json({
      success: true,
      entries,
    });
  } catch (error) {
    console.error("Harvest API Error:", error);

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
