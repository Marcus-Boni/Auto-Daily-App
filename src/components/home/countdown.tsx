"use client";

import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { gsap, type ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ClockReels, REEL_CELL_PERCENT } from "./clock-reels";
import {
  CopyPanel,
  DraftPanel,
  OptionsPanel,
  ReviewPanel,
  reviewMarkdown,
  SourcesPanel,
} from "./countdown-panels";

const STEPS = [
  {
    time: "09:13",
    minute: 13,
    title: "Conecte suas fontes.",
    body: "O Azure DevOps traz os commits do repositório; o OptSolv, os registros de tempo. Teste a conexão antes de salvar.",
  },
  {
    time: "09:14",
    minute: 14,
    title: "Escolha período e formato.",
    body: "De 24 horas a 30 dias. Daily Scrum ou resumo executivo, com instruções extras quando precisar.",
  },
  {
    time: "09:16",
    minute: 16,
    title: "A IA escreve o rascunho.",
    body: "Só com o que as fontes registram. O que não está nos dados chega marcado para você revisar.",
  },
  {
    time: "09:21",
    minute: 21,
    title: "Você revisa e ajusta.",
    body: "Edite em Markdown. Próximos passos e impedimentos vêm de você, não de um palpite da IA.",
  },
  {
    time: "09:29",
    minute: 29,
    title: "Copie e compartilhe.",
    body: "O texto vai para a sua área de transferência. Onde ele é publicado, você decide.",
  },
] as const;

/** Unidades da linha do tempo: um passo por unidade, mais o encerramento às 09:30. */
const FINALE_AT = STEPS.length;

export function Countdown() {
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const lenis = useLenis();

  const scrollToStep = useCallback(
    (index: number) => {
      const st = trigger.current;
      const duration = timeline.current?.duration();
      if (!st || !duration) {
        document.getElementById(`passo-${index + 1}`)?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const target = st.start + ((st.end - st.start) * (index + 0.7)) / duration;
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    },
    [lenis]
  );

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        section.classList.add("is-staged");
        const q = gsap.utils.selector(section);
        const pin = q(".cd-pin")[0] as HTMLElement;
        const copies = q(".cd-copy");
        const panels = q(".cd-panel");
        const railItems = q(".cd-rail-item");
        const clockEl = q(".cd-clock")[0] as HTMLElement;
        const [, , tensStrip, onesStrip] = q(".cd-clock [data-reel-strip]");
        const editor = q(".cd-editor")[0] as HTMLTextAreaElement | undefined;

        // Odômetro: a unidade gira continuamente; a dezena só gira durante o "vai um".
        const clock = { minutes: 12 };
        gsap.set(q(".cd-clock [data-reel-strip]"), { y: 0 });
        gsap.set(q(".cd-clock [data-reel='h1'] [data-reel-strip]"), {
          yPercent: -REEL_CELL_PERCENT * 10,
        });
        gsap.set(q(".cd-clock [data-reel='h2'] [data-reel-strip]"), {
          yPercent: -REEL_CELL_PERCENT * 19,
        });
        const setTens = gsap.quickSetter(tensStrip, "yPercent");
        const setOnes = gsap.quickSetter(onesStrip, "yPercent");
        const renderClock = () => {
          const ones = clock.minutes % 10;
          const carry = Math.max(0, ones - 9);
          setOnes(-REEL_CELL_PERCENT * ones);
          setTens(-REEL_CELL_PERCENT * (Math.floor(clock.minutes / 10) + carry));
        };
        renderClock();

        const center = () => {
          const pinBox = pin.getBoundingClientRect();
          const clockBox = clockEl.getBoundingClientRect();
          return {
            x: clockBox.left + clockBox.width / 2 - pinBox.left,
            y: clockBox.top + clockBox.height / 2 - pinBox.top,
          };
        };

        // O horário ativo troca no meio da entrada do texto do passo (unidade + 0,33).
        let activeStep = -1;
        const syncRail = (time: number) => {
          const step =
            time >= FINALE_AT + 0.5
              ? STEPS.length
              : Math.min(STEPS.length - 1, Math.max(0, Math.floor(time - 0.33)));
          if (step === activeStep) return;
          activeStep = step;
          for (const [index, item] of railItems.entries()) {
            item.toggleAttribute("data-active", index === step);
            item.toggleAttribute("data-done", index < step);
          }
        };

        gsap.set(copies.slice(1), { autoAlpha: 0 });
        gsap.set(panels.slice(1), { autoAlpha: 0 });
        gsap.set(q(".cd-status-idle"), { autoAlpha: 1 });
        gsap.set(q(".cd-status-ok"), { autoAlpha: 0, x: 6 });
        if (editor) editor.value = reviewMarkdown(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 0.5 },
          // O scrub suaviza o cabeçote depois que a rolagem para; a trilha acompanha a timeline.
          onUpdate: () => syncRail(tl.time()),
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${window.innerHeight * 5.4}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        trigger.current = tl.scrollTrigger ?? null;
        timeline.current = tl;

        // 09:13 conexões verificadas, uma depois da outra.
        tl.to(clock, { minutes: STEPS[0].minute, duration: 0.4, onUpdate: renderClock }, 0)
          .to(q(".cd-status-idle"), { autoAlpha: 0, duration: 0.2, stagger: 0.25 }, 0.25)
          .to(q(".cd-status-ok"), { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.25 }, 0.3)
          .fromTo(
            q(".cd-test"),
            { scale: 1 },
            { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 },
            0.15
          );

        for (const [index, step] of STEPS.entries()) {
          if (index === 0) continue;
          tl.to(
            copies[index - 1],
            { autoAlpha: 0, y: -28, filter: "blur(6px)", duration: 0.3 },
            index
          )
            .to(
              panels[index - 1],
              { autoAlpha: 0, y: -36, scale: 0.98, filter: "blur(8px)", duration: 0.32 },
              index
            )
            .fromTo(
              copies[index],
              { autoAlpha: 0, y: 32, filter: "blur(6px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.35, immediateRender: false },
              index + 0.15
            )
            .fromTo(
              panels[index],
              { autoAlpha: 0, y: 56, scale: 0.97, filter: "blur(8px)" },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.4,
                immediateRender: false,
              },
              index + 0.15
            )
            .to(clock, { minutes: step.minute, duration: 0.5, onUpdate: renderClock }, index);
        }

        // 09:14 o botão de gerar é acionado no fim do passo.
        tl.fromTo(
          q(".cd-generate"),
          { scale: 1 },
          { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 },
          1.8
        )
          // 09:16 o rascunho se compõe linha a linha.
          .from(
            q(
              ".cd-draft .document-body > :is(.report-meta, h2, .report-intro), .cd-draft .report-preview :is(h3, li)"
            ),
            {
              autoAlpha: 0,
              x: -12,
              filter: "blur(4px)",
              duration: 0.2,
              stagger: 0.03,
              ease: "power2.out",
            },
            2.25
          );

        // 09:21 a pessoa substitui as lacunas no editor.
        if (editor) {
          const typing = { progress: 0 };
          tl.to(
            typing,
            {
              progress: 1,
              duration: 0.45,
              ease: "none",
              onUpdate: () => {
                editor.value = reviewMarkdown(typing.progress);
              },
            },
            3.4
          );
        }

        // 09:29 texto copiado.
        tl.fromTo(
          q(".cd-copy-button"),
          { scale: 1 },
          { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 },
          4.45
        ).from(q(".cd-toast"), { autoAlpha: 0, y: 18, duration: 0.3, ease: "power3.out" }, 4.5);

        // 09:30 o campo verde nasce do relógio e toma a tela.
        tl.to(clock, { minutes: 30, duration: 0.35, onUpdate: renderClock }, FINALE_AT - 0.1)
          .fromTo(
            q(".cd-finale"),
            { clipPath: () => `circle(0px at ${center().x}px ${center().y}px)` },
            {
              clipPath: () =>
                `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${center().x}px ${center().y}px)`,
              duration: 0.75,
              ease: "power3.in",
            },
            FINALE_AT + 0.2
          )
          .from(
            q(".cd-finale [data-finale-item]"),
            { autoAlpha: 0, y: 40, duration: 0.4, stagger: 0.08, ease: "power3.out" },
            FINALE_AT + 0.75
          )
          .to({}, { duration: 0.2 });

        syncRail(0);
        return () => {
          section.classList.remove("is-staged");
          trigger.current = null;
          timeline.current = null;
        };
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="como-funciona" className="countdown" aria-labelledby="countdown-title">
      <div className="cd-pin relative">
        <div className="cd-grid mx-auto max-w-[1400px] px-4 md:px-8">
          <h2
            id="countdown-title"
            className="cd-head max-w-[13ch] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.04] font-semibold tracking-[-0.032em] text-balance"
          >
            Dezoito minutos antes da daily.
          </h2>
          <div className="cd-clock" aria-hidden="true">
            <ClockReels
              time="09:12"
              decorative
              className="text-[clamp(4.25rem,8vw,7.75rem)] font-medium text-primary"
            />
          </div>
          <div className="cd-foot">
            <ol className="cd-rail" aria-label="Etapas">
              {STEPS.map((step, index) => (
                <li key={step.time}>
                  <button
                    type="button"
                    className="cd-rail-item"
                    onClick={() => scrollToStep(index)}
                    aria-label={`${step.time}: ${step.title}`}
                  >
                    {step.time}
                  </button>
                </li>
              ))}
            </ol>
            <p className="cd-note text-[0.75rem] text-muted-foreground">
              Exemplo com dados fictícios.
            </p>
          </div>
          <div className="cd-steps">
            {STEPS.map((step, index) => (
              <article key={step.time} id={`passo-${index + 1}`} className="cd-step">
                <div className="cd-copy">
                  <h3 className="text-[clamp(1.5rem,2.2vw,2rem)] leading-tight font-semibold tracking-[-0.025em]">
                    <span className="cd-time font-semibold text-primary tabular-nums">
                      {step.time}{" "}
                    </span>
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[42ch] text-[1rem] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
                <Reveal className="cd-panel" skipWhen="(min-width: 1024px)">
                  {index === 0 && <SourcesPanel />}
                  {index === 1 && <OptionsPanel onGenerate={() => scrollToStep(2)} />}
                  {index === 2 && <DraftPanel />}
                  {index === 3 && <ReviewPanel />}
                  {index === 4 && <CopyPanel />}
                </Reveal>
              </article>
            ))}
          </div>
        </div>
        <div className="cd-finale bg-field text-field-foreground">
          <div className="cd-finale-inner">
            <div data-finale-item>
              <ClockReels
                time="09:30"
                decorative
                className="text-[clamp(5rem,20vw,18rem)] font-medium"
              />
            </div>
            <p
              data-finale-item
              className="mt-2 text-[clamp(2rem,4.4vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.032em]"
            >
              Pronto para a daily.
            </p>
            <p data-finale-item className="mt-4 max-w-[40ch] text-[1.0625rem] text-field-muted">
              Fontes conferidas, rascunho revisado, texto copiado.
            </p>
            <div data-finale-item className="mt-8">
              <Button
                asChild
                className="cta-lg h-12 bg-field-foreground px-6 text-field hover:bg-field-foreground/90"
              >
                <Link href="/app">
                  Abrir o app <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
