export interface UserConfig {
  rememberCredentials: boolean;
  azurePat: string;
  azureOrganization: string;
  azureProject: string;
  azureRepositoryId: string;
  azureUserEmail: string;

  optsolvToken: string;
  optsolvUserEmail: string;

  defaultMode: GenerationMode;
  language: "pt-BR" | "en-US";
}

export type PartialUserConfig = Partial<UserConfig>;

export type GenerationMode = "azure-only" | "optsolv-only" | "combined-auto" | "combined-custom";

export type TimePeriod = "24h" | "48h" | "72h" | "7d" | "14d" | "30d";

export interface PeriodOption {
  value: TimePeriod;
  label: string;
  description: string;
  hours: number;
}

export type ReportFormat = "standard" | "professional";

export interface ReportFormatOption {
  value: ReportFormat;
  label: string;
  description: string;
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

export interface OptSolvTimeEntry {
  id: string;
  userId: string;
  userEmail: string;
  projectId: string;
  projectCode: string;
  projectIntegrationKey: string | null;
  date: string;
  durationMinutes: number;
  billable: boolean;
  status: "draft" | "submitted" | "approved" | "rejected";
  description: string;
  createdAt: string;
}

export interface OptSolvTimeEntriesResponse {
  data: OptSolvTimeEntry[];
  nextCursor: string | null;
}

export interface ParsedTimeEntry {
  id: string | number;
  project: string;
  task: string;
  hours: number;
  notes: string;
  client: string;
  date: string;
  userEmail?: string;
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
  window?: SourceWindow;
  generatedAt?: string;
  sourceStatus?: SourceStatuses;
  sources?: {
    azure?: ParsedCommit[];
    optsolv?: ParsedTimeEntry[];
  };
}

export interface AzureDataResponse {
  success: boolean;
  commits?: ParsedCommit[];
  error?: string;
  details?: string;
  message?: string;
}

export interface OptsolvDataResponse {
  success: boolean;
  entries?: ParsedTimeEntry[];
  error?: string;
  details?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface DailyResult {
  content: string;
  generatedAt: string;
  mode: GenerationMode;
  window?: SourceWindow;
  sourceStatus?: SourceStatuses;
  period?: TimePeriod;
  reportFormat?: ReportFormat;
  customPrompt?: string;
  sources?: {
    azure?: ParsedCommit[];
    optsolv?: ParsedTimeEntry[];
  };
}

export interface SourceWindow {
  start: string;
  end: string;
}

export interface SourceStatus {
  status: "success" | "empty" | "error" | "not-configured";
  count: number;
  message?: string;
}

export type SourceStatuses = Partial<Record<"azure" | "optsolv", SourceStatus>>;

export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

export interface ConfigValidation {
  isValid: boolean;
  errors: Record<keyof UserConfig, string | undefined>;
  hasAzureConfig: boolean;
  hasOptsolvConfig: boolean;
}
