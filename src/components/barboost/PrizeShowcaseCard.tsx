import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { hexToRgba } from "@/lib/hex-alpha";

/** Elke kaart: eigen keyframes + eigen duur + lichte delay → nooit synchroon */
const DRIFT_ANIMATION = [
  { name: "bb-prize-drift-bg-0", durationSec: 8.4, delaySec: 0 },
  { name: "bb-prize-drift-bg-1", durationSec: 12.2, delaySec: -2.6 },
  { name: "bb-prize-drift-bg-2", durationSec: 9.9, delaySec: -5.4 },
] as const;

const GLOSS1_DUR_S = [10.8, 12.4, 11.1] as const;
const GLOSS1_DELAY_S = [0, -2.4, -5.8] as const;
const GLOSS2_DUR_S = [15.2, 13.5, 16.4] as const;
const GLOSS2_DELAY_S = [0, -4.2, -2.1] as const;

function accentDriftBackground(hex: string): string {
  return `linear-gradient(122deg,
    ${hexToRgba(hex, 0.52)} 0%,
    ${hexToRgba(hex, 0.38)} 18%,
    ${hexToRgba(hex, 0.48)} 36%,
    ${hexToRgba(hex, 0.32)} 52%,
    ${hexToRgba(hex, 0.5)} 68%,
    ${hexToRgba(hex, 0.36)} 84%,
    ${hexToRgba(hex, 0.45)} 100%)`;
}

export function PrizeShowcaseCard({
  accentHex,
  staggerIndex,
  emphasis = "normal",
  dealId,
  compact,
  children,
}: {
  accentHex: string;
  staggerIndex: number;
  emphasis?: "normal" | "winner" | "dimmed";
  /** Voor scroll/focus na het rad */
  dealId?: string;
  /** Compacte padding en geen extra winner-scale — past in vaste viewport */
  compact?: boolean;
  children: ReactNode;
}) {
  const border = hexToRgba(accentHex, 0.55);
  const glow = hexToRgba(accentHex, 0.22);
  const i = Math.min(2, Math.max(0, staggerIndex)) as 0 | 1 | 2;
  const drift = DRIFT_ANIMATION[i];

  const glossVars = {
    "--prize-gloss-1-dur": `${GLOSS1_DUR_S[i]}s`,
    "--prize-gloss-1-delay": `${GLOSS1_DELAY_S[i]}s`,
    "--prize-gloss-2-dur": `${GLOSS2_DUR_S[i]}s`,
    "--prize-gloss-2-delay": `${GLOSS2_DELAY_S[i]}s`,
  } as CSSProperties;

  const winnerGlow = `0 0 0 2px ${hexToRgba(accentHex, 0.45)}, 0 24px 64px rgba(0,0,0,0.55), 0 0 80px ${hexToRgba(accentHex, 0.42)}, 0 0 120px ${hexToRgba(accentHex, 0.2)}`;

  return (
    <div
      id={dealId ? `prize-reveal-${dealId}` : undefined}
      className={cn(
        "prize-showcase-card pointer-events-none relative overflow-hidden rounded-2xl border-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        compact ? "p-2 sm:p-2.5" : "p-4",
        "transition-[transform,opacity,box-shadow,border-color]",
        emphasis === "winner" &&
          (compact
            ? "z-30 ring-1 ring-white/30 ring-offset-1 ring-offset-[#06060a]"
            : "z-30 will-change-transform scale-[1.07] ring-2 ring-white/35 ring-offset-2 ring-offset-[#06060a] sm:scale-[1.14] sm:-translate-y-1"),
        emphasis === "dimmed" && "z-0 scale-[0.94] opacity-[0.22]",
      )}
      style={{
        ...glossVars,
        borderColor: emphasis === "winner" ? hexToRgba(accentHex, 0.75) : border,
        boxShadow:
          emphasis === "winner"
            ? winnerGlow
            : `0 0 0 1px ${hexToRgba(accentHex, 0.18)}, 0 20px 50px rgba(0,0,0,0.5), 0 0 56px ${glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${hexToRgba(accentHex, 0.22)} 0%, #0a0a12 48%, rgba(0,0,0,0.92) 100%)`,
        }}
        aria-hidden
      />
      {emphasis !== "dimmed" && (
        <>
          <div
            className="prize-showcase-drift-layer pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen opacity-[0.5]"
            style={{
              backgroundImage: accentDriftBackground(accentHex),
              backgroundSize: "380% 380%",
              animationName: drift.name,
              animationDuration: `${drift.durationSec}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${drift.delaySec}s`,
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 -top-10 z-[1] h-28 w-28 rounded-full blur-2xl"
            style={{ backgroundColor: hexToRgba(accentHex, 0.28) }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-[inherit]"
            aria-hidden
          >
            <div className="bb-upgrade-gloss-ray" />
            <div className="bb-upgrade-gloss-ray bb-upgrade-gloss-ray--secondary opacity-70" />
          </div>
        </>
      )}
      <div className="relative z-[3]">{children}</div>
    </div>
  );
}
