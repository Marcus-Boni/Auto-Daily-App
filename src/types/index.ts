// ==========================================
// Auto Daily App - Type Definitions
// ==========================================

// ==========================================
// User Configuration Types
// ==========================================

/**
 * User configuration stored in LocalStorage.
 * Contains all credentials and settings for Azure DevOps and Harvest integrations.
 */
export interface UserConfig {
  // Azure DevOps Configuration
  azurePat: string;
  azureOrganization: string;
  azureProject: string;
  azureRepositoryId: string;
  azureUserEmail: string;

  // Harvest Configuration
  harvestAccountId: string;
  harvestToken: string;

  // Google Gemini Configuration
  geminiApiKey: string;

  // App Settings
  defaultMode: GenerationMode;
  language: "pt-BR" | "en-US";
}

/**
 * Partial user config for updates.
 */
export type PartialUserConfig = Partial<UserConfig>;

// ==========================================
// Generation Mode Types
// ==========================================

/**
 * Available generation modes for the Daily Scrum report.
 */
export type GenerationMode = "azure-only" | "harvest-only" | "combined-auto" | "combined-custom";

/**
 * Mode configuration with labels.
 */
export interface ModeOption {
  value: GenerationMode;
  label: string;
  description: string;
  requiresAzure: boolean;
  requiresHarvest: boolean;
}

// ==========================================
// Azure DevOps Types
// ==========================================

/**
 * Azure DevOps commit information.
 */
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

/**
 * Azure DevOps API response for commits.
 */
export interface AzureCommitsResponse {
  count: number;
  value: AzureCommit[];
}

/**
 * Parsed commit data for display.
 */
export interface ParsedCommit {
  id: string;
  message: string;
  author: string;
  date: string;
  changes: string;
}

// ==========================================
// Harvest Types
// ==========================================

/**
 * Harvest time entry.
 */
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

/**
 * Harvest API response for time entries.
 */
export interface HarvestTimeEntriesResponse {
  time_entries: HarvestTimeEntry[];
  per_page: number;
  total_pages: number;
  total_entries: number;
  next_page: number | null;
  previous_page: number | null;
  page: number;
}

/**
 * Parsed time entry for display.
 */
export interface ParsedTimeEntry {
  id: number;
  project: string;
  task: string;
  hours: number;
  notes: string;
  client: string;
  date: string;
}

// ==========================================
// API Request/Response Types
// ==========================================

/**
 * Generate daily request payload.
 */
export interface GenerateDailyRequest {
  mode: GenerationMode;
  customPrompt?: string;
  date?: string; // ISO date string, defaults to today
}

/**
 * Generate daily response.
 */
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

/**
 * Azure data fetch response.
 */
export interface AzureDataResponse {
  success: boolean;
  commits?: ParsedCommit[];
  error?: string;
  details?: string;
}

/**
 * Harvest data fetch response.
 */
export interface HarvestDataResponse {
  success: boolean;
  entries?: ParsedTimeEntry[];
  error?: string;
  details?: string;
}

// ==========================================
// UI State Types
// ==========================================

/**
 * Loading state for async operations.
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Result state for daily generation.
 */
export interface DailyResult {
  content: string;
  generatedAt: string;
  mode: GenerationMode;
  sources?: {
    azure?: ParsedCommit[];
    harvest?: ParsedTimeEntry[];
  };
}

// ==========================================
// Validation Types
// ==========================================

/**
 * Validation result for a single field.
 */
export interface FieldValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Validation result for the entire config.
 */
export interface ConfigValidation {
  isValid: boolean;
  errors: Record<keyof UserConfig, string | undefined>;
  hasAzureConfig: boolean;
  hasHarvestConfig: boolean;
  hasGeminiConfig: boolean;
}
