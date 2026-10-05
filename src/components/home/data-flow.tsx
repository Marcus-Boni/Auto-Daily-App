"use client";

import { Cpu, GitCommitHorizontal, Monitor, Server, UserCheck } from "lucide-react";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const nodes = [
  { icon: Monitor, title: "Seu navegador", body: "Tokens ficam na memória da página por padrão." },
  {
    icon: Server,
    title: "Rotas do Auto Daily",
    body: "Consultam as fontes com as suas credenciais.",
  },
  {
    icon: GitCommitHorizontal,
    title: "Azure DevOps e OptSolv",
    body: "Devolvem commits e registros de tempo do período.",
  },
  {
    icon: Cpu,
    title: "Hugging Face",
    body: "Recebe o contexto das atividades e devolve o rascunho.",
  },
  { icon: UserCheck, title: "Você", body: "Revisa, edita e copia. Nada é publicado sozinho." },
];

const storage = [
  { title: "Só nesta sessão", body: "Padrão. Recarregar ou fechar a página descarta os tokens." },
  {
    title: "Neste dispositivo",
    body: "Opcional. Usa o armazenamento local do navegador, sem criptografia.",
  },
  {
    title: "Na sua conta",
    body: "Opcional. Cofre criptografado com AES-256-GCM e histórico das suas dailies.",
  },
];

export function DataFlow() {
  const root = useRef<HTMLElement>(null);

  // A linha percorre o caminho dos dados no ritmo da rolagem e acende cada etapa.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          wide: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          narrow: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const wide = Boolean(context.conditions?.wide);
          const q = gsap.utils.selector(root);
          const steps = q(".flow-node");
          for (const step of steps) step.removeAttribute("data-lit");
          gsap.fromTo(
            q(".flow-progress"),
            wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 },
            {
              scaleX: 1,
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: q(".flow-track-area")[0],
                start: wide ? "top 72%" : "top 78%",
                end: wide ? "bottom 40%" : "bottom 55%",
                scrub: 0.6,
                onUpdate: (self) => {
                  const lit = Math.round(self.progress * (steps.length - 1));
                  for (const [index, step] of steps.entries()) {
                    step.toggleAttribute("data-lit", index <= lit && self.progress > 0.02);
                  }
                },
              },
            }
          );
          return () => {
            for (const step of steps) step.setAttribute("data-lit", "");
          };
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="dados"
      aria-labelledby="dados-title"
      className="scroll-mt-20 border-t border-border bg-secondary/50"
    >
      <div className="mx-auto max-w-[1400px] px-4 py-[clamp(88px,12vw,160px)] md:px-8">
        <h2
          id="dados-title"
          className="max-w-[16ch] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.032em] text-balance"
        >
          Por onde seus dados passam.
        </h2>
        <p className="mt-5 max-w-[56ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
          Um caminho curto e explícito. O contexto das atividades e suas instruções extras vão para
          o provedor de IA; confira as políticas da sua organização antes de usar.
        </p>

        <div className="flow-track-area relative mt-14 md:mt-20">
          <span className="flow-track" aria-hidden="true">
            <span className="flow-progress" />
          </span>
          <ol className="relative grid gap-9 lg:grid-cols-5 lg:gap-6">
            {nodes.map((node) => (
              <li key={node.title} className="flow-node" data-lit="">
                <span className="flow-icon">
                  <node.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1rem] font-semibold">{node.title}</h3>
                  <p className="mt-1.5 max-w-[30ch] text-[0.875rem] leading-relaxed text-muted-foreground">
                    {node.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 grid gap-8 border-t border-border pt-12 md:mt-28 lg:grid-cols-12">
          <h3 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] lg:col-span-5 lg:max-w-[18ch]">
            Você escolhe onde guardar as credenciais.
          </h3>
          <dl className="divide-y divide-border lg:col-span-7">
            {storage.map((option) => (
              <div
                key={option.title}
                className="grid gap-1 py-5 first:pt-0 sm:grid-cols-[200px_1fr] sm:gap-6"
              >
                <dt className="font-medium">{option.title}</dt>
                <dd className="text-muted-foreground">{option.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
