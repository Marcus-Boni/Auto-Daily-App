"use client";

import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ReportDocument } from "@/components/daily/report-document";
import { Magnetic } from "@/components/motion/magnetic";
import { ProviderLogo } from "@/components/provider-logo";
import { Button } from "@/components/ui/button";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { ClockReels, REEL_CELL_PERCENT } from "./clock-reels";
import { DEMO_COMMITS, DEMO_ENTRIES } from "./demo-data";
import { REPO_URL } from "./links";
import { useDemoDaily } from "./use-demo-daily";

const formatHours = (hours: number) =>
  `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(hours)} h`;

/** Sem o prefixo convencional (`feat(checkout):`): o chip mostra o que mudou. */
const subject = (message: string) => message.slice(message.indexOf(": ") + 2);

const chips = [
  {
    provider: "azure",
    lead: DEMO_COMMITS[0].id.slice(0, 7),
    text: subject(DEMO_COMMITS[0].message),
  },
  { provider: "optsolv", lead: formatHours(DEMO_ENTRIES[0].hours), text: DEMO_ENTRIES[0].notes },
  {
    provider: "azure",
    lead: DEMO_COMMITS[2].id.slice(0, 7),
    text: subject(DEMO_COMMITS[2].message),
  },
] as const;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const daily = useDemoDaily();

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        element.classList.add("is-intro-ready");
        const q = gsap.utils.selector(element);
        const title = SplitText.create(q(".hero-title"), { type: "lines", mask: "lines" });
        const tl = gsap.timeline({ delay: 0.1, onComplete: () => title.revert() });

        // O relógio gira uma volta e para em 09:12, um rolo de cada vez.
        tl.fromTo(
          q(".hero-clock [data-reel-strip]"),
          { y: 0, yPercent: 0 },
          {
            yPercent: (_index: number, target: HTMLElement) =>
              -REEL_CELL_PERCENT * Number(target.style.getPropertyValue("--reel-index")),
            duration: 1.5,
            stagger: 0.09,
            ease: "expo.inOut",
          },
          0
        )
          // Valor final explícito: o dois-pontos pisca via CSS e um from() gravaria a opacidade do meio da piscada.
          .fromTo(
            q(".hero-clock .clock-colon, .hero-clock-caption"),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.6, clearProps: "opacity,visibility" },
            0.9
          )
          .from(title.lines, { yPercent: 108, duration: 1.15, stagger: 0.1 }, 0.2)
          .from(q(".hero-sub"), { autoAlpha: 0, y: 16, filter: "blur(6px)", duration: 0.9 }, 0.5)
          .from(q(".hero-cta"), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.08 }, 0.65)
          .fromTo(
            q(".hero-field"),
            { clipPath: "inset(100% 0% 0% 0% round 16px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 16px)",
              duration: 1.3,
              ease: "expo.inOut",
              clearProps: "clipPath",
            },
            0.2
          )
          .from(
            q(".hero-chip"),
            { autoAlpha: 0, y: 18, filter: "blur(6px)", duration: 0.8, stagger: 0.12 },
            0.95
          )
          .from(q(".hero-document"), { autoAlpha: 0, y: 56, duration: 1.2 }, 1.1)
          .from(
            q(
              ".hero-document .document-body > :is(.report-meta, h2, .report-intro), .hero-document .report-preview :is(h3, li)"
            ),
            {
              autoAlpha: 0,
              x: -10,
              filter: "blur(4px)",
              duration: 0.7,
              stagger: 0.06,
              clearProps: "filter,transform",
            },
            1.35
          );
        return () => element.classList.remove("is-intro-ready");
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="home-hero mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 pt-8 pb-16 md:px-8 md:pt-12 lg:grid-cols-12 lg:gap-10 lg:pt-10 lg:pb-8"
      aria-labelledby="hero-title"
    >
      <div className="flex flex-col justify-center lg:col-span-5">
        <div className="hero-clock flex items-end gap-4" data-intro>
          <ClockReels time="09:12" className="text-[clamp(3.75rem,8vw,7rem)] font-medium" />
          <span className="hero-clock-caption mb-[0.55em] text-[0.8125rem] text-muted-foreground">
            Daily às 09:30
          </span>
        </div>
        <h1
          id="hero-title"
          className="hero-title mt-6 max-w-[11ch] text-[clamp(2.75rem,5.6vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
          data-intro
        >
          Seu trabalho, bem contado.
        </h1>
        <p
          className="hero-sub mt-6 max-w-[36ch] text-[1.0625rem] leading-relaxed text-muted-foreground md:text-lg"
          data-intro
        >
          Commits do Azure DevOps e horas do OptSolv viram um rascunho de daily. Você revisa e
          compartilha.
        </p>
        <div className="hero-ctas mt-9 flex flex-wrap items-center gap-3" data-intro>
          <span className="hero-cta inline-flex">
            <Magnetic>
              <Button asChild className="cta-lg h-12 px-6">
                <Link href="/app">
                  Abrir o app <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </Magnetic>
          </span>
          <span className="hero-cta inline-flex">
            <Button asChild variant="outline" className="cta-lg h-12 px-5">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <Github aria-hidden="true" /> Ver no GitHub
              </a>
            </Button>
          </span>
        </div>
      </div>

      <figure className="lg:col-span-7">
        <div
          className="hero-field relative overflow-hidden rounded-2xl bg-field p-3 sm:p-5 lg:p-6"
          data-intro
        >
          <ul className="mb-3 grid gap-2 sm:mb-4 sm:grid-cols-3" aria-label="Registros consultados">
            {chips.map((chip, index) => (
              <li
                key={chip.lead}
                className={`hero-chip flex min-w-0 items-center gap-2.5 rounded-lg border border-field-line bg-field-foreground/[0.07] px-3 py-2.5 text-[0.8125rem] text-field-foreground ${index === 2 ? "hidden sm:flex" : ""}`}
              >
                <ProviderLogo provider={chip.provider} size="xs" aria-hidden="true" />
                <span className="shrink-0 font-mono text-[0.75rem] text-field-muted tabular-nums">
                  {chip.lead}
                </span>
                <span className="truncate">{chip.text}</span>
              </li>
            ))}
          </ul>
          <div className="hero-document">
            <ReportDocument
              daily={daily}
              hasAnySource
              onNavigate={() => {}}
              animateArrival={false}
            />
          </div>
        </div>
        <figcaption className="mt-3 text-[0.75rem] text-muted-foreground">
          Exemplo com dados fictícios. Edite e copie à vontade.
        </figcaption>
      </figure>
    </section>
  );
}
