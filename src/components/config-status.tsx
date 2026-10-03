"use client";

import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface ConfigStatusProps {
  label: string;
  isConfigured: boolean;
  isRequired?: boolean;
  icon?: React.ReactNode;
}

export function ConfigStatus({ label, isConfigured, isRequired = false, icon }: ConfigStatusProps) {
  const content = isConfigured ? (
    <Badge
      variant="outline"
      className="gap-1.5 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
    >
      <CheckCircle2 className="h-3 w-3 shrink-0" />
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </Badge>
  ) : isRequired ? (
    <Badge
      variant="outline"
      className="gap-1.5 border-destructive/50 bg-destructive/10 text-destructive"
    >
      <XCircle className="h-3 w-3 shrink-0" />
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1.5 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </Badge>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
