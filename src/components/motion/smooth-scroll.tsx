"use client";

import { type LenisRef, ReactLenis, useLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Rolagem suave global. O Lenis roda no ticker do GSAP para que ScrollTrigger e
 * rolagem compartilhem o mesmo quadro. Com movimento reduzido o Lenis acompanha
 * o dispositivo 1:1 (comportamento padrão da biblioteca).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.11,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <ScrollBridge />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReactLenis>
  );
}

function ScrollBridge() {
  const lenis = useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    if (!lenis) return;
    // Dialogs e selects do Radix travam a rolagem marcando o body; o Lenis pausa junto.
    const sync = () => {
      if (document.body.hasAttribute("data-scroll-locked")) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    sync();
    return () => observer.disconnect();
  }, [lenis]);

  return null;
}
