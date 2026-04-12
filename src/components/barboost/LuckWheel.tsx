"use client";

import { cn } from "@/lib/cn";

/** Gelijke segmenten: één kleur per deal (volgorde = van boven met de wijzer, met de klok mee) */
export function wheelConicGradient(segmentColors: string[]): string {
  const n = segmentColors.length;
  if (n === 0) {
    return "conic-gradient(from -90deg, #3f3f46 0deg 360deg)";
  }
  const slice = 360 / n;
  const stops = segmentColors.map(
    (c, i) => `${c} ${i * slice}deg ${(i + 1) * slice}deg`,
  );
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

const LEGACY_MULTI_SLICE = `conic-gradient(from -90deg,
              rgba(71, 85, 105, 0.95) 0deg 45deg,
              rgba(99, 102, 241, 0.9) 45deg 90deg,
              rgba(139, 92, 246, 0.92) 90deg 135deg,
              rgba(168, 85, 247, 0.9) 135deg 180deg,
              rgba(192, 132, 252, 0.88) 180deg 225deg,
              rgba(244, 114, 182, 0.9) 225deg 270deg,
              rgba(251, 191, 36, 0.92) 270deg 315deg,
              rgba(250, 204, 21, 0.98) 315deg 360deg
            )`;

/** Visueel rad — compact/mini = minder dominant; mini kleiner dan compact */
export function LuckWheel({
  rotationDeg,
  spinning,
  compact = false,
  mini = false,
  /** Tijdens draaien: groot, helder, met gloed — overschrijft mini */
  emphasized = false,
  showCaption = true,
  segmentColors,
  className,
}: {
  rotationDeg: number;
  spinning: boolean;
  compact?: boolean;
  mini?: boolean;
  emphasized?: boolean;
  showCaption?: boolean;
  /** Eén kleur per prijs — rad krijgt evenveel segmenten als deze array lang is */
  segmentColors?: string[];
  className?: string;
}) {
  const useMiniLayout = mini && !emphasized;
  const small = (compact || mini) && !emphasized;

  const diskBackground =
    segmentColors && segmentColors.length > 0
      ? wheelConicGradient(segmentColors)
      : LEGACY_MULTI_SLICE;
  return (
    <div
      className={cn(
        "pointer-events-none relative mx-auto shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        emphasized
          ? "w-[min(100%,min(260px,34dvh))]"
          : useMiniLayout
            ? "w-[min(100%,112px)]"
            : compact
              ? "w-[min(100%,148px)]"
              : "w-[min(100%,240px)]",
        emphasized &&
          "shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_16px_56px_rgba(0,0,0,0.55),0_0_88px_rgba(139,92,246,0.38),0_0_120px_rgba(167,139,250,0.22)]",
        emphasized && spinning && "bb-wheel-spin-ambient",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute z-20 text-white drop-shadow-md transition-all duration-500",
          emphasized
            ? "-top-1 left-1/2 -translate-x-1/2 text-2xl"
            : useMiniLayout
              ? "-top-0.5 left-1/2 -translate-x-1/2 text-xs text-white/50"
              : compact
                ? "-top-0.5 left-1/2 -translate-x-1/2 text-sm text-white/50"
                : "-top-0.5 left-1/2 -translate-x-1/2 text-xl text-white/50",
        )}
        aria-hidden
      >
        ▼
      </div>
      <div
        className={cn(
          "relative mx-auto aspect-square transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          emphasized
            ? "w-full max-w-[min(240px,32dvh)]"
            : useMiniLayout
              ? "w-full max-w-[104px]"
              : compact
                ? "w-full max-w-[132px]"
                : "w-[88%] max-w-[220px]",
        )}
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          transition: spinning
            ? "transform 5.75s cubic-bezier(0.08, 0.72, 0.12, 1), max-width 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
            : "max-width 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className={cn(
            "h-full w-full rounded-full border shadow-[inset_0_0_32px_rgba(0,0,0,0.5)] transition-all duration-500",
            emphasized
              ? "border-white/25 opacity-100 shadow-[inset_0_0_52px_rgba(0,0,0,0.32),inset_0_-8px_24px_rgba(255,255,255,0.06)]"
              : "border-white/[0.1]",
            small && !emphasized && "opacity-[0.82]",
            emphasized &&
              spinning &&
              "ring-2 ring-violet-400/45 ring-offset-2 ring-offset-[#06060a]",
          )}
          style={{
            background: diskBackground,
          }}
        />
        <div
          className={cn(
            "absolute rounded-full border border-white/10 bg-[#0a0a10]/95 shadow-inner transition-all duration-500",
            emphasized ? "inset-[17%]" : useMiniLayout ? "inset-[14%]" : compact ? "inset-[16%]" : "inset-[18%]",
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-transparent font-semibold uppercase tracking-wider transition-all duration-500 text-white/50",
            emphasized
              ? "h-[22%] min-h-[40px] w-[22%] min-w-[40px] text-[10px] text-white/70"
              : useMiniLayout
                ? "h-[28%] min-h-[26px] w-[28%] min-w-[26px] text-[7px]"
                : compact
                  ? "h-[26%] min-h-[32px] w-[26%] min-w-[32px] text-[8px]"
                  : "h-[22%] min-h-[44px] w-[22%] min-w-[44px] text-[10px]",
          )}
        >
          BB
        </div>
      </div>
      {showCaption ? (
        !small || emphasized ? (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/38">
            Je geluks­score bepaalt welke deal uit het schema van vanavond bij jou past —
            hoe hoger, hoe scherper het voordeel.
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] leading-snug text-white/32">
            Score → passend aanbod
          </p>
        )
      ) : null}
    </div>
  );
}
