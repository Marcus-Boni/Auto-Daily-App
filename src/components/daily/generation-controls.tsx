"use client";
import { AlertCircle, ArrowRight, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
        <div className="source-option">
          <Checkbox
            id="source-azure"
            checked={state.options.azure}
            onCheckedChange={(checked) => updateOptions({ azure: checked === true })}
            disabled={!validation.hasAzureConfig && !state.options.azure}
          />
          <label htmlFor="source-azure" className="source-copy cursor-pointer flex-1">
            <strong>Azure DevOps</strong>
            <small>
              {validation.hasAzureConfig ? "Commits do repositório" : "Configure esta integração"}
            </small>
          </label>
        </div>
        <div className="source-option">
          <Checkbox
            id="source-optsolv"
            checked={state.options.optsolv}
            onCheckedChange={(checked) => updateOptions({ optsolv: checked === true })}
            disabled={!validation.hasOptsolvConfig && !state.options.optsolv}
          />
          <label htmlFor="source-optsolv" className="source-copy cursor-pointer flex-1">
            <strong>OptSolv Time Tracker</strong>
            <small>
              {validation.hasOptsolvConfig ? "Registros de tempo" : "Configure esta integração"}
            </small>
          </label>
        </div>
        <button type="button" className="text-link" onClick={() => onNavigate("integrations")}>
          Gerenciar integrações <ArrowRight aria-hidden="true" />
        </button>
      </fieldset>
      <div className="form-group">
        <Label htmlFor="daily-period">Período</Label>
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
        <RadioGroup
          value={state.options.reportFormat}
          onValueChange={(value) => updateOptions({ reportFormat: value as ReportFormat })}
          className="gap-0"
        >
          {REPORT_FORMATS.map((format) => {
            const id = `format-${format.value}`;
            return (
              <div className="format-option" key={format.value}>
                <RadioGroupItem value={format.value} id={id} className="mt-0.5" />
                <label htmlFor={id} className="cursor-pointer flex-1">
                  <strong>
                    {format.value === "standard" ? "Daily Scrum" : "Resumo executivo"}
                  </strong>
                  <small>{format.description}</small>
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </fieldset>
      <Accordion type="single" collapsible className="instructions">
        <AccordionItem value="instructions" className="border-none">
          <AccordionTrigger className="instructions-summary hover:no-underline py-2 text-[0.8125rem] font-semibold text-foreground">
            Instruções adicionais
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0">
            <Label htmlFor="daily-instructions" className="block mb-2 text-[0.8125rem]">
              O que deve orientar o texto?
            </Label>
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
            <p className="field-help mt-1.5" id="instructions-help">
              Complementam o formato escolhido. Evite incluir dados sensíveis.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
