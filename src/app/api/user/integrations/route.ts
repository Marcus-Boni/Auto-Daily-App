import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, userIntegrations } from "@/lib/db/index";
import { decryptSecret, encryptSecret } from "@/lib/vault";

const integrationsSchema = z.object({
  azureOrganization: z.string().trim().optional(),
  azureProject: z.string().trim().optional(),
  azureRepository: z.string().trim().optional(),
  azureUserEmail: z.string().trim().email().or(z.literal("")).optional(),
  azurePat: z.string().trim().optional(),
  optsolvUserEmail: z.string().trim().email().or(z.literal("")).optional(),
  optsolvToken: z.string().trim().optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    }

    const record = await db.query.userIntegrations.findFirst({
      where: eq(userIntegrations.userId, session.user.id),
    });

    if (!record) {
      return NextResponse.json({ success: true, integrations: null });
    }

    return NextResponse.json({
      success: true,
      integrations: {
        azureOrganization: record.azureOrganization || "",
        azureProject: record.azureProject || "",
        azureRepository: record.azureRepository || "",
        azureUserEmail: record.azureUserEmail || "",
        azurePat: decryptSecret(record.encryptedAzurePat) || "",
        optsolvUserEmail: record.optsolvUserEmail || "",
        optsolvToken: decryptSecret(record.encryptedOptsolvToken) || "",
      },
    });
  } catch (error) {
    console.error("[user/integrations] Erro ao buscar integrações:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar configurações salvas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = integrationsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: parsed.error.issues.map((i) => i.message).join("; "),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date();

    const encryptedAzurePat = encryptSecret(data.azurePat);
    const encryptedOptsolvToken = encryptSecret(data.optsolvToken);

    await db
      .insert(userIntegrations)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        azureOrganization: data.azureOrganization || null,
        azureProject: data.azureProject || null,
        azureRepository: data.azureRepository || null,
        azureUserEmail: data.azureUserEmail || null,
        encryptedAzurePat,
        optsolvUserEmail: data.optsolvUserEmail || null,
        encryptedOptsolvToken,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userIntegrations.userId,
        set: {
          azureOrganization: data.azureOrganization || null,
          azureProject: data.azureProject || null,
          azureRepository: data.azureRepository || null,
          azureUserEmail: data.azureUserEmail || null,
          encryptedAzurePat,
          optsolvUserEmail: data.optsolvUserEmail || null,
          encryptedOptsolvToken,
          updatedAt: now,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Configurações sincronizadas no cofre com sucesso.",
    });
  } catch (error) {
    console.error("[user/integrations] Erro ao salvar integrações:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao salvar configurações" },
      { status: 500 }
    );
  }
}
