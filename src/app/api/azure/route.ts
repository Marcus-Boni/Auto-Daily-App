import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchAzureCommits } from "@/lib/azure-service";
import type { AzureDataResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<AzureDataResponse>> {
  const azurePat = request.headers.get("x-azure-pat") || "";
  const organization = request.headers.get("x-azure-organization") || "";
  const project = request.headers.get("x-azure-project") || "";
  const repository = request.headers.get("x-azure-repository") || "";
  const userEmail = request.headers.get("x-azure-user-email") || "";

  // Debug logging for production
  console.log("[Azure API Route] Headers received:", {
    hasPat: !!azurePat && azurePat.length > 0,
    patLength: azurePat.length,
    organization,
    project,
    repository,
    userEmail: userEmail || "(not provided)",
  });

  const searchParams = request.nextUrl.searchParams;
  const periodHours = parseInt(searchParams.get("periodHours") || "24", 10);

  const result = await fetchAzureCommits(
    {
      pat: azurePat,
      organization,
      project,
      repository,
      userEmail: userEmail || undefined,
    },
    periodHours
  );

  if (!result.success) {
    const status = result.error?.includes("Token")
      ? 401
      : result.error?.includes("não encontrado")
        ? 404
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
    commits: result.commits || [],
  });
}
