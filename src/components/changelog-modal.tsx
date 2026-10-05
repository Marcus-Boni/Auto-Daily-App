"use client";

import { ExternalLink } from "lucide-react";
import { Children } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReleaseNotes } from "@/lib/changelog";
import { APP_VERSION, CHANGELOG_URL } from "@/lib/version";

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: ReleaseNotes | null;
}

/** Emojis decorativos dos títulos do changelog ficam fora da interface. */
const withoutPictographs = (node: React.ReactNode) =>
  typeof node === "string" ? node.replace(/\p{Extended_Pictographic}️?\s*/gu, "") : node;

const heading: Components["h3"] = ({ children }) => (
  <h3>{Children.map(children, withoutPictographs)}</h3>
);

const components: Components = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  a: ({ children, node: _node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(parsed);
}

export function ChangelogModal({ open, onOpenChange, notes }: ChangelogModalProps) {
  const description = notes
    ? `Versão ${notes.version}${notes.date ? `, publicada em ${formatDate(notes.date)}` : ""}.`
    : "As notas desta versão estão no histórico do projeto.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-2">
          <div className="flex items-center justify-between">
            <BrandLogo />
            <Badge variant="outline" className="font-mono text-xs font-semibold">
              v{APP_VERSION}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-semibold">Novidades do Auto Daily</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {notes?.body && (
          <div className="release-notes max-h-[55vh] overflow-y-auto pr-1" data-lenis-prevent>
            <ReactMarkdown components={components}>{notes.body}</ReactMarkdown>
          </div>
        )}

        <div className="flex justify-end border-t border-border pt-4">
          <Button variant="outline" asChild>
            <a href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer">
              Ver histórico completo <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
