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

/** Papier + wijnlint — warm kraft met duidelijke hoogte/lichtval */
const PAPER_FACE =
  "linear-gradient(168deg,#fffdfa 0%,#f3e8dc 28%,#ddc9b4 58%,#c4a990 100%)";
const PAPER_FACE_TOP =
  "linear-gradient(208deg,#fffcf9 0%,#f5ebe3 35%,#e2d2c2 70%,#cdb59e 100%)";
const RIBBON =
  "linear-gradient(90deg,#1f0a0e 0%,#6b2430 18%,#b84a56 45%,#f0c4c8 50%,#b84a56 55%,#6b2430 82%,#1f0a0e 100%)";
const RIBBON_V =
  "linear-gradient(180deg,#1f0a0e 0%,#6b2430 22%,#b84a56 48%,#f0c4c8 50%,#b84a56 52%,#6b2430 78%,#1f0a0e 100%)";

function ParcelBow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative flex h-10 w-[4.25rem] items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <div className="absolute h-8 w-11 -translate-x-[92%] rounded-[45%] bg-gradient-to-br from-[#8b3a46] via-[#5c1f28] to-[#2a0c10] shadow-[inset_0_2px_5px_rgba(255,230,232,0.4),0_5px_10px_rgba(30,8,12,0.45)] -rotate-[26deg]" />
      <div className="relative z-10 h-6 w-[1.65rem] rounded-full bg-gradient-to-br from-[#c45460] via-[#722f37] to-[#3d1218] shadow-[inset_0_2px_4px_rgba(255,220,224,0.65)] ring-[2.5px] ring-[#f5e6e8]/55" />
      <div className="absolute h-8 w-11 translate-x-[92%] rounded-[45%] bg-gradient-to-bl from-[#8b3a46] via-[#5c1f28] to-[#2a0c10] shadow-[inset_0_2px_5px_rgba(255,230,232,0.4),0_5px_10px_rgba(30,8,12,0.45)] rotate-[26deg]" />
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

      <div className="relative mx-auto w-full max-w-[min(300px,86vw)]">
        <div className="relative w-full pb-[92%]">
          {/* Vloer-schaduw (plat; buiten 3D-draai voor “grond”) */}
          <div
            className="pointer-events-none absolute bottom-[2%] left-1/2 z-0 h-[11%] w-[76%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(35,24,18,0.45)_0%,rgba(35,24,18,0.12)_55%,transparent_72%)] blur-[18px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[3%] left-1/2 z-0 h-[8%] w-[68%] rounded-[100%] bg-stone-900/25 blur-md"
            style={{
              transform: "translateX(-50%) scaleX(1.08) skewX(-8deg)",
            }}
            aria-hidden
          />

          {/* 3D-scène: papier + diepte */}
          <div
            className="bb-kapper-parcel-scene absolute inset-[2%] z-[1]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Onderkant — massief blok met zij-hoek */}
            <div
              className="absolute bottom-0 left-[3%] right-[3%] top-[42%] overflow-hidden rounded-b-[1.5rem] rounded-t-[0.45rem] border border-[#6b5344]/35"
              style={{
                background: PAPER_FACE,
                boxShadow: `
                  inset 0 3px 2px rgba(255,252,248,0.9),
                  inset 3px 0 14px rgba(255,255,255,0.12),
                  inset -10px -4px 22px rgba(42,30,22,0.18),
                  0 18px 36px rgba(32,22,16,0.28),
                  0 4px 0 rgba(90,70,56,0.12)
                `,
              }}
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.09]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Linker zijkant donkerder = 3D-kant */}
              <div className="pointer-events-none absolute inset-y-2 bottom-2 left-1 top-2 w-[16%] rounded-bl-[1.05rem] bg-gradient-to-r from-black/28 via-black/08 to-transparent" />
              <div className="pointer-events-none absolute inset-y-2 bottom-2 right-1 top-2 w-[12%] rounded-br-[0.9rem] bg-gradient-to-l from-white/18 to-transparent" />
              {/* Licht van links-boven */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent opacity-70" />
              <div className="pointer-events-none absolute left-0 top-0 h-[42%] w-[55%] rounded-br-[100%] bg-gradient-to-br from-white/25 to-transparent opacity-90" />

              {/* Wijnkleurig lint + satijnglans */}
              <div
                className="absolute inset-y-2.5 left-1/2 w-[26%] -translate-x-1/2 rounded-[4px]"
                style={{
                  background: RIBBON_V,
                  boxShadow:
                    "inset 0 2px 3px rgba(255,220,224,0.35), inset 0 -2px 4px rgba(20,4,8,0.45), 0 0 0 1px rgba(20,6,10,0.25)",
                }}
                aria-hidden
              />
              <div
                className="absolute left-3 right-3 top-1/2 h-[20%] -translate-y-1/2 rounded-[4px]"
                style={{
                  background: RIBBON,
                  boxShadow:
                    "inset 0 2px 3px rgba(255,220,224,0.3), inset 0 -2px 4px rgba(20,4,8,0.4), 0 0 0 1px rgba(20,6,10,0.22)",
                }}
                aria-hidden
              />
              {/* Goud accent rozet */}
              <div
                className="absolute left-1/2 top-1/2 z-[1] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#fde8c8] via-[#d4a057] to-[#8a5c1e] shadow-[0_4px_10px_rgba(40,20,8,0.35),inset_0_2px_3px_rgba(255,255,255,0.65)] ring-2 ring-[#f8ecd8]/90"
                aria-hidden
              />
              <div
                className="absolute left-1/2 top-1/2 z-[2] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#fff8ed]/90 to-[#c9953e]/80 opacity-90"
                aria-hidden
              />

              {/* Opening / binnenkant */}
              <div
                className={cn(
                  "absolute inset-x-6 bottom-3.5 top-5 rounded-xl border border-[#a89888]/55 bg-gradient-to-b from-[#faf6f1] via-[#ebe3da] to-[#d8cfc4] shadow-[inset_0_3px_8px_rgba(42,32,26,0.12)] transition-opacity duration-300",
                  seamOpen > 0.05 ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              />
              {/* Voorkant “dikte”-illusie */}
              <div
                className="pointer-events-none absolute bottom-0 left-[6%] right-[6%] h-2 rounded-b-[1rem] bg-gradient-to-b from-[#5c4638]/35 to-[#3d2e26]/55"
                aria-hidden
              />
            </div>

            {/* Bovenkant — deksel met strik + specular */}
            <div
              className="absolute left-[2%] right-[2%] top-[5%] h-[39%] origin-[50%_100%] overflow-hidden rounded-t-[1.45rem] border border-[#6b5344]/38 border-b-0 will-change-transform"
              style={{
                background: PAPER_FACE_TOP,
                boxShadow: `
                  inset 0 4px 3px rgba(255,255,255,0.95),
                  inset -8px -6px 18px rgba(62,48,38,0.12),
                  0 14px 28px rgba(28,20,14,0.22)
                `,
                transform: `translate3d(0,calc(-${topLiftRem}rem - ${topFlyRem}rem),0) rotateX(${-seamOpen * 14}deg)`,
                transition:
                  isDragging || opening
                    ? "none"
                    : `transform ${SNAP_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`,
              }}
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#8a735f]/15" />
              <div className="pointer-events-none absolute -left-1/4 top-0 h-[55%] w-[70%] rotate-12 bg-gradient-to-br from-white/45 to-transparent opacity-80" />

              <div className="absolute left-1/2 top-[14%] z-[2] -translate-x-1/2">
                <ParcelBow className="scale-[1.02] drop-shadow-[0_6px_12px_rgba(40,10,14,0.35)]" />
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-[#5c4638]/45 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-70"
                aria-hidden
              />
            </div>

            {/* Naad-glans */}
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-[42%] h-[3.5%] rounded-full bg-gradient-to-r from-transparent via-white/75 to-transparent"
              style={{
                opacity: seamOpen * (1 - flyAway) * 0.9,
                transform: `translateZ(24px) scaleY(${0.35 + seamOpen * 0.95})`,
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
