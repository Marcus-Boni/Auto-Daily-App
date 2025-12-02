import type { ParsedTimeEntry } from "@/types";

export interface HarvestConfig {
  token: string;
  accountId: string;
}

export interface HarvestResult {
  success: boolean;
  entries?: ParsedTimeEntry[];
  error?: string;
  details?: string;
}

interface HarvestTimeEntry {
  id: number;
  hours: number;
  notes: string | null;
  spent_date: string;
  project: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    name: string;
  };
  client: {
    id: number;
    name: string;
  };
}

interface HarvestResponse {
  time_entries: HarvestTimeEntry[];
  total_entries: number;
}

export async function fetchHarvestEntries(
  config: HarvestConfig,
  periodHours: number
): Promise<HarvestResult> {
  const { token, accountId } = config;

  if (!token || !accountId) {
    return {
      success: false,
      error: "Configuração incompleta",
      details: "Token e Account ID são obrigatórios",
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

    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    console.log(
      `[Harvest Service] Searching entries from ${formatDate(fromDate)} to ${formatDate(toDate)}`
    );

    const params = new URLSearchParams({
      from: formatDate(fromDate),
      to: formatDate(toDate),
    });

    const apiUrl = `https://api.harvestapp.com/v2/time_entries?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Harvest-Account-Id": accountId,
        "Content-Type": "application/json",
        "User-Agent": "AutoDaily App (marcus.boni@optsol.com.br)",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Harvest Service] Error ${response.status}: ${errorText}`);

      if (response.status === 401) {
        return {
          success: false,
          error: "Token inválido ou expirado",
          details: "Verifique seu Personal Access Token do Harvest",
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: "Acesso negado",
          details: "Verifique o Account ID do Harvest",
        };
      }

      return {
        success: false,
        error: "Erro ao buscar registros de tempo",
        details: errorText,
      };
    }

    const data: HarvestResponse = await response.json();
    console.log(`[Harvest Service] Found ${data.time_entries?.length || 0} entries`);

    const entries: ParsedTimeEntry[] = data.time_entries.map((entry) => ({
      id: entry.id,
      hours: entry.hours,
      notes: entry.notes || "Sem descrição",
      date: new Date(entry.spent_date).toLocaleDateString("pt-BR"),
      project: entry.project.name,
      task: entry.task.name,
      client: entry.client.name,
    }));

    return {
      success: true,
      entries,
    };
  } catch (error) {
    console.error("[Harvest Service] Error:", error);

    return {
      success: false,
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
