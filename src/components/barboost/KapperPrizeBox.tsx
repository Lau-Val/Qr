"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

const COMMIT_THRESHOLD = 0.88;
const FLY_MS = 1100;
const SNAP_MS = 320;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Warm kraft + wijnlint + goud — zelfde palet als voorheen, strakker dan “papier-look” */
const BOX_MAIN =
  "linear-gradient(100deg,#faf6f1 0%,#efe4d8 42%,#d9c9b6 72%,#b8a08c 100%)";
const LID_TOP =
  "linear-gradient(195deg,#ffffff 0%,#f8f2ec 28%,#ebe0d4 62%,#d2c2b0 100%)";
const RIBBON_H =
  "linear-gradient(90deg,#6b2832 0%,#a84852 22%,#d87882 50%,#a84852 78%,#6b2832 100%)";
const RIBBON_V =
  "linear-gradient(180deg,#5c242c 0%,#8f3d47 35%,#e8a0a8 50%,#8f3d47 65%,#5c242c 100%)";

/** Strik: vier glanzende lussen (referentie) + gouden knoop */
function GiftBow({ className }: { className?: string }) {
  const loop =
    "rounded-[50%] bg-gradient-to-br from-[#c75f68] via-[#8a303c] to-[#4a181e] shadow-[inset_0_2px_4px_rgba(255,230,232,0.5),0_3px_8px_rgba(40,10,14,0.32)]";
  return (
    <div
      className={cn(
        "pointer-events-none relative h-[3.1rem] w-[3.5rem]",
        className,
      )}
      aria-hidden
    >
      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 px-0.5 pt-0.5">
        <div className={cn("h-6 w-7 -rotate-[16deg]", loop)} />
        <div className={cn("h-6 w-7 rotate-[16deg]", loop)} />
        <div className={cn("h-6 w-7 rotate-[14deg]", loop)} />
        <div className={cn("h-6 w-7 -rotate-[14deg]", loop)} />
      </div>
      <div className="absolute left-1/2 top-[46%] z-20 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#fcecc8] via-[#d4a24a] to-[#8a6020] shadow-[inset_0_2px_3px_rgba(255,255,255,0.65),0_2px_6px_rgba(40,20,8,0.35)] ring-2 ring-[#faf3e6]/90" />
    </div>
  );
}

/**
 * Cadeaupakje: onderkant + bovenkant, schuif om de naad te openen (1:1 met de schuif),
 * daarna schiet de bovenkant omhoog weg; prijs verschijnt boven de onderkant.
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

  const canSlide = !opening && !revealDealId;
  const committedRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const [slideProgress, setSlideProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyProgress, setFlyProgress] = useState(0);

  const dragProgress = opening || revealDealId ? 1 : slideProgress;

  useEffect(() => {
    if (!opening) {
      setFlyProgress(0);
      return;
    }
    let start = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FLY_MS);
      setFlyProgress(easeOutCubic(t));
      if (t < 1) {
        id = requestAnimationFrame(tick);
      }
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [opening]);

  const commitOpen = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    setSlideProgress(1);
    onBoxPress();
  }, [onBoxPress]);

  const updateProgressFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = clamp01((clientX - rect.left) / rect.width);
      setSlideProgress(p);
      if (p >= 0.995) {
        commitOpen();
      }
    },
    [commitOpen],
  );

  const onTrackPointerDown = (e: React.PointerEvent) => {
    if (!canSlide) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    updateProgressFromClientX(e.clientX);
  };

  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (!canSlide || !draggingRef.current) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateProgressFromClientX(e.clientX);
  };

  const onTrackPointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    setIsDragging(false);
    if (!opening && !revealDealId) {
      setSlideProgress((p) => {
        if (p >= COMMIT_THRESHOLD) {
          commitOpen();
          return 1;
        }
        return 0;
      });
    }
  };

  /** Naad opent mee met schuif (0–1); daarna vliegt de bovenkant weg met flyProgress. */
  const seamOpen = dragProgress;
  const flyAway = opening ? flyProgress : revealDealId ? 1 : 0;

  const topLiftRem = seamOpen * 2.35;
  const topFlyRem = flyAway * 13;

  return (
    <div className="flex w-full flex-col items-center px-1">
      {/* Prijs boven de onderkant (pas zichtbaar na openen) */}
      <div
        className={cn(
          "flex w-full max-w-[min(280px,82vw)] flex-col items-center justify-end transition-[opacity,margin] duration-500",
          showPrize && winner
            ? "mb-3 min-h-0 opacity-100"
            : "pointer-events-none mb-0 max-h-0 min-h-0 overflow-hidden opacity-0",
        )}
        aria-live="polite"
      >
        {showPrize && winner ? (
          <div className="bb-kapper-prize-rise w-full max-w-[min(260px,78vw)] rounded-2xl border border-stone-200/95 bg-white px-4 py-3.5 text-center shadow-[0_14px_36px_rgba(15,23,42,0.1)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Jouw voordeel
            </p>
            <p className="mt-2 text-[clamp(0.95rem,3.8vw,1.1rem)] font-bold leading-snug text-stone-900">
              {winner.text}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto w-full max-w-[min(280px,84vw)]">
        <div className="relative w-full pb-[100%]">
          {/* Grondschaduw — zacht, zoals de referentie */}
          <div
            className="pointer-events-none absolute bottom-[3%] left-1/2 z-0 h-[10%] w-[70%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(30,22,18,0.38)_0%,rgba(30,22,18,0.1)_58%,transparent_75%)] blur-[14px]"
            aria-hidden
          />

          <div
            className="bb-kapper-parcel-scene absolute inset-[3%] z-[1]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* —— Onderkant: hoog blok, afgeronde hoeken, glans (referentie-vorm) —— */}
            <div
              className="absolute bottom-0 left-[10%] right-[10%] top-[44%] overflow-hidden rounded-[1.15rem] border border-stone-800/8"
              style={{
                background: BOX_MAIN,
                boxShadow: `
                  inset 0 2px 1px rgba(255,255,255,0.95),
                  inset 0 -14px 24px rgba(60,48,38,0.08),
                  inset -18px 0 28px rgba(90,72,58,0.12),
                  0 12px 24px rgba(28,22,18,0.15)
                `,
              }}
              aria-hidden
            >
              <div className="pointer-events-none absolute inset-0 rounded-[1.1rem] bg-gradient-to-br from-white/55 via-transparent to-transparent opacity-90" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-stone-900/7" />
              {/* Verticaal lint (onderste deel) */}
              <div
                className="absolute bottom-1 left-1/2 top-2 z-[2] w-[21%] -translate-x-1/2 rounded-[3px]"
                style={{
                  background: RIBBON_V,
                  boxShadow:
                    "inset 0 1px 2px rgba(255,224,228,0.5), 0 0 0 1px rgba(50,18,22,0.12)",
                }}
              />
              <div
                className={cn(
                  "absolute inset-x-[14%] bottom-[12%] top-[18%] z-[1] rounded-xl border border-[#c4b5a4]/60 bg-gradient-to-b from-[#faf7f3] to-[#e5ddd4] shadow-[inset_0_2px_10px_rgba(42,34,28,0.08)] transition-opacity duration-300",
                  seamOpen > 0.06 ? "opacity-100" : "opacity-0",
                )}
              />
            </div>

            {/* Horizontaal lint op de naad (overgang deksel ↔ bodem) */}
            <div
              className="pointer-events-none absolute left-[6%] right-[6%] top-[43.5%] z-[4] h-[13%] -translate-y-1/2 rounded-[3px]"
              style={{
                background: RIBBON_H,
                boxShadow:
                  "inset 0 2px 2px rgba(255,224,228,0.4), 0 0 0 1px rgba(50,18,22,0.1)",
                opacity: 0.97,
              }}
              aria-hidden
            />

            {/* —— Deksel: iets breder, afgerond, lip + strik (referentie) —— */}
            <div
              className="absolute left-[6%] right-[6%] top-[6%] z-[5] h-[38%] origin-[50%_100%] overflow-visible rounded-t-[1.25rem] will-change-transform"
              style={{
                transform: `translate3d(0,calc(-${topLiftRem}rem - ${topFlyRem}rem),0) rotateX(${-seamOpen * 12}deg)`,
                transition:
                  isDragging || opening
                    ? "none"
                    : `transform ${SNAP_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`,
              }}
              aria-hidden
            >
              <div
                className="relative h-[86%] overflow-hidden rounded-t-[1.25rem] border border-stone-800/10 border-b-0"
                style={{
                  background: LID_TOP,
                  boxShadow: `
                    inset 0 3px 2px rgba(255,255,255,1),
                    inset -12px -8px 20px rgba(70,56,44,0.07),
                    0 10px 22px rgba(28,22,18,0.12)
                  `,
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/15 to-transparent" />
                <div className="pointer-events-none absolute left-0 top-0 h-[38%] w-[65%] rounded-br-[100%] bg-gradient-to-br from-white/80 to-transparent" />
                {/* Verticaal lint op deksel */}
                <div
                  className="absolute bottom-1 left-1/2 top-2 z-[2] w-[21%] -translate-x-1/2 rounded-[3px]"
                  style={{
                    background: RIBBON_V,
                    boxShadow:
                      "inset 0 1px 2px rgba(255,224,228,0.55), 0 0 0 1px rgba(50,18,22,0.12)",
                  }}
                />
                {/* Horizontaal op deksel */}
                <div
                  className="absolute bottom-[18%] left-[5%] right-[5%] z-[3] h-[22%] rounded-[3px]"
                  style={{
                    background: RIBBON_H,
                    boxShadow:
                      "inset 0 2px 2px rgba(255,224,228,0.4), 0 0 0 1px rgba(50,18,22,0.1)",
                  }}
                />
                <div className="absolute left-1/2 top-[10%] z-[6] -translate-x-1/2">
                  <GiftBow />
                </div>
              </div>
              {/* Lip / rand onder het deksel */}
              <div
                className="pointer-events-none absolute bottom-0 left-[2%] right-[2%] h-[13%] rounded-b-[0.65rem] border border-t-0 border-stone-800/10 bg-gradient-to-b from-[#d4c4b2] to-[#b8a694]"
                style={{
                  boxShadow: "inset 0 3px 4px rgba(0,0,0,0.12)",
                }}
              />
            </div>

            <div
              className="pointer-events-none absolute left-[9%] right-[9%] top-[43.5%] z-[6] h-[2.5%] rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
              style={{
                opacity: seamOpen * (1 - flyAway) * 0.85,
              }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      {/* Schuif om te openen */}
      <div className="mt-5 w-full max-w-[min(280px,82vw)]">
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(dragProgress * 100)}
          aria-label="Schuif om het pakje te openen"
          aria-disabled={!canSlide}
          className={cn(
            "relative h-12 w-full touch-none rounded-full border border-stone-300/90 bg-gradient-to-b from-stone-100 to-stone-200/95 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] select-none",
            canSlide ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-80",
          )}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
        >
          <div
            className="pointer-events-none absolute inset-y-1 left-1 right-1 rounded-full bg-stone-300/35"
            aria-hidden
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-1.5 flex w-14 max-w-[calc(100%-0.5rem)] items-center justify-center rounded-full border border-stone-400/50 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.12)] will-change-transform",
              !isDragging && canSlide &&
                `transition-[left] ease-out [transition-duration:${SNAP_MS}ms]`,
            )}
            style={{
              left: `calc((100% - 3.5rem) * ${dragProgress})`,
            }}
          >
            <span className="text-lg text-stone-600" aria-hidden>
              →
            </span>
          </div>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center pl-16 pr-3 text-center text-[11px] font-medium tracking-tight text-stone-500">
            {opening
              ? "Even geduld…"
              : revealDealId
                ? "Klaar"
                : "Schuif om te openen"}
          </span>
        </div>
      </div>

      {canSlide ? (
        <p className="mt-3 max-w-[20rem] text-center text-[12px] font-medium leading-relaxed text-stone-600">
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
