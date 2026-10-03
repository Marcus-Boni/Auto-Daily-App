import type { ParsedTimeEntry } from "@/types";

export interface OptSolvConfig {
  token: string;
  baseUrl?: string;
  userEmail?: string;
}

export interface OptSolvResult {
  success: boolean;
  entries?: ParsedTimeEntry[];
  error?: string;
  details?: string;
}

interface OptSolvTimeEntryDTO {
  id: string;
  userId: string;
  userEmail: string;
  projectId: string;
  projectCode: string;
  projectIntegrationKey: string | null;
  date: string;
  durationMinutes: number;
  billable: boolean;
  status: "draft" | "submitted" | "approved" | "rejected";
  description: string;
  createdAt: string;
}

interface OptSolvResponse {
  data: OptSolvTimeEntryDTO[];
  nextCursor: string | null;
}

const DEFAULT_OPTSOLV_BASE_URL = "https://opt-time.optsolv.com.br/api/v1";

/**
 * Busca entradas de tempo diretamente na API v1 do OptSolv Time Tracker.
 * Suporta autenticação via Bearer token (JWT M2M ou Chave de Integração Padronizada).
 */
export async function fetchOptsolvEntries(
  config: OptSolvConfig,
  periodHours: number
): Promise<OptSolvResult> {
  const { token, baseUrl = DEFAULT_OPTSOLV_BASE_URL, userEmail } = config;

  if (!token) {
    return {
      success: false,
      error: "Configuração incompleta",
      details: "Chave de integração ou token do OptSolv é obrigatório",
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

    const fromStr = formatDate(fromDate);
    const toStr = formatDate(toDate);

    console.log(`[OptSolv Service] Searching entries from ${fromStr} to ${toStr}`);

    const params = new URLSearchParams({
      from: fromStr,
      to: toStr,
      limit: "200",
    });

    const apiUrl = `${baseUrl.replace(/\/$/, "")}/time-entries?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "AutoDaily-App/1.0 (OptSolv Integration)",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OptSolv Service] Error ${response.status}: ${errorText}`);

      if (response.status === 401) {
        return {
          success: false,
          error: "Chave ou token inválido",
          details: "Verifique a Chave de Integração ou Token M2M do OptSolv Time Tracker",
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: "Acesso negado",
          details:
            "Sua credencial não possui permissão de leitura (escopo opt-time.read) no OptSolv",
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          error: "Limite de requisições excedido",
          details: "Aguarde alguns instantes e tente novamente (Rate limit: 600 req/min)",
        };
      }

      return {
        success: false,
        error: "Erro ao buscar registros de tempo do OptSolv",
        details: errorText,
      };
    }

    const data: OptSolvResponse = await response.json();
    let rawEntries = data.data || [];
    console.log(`[OptSolv Service] Found ${rawEntries.length} entries in period`);

    // Filtrar por e-mail do usuário se fornecido
    if (userEmail && userEmail.trim().length > 0) {
      const normalizedUser = userEmail.trim().toLowerCase();
      rawEntries = rawEntries.filter(
        (entry) =>
          entry.userEmail?.toLowerCase() === normalizedUser ||
          entry.userId?.toLowerCase() === normalizedUser
      );
      console.log(`[OptSolv Service] Filtered to ${rawEntries.length} entries for ${userEmail}`);
    }

    const entries: ParsedTimeEntry[] = rawEntries.map((entry) => {
      const hours = Number((entry.durationMinutes / 60).toFixed(2));
      const displayDate = new Date(`${entry.date}T12:00:00Z`).toLocaleDateString("pt-BR");

      return {
        id: entry.id,
        hours,
        notes: entry.description?.trim() || "Sem descrição",
        date: displayDate,
        project: entry.projectCode || "OptSolv",
        task: entry.projectIntegrationKey || entry.projectCode || "Desenvolvimento",
        client: entry.projectIntegrationKey || "OptSolv",
        userEmail: entry.userEmail,
      };
    });

    return {
      success: true,
      entries,
    };
  } catch (error) {
    console.error("[OptSolv Service] Error:", error);

    return {
      success: false,
      error: "Erro interno ao comunicar com OptSolv",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
