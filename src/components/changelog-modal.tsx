"use client";

import { Bot, CheckCircle2, ExternalLink, History, Lock, Sparkles, Zap } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { APP_VERSION, RELEASES_URL } from "@/lib/version";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <Badge variant="outline" className="font-mono text-xs font-semibold">
              v{APP_VERSION}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold">Novidades do Auto Daily</DialogTitle>
          <DialogDescription>
            Notas da versão oficial 1.0.0 com arquitetura moderna e nuvem integrada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1 text-sm">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="size-4" />
              <span>Versão 1.0.0 — Lançamento Oficial</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              A evolução completa do Auto Daily: de ferramenta local para uma plataforma
              profissional conectada à nuvem.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Bot className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  IA Otimizada com Qwen 2.5 Coder
                </h3>
                <p className="text-xs text-muted-foreground">
                  Geração estruturada com Qwen2.5-Coder-7B e fallback automático para Llama-3.1-8B
                  no roteador Hugging Face.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Lock className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  Autenticação & Cofre Criptografado (AES-256)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Login via GitHub OAuth ou Email/Senha com Better Auth. Tokens do Azure e OptSolv
                  são criptografados no servidor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <History className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  Banco de Dados Serverless & Histórico
                </h3>
                <p className="text-xs text-muted-foreground">
                  Turso (libSQL) em São Paulo com Drizzle ORM. Cada relatório gerado fica arquivado
                  com busca rápida e cópia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Produção Ativa na Vercel</h3>
                <p className="text-xs text-muted-foreground">
                  Deploy contínuo e tempo limite estendido (`maxDuration = 60s`) para geração fluida
                  sem interrupções.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Sistema estável em produção
            </span>
            <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
              <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
                <span>Ver no GitHub</span>
                <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
