import { auth } from "@/lib/auth";
import { dailies, db } from "@/lib/db/index";
import type { GenerationMode, ReportFormat, SourceStatuses, SourceWindow } from "@/types";

interface SaveDailyOptions {
  headers: Headers;
  content: string;
  mode: GenerationMode;
  period?: string;
  periodHours: number;
  reportFormat: ReportFormat;
  customPrompt?: string;
  sourceStatus: SourceStatuses;
  window: SourceWindow;
}

/**
 * Attempts to save a generated daily report to the database if the user is authenticated.
 * Fails silently with a server log if the user is not authenticated or if database is unreachable,
 * ensuring the generation flow is never interrupted.
 */
export async function saveDailyIfAuthenticated(options: SaveDailyOptions): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: options.headers });
    if (!session?.user?.id) {
      return;
    }

    const now = new Date();
    await db.insert(dailies).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      content: options.content,
      mode: options.mode,
      period: options.period ?? `${options.periodHours}h`,
      periodHours: options.periodHours,
      reportFormat: options.reportFormat,
      customPrompt: options.customPrompt || null,
      sourcesSummary: JSON.stringify(options.sourceStatus),
      windowStart: options.window.start,
      windowEnd: options.window.end,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[daily-history] Não foi possível persistir daily no histórico:", error);
  }
}
