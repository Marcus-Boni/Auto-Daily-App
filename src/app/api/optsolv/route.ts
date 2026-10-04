import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchOptsolvEntries } from "@/lib/optsolv-service";
import type { OptsolvDataResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<OptsolvDataResponse>> {
  const token = (request.headers.get("x-optsolv-token") || "").trim();
  const userEmail = request.headers.get("x-optsolv-user-email")?.trim() || undefined;

  const searchParams = request.nextUrl.searchParams;
  const requestedHours = Number(searchParams.get("periodHours") || "24");

  const operation = searchParams.get("operation");
  if (operation && operation !== "test")
    return NextResponse.json({ success: false, error: "Operação inválida" }, { status: 400 });
  const periodHours = Number.isFinite(requestedHours)
    ? Math.max(1, Math.min(720, Math.trunc(requestedHours)))
    : 24;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Configuração incompleta",
        details: "Informe a chave de integração ou token do OptSolv.",
      },
      { status: 400 }
    );
  }

  const result = await fetchOptsolvEntries(
    {
      token,
      userEmail,
    },
    periodHours,
    { test: operation === "test", signal: request.signal }
  );

  if (!result.success) {
    const status = result.error?.includes("inválido")
      ? 401
      : result.error?.includes("negado")
        ? 403
        : result.error?.includes("excedido")
          ? 429
          : 500;

    return NextResponse.json(
      {
        success: false,
        error: result.error || "Erro desconhecido",
        details: result.details,
      },
      { status }
    );
  }

  if (operation === "test")
    return NextResponse.json({
      success: true,
      message: "Conexão verificada com acesso de leitura.",
    });

  return NextResponse.json({
    success: true,
    entries: result.entries || [],
  });
}
