import { ChevronDown, Clock, GitCommitHorizontal, Layers } from "lucide-react";
import type { DailyResult } from "@/types";

export function SourceSummary({ result }: { result: DailyResult }) {
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
    <details className="evidence">
      <summary>
        <span>
          <Layers aria-hidden="true" />
          Registros usados neste rascunho
        </span>
        <span>{summary || "Sem registros"}</span>
        <ChevronDown aria-hidden="true" />
      </summary>
      <div className="evidence-content">
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
                (status.status === "empty" ? "Nenhum registro no período." : "Fonte indisponível.")}
            </p>
          )
        )}
        {commits.length > 0 && (
          <section>
            <h3>
              <GitCommitHorizontal aria-hidden="true" />
              Azure DevOps
            </h3>
            <ul>
              {commits.map((commit) => (
                <li key={commit.id}>
                  <code title={commit.id}>{commit.id.slice(0, 8)}</code>
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
              <Clock aria-hidden="true" />
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
      </div>
    </details>
  );
}
