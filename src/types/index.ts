export interface UserConfig {
  azurePat: string;
  azureOrganization: string;
  azureProject: string;
  azureRepositoryId: string;
  azureUserEmail: string;

  harvestAccountId: string;
  harvestToken: string;

  defaultMode: GenerationMode;
  language: "pt-BR" | "en-US";
}

export type PartialUserConfig = Partial<UserConfig>;

export type GenerationMode = "azure-only" | "harvest-only" | "combined-auto" | "combined-custom";

export type TimePeriod = "24h" | "48h" | "72h" | "7d" | "14d" | "30d";

export interface ModeOption {
  value: GenerationMode;
  label: string;
  description: string;
  requiresAzure: boolean;
  requiresHarvest: boolean;
}

export interface PeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
  hours: number;
  icon: string;
}

export type ReportFormat = "standard" | "professional";

export interface ReportFormatOption {
  value: ReportFormat;
  label: string;
  description: string;
  icon: string;
}

export interface AzureCommit {
  commitId: string;
  comment: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  changeCounts: {
    Add: number;
    Edit: number;
    Delete: number;
  };
  url: string;
}

export interface AzureCommitsResponse {
  count: number;
  value: AzureCommit[];
}

export interface ParsedCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  changes: string;
}

export interface HarvestTimeEntry {
  id: number;
  spent_date: string;
  hours: number;
  hours_without_timer: number;
  rounded_hours: number;
  notes: string | null;
  is_locked: boolean;
  locked_reason: string | null;
  is_closed: boolean;
  is_billed: boolean;
  timer_started_at: string | null;
  started_time: string | null;
  ended_time: string | null;
  is_running: boolean;
  billable: boolean;
  budgeted: boolean;
  billable_rate: number | null;
  cost_rate: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  client: {
    id: number;
    name: string;
    currency: string;
  };
  project: {
    id: number;
    name: string;
    code: string;
  };
  task: {
    id: number;
    name: string;
  };
}

export interface HarvestTimeEntriesResponse {
  time_entries: HarvestTimeEntry[];
  per_page: number;
  total_pages: number;
  total_entries: number;
  next_page: number | null;
  previous_page: number | null;
  page: number;
}

export interface ParsedTimeEntry {
  id: number;
  project: string;
  task: string;
  hours: number;
  notes: string;
  client: string;
  date: string;
}

export interface GenerateDailyRequest {
  mode: GenerationMode;
  customPrompt?: string;
  date?: string;
  period?: TimePeriod;
  periodHours?: number;
  reportFormat?: ReportFormat;
}

export interface GenerateDailyResponse {
  success: boolean;
  daily?: string;
  error?: string;
  details?: string;
  sources?: {
    azure?: ParsedCommit[];
    harvest?: ParsedTimeEntry[];
  };
}

export interface AzureDataResponse {
  success: boolean;
  commits?: ParsedCommit[];
  error?: string;
  details?: string;
}

export interface HarvestDataResponse {
  success: boolean;
  entries?: ParsedTimeEntry[];
  error?: string;
  details?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface DailyResult {
  content: string;
  generatedAt: string;
  mode: GenerationMode;
  sources?: {
    azure?: ParsedCommit[];
    harvest?: ParsedTimeEntry[];
  };
}

export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

export interface ConfigValidation {
  isValid: boolean;
  errors: Record<keyof UserConfig, string | undefined>;
  hasAzureConfig: boolean;
  hasHarvestConfig: boolean;
  hasGeminiConfig: boolean;
}
