"use client";

import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { BrandMark } from "@/components/brand-mark";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import brand from "@/lib/brand.json";
import { gsap, useGSAP } from "@/lib/gsap";
import { AUTHOR_URL, REPO_URL, repoFile } from "./links";
import { useAnchorScroll } from "./use-anchor-scroll";

export function Closing() {
  const root = useRef<HTMLElement>(null);

  // O símbolo "Daily aberto" gira até a posição de repouso enquanto a seção entra.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".closing-mark",
          { rotate: -38, yPercent: 18, scale: 0.86 },
          {
            rotate: 0,
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="closing-title"
      className="relative isolate overflow-hidden border-t border-border"
    >
      <BrandMark
        decorative
        className="closing-mark pointer-events-none absolute top-1/2 right-[-12%] -z-10 size-[min(78vw,640px)] -translate-y-1/2 text-primary opacity-[0.09] md:right-[-4%] dark:opacity-[0.12]"
      />
      <div className="mx-auto max-w-[1400px] px-4 py-[clamp(112px,16vw,208px)] md:px-8">
        <h2
          id="closing-title"
          className="max-w-[12ch] text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[1] font-semibold tracking-[-0.038em] text-balance"
        >
          Prepare sua próxima daily.
        </h2>
        <p className="mt-6 max-w-[40ch] text-[1.0625rem] leading-relaxed text-muted-foreground md:text-lg">
          Conecte uma fonte, gere o rascunho e revise antes de compartilhar.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Magnetic>
            <Button asChild className="cta-lg h-12 px-6">
              <Link href="/app">
                Abrir o app <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Magnetic>
          <Button asChild variant="outline" className="cta-lg h-12 bg-background px-5">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" /> Ver no GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

const productLinks = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#principios", label: "Princípios" },
  { href: "#dados", label: "Privacidade" },
  { href: "#faq", label: "Perguntas frequentes" },
];

const projectLinks = [
  { href: REPO_URL, label: "GitHub" },
  { href: repoFile("CONTRIBUTING.md"), label: "Como contribuir" },
  { href: repoFile("SECURITY.md"), label: "Segurança" },
  { href: repoFile("LICENSE"), label: "Licença MIT" },
];

export function HomeFooter() {
  const onAnchorClick = useAnchorScroll();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <BrandLogo />
          <p className="mt-4 text-[0.875rem] text-muted-foreground">{brand.tagline}</p>
          <p className="mt-1 text-[0.875rem] text-muted-foreground">
            Criado por{" "}
            <a className="inline-link" href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">
              Marcus Boni
            </a>
            .
          </p>
        </div>
        <nav aria-label="Produto" className="lg:col-span-3">
          <p className="text-[0.8125rem] font-semibold">Produto</p>
          <ul className="mt-3 grid gap-0.5 text-[0.875rem]">
            <li>
              <Link className="footer-link" href="/app">
                Abrir o app
              </Link>
            </li>
            {productLinks.map((link) => (
              <li key={link.href}>
                <a className="footer-link" href={link.href} onClick={onAnchorClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Projeto" className="lg:col-span-3">
          <p className="text-[0.8125rem] font-semibold">Projeto</p>
          <ul className="mt-3 grid gap-0.5 text-[0.875rem]">
            {projectLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="footer-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-[1400px] border-t border-border px-4 py-6 text-[0.75rem] text-muted-foreground md:px-8">
        Código sob licença MIT. Assinatura em Geist, sob SIL Open Font License.
      </div>
    </footer>
  );
}
