"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConfigValidation, GenerationMode, PartialUserConfig, UserConfig } from "@/types";

const DEFAULT_CONFIG: UserConfig = {
  azurePat: "",
  azureOrganization: "",
  azureProject: "",
  azureRepositoryId: "",
  azureUserEmail: "",

  optsolvToken: "opt_time_dev_standardized_integration_key_2026_test",
  optsolvUserEmail: "",

  defaultMode: "combined-auto",
  language: "pt-BR",
};

interface UserConfigStore {
  config: UserConfig;
  isHydrated: boolean;

  updateConfig: (updates: PartialUserConfig) => void;
  resetConfig: () => void;
  setHydrated: (state: boolean) => void;

  getValidation: () => ConfigValidation;
  hasRequiredConfig: (mode: GenerationMode) => boolean;
  getHeaders: () => Record<string, string>;
}

function validateConfig(config?: Partial<UserConfig>): ConfigValidation {
  const safeConfig: UserConfig = {
    ...DEFAULT_CONFIG,
    ...(config ?? {}),
    azurePat: config?.azurePat ?? "",
    azureOrganization: config?.azureOrganization ?? "",
    azureProject: config?.azureProject ?? "",
    azureRepositoryId: config?.azureRepositoryId ?? "",
    azureUserEmail: config?.azureUserEmail ?? "",
    optsolvToken: config?.optsolvToken ?? DEFAULT_CONFIG.optsolvToken,
    optsolvUserEmail: config?.optsolvUserEmail ?? "",
  };

  const errors: Record<keyof UserConfig, string | undefined> = {
    azurePat: undefined,
    azureOrganization: undefined,
    azureProject: undefined,
    azureRepositoryId: undefined,
    azureUserEmail: undefined,
    optsolvToken: undefined,
    optsolvUserEmail: undefined,
    defaultMode: undefined,
    language: undefined,
  };

  const hasAzurePat = safeConfig.azurePat.length > 0;
  const hasAzureOrg = safeConfig.azureOrganization.length > 0;
  const hasAzureProject = safeConfig.azureProject.length > 0;
  const hasAzureRepo = safeConfig.azureRepositoryId.length > 0;

  if (hasAzurePat && !hasAzureOrg) {
    errors.azureOrganization = "Organização é obrigatória quando PAT é fornecido";
  }
  if (hasAzurePat && !hasAzureProject) {
    errors.azureProject = "Projeto é obrigatório quando PAT é fornecido";
  }
  if (hasAzurePat && !hasAzureRepo) {
    errors.azureRepositoryId = "Repositório é obrigatório quando PAT é fornecido";
  }

  const hasAzureConfig = hasAzurePat && hasAzureOrg && hasAzureProject && hasAzureRepo;
  const hasOptsolvConfig = safeConfig.optsolvToken.trim().length > 0;

  const isValid = Object.values(errors).every((e) => e === undefined);

  return {
    isValid,
    errors,
    hasAzureConfig,
    hasOptsolvConfig,
  };
}

export const useUserConfigStore = create<UserConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      isHydrated: false,

      updateConfig: (updates) =>
        set((state) => ({
          config: { ...state.config, ...updates },
        })),

      resetConfig: () => set({ config: DEFAULT_CONFIG }),

      setHydrated: (state) => set({ isHydrated: state }),

      getValidation: () => validateConfig(get().config),

      hasRequiredConfig: (mode) => {
        const validation = validateConfig(get().config);

        switch (mode) {
          case "azure-only":
            return validation.hasAzureConfig;
          case "optsolv-only":
            return validation.hasOptsolvConfig;
          case "combined-auto":
          case "combined-custom":
            return validation.hasAzureConfig || validation.hasOptsolvConfig;
          default:
            return false;
        }
      },

      getHeaders: () => {
        const config = get().config;
        return {
          "x-azure-pat": config?.azurePat ?? "",
          "x-azure-organization": config?.azureOrganization ?? "",
          "x-azure-project": config?.azureProject ?? "",
          "x-azure-repository": config?.azureRepositoryId ?? "",
          "x-azure-user-email": config?.azureUserEmail ?? "",
          "x-optsolv-token": config?.optsolvToken ?? DEFAULT_CONFIG.optsolvToken,
          "x-optsolv-user-email": config?.optsolvUserEmail ?? "",
        };
      },
    }),
    {
      name: "auto-daily-config",
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as { config?: Partial<UserConfig> })?.config ?? {};
        return {
          ...currentState,
          config: {
            ...DEFAULT_CONFIG,
            ...persisted,
            optsolvToken: persisted.optsolvToken || DEFAULT_CONFIG.optsolvToken,
            optsolvUserEmail: persisted.optsolvUserEmail ?? DEFAULT_CONFIG.optsolvUserEmail,
          },
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function useUserConfig() {
  const store = useUserConfigStore();

  return {
    config: store.config,
    isHydrated: store.isHydrated,
    updateConfig: store.updateConfig,
    resetConfig: store.resetConfig,
    validation: store.getValidation(),
    hasRequiredConfig: store.hasRequiredConfig,
    getHeaders: store.getHeaders,
  };
}
