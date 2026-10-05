"use client";

import { Github } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EASE_OUT } from "@/lib/gsap";
import { REPO_URL } from "./links";
import { useAnchorScroll } from "./use-anchor-scroll";

const sections = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#principios", label: "Princípios" },
  { href: "#dados", label: "Privacidade" },
  { href: "#open-source", label: "Open source" },
] as const;

export function HomeNav() {
  const { scrollY } = useScroll();
  const hairline = useTransform(scrollY, [0, 64], [0, 1]);
  const [hidden, setHidden] = useState(false);
  const onAnchorClick = useAnchorScroll();

  // Recolhe ao descer para liberar a leitura; volta ao primeiro gesto de subida.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 240);
  });

  return (
    <motion.header
      className="sticky top-0 z-30 bg-background"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      onFocusCapture={() => setHidden(false)}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-border"
        style={{ opacity: hairline }}
      />
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-4 md:px-8">
        <Link href="/" className="brand" aria-label="Auto Daily, página inicial">
          <BrandLogo decorative />
        </Link>
        <nav aria-label="Seções da página" className="ml-6 hidden items-center gap-1 md:flex">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              onClick={onAnchorClick}
              className="rounded-md px-3 py-2.5 text-[0.875rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="icon-button"
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositório no GitHub"
              >
                <Github aria-hidden="true" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              Ver repositório no GitHub
            </TooltipContent>
          </Tooltip>
          <Button asChild className="ml-2 px-4">
            <Link href="/app">Abrir o app</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
