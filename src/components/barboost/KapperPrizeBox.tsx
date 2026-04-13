"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

const FLY_MS = 1000;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Mystery box: animatie opent het deksel; start via onderliggende knop (geen tik op de doos).
 */
export function KapperPrizeBox({
  opening,
  revealDealId,
  showcase,
  onBoxPress,
  idleHint,
  variant = "light",
  interactiveBox = false,
}: {
  opening: boolean;
  revealDealId: string | null;
  showcase: Row[];
  /** Alleen gebruikt als `interactiveBox` true is (legacy / alternatief). */
  onBoxPress?: () => void;
  idleHint: string;
  /** `light` = salon; `dark` = bar / horeca op donkere achtergrond */
  variant?: "light" | "dark";
  /** Als true: tik op de doos start (standaard false: alleen knop eronder). */
  interactiveBox?: boolean;
}) {
  const showPrize = Boolean(revealDealId && !opening);
  const winner = revealDealId
    ? showcase.find((s) => s.dealId === revealDealId)
    : null;

  const canTap = interactiveBox && !opening && !revealDealId;
  const showIdleHint = !opening && !revealDealId;
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

  const dark = variant === "dark";

  const boxInner = (
    <div className="relative w-full pb-[88%]">
      <div
        className={cn(
          "pointer-events-none absolute bottom-[3%] left-1/2 h-[9%] w-[70%] -translate-x-1/2 rounded-full blur-md",
          dark ? "bg-black/45" : "bg-stone-900/12",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "absolute bottom-0 left-[10%] right-[10%] top-[42%] rounded-[0.85rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_16px_rgba(0,0,0,0.35)]",
          dark
            ? "border-white/12 bg-gradient-to-b from-slate-800 to-slate-950"
            : "border-stone-300/90 bg-gradient-to-b from-stone-50 to-stone-200/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_16px_rgba(28,25,23,0.08)]",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "pointer-events-none absolute bottom-1 left-1/2 top-[46%] z-[1] w-[20%] -translate-x-1/2 rounded-sm shadow-sm",
          dark
            ? "bg-[linear-gradient(180deg,#4c1d95_0%,#7c3aed_50%,#4c1d95_100%)]"
            : "bg-[linear-gradient(180deg,#6b2d36_0%,#a84852_50%,#6b2d36_100%)]",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-[18%] left-[10%] right-[10%] z-[1] h-[13%] rounded-sm shadow-sm",
          dark
            ? "bg-[linear-gradient(90deg,#5b21b6_0%,#a78bfa_50%,#5b21b6_100%)]"
            : "bg-[linear-gradient(90deg,#5c2830_0%,#c45f6a_50%,#5c2830_100%)]",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "absolute left-[6%] right-[6%] top-[7%] z-[2] h-[37%] overflow-hidden rounded-t-[0.9rem] border border-b-0 will-change-transform",
          dark
            ? "border-white/14 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[inset_0_2px_0_rgba(255,255,255,0.08),0_6px_14px_rgba(0,0,0,0.45)]"
            : "border-stone-300/85 bg-gradient-to-b from-white via-stone-50 to-stone-200/90 shadow-[inset_0_2px_0_rgba(255,255,255,0.95),0_6px_14px_rgba(28,25,23,0.1)]",
        )}
        style={{
          transform: `translateY(calc(-${lidOff * 7.5}rem))`,
          transition: opening ? "none" : "transform 280ms ease-out",
        }}
        aria-hidden
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            dark
              ? "bg-gradient-to-br from-violet-500/15 via-transparent to-fuchsia-500/10"
              : "bg-gradient-to-br from-white/80 via-transparent to-stone-400/10",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 h-[35%] w-[55%] rounded-br-[100%]",
            dark
              ? "bg-gradient-to-br from-white/10 to-transparent"
              : "bg-gradient-to-br from-white/90 to-transparent",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent to-transparent",
            dark ? "via-violet-400/25" : "via-stone-400/35",
          )}
        />
        <div className="pointer-events-none absolute left-1/2 top-[22%] z-[3] -translate-x-1/2 text-[clamp(1.35rem,7vw,1.85rem)] font-black tabular-nums leading-none text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          ?
        </div>
      </div>
    </div>
  );

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
          <div
            className={cn(
              "bb-kapper-prize-rise w-full max-w-[min(240px,78vw)] rounded-2xl border px-4 py-3.5 text-center shadow-lg",
              dark
                ? "border-violet-500/25 bg-slate-900/95 shadow-black/40"
                : "border-stone-200 bg-white shadow-stone-900/5",
            )}
          >
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.18em]",
                dark ? "text-violet-200/85" : "text-stone-500",
              )}
            >
              Jouw voordeel
            </p>
            <p
              className={cn(
                "mt-2 text-[clamp(0.95rem,3.8vw,1.1rem)] font-bold leading-snug",
                dark ? "text-white" : "text-stone-900",
              )}
            >
              {winner.text}
            </p>
          </div>
        ) : null}
      </div>

      {canTap ? (
        <button
          type="button"
          onClick={() => {
            if (canTap) onBoxPress?.();
          }}
          className={cn(
            "relative mx-auto w-full max-w-[220px] touch-manipulation outline-none [-webkit-tap-highlight-color:transparent]",
            "cursor-pointer active:scale-[0.98]",
          )}
          aria-label="Tik om de mystery box te openen"
        >
          {boxInner}
        </button>
      ) : (
        <div
          className="relative mx-auto w-full max-w-[220px]"
          role="presentation"
          aria-hidden
        >
          {boxInner}
        </div>
      )}

      {showIdleHint ? (
        <p
          className={cn(
            "mt-4 max-w-[19rem] text-center text-[12px] font-medium leading-relaxed",
            dark ? "text-white/55" : "text-stone-600",
          )}
        >
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
