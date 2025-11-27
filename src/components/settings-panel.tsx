"use client";

import { CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfigStatus } from "@/components/config-status";
import { SecretInput } from "@/components/secret-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserConfig } from "@/hooks/use-user-config";
import { TUTORIALS } from "@/lib/constants";

/**
 * SettingsPanel component for configuring API credentials.
 * All credentials are stored in LocalStorage only.
 */
export function SettingsPanel() {
  const { config, updateConfig, resetConfig, validation } = useUserConfig();

  const handleReset = () => {
    if (confirm("Tem certeza que deseja limpar todas as configurações?")) {
      resetConfig();
      toast.success("Configurações resetadas com sucesso!");
    }
  };

  const handleSave = () => {
    toast.success("Configurações salvas automaticamente no navegador!");
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-wrap items-center gap-2">
        <ConfigStatus label="Azure DevOps" isConfigured={validation.hasAzureConfig} />
        <ConfigStatus label="Harvest" isConfigured={validation.hasHarvestConfig} />
        <ConfigStatus label="Gemini AI" isConfigured={validation.hasGeminiConfig} isRequired />
      </div>

      {/* Azure DevOps Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-label="Azure DevOps">
                <title id="azure-icon-title">Azure DevOps</title>
                <path d="M0 8.877L2.247 5.91l8.405-3.416V.022l7.37 5.393L2.966 8.338v8.225L0 15.707zm24-4.45v14.651l-5.753 4.9-9.303-3.057v3.056l-5.978-7.416 15.057 1.798V5.415z" />
              </svg>
            </div>
            Azure DevOps
          </CardTitle>
          <CardDescription>
            Configure suas credenciais para buscar commits e work items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            id="azure-pat"
            label="Personal Access Token (PAT)"
            value={config.azurePat}
            onChange={(value) => updateConfig({ azurePat: value })}
            placeholder="Seu PAT do Azure DevOps"
            tutorial={TUTORIALS.azurePat}
            error={validation.errors.azurePat}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="azure-org">Organização</Label>
              <Input
                id="azure-org"
                value={config.azureOrganization}
                onChange={(e) => updateConfig({ azureOrganization: e.target.value })}
                placeholder="nome-da-organizacao"
              />
              {validation.errors.azureOrganization && (
                <p className="text-sm text-destructive">{validation.errors.azureOrganization}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="azure-project">Projeto</Label>
              <Input
                id="azure-project"
                value={config.azureProject}
                onChange={(e) => updateConfig({ azureProject: e.target.value })}
                placeholder="nome-do-projeto"
              />
              {validation.errors.azureProject && (
                <p className="text-sm text-destructive">{validation.errors.azureProject}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="azure-repo">Repositório</Label>
              <Input
                id="azure-repo"
                value={config.azureRepositoryId}
                onChange={(e) => updateConfig({ azureRepositoryId: e.target.value })}
                placeholder="nome-do-repositorio"
              />
              {validation.errors.azureRepositoryId && (
                <p className="text-sm text-destructive">{validation.errors.azureRepositoryId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="azure-email">E-mail do usuário (opcional)</Label>
              <Input
                id="azure-email"
                type="email"
                value={config.azureUserEmail}
                onChange={(e) => updateConfig({ azureUserEmail: e.target.value })}
                placeholder="seu@email.com"
              />
              <p className="text-xs text-muted-foreground">Filtra commits apenas do seu usuário</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Harvest Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor" aria-label="Harvest">
                <title id="harvest-icon-title">Harvest</title>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6S6.698 2.4 12 2.4s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm0-16.8c-3.974 0-7.2 3.226-7.2 7.2s3.226 7.2 7.2 7.2 7.2-3.226 7.2-7.2-3.226-7.2-7.2-7.2zm0 12c-2.65 0-4.8-2.15-4.8-4.8s2.15-4.8 4.8-4.8 4.8 2.15 4.8 4.8-2.15 4.8-4.8 4.8z" />
              </svg>
            </div>
            Harvest
          </CardTitle>
          <CardDescription>
            Configure suas credenciais para buscar registros de tempo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            id="harvest-token"
            label="Access Token"
            value={config.harvestToken}
            onChange={(value) => updateConfig({ harvestToken: value })}
            placeholder="Seu token do Harvest"
            tutorial={TUTORIALS.harvestToken}
            error={validation.errors.harvestToken}
          />

          <div className="space-y-2">
            <Label htmlFor="harvest-account">Account ID</Label>
            <Input
              id="harvest-account"
              value={config.harvestAccountId}
              onChange={(e) => updateConfig({ harvestAccountId: e.target.value })}
              placeholder="123456"
            />
            {validation.errors.harvestAccountId && (
              <p className="text-sm text-destructive">{validation.errors.harvestAccountId}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gemini AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor" aria-label="Google Gemini AI">
                <title id="gemini-icon-title">Google Gemini AI</title>
                <path d="M12 0L1.75 6v12L12 24l10.25-6V6L12 0zm0 3.5L18.5 7.5 12 11.5 5.5 7.5 12 3.5zM4.25 9.5l6.75 4v7l-6.75-4v-7zm15.5 0v7l-6.75 4v-7l6.75-4z" />
              </svg>
            </div>
            Google Gemini AI
          </CardTitle>
          <CardDescription>Configure a API Key para geração de texto com IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SecretInput
            id="gemini-key"
            label="API Key"
            value={config.geminiApiKey}
            onChange={(value) => updateConfig({ geminiApiKey: value })}
            placeholder="Sua API Key do Gemini"
            tutorial={TUTORIALS.geminiApiKey}
            error={validation.errors.geminiApiKey}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar Configurações
        </Button>

        <Button onClick={handleSave} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Salvo Automaticamente
        </Button>
      </div>

      {/* Security Notice */}
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">🔒 Segurança:</strong> Suas credenciais são salvas
          apenas no seu navegador (LocalStorage) e nunca são enviadas para nossos servidores. Elas
          são usadas apenas para se comunicar diretamente com as APIs do Azure DevOps, Harvest e
          Google Gemini.
        </p>
      </div>
    </div>
  );
}
