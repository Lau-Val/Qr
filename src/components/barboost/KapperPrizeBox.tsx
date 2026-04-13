"use client";

import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

/**
 * Warme goud/amber cadeaudoos: tik om te openen, daarna komt de prijs omhoog.
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
  /** Onder de box als nog niet geopend */
  idleHint: string;
}) {
  const lidOpen = opening || Boolean(revealDealId);
  const showPrize = Boolean(revealDealId && !opening);
  const winner = revealDealId
    ? showcase.find((s) => s.dealId === revealDealId)
    : null;
  const canTap = !opening && !revealDealId;

  return (
    <div className="flex w-full flex-col items-center px-1">
      <div
        className="relative mx-auto w-full max-w-[min(280px,78vw)]"
        style={{ perspective: "960px" }}
      >
        <button
          type="button"
          disabled={!canTap}
          onClick={() => {
            if (canTap) onBoxPress();
          }}
          className={cn(
            "relative block w-full pb-[72%] outline-none transition-transform",
            canTap &&
              "cursor-pointer active:scale-[0.98] [-webkit-tap-highlight-color:transparent]",
            !canTap && "cursor-default",
          )}
          aria-label={canTap ? "Open de cadeaudoos om je prijs te zien" : undefined}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Schaduw onder de doos */}
            <div
              className="absolute bottom-[6%] left-1/2 h-[14%] w-[72%] -translate-x-1/2 rounded-full bg-black/35 blur-xl"
              aria-hidden
            />

            {/* Doos: onderkant */}
            <div
              className="absolute bottom-0 left-[9%] right-[9%] top-[38%] rounded-b-[1.35rem] rounded-t-sm border border-amber-900/25 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 shadow-[inset_0_2px_0_rgba(255,255,255,0.35),0_12px_28px_rgba(120,80,20,0.45)]"
              aria-hidden
            />

            {/* Deksel — scharnier onderaan */}
            <div
              className="absolute left-[7%] right-[7%] top-[8%] h-[34%] origin-bottom rounded-t-[1.25rem] border border-amber-900/30 bg-gradient-to-br from-amber-50 via-amber-200 to-amber-600 shadow-[0_-4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)] transition-[transform,box-shadow] duration-[2400ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
              style={{
                transform: lidOpen ? "rotateX(-108deg)" : "rotateX(0deg)",
                transformOrigin: "50% 100%",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="absolute inset-x-[18%] top-[18%] h-[22%] rounded-full bg-gradient-to-r from-amber-400/80 via-yellow-200/90 to-amber-400/80 opacity-90 blur-[1px]"
                aria-hidden
              />
              <span
                className="absolute left-1/2 top-[28%] -translate-x-1/2 text-2xl drop-shadow-sm"
                aria-hidden
              >
                🎀
              </span>
            </div>

            {/* Binnenkant / vraagteken vóór prijs */}
            {!showPrize ? (
              <div
                className={cn(
                  "absolute bottom-[14%] left-[16%] right-[16%] top-[44%] flex items-center justify-center rounded-lg border border-amber-900/15 bg-gradient-to-b from-amber-950/90 to-stone-900/95 transition-opacity duration-500",
                  opening && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "text-4xl font-black text-amber-200/35 transition-all duration-700",
                    opening && "scale-110 text-amber-100/50",
                  )}
                  aria-hidden
                >
                  ?
                </span>
              </div>
            ) : null}

            {/* Prijs kaartje omhoog */}
            {showPrize && winner ? (
              <div className="bb-kapper-prize-rise pointer-events-none absolute bottom-[18%] left-[8%] right-[8%] z-20 flex justify-center">
                <div className="max-w-[95%] rounded-2xl border-2 border-amber-300/90 bg-gradient-to-b from-white to-amber-50 px-4 py-3 text-center shadow-[0_20px_40px_rgba(0,0,0,0.35)] ring-1 ring-amber-500/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800/80">
                    Gefeliciteerd
                  </p>
                  <p className="mt-1.5 text-[clamp(0.95rem,3.8vw,1.15rem)] font-extrabold leading-tight text-amber-950">
                    {winner.text}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </button>
      </div>

      {canTap ? (
        <p className="mt-3 max-w-[18rem] text-center text-[11px] font-medium leading-snug text-amber-900/70">
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
