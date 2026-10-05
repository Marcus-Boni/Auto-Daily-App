"use client";
import { AlertCircle, ArrowRight, Check, Copy, FileText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { isValidElement, useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DailyGeneration } from "@/hooks/use-daily-generation";
import { TIME_PERIODS } from "@/lib/constants";
import { EASE_OUT, gsap, useGSAP } from "@/lib/gsap";

interface DailyProps {
  daily: DailyGeneration;
  onNavigate: (view: "daily" | "integrations" | "guide") => void;
}

/** Texto padrão das regras de evidência para trechos sem dados; marcado para revisão. */
const PENDING_MARK = "Não informado nos dados consultados";

function plainText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (isValidElement<{ children?: React.ReactNode }>(node)) return plainText(node.props.children);
  return "";
}

export const markdownComponents: Components = {
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h3>{children}</h3>,
  h3: ({ children }) => <h4>{children}</h4>,
  li: ({ children, node: _node, ...props }) => (
    <li {...props} data-pending={plainText(children).includes(PENDING_MARK) || undefined}>
      {children}
    </li>
  ),
  p: ({ children, node: _node, ...props }) => (
    <p {...props} data-pending={plainText(children).includes(PENDING_MARK) || undefined}>
      {children}
    </p>
  ),
  a: ({ children, node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const feedbackMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
  transition: { duration: 0.32, ease: EASE_OUT },
} as const;

export function ReportDocument({
  daily,
  onNavigate,
  hasAnySource,
  animateArrival = true,
}: DailyProps & { hasAnySource: boolean; animateArrival?: boolean }) {
  const { state } = daily;
  const [copied, setCopied] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const generatedAt = state.result?.generatedAt;
  // Um rascunho novo chega em sequência; edições e trocas de modo não repetem a entrada.
  useGSAP(
    () => {
      if (!animateArrival || !generatedAt || !body.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const preview = body.current.querySelector(".report-preview");
      const lines = [
        ...body.current.querySelectorAll(
          ":scope > .report-meta, :scope > h2, :scope > .report-intro"
        ),
        ...(preview ? Array.from(preview.children) : []),
      ];
      gsap.from(lines, {
        autoAlpha: 0,
        y: 14,
        filter: "blur(5px)",
        duration: 0.75,
        stagger: 0.045,
        clearProps: "opacity,visibility,transform,filter",
      });
    },
    { dependencies: [generatedAt], scope: body }
  );
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!state.result}
                  onClick={() => daily.setEditing(!state.editing)}
                  aria-pressed={state.editing}
                >
                  {state.editing ? "Concluir edição" : "Editar"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {state.result
                ? state.editing
                  ? "Concluir edição e pré-visualizar Markdown"
                  : "Editar rascunho manualmente em Markdown"
                : "Gere um rascunho para poder editar"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!state.result || !state.content.trim()}
                  onClick={() => void copy()}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "copied" : "copy"}
                      className="inline-flex"
                      initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                    >
                      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    </motion.span>
                  </AnimatePresence>
                  {copied ? "Texto copiado" : "Copiar texto"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {!state.result || !state.content.trim()
                ? "Gere um rascunho para poder copiar"
                : copied
                  ? "Copiado para a área de transferência!"
                  : "Copiar relato formatado"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {state.loading && (
          <motion.div
            key="loading"
            className="generation-feedback"
            role="status"
            {...feedbackMotion}
          >
            <span className="loading-mark" aria-hidden="true" />
            <span>
              Consultando as fontes e preparando o rascunho.{" "}
              {state.result
                ? "Seu texto anterior continua disponível."
                : "Isso pode levar alguns instantes."}
            </span>
          </motion.div>
        )}
        {state.error && (
          <motion.div
            key="error"
            className="generation-feedback"
            data-tone="error"
            role="alert"
            {...feedbackMotion}
          >
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
          </motion.div>
        )}
        {partial && (
          <motion.div
            key="partial"
            className="generation-feedback"
            data-tone="warning"
            {...feedbackMotion}
          >
            <AlertCircle aria-hidden="true" />
            <p>
              Uma fonte selecionada não pôde ser consultada. Confira abaixo quais registros foram
              usados neste rascunho.
            </p>
          </motion.div>
        )}
        {state.pending && (
          <motion.div key="pending" className="draft-choice" role="status" {...feedbackMotion}>
            <p>Um novo rascunho está pronto. Suas edições permanecem no documento atual.</p>
            <div>
              <Button type="button" onClick={daily.accept}>
                Usar novo rascunho
              </Button>
              <Button type="button" variant="outline" onClick={daily.keep}>
                Manter minhas edições
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {state.result ? (
        <div className="document-body" ref={body}>
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
