"use client";

import { ArrowRight, Check, CircleCheck, Copy, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { markdownComponents, ReportDocument } from "@/components/daily/report-document";
import { ProviderLogo } from "@/components/provider-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TIME_PERIODS } from "@/lib/constants";
import { DEMO_REVIEWED } from "./demo-data";
import { useDemoDaily } from "./use-demo-daily";

const PENDING = "Não informado nos dados consultados; revisar antes de compartilhar.";
export const REVIEW_LINES = {
  next: "Publicar a validação de CEP em homologação e acompanhar o QA.",
  blocker: "Aguardando credenciais de homologação da transportadora.",
} as const;

/** Texto do editor durante a revisão; `typed` controla quanto da versão humana já foi escrito. */
export function reviewMarkdown(progress = 1) {
  const slot = (line: string, start: number) => {
    const local = Math.min(1, Math.max(0, (progress - start) / 0.5));
    return local <= 0 ? PENDING : line.slice(0, Math.round(line.length * local));
  };
  return `## Próximos passos\n- ${slot(REVIEW_LINES.next, 0)}\n\n## Impedimentos\n- ${slot(REVIEW_LINES.blocker, 0.5)}`;
}

const sources = [
  { provider: "azure", name: "Azure DevOps", detail: "aurora-tech / checkout / loja-web" },
  { provider: "optsolv", name: "OptSolv Time Tracker", detail: "Registros de bruno.tavares" },
] as const;

export function SourcesPanel() {
  return (
    <div className="stage-card">
      {sources.map((source) => (
        <div key={source.provider} className="cd-source flex items-center gap-4 px-5 py-5 sm:px-6">
          <ProviderLogo provider={source.provider} size="md" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.9375rem] font-semibold">{source.name}</p>
            <p className="truncate text-[0.8125rem] text-muted-foreground">{source.detail}</p>
          </div>
          <span className="cd-status relative inline-grid shrink-0 text-[0.8125rem]">
            <span className="cd-status-idle col-start-1 row-start-1 self-center text-muted-foreground opacity-0">
              Não testada
            </span>
            <span className="cd-status-ok col-start-1 row-start-1 inline-flex items-center gap-1.5 font-medium text-primary">
              <Check className="size-4" aria-hidden="true" /> Conexão verificada
            </span>
          </span>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary px-5 py-3.5 text-[0.75rem] text-muted-foreground sm:px-6">
        <span>O teste consulta a fonte com limite reduzido e não salva nada.</span>
        <Button type="button" variant="outline" className="cd-test min-h-10 bg-card">
          Testar conexão
        </Button>
      </div>
    </div>
  );
}

export function OptionsPanel({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <div className="stage-card p-5 sm:p-6">
      <div className="preparation">
        <fieldset>
          <legend>Fontes de atividade</legend>
          {sources.map((source) => (
            <div className="source-option" key={source.provider}>
              <Checkbox id={`demo-source-${source.provider}`} defaultChecked />
              <ProviderLogo provider={source.provider} size="sm" aria-hidden="true" />
              <label
                htmlFor={`demo-source-${source.provider}`}
                className="source-copy flex-1 cursor-pointer"
              >
                <strong>{source.name}</strong>
                <small>
                  {source.provider === "azure" ? "Commits do repositório" : "Registros de tempo"}
                </small>
              </label>
            </div>
          ))}
        </fieldset>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <div className="form-group">
            <Label htmlFor="demo-period">Período</Label>
            <Select defaultValue="24h">
              <SelectTrigger id="demo-period" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value} className="min-h-11">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <fieldset className="form-group">
            <legend className="mb-2">Formato do relato</legend>
            <RadioGroup defaultValue="standard" className="gap-0">
              {[
                { value: "standard", label: "Daily Scrum" },
                { value: "professional", label: "Resumo executivo" },
              ].map((format) => (
                <div className="format-option py-1.5" key={format.value}>
                  <RadioGroupItem value={format.value} id={`demo-format-${format.value}`} />
                  <label htmlFor={`demo-format-${format.value}`} className="flex-1 cursor-pointer">
                    <strong>{format.label}</strong>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <Button type="button" className="cd-generate mt-6 w-full" onClick={onGenerate}>
          Gerar rascunho <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function DraftPanel() {
  const daily = useDemoDaily();
  return (
    <div className="cd-draft">
      <ReportDocument daily={daily} hasAnySource onNavigate={() => {}} animateArrival={false} />
    </div>
  );
}

function StageDocument({
  copied = false,
  editing = false,
  children,
}: {
  copied?: boolean;
  editing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="document" aria-label="Revisão da daily, exemplo">
      <div className="document-toolbar">
        <span className="document-title">
          <FileText aria-hidden="true" />
          Seu rascunho
        </span>
        <div className="document-actions">
          <Button type="button" variant="ghost" aria-pressed={editing} tabIndex={-1}>
            {editing ? "Concluir edição" : "Editar"}
          </Button>
          <Button type="button" variant="outline" className="cd-copy-button" tabIndex={-1}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "Texto copiado" : "Copiar texto"}
          </Button>
        </div>
      </div>
      <div className="document-body">{children}</div>
      <div className="document-footer">
        <span>Rascunho editado nesta sessão</span>
        <span>Compartilhamento manual</span>
      </div>
    </section>
  );
}

export function ReviewPanel() {
  return (
    <StageDocument editing>
      <div className="report-editor">
        <label htmlFor="demo-review-editor">Editar rascunho em Markdown</label>
        <Textarea
          id="demo-review-editor"
          className="cd-editor"
          rows={7}
          readOnly
          tabIndex={-1}
          defaultValue={reviewMarkdown(1)}
        />
        <p className="field-help mt-2">O texto permanece nesta sessão.</p>
      </div>
    </StageDocument>
  );
}

const reviewedTail = DEMO_REVIEWED.slice(DEMO_REVIEWED.indexOf("## Próximos passos"));

export function CopyPanel() {
  return (
    <div>
      <StageDocument copied>
        <div className="report-preview cd-tail">
          <ReactMarkdown components={markdownComponents}>{reviewedTail}</ReactMarkdown>
        </div>
      </StageDocument>
      <div
        className="cd-toast mt-4 ml-auto flex w-fit items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 text-[0.8125rem] shadow-[0_18px_40px_-18px_rgb(12_40_26/0.35)]"
        role="presentation"
      >
        <CircleCheck className="size-[18px] text-primary" aria-hidden="true" />
        Rascunho copiado para a área de transferência.
      </div>
    </div>
  );
}
