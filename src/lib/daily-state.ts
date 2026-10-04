import type {
  DailyResult,
  GenerationMode,
  ReportFormat,
  SourceStatuses,
  TimePeriod,
} from "../types";

export interface DailyOptions {
  azure: boolean;
  optsolv: boolean;
  period: TimePeriod;
  reportFormat: ReportFormat;
  customPrompt: string;
}

export interface DailyState {
  options: DailyOptions;
  result: DailyResult | null;
  pending: DailyResult | null;
  content: string;
  edited: boolean;
  editing: boolean;
  loading: boolean;
  requestId: number | null;
  error: string | null;
  failedSources: SourceStatuses | null;
}

export type DailyAction =
  | { type: "options"; updates: Partial<DailyOptions> }
  | { type: "start"; requestId: number }
  | { type: "success"; requestId: number; result: DailyResult }
  | { type: "failure"; requestId: number; error: string; sourceStatus?: SourceStatuses }
  | { type: "cancel"; requestId: number }
  | { type: "edit"; content: string }
  | { type: "editing"; value: boolean }
  | { type: "accept" }
  | { type: "keep" };

export function createDailyState(options: DailyOptions): DailyState {
  return {
    options,
    result: null,
    pending: null,
    content: "",
    edited: false,
    editing: false,
    loading: false,
    requestId: null,
    error: null,
    failedSources: null,
  };
}

function acceptResult(state: DailyState, result: DailyResult): DailyState {
  return {
    ...state,
    result,
    content: result.content,
    edited: false,
    editing: false,
    pending: null,
  };
}

export function dailyReducer(state: DailyState, action: DailyAction): DailyState {
  switch (action.type) {
    case "options":
      return { ...state, options: { ...state.options, ...action.updates } };
    case "start":
      return {
        ...state,
        loading: true,
        requestId: action.requestId,
        error: null,
        failedSources: null,
      };
    case "success": {
      if (state.requestId !== action.requestId) return state;
      const complete = { ...state, loading: false, requestId: null };
      return state.edited
        ? { ...complete, pending: action.result }
        : acceptResult(complete, action.result);
    }
    case "failure":
      return state.requestId === action.requestId
        ? {
            ...state,
            loading: false,
            requestId: null,
            error: action.error,
            failedSources: action.sourceStatus ?? null,
          }
        : state;
    case "cancel":
      return state.requestId === action.requestId
        ? { ...state, loading: false, requestId: null, error: null }
        : state;
    case "edit":
      return {
        ...state,
        content: action.content,
        edited: action.content !== state.result?.content,
      };
    case "editing":
      return { ...state, editing: action.value };
    case "accept":
      return state.pending ? acceptResult(state, state.pending) : state;
    case "keep":
      return { ...state, pending: null };
  }
}

export function getGenerationMode(options: DailyOptions): GenerationMode {
  if (options.azure && options.optsolv) {
    return options.customPrompt.trim() ? "combined-custom" : "combined-auto";
  }
  return options.azure ? "azure-only" : "optsolv-only";
}

export function getSourceHeaders(
  options: DailyOptions,
  headers: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([key]) =>
        (options.azure && key.startsWith("x-azure-")) ||
        (options.optsolv && key.startsWith("x-optsolv-"))
    )
  );
}

export function hasChangedOptions(options: DailyOptions, result: DailyResult | null): boolean {
  if (!result) return false;
  return (
    getGenerationMode(options) !== result.mode ||
    options.period !== result.period ||
    options.reportFormat !== result.reportFormat ||
    options.customPrompt.trim() !== (result.customPrompt ?? "")
  );
}
