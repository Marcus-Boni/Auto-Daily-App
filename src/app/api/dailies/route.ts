import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dailies, db } from "@/lib/db/index";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50", 10), 100);

    const records = await db.query.dailies.findMany({
      where: eq(dailies.userId, session.user.id),
      orderBy: [desc(dailies.generatedAt)],
      limit,
    });

    return NextResponse.json({
      success: true,
      dailies: records.map((record) => ({
        id: record.id,
        content: record.content,
        mode: record.mode,
        period: record.period,
        periodHours: record.periodHours,
        reportFormat: record.reportFormat,
        customPrompt: record.customPrompt,
        sourcesSummary: record.sourcesSummary ? JSON.parse(record.sourcesSummary) : null,
        windowStart: record.windowStart,
        windowEnd: record.windowEnd,
        generatedAt: record.generatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[dailies] Erro ao listar histórico:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao listar histórico de dailies" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID obrigatório" }, { status: 400 });
    }

    await db.delete(dailies).where(and(eq(dailies.id, id), eq(dailies.userId, session.user.id)));

    return NextResponse.json({ success: true, message: "Daily excluída com sucesso" });
  } catch (error) {
    console.error("[dailies] Erro ao excluir daily:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao excluir daily do histórico" },
      { status: 500 }
    );
  }
}
