import type { Transition, Variants } from "motion/react";

/**
 * Curvas de aceleração e transições padrão seguindo as melhores práticas do Motion.
 * Prioriza naturalidade, resposta rápida e elegância (estilo Linear/Vercel).
 */
export const TRANSITIONS = {
  // Transição rápida para feedback imediato (botões, seleções)
  quick: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,

  // Transição padrão para mudanças de estado e cards
  smooth: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,

  // Transição de saída rápida para não gerar sensação de latência
  exit: {
    duration: 0.15,
    ease: [0.7, 0, 0.84, 0],
  } as Transition,

  // Spring sutil para elementos de seleção e badges
  spring: {
    type: "spring",
    stiffness: 450,
    damping: 30,
  } as Transition,
} as const;

/**
 * Variantes de fade com deslocamento vertical sutil.
 */
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: TRANSITIONS.exit,
  },
};

/**
 * Variantes para abas e transições de tela principal.
 */
export const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.12,
    },
  },
};

/**
 * Variantes para expansão/colapso suave de elementos condicionais.
 */
export const collapseVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: TRANSITIONS.exit,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: TRANSITIONS.smooth,
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: TRANSITIONS.exit,
  },
};

/**
 * Variantes em escala para popovers, badges e ícones de confirmação.
 */
export const scalePopVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: TRANSITIONS.quick,
  },
};

/**
 * Container com stagger sutil para listas ou cards sequenciais.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};
