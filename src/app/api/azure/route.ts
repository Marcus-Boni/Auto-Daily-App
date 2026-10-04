import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchAzureCommits } from "@/lib/azure-service";
import type { AzureDataResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<AzureDataResponse>> {
  const azurePat = (request.headers.get("x-azure-pat") || "").trim();
  const organization = (request.headers.get("x-azure-organization") || "").trim();
  const project = (request.headers.get("x-azure-project") || "").trim();
  const repository = (request.headers.get("x-azure-repository") || "").trim();
  const userEmail = (request.headers.get("x-azure-user-email") || "").trim();

  const searchParams = request.nextUrl.searchParams;
  const requestedHours = Number(searchParams.get("periodHours") || "24");

  const operation = searchParams.get("operation");
  if (operation && operation !== "test")
    return NextResponse.json({ success: false, error: "Operação inválida" }, { status: 400 });
  const periodHours = Number.isFinite(requestedHours)
    ? Math.max(1, Math.min(720, Math.trunc(requestedHours)))
    : 24;

  if (!azurePat || !organization || !project || !repository) {
    return NextResponse.json(
      {
        success: false,
        error: "Configuração incompleta",
        details: "PAT, Organização, Projeto e Repositório são obrigatórios.",
      },
      { status: 400 }
    );
  }

  const result = await fetchAzureCommits(
    {
      pat: azurePat,
      organization,
      project,
      repository,
      userEmail: userEmail || undefined,
    },
    periodHours,
    { test: operation === "test", signal: request.signal }
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

  if (operation === "test")
    return NextResponse.json({
      success: true,
      message: "Conexão verificada com acesso de leitura.",
    });

  return NextResponse.json({
    success: true,
    commits: result.commits || [],
  });
}
