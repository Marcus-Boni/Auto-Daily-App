import { cn } from "@/lib/utils";

/** Duas voltas de 0 a 9: permite girar uma volta inteira antes de parar no dígito. */
const CELLS = Array.from({ length: 20 }, (_, index) => ({
  id: `cell-${index}`,
  digit: index % 10,
}));
export const REEL_CELL_PERCENT = 100 / CELLS.length;

/**
 * Relógio em rolos, como um odômetro. Cada dígito é uma fita vertical; o HTML do
 * servidor já mostra a hora correta e o GSAP só move as fitas (`[data-reel-strip]`).
 */
export function ClockReels({
  time,
  className,
  decorative = false,
}: {
  time: string;
  className?: string;
  decorative?: boolean;
}) {
  const digits = time.replace(":", "").split("");
  const reel = (digit: string, slot: string) => (
    <span className="clock-reel" key={slot} data-reel={slot}>
      <span
        className="clock-strip"
        data-reel-strip
        style={{ "--reel-index": 10 + Number(digit) } as React.CSSProperties}
      >
        {CELLS.map((cell) => (
          <span key={cell.id}>{cell.digit}</span>
        ))}
      </span>
    </span>
  );
  const face = (
    <>
      {reel(digits[0], "h1")}
      {reel(digits[1], "h2")}
      <span className="clock-colon" aria-hidden="true">
        :
      </span>
      {reel(digits[2], "m1")}
      {reel(digits[3], "m2")}
    </>
  );
  if (decorative)
    return (
      <span className={cn("clock", className)} aria-hidden="true">
        {face}
      </span>
    );
  return (
    <span className={cn("clock", className)} role="img" aria-label={time}>
      {face}
    </span>
  );
}
