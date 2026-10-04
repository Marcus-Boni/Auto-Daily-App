"use client";

import { Check, Cloud, Loader2, LogIn, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth/auth-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserConfig } from "@/hooks/use-user-config";
import { signOut, useSession } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { config, updateConfig } = useUserConfig();

  // Sync credentials to encrypted vault
  const handleSyncToVault = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          azureOrganization: config.azureOrganization,
          azureProject: config.azureProject,
          azureRepository: config.azureRepositoryId,
          azureUserEmail: config.azureUserEmail,
          azurePat: config.azurePat,
          optsolvUserEmail: config.optsolvUserEmail,
          optsolvToken: config.optsolvToken,
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar no cofre");
      }

      toast.success("Credenciais criptografadas e sincronizadas no cofre!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao sincronizar com o cofre");
    } finally {
      setSyncing(false);
    }
  };

  // Restore credentials from encrypted vault
  const handleRestoreFromVault = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/user/integrations");
      if (!res.ok) throw new Error("Falha ao consultar cofre");
      const data = await res.json();

      if (!data.integrations) {
        toast.info("Nenhuma credencial encontrada no seu cofre na nuvem.");
        return;
      }

      const {
        azureOrganization,
        azureProject,
        azureRepository,
        azureUserEmail,
        azurePat,
        optsolvUserEmail,
        optsolvToken,
      } = data.integrations;

      updateConfig({
        azureOrganization: azureOrganization || "",
        azureProject: azureProject || "",
        azureRepositoryId: azureRepository || "",
        azureUserEmail: azureUserEmail || "",
        azurePat: azurePat || "",
        optsolvUserEmail: optsolvUserEmail || "",
        optsolvToken: optsolvToken || "",
      });

      toast.success("Credenciais restauradas do cofre com sucesso!");
      setProfileModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao restaurar do cofre");
    } finally {
      setSyncing(false);
    }
  };

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!session?.user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium"
          onClick={() => setAuthModalOpen(true)}
        >
          <LogIn className="size-3.5" />
          <span>Entrar</span>
        </Button>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  const user = session.user;
  const initial = user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="focus-visible:ring-ring flex size-8 items-center justify-center rounded-full border border-border/80 bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2"
            onClick={() => setProfileModalOpen(true)}
            aria-label={`Perfil de ${user.name || user.email}`}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "Avatar"}
                width={32}
                height={32}
                unoptimized
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          <span>{user.name || user.email}</span>
        </TooltipContent>
      </Tooltip>

      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              Sua Conta
            </DialogTitle>
            <DialogDescription>
              Gerencie sua sessão e sincronize credenciais criptografadas no cofre.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  width={40}
                  height={40}
                  unoptimized
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{user.name || "Usuário"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <ShieldCheck className="size-3" />
              Ativo
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Cofre Criptografado (AES-256)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleSyncToVault}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Cloud className="size-3.5" />
                )}
                Salvar no Cofre
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleRestoreFromVault}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Restaurar do Cofre
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Seus tokens são criptografados no servidor com chave de 256 bits antes de serem salvos
              no banco.
            </p>
          </div>

          <div className="border-t border-border/60 pt-4">
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={async () => {
                await signOut();
                toast.success("Você saiu da conta.");
                setProfileModalOpen(false);
              }}
            >
              <LogOut className="size-4" />
              Sair da conta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
