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

      <div
        className="relative mx-auto w-full max-w-[min(280px,82vw)]"
        style={{ perspective: "1000px" }}
      >
        <div className="relative w-full pb-[88%]">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Schaduw onder het pakje */}
            <div
              className="absolute bottom-[4%] left-1/2 h-[10%] w-[72%] -translate-x-1/2 rounded-full bg-stone-500/20 blur-xl"
              aria-hidden
            />

            {/* Onderkant — blijft staan */}
            <div
              className="absolute bottom-0 left-[6%] right-[6%] top-[46%] overflow-hidden rounded-b-[1.35rem] rounded-t-md border border-[#b8a090]/90 bg-[linear-gradient(165deg,#f6f0ea_0%,#e8ddd4_42%,#d9cdc2_100%)] shadow-[inset_0_2px_0_rgba(255,255,255,0.75),0_14px_28px_rgba(28,25,23,0.12)]"
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Lint kruis — vooral op onderkant */}
              <div
                className="absolute inset-y-2 left-1/2 w-[24%] -translate-x-1/2 rounded-[3px] bg-gradient-to-b from-[#f0dcc8] via-[#c9a06c] to-[#9e7348] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                aria-hidden
              />
              <div
                className="absolute left-2.5 right-2.5 top-1/2 h-[19%] -translate-y-1/2 rounded-[3px] bg-gradient-to-r from-[#f0dcc8] via-[#c9a06c] to-[#9e7348] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                aria-hidden
              />
              <div
                className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#e8c9a8] to-[#a67c52] shadow-md ring-2 ring-[#f5e6d8]/90"
                aria-hidden
              />
              {/* Binnenkant / opening */}
              <div
                className={cn(
                  "absolute inset-x-5 bottom-3 top-4 rounded-lg border border-stone-300/50 bg-gradient-to-b from-stone-100/95 to-stone-200/80 shadow-inner transition-opacity duration-300",
                  seamOpen > 0.05 ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
            </div>

            {/* Bovenkant — schuift omhoog mee met schuif, daarna weg */}
            <div
              className="absolute left-[5%] right-[5%] top-[7%] h-[40%] origin-[50%_100%] overflow-hidden rounded-t-[1.3rem] border border-[#b8a090]/90 border-b-0 bg-[linear-gradient(195deg,#fffcf8_0%,#f0e6dc_55%,#e5d8cc_100%)] shadow-[0_10px_22px_rgba(28,25,23,0.1),inset_0_2px_0_rgba(255,255,255,0.88)] will-change-transform"
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
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
              />
              <div
                className="absolute left-1/2 top-[18%] flex -translate-x-1/2 drop-shadow-sm"
                aria-hidden
              >
                <span className="text-[1.35rem] leading-none">🎀</span>
              </div>
              <div
                className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-stone-400/50 to-transparent"
                aria-hidden
              />
            </div>

            {/* Tijdens schuiven / vliegen: subtiele glans in de naad */}
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-[44%] h-[3%] rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0"
              style={{
                opacity: seamOpen * (1 - flyAway) * 0.85,
                transform: `scaleY(${0.4 + seamOpen * 0.8})`,
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
