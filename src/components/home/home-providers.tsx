"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const APP_VIEWS = new Set(["daily", "history", "integrations", "guide"]);

/**
 * O aplicativo morava em `/` com áreas em hash (`/#history`). Esses links antigos
 * seguem para `/app` mantendo a área; o servidor não recebe o hash, por isso no cliente.
 */
function LegacyHashRedirect() {
  useEffect(() => {
    const view = window.location.hash.slice(1);
    if (APP_VIEWS.has(view)) window.location.replace(`/app#${view}`);
  }, []);
  return null;
}

export function HomeProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={70} skipDelayDuration={250}>
      <LegacyHashRedirect />
      {children}
    </TooltipProvider>
  );
}
