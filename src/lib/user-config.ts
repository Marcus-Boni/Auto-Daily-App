import type { ConfigValidation, GenerationMode, UserConfig } from "@/types";

export const DEFAULT_CONFIG: UserConfig = {
  azurePat: "",
  azureOrganization: "",
  azureProject: "",
  azureRepositoryId: "",
  azureUserEmail: "",
  optsolvToken: "",
  optsolvUserEmail: "",
  defaultMode: "combined-auto",
  language: "pt-BR",
  rememberCredentials: false,
};

const textFields = [
  "azurePat",
  "azureOrganization",
  "azureProject",
  "azureRepositoryId",
  "azureUserEmail",
  "optsolvToken",
  "optsolvUserEmail",
] as const;
const modes: GenerationMode[] = ["azure-only", "optsolv-only", "combined-auto", "combined-custom"];

export function normalizeUserConfig(value: unknown): UserConfig {
  const config = { ...DEFAULT_CONFIG };
  if (!value || typeof value !== "object") return config;
  const input = value as Record<string, unknown>;
  for (const field of textFields) {
    config[field] = typeof input[field] === "string" ? input[field].trim() : "";
  }
  if (modes.includes(input.defaultMode as GenerationMode))
    config.defaultMode = input.defaultMode as GenerationMode;
  if (input.language === "pt-BR" || input.language === "en-US") config.language = input.language;
  config.rememberCredentials = input.rememberCredentials === true;
  return config;
}

// Only the versioned opt-in format restores secrets; older local data is never consent.
export function persistedUserConfig(value: unknown, allowCredentials = true): UserConfig {
  const config = normalizeUserConfig(value);
  if (!allowCredentials) config.rememberCredentials = false;
  if (!config.rememberCredentials) {
    config.azurePat = "";
    config.optsolvToken = "";
  }
  return config;
}

export function validateConfig(value: unknown): ConfigValidation {
  const config = normalizeUserConfig(value);
  const errors: ConfigValidation["errors"] = {
    azurePat: undefined,
    azureOrganization: undefined,
    azureProject: undefined,
    azureRepositoryId: undefined,
    azureUserEmail: undefined,
    optsolvToken: undefined,
    optsolvUserEmail: undefined,
    defaultMode: undefined,
    language: undefined,
    rememberCredentials: undefined,
  };
  for (const field of textFields) {
    if (/[^\x20-\x7e\u00a0-\uffff]/.test(config[field]))
      errors[field] = "Remova os caracteres de controle deste campo.";
  }
  for (const field of ["optsolvUserEmail"] as const) {
    if (config[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config[field])) {
      errors[field] = "Informe um e-mail válido ou deixe o campo vazio.";
    }
  }
  if (config.azurePat) {
    if (!config.azureOrganization) errors.azureOrganization = "Informe a organização do Azure.";
    if (!config.azureProject) errors.azureProject = "Informe o projeto do Azure.";
    if (!config.azureRepositoryId) errors.azureRepositoryId = "Informe o repositório do Azure.";
  }
  const azureFields = [
    "azurePat",
    "azureOrganization",
    "azureProject",
    "azureRepositoryId",
  ] as const;
  const hasAzureConfig =
    azureFields.every((field) => !!config[field] && !errors[field]) && !errors.azureUserEmail;
  const hasOptsolvConfig =
    !!config.optsolvToken && !errors.optsolvToken && !errors.optsolvUserEmail;
  return {
    isValid: Object.values(errors).every((error) => !error),
    errors,
    hasAzureConfig,
    hasOptsolvConfig,
  };
}
