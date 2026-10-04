"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { TutorialHelp } from "@/components/tutorial-help";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SecretInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tutorial?: { title: string; steps: readonly string[]; warning?: string };
  error?: string;
  help?: string;
  required?: boolean;
}

export function SecretInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  tutorial,
  error,
  help,
  required,
}: SecretInputProps) {
  const [visible, setVisible] = useState(false);
  const description =
    [help ? `${id}-help` : undefined, error ? `${id}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="form-group">
      <Label htmlFor={id}>{label}</Label>
      <div className="secret-input-control relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={description}
          className="min-h-11 pr-12"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="secret-toggle absolute right-0 top-0 min-h-11 min-w-11"
              onClick={() => setVisible(!visible)}
              aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label}`}
              aria-pressed={visible}
            >
              {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={6}>
            {visible ? "Ocultar token" : "Exibir token"}
          </TooltipContent>
        </Tooltip>
      </div>
      {help ? (
        <p id={`${id}-help`} className="field-help">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
      {tutorial ? <TutorialHelp tutorial={tutorial} /> : null}
    </div>
  );
}
