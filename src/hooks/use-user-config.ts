"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  DEFAULT_CONFIG,
  normalizeUserConfig,
  persistedUserConfig,
  validateConfig,
} from "@/lib/user-config";
import type { ConfigValidation, GenerationMode, PartialUserConfig, UserConfig } from "@/types";

interface UserConfigStore {
  config: UserConfig;
  isHydrated: boolean;
  persistenceAvailable: boolean;
  updateConfig: (updates: PartialUserConfig) => void;
  resetConfig: () => void;
  clearCredentials: () => void;
  setHydrated: (state: boolean) => void;
  getValidation: () => ConfigValidation;
  hasRequiredConfig: (mode: GenerationMode) => boolean;
  getHeaders: () => Record<string, string>;
}

// Blocked browser storage must not block the session or leave onboarding loading.
let storageAvailable = true;
const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      storageAvailable = true;
      return value;
    } catch {
      storageAvailable = false;
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
  },
};

export const useUserConfigStore = create<UserConfigStore>()(
  persist(
    (set, get) => {
      // Persist writes synchronously after set. The adapter only records capability;
      // it never calls set, so this one status update cannot recurse on storage errors.
      const syncPersistenceStatus = () => {
        if (get().persistenceAvailable !== storageAvailable) {
          set({ persistenceAvailable: storageAvailable });
        }
      };
      return {
        config: { ...DEFAULT_CONFIG },
        isHydrated: false,
        persistenceAvailable: true,
        updateConfig: (updates) => {
          set((state) => ({ config: normalizeUserConfig({ ...state.config, ...updates }) }));
          syncPersistenceStatus();
        },
        resetConfig: () => {
          set({ config: { ...DEFAULT_CONFIG } });
          syncPersistenceStatus();
        },
        clearCredentials: () => {
          set((state) => ({
            config: { ...state.config, azurePat: "", optsolvToken: "", rememberCredentials: false },
          }));
          syncPersistenceStatus();
        },
        setHydrated: (isHydrated) => {
          set({ isHydrated });
          syncPersistenceStatus();
        },
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
              return validation.hasAzureConfig && validation.hasOptsolvConfig;
            default:
              return false;
          }
        },
        getHeaders: () => {
          const config = get().config;
          return {
            "x-azure-pat": config.azurePat,
            "x-azure-organization": config.azureOrganization,
            "x-azure-project": config.azureProject,
            "x-azure-repository": config.azureRepositoryId,
            "x-azure-user-email": config.azureUserEmail,
            "x-optsolv-token": config.optsolvToken,
            "x-optsolv-user-email": config.optsolvUserEmail,
          };
        },
      };
    },
    {
      name: "auto-daily-config",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ config: persistedUserConfig(state.config) }),
      migrate: (persistedState) => ({
        config: persistedUserConfig((persistedState as { config?: unknown } | null)?.config, false),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        config: persistedUserConfig((persistedState as { config?: unknown } | null)?.config),
      }),
    }
  )
);

let hydration: Promise<void> | undefined;
export function hydrateUserConfigStore(): Promise<void> {
  if (!hydration) {
    hydration = Promise.resolve(useUserConfigStore.persist.rehydrate()).finally(() => {
      useUserConfigStore.getState().setHydrated(true);
    });
  }
  return hydration;
}

export function useUserConfig() {
  const store = useUserConfigStore();
  useEffect(() => {
    void hydrateUserConfigStore();
  }, []);
  return {
    config: store.config,
    isHydrated: store.isHydrated,
    persistenceAvailable: store.persistenceAvailable,
    updateConfig: store.updateConfig,
    resetConfig: store.resetConfig,
    clearCredentials: store.clearCredentials,
    validation: store.getValidation(),
    hasRequiredConfig: store.hasRequiredConfig,
    getHeaders: store.getHeaders,
  };
}
