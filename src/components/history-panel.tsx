"use client";

import { Calendar, Check, Clock, Copy, History, LogIn, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth/auth-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

interface DailyRecordItem {
  id: string;
  content: string;
  mode: string;
  period: string;
  periodHours: number;
  reportFormat: string;
  customPrompt?: string;
  sourcesSummary?: Record<string, unknown>;
  windowStart?: string;
  windowEnd?: string;
  generatedAt: string;
}

export function HistoryPanel() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dailies, setDailies] = useState<DailyRecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dailies");
      if (!res.ok) throw new Error("Falha ao carregar histórico");
      const data = await res.json();
      if (data.success) {
        setDailies(data.dailies || []);
      }
    } catch {
      toast.error("Não foi possível carregar o histórico de dailies.");
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Texto copiado para a área de transferência!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erro ao copiar texto.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dailies?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir daily");
      setDailies((prev) => prev.filter((d) => d.id !== id));
      toast.success("Daily removida do histórico.");
    } catch {
      toast.error("Não foi possível excluir a daily.");
    }
  };

  const filteredDailies = useMemo(() => {
    if (!search.trim()) return dailies;
    const term = search.toLowerCase();
    return dailies.filter(
      (d) =>
        d.content.toLowerCase().includes(term) ||
        d.mode.toLowerCase().includes(term) ||
        new Date(d.generatedAt).toLocaleDateString("pt-BR").includes(term)
    );
  }, [dailies, search]);

  if (sessionLoading) {
    return (
      <main id="main" className="app-main">
        <div className="history-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main id="main" className="app-main">
        <header className="page-header">
          <div>
            <h1 id="history-heading" tabIndex={-1} className="page-title flex items-center gap-2.5">
              <History className="size-6 text-primary" />
              Histórico de Dailies
            </h1>
            <p className="page-description">
              Consulte seus relatórios gerados a qualquer momento, organizados na nuvem.
            </p>
          </div>
        </header>

        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <History className="size-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Acesse o histórico com sua conta gratuita
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Ao se conectar, cada daily gerada é automaticamente salva no banco de dados em nuvem
            para você consultar, pesquisar e reutilizar quando quiser.
          </p>
          <Button className="mt-6 gap-2" onClick={() => setAuthModalOpen(true)}>
            <LogIn className="size-4" />
            Entrar ou Criar conta
          </Button>
        </div>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </main>
    );
  }

  return (
    <main id="main" className="app-main">
      <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="history-heading" tabIndex={-1} className="page-title flex items-center gap-2.5">
            <History className="size-6 text-primary" />
            Histórico de Dailies
          </h1>
          <p className="page-description">
            {dailies.length === 1
              ? "1 daily arquivada na sua conta."
              : `${dailies.length} dailies arquivadas na sua conta.`}
          </p>
        </div>

        {dailies.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Buscar no histórico..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </header>

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      ) : filteredDailies.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
          <History className="size-10 text-muted-foreground/60" />
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {search ? "Nenhuma daily encontrada para a busca." : "Nenhuma daily arquivada ainda."}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Tente buscar por outra palavra-chave ou data."
              : "Gere seu próximo relato na aba Daily e ele aparecerá aqui automaticamente!"}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredDailies.map((item) => {
            const date = new Date(item.generatedAt);
            const formattedDate = date.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const formattedTime = date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Card
                key={item.id}
                className="transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Calendar className="size-3.5 text-primary" />
                        {formattedDate} às {formattedTime}
                      </span>
                      <Badge variant="outline" className="text-[11px] uppercase tracking-wider">
                        {item.period}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px]">
                        {item.reportFormat === "professional" ? "Executivo" : "Daily Scrum"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Clock className="size-3" />
                      Janela: {item.periodHours} horas
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2 text-xs"
                      onClick={() => handleCopy(item.id, item.content)}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 px-2"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Excluir daily"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="markdown-preview max-h-60 overflow-y-auto rounded-lg border border-border/50 bg-muted/20 p-3.5 text-xs text-foreground/90">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
