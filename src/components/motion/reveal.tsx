"use client";

import { stagger, useAnimate, useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { EASE_OUT } from "@/lib/gsap";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Anima os filhos marcados com `data-reveal-item` em sequência, em vez do bloco inteiro. */
  stagger?: boolean;
  delay?: number;
  distance?: number;
  /** Media query em que outra coreografia (GSAP) assume o elemento; a entrada é ignorada. */
  skipWhen?: string;
}

/**
 * Entrada ao rolar, visível por padrão: o HTML do servidor já mostra o conteúdo e o
 * estado inicial só é aplicado no cliente a elementos ainda abaixo da dobra. Se o
 * JavaScript falhar, nada fica escondido.
 */
export function Reveal({
  stagger: isStaggered = false,
  delay = 0,
  distance = 28,
  skipWhen,
  children,
  ...props
}: RevealProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const armed = useRef(false);

  useLayoutEffect(() => {
    const element = scope.current;
    if (!element || reduce) return;
    if (skipWhen && window.matchMedia(skipWhen).matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    const targets = isStaggered ? element.querySelectorAll("[data-reveal-item]") : element;
    animate(targets, { opacity: 0, y: distance, filter: "blur(6px)" }, { duration: 0 });
    armed.current = true;
  }, [animate, distance, isStaggered, reduce, scope, skipWhen]);

  useLayoutEffect(() => {
    if (!inView || !armed.current || !scope.current) return;
    const targets = isStaggered
      ? scope.current.querySelectorAll("[data-reveal-item]")
      : scope.current;
    animate(
      targets,
      { opacity: 1, y: 0, filter: "blur(0px)" },
      {
        duration: 0.9,
        ease: EASE_OUT,
        delay: isStaggered ? stagger(0.08, { startDelay: delay }) : delay,
      }
    );
  }, [animate, delay, inView, isStaggered, scope]);

  return (
    <div ref={scope} {...props}>
      {children}
    </div>
  );
}
