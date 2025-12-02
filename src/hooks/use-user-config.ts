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

  harvestAccountId: "",
  harvestToken: "",

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

function validateConfig(config: UserConfig): ConfigValidation {
  const errors: Record<keyof UserConfig, string | undefined> = {
    azurePat: undefined,
    azureOrganization: undefined,
    azureProject: undefined,
    azureRepositoryId: undefined,
    azureUserEmail: undefined,
    harvestAccountId: undefined,
    harvestToken: undefined,
    defaultMode: undefined,
    language: undefined,
  };

  const hasAzurePat = config.azurePat.length > 0;
  const hasAzureOrg = config.azureOrganization.length > 0;
  const hasAzureProject = config.azureProject.length > 0;
  const hasAzureRepo = config.azureRepositoryId.length > 0;

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

  const hasHarvestAccount = config.harvestAccountId.length > 0;
  const hasHarvestToken = config.harvestToken.length > 0;

  if (hasHarvestToken && !hasHarvestAccount) {
    errors.harvestAccountId = "Account ID é obrigatório quando Token é fornecido";
  }
  if (hasHarvestAccount && !hasHarvestToken) {
    errors.harvestToken = "Token é obrigatório quando Account ID é fornecido";
  }

  const hasHarvestConfig = hasHarvestAccount && hasHarvestToken;

  const isValid = Object.values(errors).every((e) => e === undefined);

  return {
    isValid,
    errors,
    hasAzureConfig,
    hasHarvestConfig,
    hasGeminiConfig: true,
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
          case "harvest-only":
            return validation.hasHarvestConfig;
          case "combined-auto":
          case "combined-custom":
            return validation.hasAzureConfig || validation.hasHarvestConfig;
          default:
            return false;
        }
      },

      getHeaders: () => {
        const { config } = get();
        return {
          "x-azure-pat": config.azurePat,
          "x-azure-organization": config.azureOrganization,
          "x-azure-project": config.azureProject,
          "x-azure-repository": config.azureRepositoryId,
          "x-azure-user-email": config.azureUserEmail,
          "x-harvest-account-id": config.harvestAccountId,
          "x-harvest-token": config.harvestToken,
        };
      },
    }),
    {
      name: "auto-daily-config",
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
