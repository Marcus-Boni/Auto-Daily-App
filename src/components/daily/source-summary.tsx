import { Layers } from "lucide-react";
import { ProviderLogo } from "@/components/provider-logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DailyResult } from "@/types";

export function SourceSummary({
  result,
  defaultOpen = false,
}: {
  result: DailyResult;
  defaultOpen?: boolean;
}) {
  const commits = result.sources?.azure ?? [];
  const entries = result.sources?.optsolv ?? [];
  const summary = [
    commits.length ? `${commits.length} ${commits.length === 1 ? "commit" : "commits"}` : "",
    entries.length
      ? `${entries.length} ${entries.length === 1 ? "registro de tempo" : "registros de tempo"}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Accordion
      type="single"
      collapsible
      className="evidence"
      defaultValue={defaultOpen ? "evidence" : undefined}
    >
      <AccordionItem value="evidence" className="border-none">
        <AccordionTrigger className="evidence-summary hover:no-underline">
          <span className="evidence-summary-title">
            <Layers aria-hidden="true" />
            Registros usados neste rascunho
          </span>
          <span className="evidence-summary-badge">{summary || "Sem registros"}</span>
        </AccordionTrigger>
        <AccordionContent className="evidence-content pt-0">
          <p>
            Fontes diferentes podem descrever a mesma atividade. Horas e commits não medem
            produtividade.
          </p>
          {Object.entries(result.sourceStatus ?? {}).map(([provider, status]) =>
            status.status === "success" ? (
              status.message ? (
                <p key={provider}>{status.message}</p>
              ) : null
            ) : (
              <p className="source-status-note" key={provider}>
                <strong>{provider === "azure" ? "Azure DevOps" : "OptSolv Time Tracker"}:</strong>{" "}
                {status.message ||
                  (status.status === "empty"
                    ? "Nenhum registro no período."
                    : "Fonte indisponível.")}
              </p>
            )
          )}
          {commits.length > 0 && (
            <section>
              <h3>
                <ProviderLogo provider="azure" size="sm" aria-hidden="true" />
                Azure DevOps
              </h3>
              <ul>
                {commits.map((commit) => (
                  <li key={commit.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <code className="cursor-help">{commit.id.slice(0, 8)}</code>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4} className="font-mono text-[11px]">
                        Commit: {commit.id}
                      </TooltipContent>
                    </Tooltip>
                    <div>
                      <p>{commit.message}</p>
                      <small>{commit.author}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {entries.length > 0 && (
            <section>
              <h3>
                <ProviderLogo provider="optsolv" size="sm" aria-hidden="true" />
                OptSolv Time Tracker
              </h3>
              <ul>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <span className="time-value">
                      {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(
                        entry.hours
                      )}{" "}
                      h
                    </span>
                    <div>
                      <p>{entry.notes || entry.task || "Registro de tempo"}</p>
                      <small>{entry.project}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
