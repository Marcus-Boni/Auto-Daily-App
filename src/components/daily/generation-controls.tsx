"use client";
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DailyGeneration } from "@/hooks/use-daily-generation";
import { useUserConfig } from "@/hooks/use-user-config";
import { REPORT_FORMATS, TIME_PERIODS } from "@/lib/constants";
import type { ReportFormat, TimePeriod } from "@/types";

interface DailyProps {
  daily: DailyGeneration;
  onNavigate: (view: "daily" | "integrations" | "guide") => void;
}
export function GenerationControls({ daily, onNavigate }: DailyProps) {
  const { validation } = useUserConfig();
  const { state, updateOptions } = daily;
  const hasAnySource = validation.hasAzureConfig || validation.hasOptsolvConfig;
  const unavailable =
    (state.options.azure && !validation.hasAzureConfig) ||
    (state.options.optsolv && !validation.hasOptsolvConfig);
  return (
    <form
      id="generation-form"
      className="preparation"
      onSubmit={(event) => {
        event.preventDefault();
        void daily.generate();
      }}
    >
      <h2>Preparar</h2>
      <fieldset className="source-fieldset" disabled={state.loading}>
        <legend>Fontes de atividade</legend>
        <label className="source-option">
          <input
            type="checkbox"
            checked={state.options.azure}
            onChange={(event) => updateOptions({ azure: event.target.checked })}
            disabled={!validation.hasAzureConfig && !state.options.azure}
          />
          <span className="source-copy">
            <strong>Azure DevOps</strong>
            <small>
              {validation.hasAzureConfig ? "Commits do repositório" : "Configure esta integração"}
            </small>
          </span>
        </label>
        <label className="source-option">
          <input
            type="checkbox"
            checked={state.options.optsolv}
            onChange={(event) => updateOptions({ optsolv: event.target.checked })}
            disabled={!validation.hasOptsolvConfig && !state.options.optsolv}
          />
          <span className="source-copy">
            <strong>OptSolv Time Tracker</strong>
            <small>
              {validation.hasOptsolvConfig ? "Registros de tempo" : "Configure esta integração"}
            </small>
          </span>
        </label>
        <button type="button" className="text-link" onClick={() => onNavigate("integrations")}>
          Gerenciar integrações <ArrowRight aria-hidden="true" />
        </button>
      </fieldset>
      <div className="form-group">
        <label htmlFor="daily-period">Período</label>
        <Select
          value={state.options.period}
          disabled={state.loading}
          onValueChange={(value) => updateOptions({ period: value as TimePeriod })}
        >
          <SelectTrigger id="daily-period" className="w-full" aria-describedby="period-help">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIODS.map((period) => (
              <SelectItem
                key={period.value}
                value={period.value}
                className="min-h-11 cursor-pointer"
              >
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p id="period-help" className="field-help">
          Janela móvel até o momento da consulta.
        </p>
      </div>
      <fieldset className="format-fieldset" disabled={state.loading}>
        <legend>Formato do relato</legend>
        {REPORT_FORMATS.map((format) => (
          <label className="format-option" key={format.value}>
            <input
              type="radio"
              name="report-format"
              value={format.value}
              checked={state.options.reportFormat === format.value}
              onChange={() => updateOptions({ reportFormat: format.value as ReportFormat })}
            />
            <span>
              <strong>{format.value === "standard" ? "Daily Scrum" : "Resumo executivo"}</strong>
              <small>{format.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <details className="instructions">
        <summary>Instruções adicionais</summary>
        <label htmlFor="daily-instructions">O que deve orientar o texto?</label>
        <Textarea
          id="daily-instructions"
          value={state.options.customPrompt}
          onChange={(event) => updateOptions({ customPrompt: event.target.value })}
          disabled={state.loading}
          maxLength={4000}
          rows={4}
          placeholder="Ex.: priorize entregas e use frases curtas."
          aria-describedby="instructions-help"
        />
        <p className="field-help" id="instructions-help">
          Complementam o formato escolhido. Evite incluir dados sensíveis.
        </p>
      </details>
      <div className="mobile-generation">
        <GenerationAction daily={daily} />
      </div>
      <p className="generation-help">Você revisa o texto antes de compartilhar.</p>
      {hasAnySource ? (
        unavailable ? (
          <p className="preparation-note">
            <AlertCircle aria-hidden="true" />
            Configure as fontes selecionadas ou use apenas as disponíveis.
          </p>
        ) : !state.options.azure && !state.options.optsolv ? (
          <p className="preparation-note">
            <Info aria-hidden="true" />
            Selecione pelo menos uma fonte.
          </p>
        ) : null
      ) : (
        <p className="preparation-note">
          <Info aria-hidden="true" />
          Conecte pelo menos uma fonte para começar.
        </p>
      )}
    </form>
  );
}
export function GenerationAction({ daily }: { daily: DailyGeneration }) {
  if (daily.state.loading) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="generation-action"
            onClick={daily.cancel}
          >
            Cancelar geração
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          Interromper a consulta e preparação do rascunho
        </TooltipContent>
      </Tooltip>
    );
  }

  const disabledReason = daily.canGenerate
    ? daily.state.pending
      ? "Aceite ou descarte o novo rascunho antes de gerar outro"
      : undefined
    : "Selecione e configure ao menos uma integração com dados válidos";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="submit"
            form="generation-form"
            className="generation-action"
            disabled={!daily.canGenerate || Boolean(daily.state.pending)}
          >
            Gerar rascunho <ArrowRight aria-hidden="true" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {disabledReason || "Consultar fontes e gerar relato estruturado com IA"}
      </TooltipContent>
    </Tooltip>
  );
}
