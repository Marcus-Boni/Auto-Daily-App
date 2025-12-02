"use client";

import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Copy,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
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
import { API_ENDPOINTS, GENERATION_MODES, REPORT_FORMATS, TIME_PERIODS } from "@/lib/constants";
import type {
  DailyResult,
  GenerateDailyResponse,
  GenerationMode,
  ReportFormat,
  TimePeriod,
} from "@/types";

export function DailyGenerator() {
  const { config, validation, hasRequiredConfig, getHeaders } = useUserConfig();

  const [mode, setMode] = useState<GenerationMode>(config.defaultMode);
  const [period, setPeriod] = useState<TimePeriod>("24h");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("standard");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedMode = GENERATION_MODES.find((m) => m.value === mode);
  const selectedPeriod = TIME_PERIODS.find((p) => p.value === period);
  const selectedFormat = REPORT_FORMATS.find((f) => f.value === reportFormat);
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
          period,
          periodHours: selectedPeriod?.hours ?? 24,
          reportFormat,
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

    return requirements;
  };

  const missingRequirements = getModeRequirements();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuração do Daily
          </CardTitle>
          <CardDescription>
            Escolha as fontes de dados e o período para o seu Daily Scrum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mode" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Fonte de Dados
              </Label>
              <Select value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
                <SelectTrigger id="mode" className="w-full h-auto py-2">
                  <SelectValue placeholder="Selecione um modo">
                    {selectedMode && <span className="font-medium">{selectedMode.label}</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GENERATION_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="py-2.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Período
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                <SelectTrigger id="period" className="w-full h-auto py-2">
                  <SelectValue placeholder="Selecione o período">
                    {selectedPeriod && (
                      <div className="flex items-center gap-2">
                        <span className="text-base">{selectedPeriod.icon}</span>
                        <span className="font-medium">{selectedPeriod.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.icon}</span>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Formato do Relatório
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_FORMATS.map((format) => (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => setReportFormat(format.value)}
                  className={`
                    relative flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-all
                    hover:border-primary/50 hover:bg-accent/50
                    ${
                      reportFormat === format.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background"
                    }
                  `}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      {format.value === "standard" ? (
                        <ClipboardList className="h-4 w-4 text-primary" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">{format.label}</span>
                    </div>
                    {reportFormat === format.value && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
            {selectedPeriod && (
              <>
                <span className="text-lg">{selectedPeriod.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedPeriod.label} • {selectedFormat?.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedFormat?.description}
                  </p>
                </div>
                <Badge variant="outline" className="gap-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  {selectedPeriod.hours}h
                </Badge>
              </>
            )}
          </div>

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

            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/30 p-4">
              <ReactMarkdown>{result.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

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
