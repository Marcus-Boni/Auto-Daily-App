"use client";

import { Info, ShieldCheck } from "lucide-react";
import { GenerationControls } from "@/components/daily/generation-controls";
import { ReportDocument } from "@/components/daily/report-document";
import { SourceSummary } from "@/components/daily/source-summary";
import type { DailyGeneration } from "@/hooks/use-daily-generation";
import { useUserConfig } from "@/hooks/use-user-config";

export function DailyGenerator({
  daily,
  onNavigate,
}: {
  daily: DailyGeneration;
  onNavigate: (view: "daily" | "integrations" | "guide") => void;
}) {
  const { validation } = useUserConfig();
  return (
    <div className="workspace">
      <GenerationControls daily={daily} onNavigate={onNavigate} />
      <div className="review-area">
        {daily.changedOptions && (
          <p className="options-notice">
            <Info aria-hidden="true" />
            As opções mudaram. O documento abaixo mantém o período e as fontes da última geração.
          </p>
        )}
        <ReportDocument
          daily={daily}
          onNavigate={onNavigate}
          hasAnySource={validation.hasAzureConfig || validation.hasOptsolvConfig}
        />
        {daily.state.result && <SourceSummary result={daily.state.result} />}
        <p className="privacy-inline">
          <ShieldCheck aria-hidden="true" />
          <span>
            As atividades consultadas são processadas pelo provedor de IA.{" "}
            <button type="button" className="inline-link" onClick={() => onNavigate("guide")}>
              Entenda o fluxo de dados.
            </button>
          </span>
        </p>
      </div>
    </div>
  );
}
