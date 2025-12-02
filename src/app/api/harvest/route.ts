import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchHarvestEntries } from "@/lib/harvest-service";
import type { HarvestDataResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<HarvestDataResponse>> {
  const harvestToken = request.headers.get("x-harvest-token") || "";
  const accountId = request.headers.get("x-harvest-account-id") || "";

  const searchParams = request.nextUrl.searchParams;
  const periodHours = parseInt(searchParams.get("periodHours") || "24", 10);

  const result = await fetchHarvestEntries(
    {
      token: harvestToken,
      accountId,
    },
    periodHours
  );

  if (!result.success) {
    const status = result.error?.includes("Token")
      ? 401
      : result.error?.includes("negado")
        ? 403
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
