"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TutorialHelp } from "@/components/tutorial-help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TutorialStep {
  title: string;
  steps: readonly string[];
  warning?: string;
}

interface SecretInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tutorial?: TutorialStep;
  error?: string;
}

export function SecretInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  tutorial,
  error,
}: SecretInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          <Lock className="h-3 w-3 text-muted-foreground" />
          {label}
        </Label>
      </div>

      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${error ? "border-destructive" : ""}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent cursor-pointer"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "Ocultar" : "Mostrar"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isVisible ? (
              <motion.span
                key="visible"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
              >
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              </motion.span>
            ) : (
              <motion.span
                key="hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {tutorial && <TutorialHelp tutorial={tutorial} />}
    </div>
  );
}
