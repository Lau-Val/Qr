import confetti from "canvas-confetti";

const GOLD = ["#fde68a", "#fbbf24", "#f59e0b"];

/** Twee bursts + korte regen — kleuren mixen met accent van de gewonnen deal */
export function fireWinConfetti(accentColors: string[]) {
  const palette = [...accentColors.slice(0, 2), ...GOLD, "#ffffff"];

  const fire = (originX: number, angle: number) => {
    void confetti({
      particleCount: 55,
      spread: 62,
      startVelocity: 38,
      angle,
      origin: { x: originX, y: 0.55 },
      colors: palette,
      ticks: 220,
      gravity: 0.95,
      scalar: 1.05,
      zIndex: 99999,
      disableForReducedMotion: true,
    });
  };

  fire(0.15, 60);
  fire(0.85, 120);

  window.requestAnimationFrame(() => {
    void confetti({
      particleCount: 40,
      spread: 100,
      origin: { x: 0.5, y: 0.35 },
      colors: palette,
      ticks: 200,
      gravity: 1.05,
      scalar: 0.9,
      zIndex: 99999,
      disableForReducedMotion: true,
    });
  });
}

/**
 * Regen van boven naar beneden (bijv. bij automatische stap naar deal-pagina).
 * `angle` 270 = naar beneden t.o.v. de library (90 = omhoog).
 */
export function fireFallConfetti(accentColors: string[]): () => void {
  const palette = [...accentColors.slice(0, 2), ...GOLD, "#ffffff"];

  const burst = () => {
    void confetti({
      particleCount: 14 + Math.floor(Math.random() * 8),
      angle: 270,
      spread: 72 + Math.floor(Math.random() * 18),
      startVelocity: 16 + Math.random() * 10,
      origin: { x: 0.08 + Math.random() * 0.84, y: 0 },
      colors: palette,
      ticks: 380,
      gravity: 1.02,
      drift: (Math.random() - 0.5) * 0.35,
      scalar: 0.9 + Math.random() * 0.25,
      zIndex: 99999,
      disableForReducedMotion: true,
    });
  };

  burst();
  const intervalId = window.setInterval(burst, 85);
  const timeoutId = window.setTimeout(() => {
    window.clearInterval(intervalId);
  }, 2600);

  return () => {
    window.clearInterval(intervalId);
    window.clearTimeout(timeoutId);
  };
}
