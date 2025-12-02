"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConfigStatusProps {
  label: string;
  isConfigured: boolean;
  isRequired?: boolean;
}

export function ConfigStatus({ label, isConfigured, isRequired = false }: ConfigStatusProps) {
  if (isConfigured) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
      >
        <CheckCircle2 className="h-3 w-3" />
        {label}
      </Badge>
    );
  }

  if (isRequired) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-destructive/50 bg-destructive/10 text-destructive"
      >
        <XCircle className="h-3 w-3" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    >
      <AlertCircle className="h-3 w-3" />
      {label}
    </Badge>
  );
}
