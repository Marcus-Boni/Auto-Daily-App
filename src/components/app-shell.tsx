"use client";

import { Github, Settings, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { DailyGenerator } from "@/components/daily-generator";
import { SettingsPanel } from "@/components/settings-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserConfig } from "@/hooks/use-user-config";
import { tabContentVariants } from "@/lib/motion";

export function AppShell() {
  const { isHydrated, validation } = useUserConfig();
  const isFirstTime = !validation.hasAzureConfig && !validation.hasHarvestConfig;
  const [activeTab, setActiveTab] = useState<string>(isFirstTime ? "settings" : "generator");

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs select-none"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Auto Daily</h1>
              <p className="text-xs text-muted-foreground">Gerador de Daily Scrum com IA</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/Marcus-Boni"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="relative grid w-full max-w-md grid-cols-2 p-1">
            <TabsTrigger
              value="generator"
              className="relative z-10 gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeTab === "generator" && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-md bg-background shadow-xs dark:bg-input/50"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Gerar Daily
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="relative z-10 gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {activeTab === "settings" && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-md bg-background shadow-xs dark:bg-input/50"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
                {!validation.hasAzureConfig && !validation.hasHarvestConfig && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                )}
              </span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "generator" ? (
              <motion.div
                key="generator"
                role="tabpanel"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-6"
              >
                <DailyGenerator />
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                role="tabpanel"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-6"
              >
                <SettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            AutoDaily AI é uma ferramenta profissional que automatiza relatórios de Daily Scrum com
            dados do Azure DevOps, Harvest e IA generativa. Veja mais no{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="https://github.com/Marcus-Boni"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
          <p className="mt-1 text-xs">
            Suas credenciais ficam seguras no navegador e são enviadas apenas via cabeçalhos HTTP
            para as rotas de API da própria aplicação.
          </p>
        </div>
      </footer>
    </div>
  );
}
