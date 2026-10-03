import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchOptsolvEntries } from "@/lib/optsolv-service";
import type { OptsolvDataResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<OptsolvDataResponse>> {
  const token = request.headers.get("x-optsolv-token") || "";
  const userEmail = request.headers.get("x-optsolv-user-email") || undefined;

  const searchParams = request.nextUrl.searchParams;
  const periodHours = Number.parseInt(searchParams.get("periodHours") || "24", 10);

  const result = await fetchOptsolvEntries(
    {
      token,
      userEmail,
    },
    periodHours
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

  return NextResponse.json({
    success: true,
    entries: result.entries || [],
  });
}
