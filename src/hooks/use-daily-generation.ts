"use client";

import { useEffect, useReducer, useRef } from "react";
import { useUserConfig } from "@/hooks/use-user-config";
import { TIME_PERIODS } from "@/lib/constants";
import type { DailyOptions } from "@/lib/daily-state";
import {
  createDailyState,
  dailyReducer,
  getGenerationMode,
  getSourceHeaders,
  hasChangedOptions,
} from "@/lib/daily-state";
import type { GenerateDailyResponse } from "@/types";

export function useDailyGeneration() {
  const { validation, hasRequiredConfig, getHeaders } = useUserConfig();
  const [state, dispatch] = useReducer(
    dailyReducer,
    {
      azure: validation.hasAzureConfig,
      optsolv: validation.hasOptsolvConfig,
      period: "24h",
      reportFormat: "standard",
      customPrompt: "",
    },
    createDailyState
  );
  const currentRequest = useRef<{ id: number; controller: AbortController } | null>(null);
  const requestSequence = useRef(0);
  const mode = getGenerationMode(state.options);
  const canGenerate = (state.options.azure || state.options.optsolv) && hasRequiredConfig(mode);

  useEffect(() => () => currentRequest.current?.controller.abort(), []);

  const generate = async () => {
    if (!canGenerate || currentRequest.current || state.pending) return;
    const options = { ...state.options, customPrompt: state.options.customPrompt.trim() };
    const requestId = ++requestSequence.current;
    const controller = new AbortController();
    currentRequest.current = { id: requestId, controller };
    dispatch({ type: "start", requestId });
    const timeout = setTimeout(() => controller.abort(new Error("timeout")), 90_000);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getSourceHeaders(options, getHeaders()) },
        body: JSON.stringify({
          mode: getGenerationMode(options),
          period: options.period,
          periodHours: TIME_PERIODS.find((period) => period.value === options.period)?.hours ?? 24,
          reportFormat: options.reportFormat,
          customPrompt: options.customPrompt || undefined,
        }),
        signal: controller.signal,
      });
      const data: GenerateDailyResponse = await response.json();
      if (!response.ok || !data.success || !data.daily?.trim()) {
        let errorText =
          data.error ||
          "Não foi possível preparar o rascunho. Confira as fontes e tente novamente.";
        if (data.error === "Nenhum dado encontrado") {
          errorText =
            "Nenhum registro encontrado. Amplie o período ou confira os filtros das integrações.";
        } else if (
          data.details &&
          !data.error?.includes(data.details) &&
          !data.details.includes("Tente novamente")
        ) {
          errorText = `${data.error || "Erro ao gerar daily"}: ${data.details}`;
        }

        dispatch({
          type: "failure",
          requestId,
          error: errorText,
          sourceStatus: data.sourceStatus,
        });
        return;
      }
      dispatch({
        type: "success",
        requestId,
        result: {
          content: data.daily,
          generatedAt: data.generatedAt ?? new Date().toISOString(),
          mode: getGenerationMode(options),
          period: options.period,
          reportFormat: options.reportFormat,
          customPrompt: options.customPrompt,
          sources: data.sources,
          sourceStatus: data.sourceStatus,
          window: data.window,
        },
      });
    } catch {
      if (controller.signal.aborted && controller.signal.reason?.message !== "timeout") {
        dispatch({ type: "cancel", requestId });
      } else {
        dispatch({
          type: "failure",
          requestId,
          error: controller.signal.aborted
            ? "A geração demorou mais que o esperado. Seu rascunho foi preservado; tente novamente."
            : "Não foi possível acessar o serviço. Seu rascunho foi preservado; tente novamente.",
        });
      }
    } finally {
      clearTimeout(timeout);
      if (currentRequest.current?.id === requestId) currentRequest.current = null;
    }
  };

  const cancel = () => {
    const request = currentRequest.current;
    if (!request) return;
    currentRequest.current = null;
    request.controller.abort();
    dispatch({ type: "cancel", requestId: request.id });
  };

  return {
    state,
    canGenerate,
    changedOptions: hasChangedOptions(state.options, state.result),
    updateOptions: (updates: Partial<DailyOptions>) => dispatch({ type: "options", updates }),
    edit: (content: string) => dispatch({ type: "edit", content }),
    setEditing: (value: boolean) => dispatch({ type: "editing", value }),
    accept: () => dispatch({ type: "accept" }),
    keep: () => dispatch({ type: "keep" }),
    generate,
    cancel,
  };
}

export type DailyGeneration = ReturnType<typeof useDailyGeneration>;
