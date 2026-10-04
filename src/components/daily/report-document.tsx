"use client";
import { AlertCircle, ArrowRight, Check, Copy, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DailyGeneration } from "@/hooks/use-daily-generation";
import { TIME_PERIODS } from "@/lib/constants";

interface DailyProps {
  daily: DailyGeneration;
  onNavigate: (view: "daily" | "integrations" | "guide") => void;
}
const markdownComponents: Components = {
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  a: ({ children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};
export function ReportDocument({
  daily,
  onNavigate,
  hasAnySource,
}: DailyProps & { hasAnySource: boolean }) {
  const { state } = daily;
  const [copied, setCopied] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );
  useEffect(() => {
    if (state.editing) editor.current?.focus();
  }, [state.editing]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.content);
      setCopied(true);
      toast.success("Rascunho copiado para a área de transferência.");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      daily.setEditing(true);
      toast.error(
        "A cópia automática não está disponível. Use o editor para selecionar e copiar o texto."
      );
    }
  };
  const title =
    state.result?.reportFormat === "professional"
      ? "Resumo de atividades"
      : "Daily de desenvolvimento";
  const period = TIME_PERIODS.find((option) => option.value === state.result?.period)?.label;
  const partial =
    state.result &&
    Object.values(state.result.sourceStatus ?? {}).some(
      (source) => source.status === "error" || source.status === "not-configured"
    );
  return (
    <section className="document" aria-label="Revisão da daily">
      <div className="document-toolbar">
        <span className="document-title">
          <FileText aria-hidden="true" />
          Seu rascunho
        </span>
        <div className="document-actions">
          <Button
            type="button"
            variant="ghost"
            disabled={!state.result}
            onClick={() => daily.setEditing(!state.editing)}
            aria-pressed={state.editing}
          >
            {state.editing ? "Concluir edição" : "Editar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!state.result || !state.content.trim()}
            onClick={() => void copy()}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "Texto copiado" : "Copiar texto"}
          </Button>
        </div>
      </div>
      {state.loading && (
        <div className="generation-feedback" role="status">
          <span className="loading-mark" aria-hidden="true" />
          <span>
            Consultando as fontes e preparando o rascunho.{" "}
            {state.result
              ? "Seu texto anterior continua disponível."
              : "Isso pode levar alguns instantes."}
          </span>
        </div>
      )}
      {state.error && (
        <div className="generation-feedback" data-tone="error" role="alert">
          <AlertCircle aria-hidden="true" />
          <div>
            <p>{state.error}</p>
            {state.failedSources && (
              <ul className="failed-sources">
                {Object.entries(state.failedSources)
                  .filter(([, status]) => status.status !== "success")
                  .map(([provider, status]) => (
                    <li key={provider}>
                      <strong>
                        {provider === "azure" ? "Azure DevOps" : "OptSolv Time Tracker"}:
                      </strong>{" "}
                      {status.status === "empty"
                        ? "Nenhum registro no período."
                        : status.message || "Fonte indisponível."}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {partial && (
        <div className="generation-feedback" data-tone="warning">
          <AlertCircle aria-hidden="true" />
          <p>
            Uma fonte selecionada não pôde ser consultada. Confira abaixo quais registros foram
            usados neste rascunho.
          </p>
        </div>
      )}
      {state.pending && (
        <div className="draft-choice" role="status">
          <p>Um novo rascunho está pronto. Suas edições permanecem no documento atual.</p>
          <div>
            <Button type="button" onClick={daily.accept}>
              Usar novo rascunho
            </Button>
            <Button type="button" variant="outline" onClick={daily.keep}>
              Manter minhas edições
            </Button>
          </div>
        </div>
      )}
      {state.result ? (
        <div className="document-body">
          <div className="report-meta">
            <span>{period}</span>
            <span>Gerado {formatDate(state.result.generatedAt)}</span>
          </div>
          <h2>{title}</h2>
          {state.result.window && (
            <p className="report-intro">
              De {formatDate(state.result.window.start)} até {formatDate(state.result.window.end)}.
              Horário local do navegador.
            </p>
          )}
          {state.editing ? (
            <div className="report-editor">
              <label htmlFor="report-editor">Editar rascunho em Markdown</label>
              <Textarea
                ref={editor}
                id="report-editor"
                rows={18}
                value={state.content}
                onChange={(event) => daily.edit(event.target.value)}
                aria-describedby="editor-help"
              />
              <p className="field-help" id="editor-help">
                O texto permanece nesta sessão. Selecione e copie manualmente se necessário.
              </p>
            </div>
          ) : (
            <div className="report-preview">
              <ReactMarkdown components={markdownComponents}>{state.content}</ReactMarkdown>
            </div>
          )}
          <div className="review-reminder">
            <Check aria-hidden="true" />
            <p>
              Confirme os próximos passos e os impedimentos. As fontes registram atividades
              passadas.
            </p>
          </div>
        </div>
      ) : state.loading ? (
        <div className="document-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className="empty-state">
          <BrandMark decorative />
          <h2>
            {hasAnySource ? "Seu próximo relato começa aqui." : "Conecte uma fonte para começar."}
          </h2>
          <p>
            {hasAnySource
              ? "Escolha um período e prepare o primeiro rascunho. Você poderá revisar e ajustar o texto antes de copiar."
              : "Use commits do Azure DevOps, registros do OptSolv ou combine as duas fontes."}
          </p>
          {!hasAnySource && (
            <button type="button" className="text-link" onClick={() => onNavigate("integrations")}>
              Configurar integrações <ArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <div className="document-footer">
        <span>
          {state.result
            ? state.edited
              ? "Rascunho editado nesta sessão"
              : "Rascunho para revisão"
            : "Aguardando atividades"}
        </span>
        <span>Compartilhamento manual</span>
      </div>
    </section>
  );
}
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "em horário não disponível"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}
