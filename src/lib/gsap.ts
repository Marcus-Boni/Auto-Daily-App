import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 0.8 });
}

/** Desaceleração exponencial compartilhada entre GSAP, Motion e CSS. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
