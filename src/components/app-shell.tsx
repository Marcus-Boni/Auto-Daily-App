"use client";

import { Github, Settings, Sparkles } from "lucide-react";
import { DailyGenerator } from "@/components/daily-generator";
import { SettingsPanel } from "@/components/settings-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserConfig } from "@/hooks/use-user-config";

/**
 * Main application component with tab navigation.
 */
export function AppShell() {
  const { isHydrated, validation } = useUserConfig();

  // Show loading while hydrating from LocalStorage
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // Check if first-time user (no config)
  const isFirstTime =
    !validation.hasAzureConfig && !validation.hasHarvestConfig;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Auto Daily
              </h1>
              <p className="text-xs text-muted-foreground">
                Gerador de Daily Scrum com IA
              </p>
            </div>
          </div>

          <a
            href="https://github.com/Marcus-Boni"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue={isFirstTime ? "settings" : "generator"}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="generator" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar Daily
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
              {!validation.hasAzureConfig && !validation.hasHarvestConfig && (
                <span className="ml-1 flex h-2 w-2 rounded-full bg-yellow-500" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <DailyGenerator />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Auto Daily App — Gerado com <span className="text-primary">♥</span>{" "}
            usando Next.js, Tailwind e Google Gemini AI
          </p>
          <p className="mt-1 text-xs">
            Suas credenciais são armazenadas localmente no seu navegador
          </p>
        </div>
      </footer>
    </div>
  );
}
