"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "@/components/daily/report-document";
import { SourceSummary } from "@/components/daily/source-summary";
import { Reveal } from "@/components/motion/reveal";
import { ProviderLogo } from "@/components/provider-logo";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/gsap";
import { DEMO_DRAFT, DEMO_RESULT } from "./demo-data";

const evidenceFragment = DEMO_DRAFT.slice(DEMO_DRAFT.indexOf("## Próximos passos"));

const rules = [
  "Commits não comprovam publicação.",
  "Horas registradas não medem produtividade.",
  "Fonte indisponível não é fonte sem atividade.",
];

type Choice = "pending" | "accepted" | "kept";

export function Principles() {
  const [choice, setChoice] = useState<Choice>("pending");

  return (
    <section
      id="principios"
      aria-labelledby="principios-title"
      className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-[clamp(88px,12vw,168px)] md:px-8"
    >
      <h2
        id="principios-title"
        className="max-w-[15ch] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.032em] text-balance"
      >
        A IA rascunha. Você decide.
      </h2>

      <Reveal stagger className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-12">
        <article
          data-reveal-item
          className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-7 lg:row-span-2"
        >
          <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Nada é inventado.</h3>
          <p className="mt-3 max-w-[48ch] text-muted-foreground">
            As regras de evidência proíbem metas, resultados e impedimentos que não estejam nos
            registros. Lacunas chegam marcadas para revisão.
          </p>
          <ul className="mt-6 grid gap-2.5 text-[0.9375rem]">
            {rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2.5">
                <Check className="mt-1 size-4 text-primary" aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <div className="border-t border-border pt-6">
              <div className="report-preview principles-preview">
                <ReactMarkdown components={markdownComponents}>{evidenceFragment}</ReactMarkdown>
              </div>
            </div>
          </div>
        </article>

        <article
          data-reveal-item
          className="flex flex-col rounded-2xl bg-accent p-6 sm:p-8 lg:col-span-5"
        >
          <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Suas edições ficam.</h3>
          <p className="mt-3 max-w-[44ch] text-muted-foreground">
            Um rascunho novo nunca substitui o que você escreveu sem perguntar antes.
          </p>
          <div className="mt-8 border-t border-primary/15 pt-6 text-[0.875rem]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              {choice === "pending" ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                >
                  <p>Um novo rascunho está pronto. Suas edições permanecem no documento atual.</p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button type="button" onClick={() => setChoice("accepted")}>
                      Usar novo rascunho
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-card"
                      onClick={() => setChoice("kept")}
                    >
                      Manter minhas edições
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  className="flex flex-wrap items-center gap-x-4 gap-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                >
                  <span className="inline-flex items-center gap-2 font-medium text-primary">
                    <Check className="size-4" aria-hidden="true" />
                    {choice === "kept" ? "Suas edições foram mantidas." : "Novo rascunho aplicado."}
                  </span>
                  <button
                    type="button"
                    className="text-link min-h-11"
                    onClick={() => setChoice("pending")}
                  >
                    Ver de novo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </article>

        <article
          data-reveal-item
          className="flex flex-col rounded-2xl bg-field p-6 text-field-foreground sm:p-8 lg:col-span-5"
        >
          <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Conexão comprovada.</h3>
          <p className="mt-3 max-w-[44ch] text-field-muted">
            Testar consulta a fonte de verdade. Uma resposta vazia prova acesso, não atividade, e
            editar qualquer campo invalida o teste.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-field-line pt-6">
            <ProviderLogo
              provider="azure"
              size="md"
              style={{ background: "var(--field-foreground)", borderColor: "transparent" }}
              aria-hidden="true"
            />
            <span className="font-medium">Azure DevOps</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-field-foreground/10 px-2.5 py-1.5 text-[0.8125rem]">
              <Check className="size-4" aria-hidden="true" /> Conexão verificada
            </span>
          </div>
        </article>

        <article
          data-reveal-item
          className="grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-12 lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <h3 className="text-[1.5rem] font-semibold tracking-[-0.02em]">Fontes à vista.</h3>
            <p className="mt-3 max-w-[40ch] text-muted-foreground">
              Cada rascunho mostra os commits e as horas que o originaram, para você conferir antes
              de copiar.
            </p>
          </div>
          <div className="principles-evidence min-w-0 lg:col-span-8">
            <SourceSummary result={DEMO_RESULT} defaultOpen />
          </div>
        </article>
      </Reveal>
      <p className="mt-4 text-[0.75rem] text-muted-foreground">Exemplos com dados fictícios.</p>
    </section>
  );
}
