"use client";

import { AlertCircle, Calendar, Check, Copy, FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUserConfig } from "@/hooks/use-user-config";
import { API_ENDPOINTS, GENERATION_MODES } from "@/lib/constants";
import type { DailyResult, GenerateDailyResponse, GenerationMode } from "@/types";

/**
 * DailyGenerator component for generating Daily Scrum reports.
 */
export function DailyGenerator() {
  const { config, validation, hasRequiredConfig, getHeaders } = useUserConfig();

  const [mode, setMode] = useState<GenerationMode>(config.defaultMode);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedMode = GENERATION_MODES.find((m) => m.value === mode);
  const canGenerate = hasRequiredConfig(mode);

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Configure as credenciais necessárias nas Configurações");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.generate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({
          mode,
          customPrompt: mode === "combined-custom" ? customPrompt : undefined,
        }),
      });

      const data: GenerateDailyResponse = await response.json();

      if (!data.success) {
        setError(data.error || "Erro desconhecido");
        toast.error(data.error || "Erro ao gerar daily");
        return;
      }

      setResult({
        content: data.daily || "",
        generatedAt: new Date().toISOString(),
        mode,
        sources: data.sources,
      });

      toast.success("Daily gerado com sucesso!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de conexão";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.content) return;

    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const getModeRequirements = () => {
    const requirements: string[] = [];

    if (selectedMode?.requiresAzure && !validation.hasAzureConfig) {
      requirements.push("Azure DevOps");
    }
    if (selectedMode?.requiresHarvest && !validation.hasHarvestConfig) {
      requirements.push("Harvest");
    }
    if (!validation.hasGeminiConfig) {
      requirements.push("Gemini AI");
    }

    return requirements;
  };

  const missingRequirements = getModeRequirements();

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modo de Geração
          </CardTitle>
          <CardDescription>Escolha as fontes de dados para o seu Daily Scrum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mode">Modo</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
              <SelectTrigger id="mode">
                <SelectValue placeholder="Selecione um modo" />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex flex-col items-start">
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom prompt for combined-custom mode */}
          {mode === "combined-custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Instrução Adicional</Label>
              <Textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Foque mais em tarefas de frontend, mencione o framework React..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Adicione instruções personalizadas para a IA
              </p>
            </div>
          )}

          {/* Missing requirements warning */}
          {missingRequirements.length > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Configuração Incompleta
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure nas Configurações: {missingRequirements.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando Daily...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Daily Scrum
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Erro ao gerar Daily</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {result && !isLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Daily Gerado
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(result.generatedAt).toLocaleString("pt-BR")}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Source badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {result.sources?.azure && result.sources.azure.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {result.sources.azure.length} commits
                </Badge>
              )}
              {result.sources?.harvest && result.sources.harvest.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  {result.sources.harvest.length} registros
                </Badge>
              )}
            </div>

            {/* Markdown content */}
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/30 p-4">
              <ReactMarkdown>{result.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!result && !isLoading && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Pronto para gerar seu Daily</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Selecione o modo desejado e clique em &quot;Gerar Daily Scrum&quot; para criar seu
                relatório automaticamente
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
