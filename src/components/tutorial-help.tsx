"use client";

import { Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TutorialStep {
  title: string;
  steps: readonly string[];
  warning?: string;
}

interface TutorialHelpProps {
  tutorial: TutorialStep;
}

export function TutorialHelp({ tutorial }: TutorialHelpProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tutorial" className="border-none">
        <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-foreground hover:no-underline">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" aria-hidden="true" />
            <span>{tutorial.title}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <ol className="list-decimal space-y-2 pl-4">
              {tutorial.steps.map((step) => (
                <li key={step} className={step.startsWith("  ") ? "ml-4 list-disc" : ""}>
                  {step.trim()}
                </li>
              ))}
            </ol>
            {tutorial.warning && <p className="field-help mt-3">{tutorial.warning}</p>}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
