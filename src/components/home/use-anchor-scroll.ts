"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";

/** Âncoras da página passam pelo Lenis; sem JavaScript, o navegador usa a âncora nativa. */
export function useAnchorScroll(offset = -72) {
  const lenis = useLenis();
  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const { hash } = event.currentTarget;
      const target = hash ? document.querySelector<HTMLElement>(hash) : null;
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset });
      else target.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", hash);
    },
    [lenis, offset]
  );
}
