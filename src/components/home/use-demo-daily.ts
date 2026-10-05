"use client";

import { useReducer } from "react";
import type { DailyGeneration } from "@/hooks/use-daily-generation";
import { createDailyState, type DailyOptions, dailyReducer } from "@/lib/daily-state";
import { DEMO_RESULT } from "./demo-data";

const DEMO_OPTIONS: DailyOptions = {
  azure: true,
  optsolv: true,
  period: "24h",
  reportFormat: "standard",
  customPrompt: "",
};

function createDemoState(options: DailyOptions) {
  const started = dailyReducer(createDailyState(options), { type: "start", requestId: 1 });
  return dailyReducer(started, { type: "success", requestId: 1, result: DEMO_RESULT });
}

/**
 * Mesmo reducer do aplicativo, alimentado por dados fictícios. Editar, concluir edição
 * e copiar funcionam como no produto; nenhuma fonte real é consultada.
 */
export function useDemoDaily(): DailyGeneration {
  const [state, dispatch] = useReducer(dailyReducer, DEMO_OPTIONS, createDemoState);
  return {
    state,
    canGenerate: true,
    changedOptions: false,
    updateOptions: (updates) => dispatch({ type: "options", updates }),
    edit: (content) => dispatch({ type: "edit", content }),
    setEditing: (value) => dispatch({ type: "editing", value }),
    accept: () => dispatch({ type: "accept" }),
    keep: () => dispatch({ type: "keep" }),
    generate: async () => {},
    cancel: () => {},
  };
}
