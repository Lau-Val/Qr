"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

const FLY_MS = 1000;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Eenvoudig cadeaupakje: tik om te openen; deksel schuift omhoog, prijs verschijnt erboven.
 */
export function KapperPrizeBox({
  opening,
  revealDealId,
  showcase,
  onBoxPress,
  idleHint,
}: {
  opening: boolean;
  revealDealId: string | null;
  showcase: Row[];
  onBoxPress: () => void;
  idleHint: string;
}) {
  const showPrize = Boolean(revealDealId && !opening);
  const winner = revealDealId
    ? showcase.find((s) => s.dealId === revealDealId)
    : null;

  const canTap = !opening && !revealDealId;
  const [flyProgress, setFlyProgress] = useState(0);

  useEffect(() => {
    if (!opening) {
      setFlyProgress(0);
      return;
    }
    const start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FLY_MS);
      setFlyProgress(easeOutCubic(t));
      if (t < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [opening]);

  const lidOff =
    revealDealId != null && !opening ? 1 : opening ? flyProgress : 0;

  return (
    <div className="flex w-full flex-col items-center px-1">
      <div
        className={cn(
          "flex w-full max-w-[min(260px,82vw)] flex-col items-center justify-end transition-[opacity,margin] duration-500",
          showPrize && winner
            ? "mb-3 min-h-0 opacity-100"
            : "pointer-events-none mb-0 max-h-0 min-h-0 overflow-hidden opacity-0",
        )}
        aria-live="polite"
      >
        {showPrize && winner ? (
          <div className="bb-kapper-prize-rise w-full max-w-[min(240px,78vw)] rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-center shadow-lg shadow-stone-900/5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Jouw voordeel
            </p>
            <p className="mt-2 text-[clamp(0.95rem,3.8vw,1.1rem)] font-bold leading-snug text-stone-900">
              {winner.text}
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={!canTap}
        onClick={() => {
          if (canTap) onBoxPress();
        }}
        className={cn(
          "relative mx-auto w-full max-w-[220px] touch-manipulation outline-none [-webkit-tap-highlight-color:transparent]",
          canTap && "cursor-pointer active:scale-[0.98]",
          !canTap && "cursor-default",
        )}
        aria-label={canTap ? "Tik om het pakje te openen" : undefined}
      >
        <div className="relative w-full pb-[88%]">
          <div
            className="pointer-events-none absolute bottom-[3%] left-1/2 h-[9%] w-[70%] -translate-x-1/2 rounded-full bg-stone-900/12 blur-md"
            aria-hidden
          />

          {/* Onderkant */}
          <div
            className="absolute bottom-0 left-[10%] right-[10%] top-[42%] rounded-[0.85rem] border border-stone-300/90 bg-gradient-to-b from-stone-50 to-stone-200/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_rgba(28,25,23,0.08)]"
            aria-hidden
          />

          {/* Lint (kruis) */}
          <div
            className="pointer-events-none absolute bottom-1 left-1/2 top-[42%] z-[1] w-[20%] -translate-x-1/2 rounded-sm bg-[linear-gradient(180deg,#6b2d36_0%,#a84852_50%,#6b2d36_100%)] shadow-sm"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[44%] left-[10%] right-[10%] z-[1] h-[11%] rounded-sm bg-[linear-gradient(90deg,#5c2830_0%,#c45f6a_50%,#5c2830_100%)] shadow-sm"
            aria-hidden
          />

          {/* Deksel */}
          <div
            className="absolute left-[7%] right-[7%] top-[8%] z-[2] h-[36%] rounded-t-[0.85rem] border border-b-0 border-stone-300/90 bg-gradient-to-b from-white to-stone-100 shadow-md will-change-transform"
            style={{
              transform: `translateY(calc(-${lidOff * 7.5}rem))`,
              transition: opening ? "none" : "transform 280ms ease-out",
            }}
            aria-hidden
          >
            <div className="pointer-events-none absolute inset-x-[30%] bottom-2 top-2 rounded-sm bg-[linear-gradient(180deg,#7a343e_0%,#b85662_50%,#7a343e_100%)] opacity-90" />
          </div>
        </div>
      </button>

      {canTap ? (
        <p className="mt-4 max-w-[19rem] text-center text-[12px] font-medium leading-relaxed text-stone-600">
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
