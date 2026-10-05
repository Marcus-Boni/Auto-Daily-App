"use client";

import { ArrowRight, Check, Copy, Github } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EASE_OUT } from "@/lib/gsap";
import { REPO_URL, repoFile } from "./links";

const shells = {
  bash: [
    `git clone ${REPO_URL}.git`,
    "cd Auto-Daily-App",
    "npm ci",
    "cp .env.example .env",
    "# defina HUGGINGFACE_API_KEY no .env",
    "npm run dev",
  ],
  powershell: [
    `git clone ${REPO_URL}.git`,
    "cd Auto-Daily-App",
    "npm ci",
    "Copy-Item .env.example .env",
    "# defina HUGGINGFACE_API_KEY no .env",
    "npm run dev",
  ],
} as const;
type Shell = keyof typeof shells;

function CommandLines({ shell }: { shell: Shell }) {
  return (
    <pre className="overflow-x-auto px-5 py-5 font-mono text-[0.8125rem] leading-[2] sm:px-6">
      <code>
        {shells[shell].map((line) => (
          <span key={line} className="block">
            {line.startsWith("#") ? (
              <span className="text-[#8fa699]">{line}</span>
            ) : (
              <>
                <span className="text-[#86d6ad] select-none">$ </span>
                {line}
              </>
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function OpenSource() {
  const [shell, setShell] = useState<Shell>("bash");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = async () => {
    const commands = shells[shell].filter((line) => !line.startsWith("#")).join("\n");
    try {
      await navigator.clipboard.writeText(commands);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione os comandos manualmente.");
    }
  };

  return (
    <section
      id="open-source"
      aria-labelledby="open-source-title"
      className="mx-auto grid max-w-[1400px] scroll-mt-20 gap-12 px-4 py-[clamp(88px,12vw,160px)] md:px-8 lg:grid-cols-12 lg:items-center lg:gap-10"
    >
      <div className="lg:col-span-5">
        <h2
          id="open-source-title"
          className="max-w-[13ch] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.032em] text-balance"
        >
          Código aberto. Hospede o seu.
        </h2>
        <p className="mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
          Licença MIT, com Next.js 16, React 19 e Tailwind CSS 4. Para rodar, você precisa de
          Node.js 20.9 ou superior e de uma chave da Hugging Face.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button asChild variant="outline" className="cta-lg h-12 px-5">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" /> Ver no GitHub
            </a>
          </Button>
          <a
            className="text-link"
            href={repoFile("CONTRIBUTING.md")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Como contribuir <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <Tabs
          value={shell}
          onValueChange={(value) => setShell(value as Shell)}
          className="code-window gap-0 overflow-hidden rounded-xl border border-[#2c3a32] bg-[#131a17] text-[#eaf1ec] shadow-[0_40px_80px_-40px_rgb(10_30_20/0.5)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#2c3a32] px-3 py-2">
            <TabsList className="h-10 bg-transparent p-0" aria-label="Terminal">
              {(["bash", "powershell"] as const).map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="code-tab min-h-10 px-3 text-[0.8125rem]"
                >
                  {value === "bash" ? "bash" : "PowerShell"}
                </TabsTrigger>
              ))}
            </TabsList>
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-[0.8125rem] text-[#afbeb4] transition-colors hover:bg-[#232e27] hover:text-[#eaf1ec]"
              aria-label={copied ? "Comandos copiados" : "Copiar comandos"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "done" : "copy"}
                  className="inline-flex"
                  initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                >
                  {copied ? (
                    <Check className="size-4 text-[#86d6ad]" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                </motion.span>
              </AnimatePresence>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          {(["bash", "powershell"] as const).map((value) => (
            <TabsContent key={value} value={value} className="m-0">
              <CommandLines shell={value} />
            </TabsContent>
          ))}
        </Tabs>
        <p className="mt-3 text-[0.75rem] text-muted-foreground">
          Variáveis, banco local e deploy estão descritos no{" "}
          <a
            className="inline-link"
            href={repoFile("README.md")}
            target="_blank"
            rel="noopener noreferrer"
          >
            README
          </a>
          .
        </p>
      </div>
    </section>
  );
}
