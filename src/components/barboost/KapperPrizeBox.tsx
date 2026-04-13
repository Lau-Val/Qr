"use client";

import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

/**
 * Ingepakt cadeaupakje (licht papier + lint): tik om te openen, prijs komt tevoorschijn.
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
  const lidOpen = opening || Boolean(revealDealId);
  const showPrize = Boolean(revealDealId && !opening);
  const winner = revealDealId
    ? showcase.find((s) => s.dealId === revealDealId)
    : null;
  const canTap = !opening && !revealDealId;

  return (
    <div className="flex w-full flex-col items-center px-1">
      <div
        className="relative mx-auto w-full max-w-[min(260px,76vw)]"
        style={{ perspective: "900px" }}
      >
        <button
          type="button"
          disabled={!canTap}
          onClick={() => {
            if (canTap) onBoxPress();
          }}
          className={cn(
            "relative block w-full pb-[78%] outline-none transition-transform",
            canTap &&
              "cursor-pointer active:scale-[0.99] [-webkit-tap-highlight-color:transparent]",
            !canTap && "cursor-default",
          )}
          aria-label={
            canTap ? "Open het pakje om je salon-voordeel te zien" : undefined
          }
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Zachte schaduw */}
            <div
              className="absolute bottom-[5%] left-1/2 h-[12%] w-[70%] -translate-x-1/2 rounded-full bg-stone-400/25 blur-lg"
              aria-hidden
            />

            {/* Pakje: onderkant — ingepakt papier */}
            <div
              className="absolute bottom-0 left-[8%] right-[8%] top-[36%] rounded-b-[1.25rem] rounded-t-sm border border-stone-300/70 bg-[#f3ebe3] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(28,25,23,0.08)]"
              aria-hidden
            >
              {/* Verticaal lint */}
              <div
                className="absolute inset-y-2 left-1/2 w-[22%] -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#e8d5c4] via-[#d4a574] to-[#b8956a] opacity-90 shadow-inner"
                aria-hidden
              />
              {/* Horizontaal lint */}
              <div
                className="absolute left-2 right-2 top-1/2 h-[18%] -translate-y-1/2 rounded-sm bg-gradient-to-r from-[#e8d5c4] via-[#d4a574] to-[#b8956a] opacity-90 shadow-inner"
                aria-hidden
              />
            </div>

            {/* Deksel / bovenflap van het pakje */}
            <div
              className="absolute left-[6%] right-[6%] top-[6%] h-[32%] origin-bottom rounded-t-[1.15rem] border border-stone-300/75 bg-gradient-to-br from-[#faf6f1] via-[#f0e6dc] to-[#e5d5c8] shadow-[0_4px_12px_rgba(28,25,23,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] transition-[transform] duration-[2400ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
              style={{
                transform: lidOpen ? "rotateX(-110deg)" : "rotateX(0deg)",
                transformOrigin: "50% 100%",
                transformStyle: "preserve-3d",
              }}
              aria-hidden
            >
              {/* Mini strik */}
              <div className="absolute left-1/2 top-[22%] flex -translate-x-1/2 items-center justify-center">
                <span className="text-lg drop-shadow-sm" aria-hidden>
                  🎀
                </span>
              </div>
            </div>

            {/* Binnenkant vóór prijs — licht & rustig */}
            {!showPrize ? (
              <div
                className={cn(
                  "absolute bottom-[12%] left-[14%] right-[14%] top-[42%] flex items-center justify-center rounded-lg border border-stone-200/80 bg-stone-50/95 transition-opacity duration-500",
                  opening && "opacity-70",
                )}
              >
                <span
                  className={cn(
                    "text-3xl font-light text-stone-300 transition-all duration-700",
                    opening && "scale-105 text-stone-400",
                  )}
                  aria-hidden
                >
                  ···
                </span>
              </div>
            ) : null}

            {showPrize && winner ? (
              <div className="bb-kapper-prize-rise pointer-events-none absolute bottom-[16%] left-[6%] right-[6%] z-20 flex justify-center">
                <div className="max-w-[96%] rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-center shadow-[0_12px_32px_rgba(15,23,42,0.1)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Jouw voordeel
                  </p>
                  <p className="mt-2 text-[clamp(0.95rem,3.8vw,1.1rem)] font-bold leading-snug text-stone-900">
                    {winner.text}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </button>
      </div>

      {canTap ? (
        <p className="mt-4 max-w-[19rem] text-center text-[12px] font-medium leading-relaxed text-stone-600">
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
