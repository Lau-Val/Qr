"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Row = { dealId: string; text: string };

// 12 sparkles: 8 main + 4 outer
const SPARKS = [
  { angle: 0,   r: 70, size: 8 },
  { angle: 45,  r: 82, size: 5 },
  { angle: 90,  r: 74, size: 9 },
  { angle: 135, r: 88, size: 5 },
  { angle: 180, r: 72, size: 8 },
  { angle: 225, r: 84, size: 5 },
  { angle: 270, r: 76, size: 9 },
  { angle: 315, r: 86, size: 5 },
  { angle: 22,  r: 105, size: 4 },
  { angle: 112, r: 108, size: 4 },
  { angle: 202, r: 104, size: 4 },
  { angle: 292, r: 107, size: 4 },
];

function Bow({ color }: { color: string }) {
  return (
    <svg width="64" height="34" viewBox="0 0 64 34" fill="none" aria-hidden>
      {/* Left ear */}
      <ellipse cx="19" cy="17" rx="18" ry="12" fill={color} />
      {/* Right ear */}
      <ellipse cx="45" cy="17" rx="18" ry="12" fill={color} />
      {/* Ear highlights */}
      <ellipse cx="13" cy="11" rx="7" ry="4" fill="rgba(255,255,255,0.30)" />
      <ellipse cx="52" cy="11" rx="7" ry="4" fill="rgba(255,255,255,0.30)" />
      {/* Ribbon tails */}
      <rect x="28" y="24" width="8" height="10" rx="3" fill={color} />
      {/* Center knot */}
      <circle cx="32" cy="17" r="7" fill={color} />
      <circle cx="30" cy="14.5" r="2.8" fill="rgba(255,255,255,0.38)" />
    </svg>
  );
}

/**
 * Premium mystery box — puur knop-driven (geen tik op de doos zelf).
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
  onBoxPress?: () => void;
  idleHint: string;
  variant?: "light" | "dark";
  interactiveBox?: boolean;
}) {
  const showPrize = Boolean(revealDealId && !opening);
  const winner = revealDealId
    ? showcase.find((s) => s.dealId === revealDealId)
    : null;

  const canTap = interactiveBox && !opening && !revealDealId;
  const showIdleHint = !opening && !revealDealId;
  const lidOpen = opening || (Boolean(revealDealId) && !opening);
  const isIdle = !opening && !revealDealId;

  const [sparksActive, setSparksActive] = useState(false);
  const sparksTimer = useRef<number | null>(null);

  useEffect(() => {
    if (revealDealId && !opening) {
      setSparksActive(true);
      sparksTimer.current = window.setTimeout(() => setSparksActive(false), 1000);
      return () => {
        if (sparksTimer.current) clearTimeout(sparksTimer.current);
      };
    }
    return undefined;
  }, [revealDealId, opening]);

  const dark = variant === "dark";

  /* ── design tokens ─────────────────────────────────────────── */
  const BOX_W   = 172;
  const LID_H   = 58;
  const BODY_H  = 114;
  const RIB     = 22;

  const bodyGrad = dark
    ? "linear-gradient(160deg, #1e1660 0%, #12093c 55%, #0a071e 100%)"
    : "linear-gradient(160deg, #fdf9f4 0%, #f0e7d4 55%, #e3d4bb 100%)";

  const lidGrad = dark
    ? "linear-gradient(160deg, #281c7c 0%, #180f52 100%)"
    : "linear-gradient(160deg, #fefcf8 0%, #f3eadb 100%)";

  const borderCol = dark
    ? "rgba(139,92,246,0.30)"
    : "rgba(160,110,56,0.24)";

  const ribH = dark
    ? "linear-gradient(90deg,#78350f 0%,#d97706 30%,#fde68a 50%,#d97706 70%,#78350f 100%)"
    : "linear-gradient(90deg,#881337 0%,#e11d48 30%,#fecdd3 50%,#e11d48 70%,#881337 100%)";

  const ribV = dark
    ? "linear-gradient(180deg,#78350f 0%,#d97706 30%,#fde68a 50%,#d97706 70%,#78350f 100%)"
    : "linear-gradient(180deg,#881337 0%,#e11d48 30%,#fecdd3 50%,#e11d48 70%,#881337 100%)";

  const glowCol   = dark ? "rgba(124,58,237,0.6)"   : "rgba(190,18,60,0.25)";
  const bowCol    = dark ? "#f59e0b"                 : "#e11d48";
  const sparkCol  = dark ? "#fbbf24"                 : "#fb7185";
  const qColor    = dark ? "#fde68a"                 : "#9f1239";
  const qShadow   = dark
    ? "0 0 20px rgba(251,191,36,0.55), 0 2px 6px rgba(0,0,0,0.7)"
    : "0 0 14px rgba(190,18,60,0.28), 0 1px 4px rgba(0,0,0,0.08)";

  const innerShine = dark
    ? "radial-gradient(ellipse at 28% 22%, rgba(167,139,250,0.15) 0%, transparent 62%)"
    : "radial-gradient(ellipse at 28% 22%, rgba(255,255,255,0.72) 0%, transparent 62%)";

  const lidShine = dark
    ? "radial-gradient(ellipse at 30% 28%, rgba(167,139,250,0.22) 0%, transparent 68%)"
    : "radial-gradient(ellipse at 30% 28%, rgba(255,255,255,0.80) 0%, transparent 68%)";

  const bodyShadow = dark
    ? "0 20px 56px rgba(88,28,220,0.50), 0 6px 18px rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(167,139,250,0.14)"
    : "0 14px 44px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.07), inset 0 1.5px 0 rgba(255,255,255,0.88)";

  const lidShadow = dark
    ? "0 -8px 28px rgba(88,28,220,0.35), inset 0 2px 0 rgba(167,139,250,0.20)"
    : "0 -5px 18px rgba(0,0,0,0.09), inset 0 2px 0 rgba(255,255,255,0.92)";

  const cardBg = dark
    ? "linear-gradient(145deg, #1c1458 0%, #0d0b2e 100%)"
    : "linear-gradient(145deg, #fffaf5 0%, #fef2e4 100%)";

  const cardBorder = dark ? "rgba(139,92,246,0.38)" : "rgba(160,110,56,0.28)";
  const cardShadow = dark
    ? "0 10px 36px rgba(88,28,220,0.45), inset 0 1px 0 rgba(167,139,250,0.16)"
    : "0 10px 36px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.92)";

  const labelCol = dark ? "rgba(167,139,250,0.92)" : "#92400e";
  const textCol  = dark ? "#ffffff"                : "#1c1917";
  /* ─────────────────────────────────────────────────────────── */

  const boxElem = (
    <div className={cn("relative flex items-end justify-center", isIdle && "bb-box-float")}
      style={{ width: BOX_W, height: LID_H + BODY_H + 30 }}
    >
      {/* Floor glow */}
      <div
        className="bb-box-glow pointer-events-none absolute left-1/2 bottom-0"
        style={{
          width: BOX_W * 0.72,
          height: 22,
          borderRadius: "50%",
          background: glowCol,
          filter: "blur(16px)",
          transform: "translateX(-50%)",
        }}
      />

      {/* Sparkle particles */}
      {SPARKS.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const tx = Math.round(Math.cos(rad) * s.r);
        const ty = Math.round(Math.sin(rad) * s.r);
        return (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              bottom: BODY_H / 2 + 20,
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              borderRadius: "50%",
              background: sparkCol,
              boxShadow: `0 0 ${s.size + 3}px ${sparkCol}`,
              transform: sparksActive
                ? `translate(${tx}px, ${ty}px) scale(1)`
                : "translate(0,0) scale(0)",
              opacity: sparksActive ? 1 : 0,
              transition: `transform 650ms cubic-bezier(0.22,1,0.36,1) ${i * 28}ms, opacity 650ms ease ${i * 28}ms`,
              pointerEvents: "none",
              zIndex: 20,
            }}
          />
        );
      })}

      {/* Bow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: BODY_H + LID_H + 6,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 10,
          filter: dark
            ? "drop-shadow(0 3px 10px rgba(245,158,11,0.55))"
            : "drop-shadow(0 3px 10px rgba(225,29,72,0.4))",
        }}
      >
        <Bow color={bowCol} />
      </div>

      {/* Lid */}
      <div
        style={{
          position: "absolute",
          bottom: BODY_H - 1,
          left: -8,
          width: BOX_W + 16,
          height: LID_H,
          perspective: "700px",
          perspectiveOrigin: "50% 100%",
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: lidGrad,
            border: `1.5px solid ${borderCol}`,
            borderRadius: "14px 14px 0 0",
            borderBottom: "none",
            position: "relative",
            transformOrigin: "50% 100%",
            transform: `rotateX(${lidOpen ? -148 : 0}deg)`,
            transition: lidOpen ? "transform 0.82s cubic-bezier(0.34,1.42,0.64,1)" : "none",
            boxShadow: lidShadow,
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          {/* Shine layer */}
          <div style={{ position: "absolute", inset: 0, background: lidShine, pointerEvents: "none", borderRadius: "inherit" }} />

          {/* Ribbon H */}
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: RIB - 2, marginTop: -(RIB - 2) / 2,
            background: ribH,
            boxShadow: dark ? "0 2px 8px rgba(245,158,11,0.30)" : "0 2px 8px rgba(190,18,60,0.22)",
          }} />

          {/* Ribbon V */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: "50%", width: RIB - 2, marginLeft: -(RIB - 2) / 2,
            background: ribV,
          }} />

          {/* "?" */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontSize: 30,
              fontWeight: 900,
              color: qColor,
              textShadow: qShadow,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              ?
            </span>
          </div>

          {/* Shimmer sweep */}
          <div
            className="bb-box-shimmer pointer-events-none"
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: 0,
              width: "40%",
              background: "linear-gradient(108deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
              zIndex: 7,
              borderRadius: "inherit",
            }}
          />
        </div>
      </div>

      {/* Box body */}
      <div style={{ position: "absolute", bottom: 16, width: BOX_W, height: BODY_H }}>
        <div style={{
          width: "100%",
          height: "100%",
          background: bodyGrad,
          border: `1.5px solid ${borderCol}`,
          borderTop: "none",
          borderRadius: "0 0 18px 18px",
          position: "relative",
          overflow: "hidden",
          boxShadow: bodyShadow,
        }}>
          {/* Inner shine */}
          <div style={{ position: "absolute", inset: 0, background: innerShine, pointerEvents: "none" }} />

          {/* Ribbon H */}
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: RIB, marginTop: -RIB / 2,
            background: ribH,
            boxShadow: dark ? "0 2px 10px rgba(245,158,11,0.35)" : "0 2px 10px rgba(190,18,60,0.25)",
          }} />

          {/* Ribbon V */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: "50%", width: RIB, marginLeft: -RIB / 2,
            background: ribV,
            boxShadow: dark ? "2px 0 8px rgba(245,158,11,0.22)" : "2px 0 8px rgba(190,18,60,0.18)",
          }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center">
      {/* Prize reveal card */}
      <div
        className={cn(
          "w-full max-w-[220px] transition-[opacity,transform] duration-500",
          showPrize && winner
            ? "mb-3 opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-5 pointer-events-none h-0 overflow-hidden",
        )}
        aria-live="polite"
      >
        {showPrize && winner ? (
          <div
            className="bb-kapper-prize-rise rounded-2xl border px-4 py-4 text-center"
            style={{ background: cardBg, borderColor: cardBorder, boxShadow: cardShadow }}
          >
            <p style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: labelCol, marginBottom: 6,
            }}>
              Jouw voordeel
            </p>
            <p style={{
              fontSize: "clamp(0.95rem,3.8vw,1.1rem)", fontWeight: 800,
              lineHeight: 1.25, color: textCol, letterSpacing: "-0.01em",
            }}>
              {winner.text}
            </p>
          </div>
        ) : null}
      </div>

      {/* The box itself */}
      {canTap ? (
        <button
          type="button"
          onClick={() => onBoxPress?.()}
          className="touch-manipulation outline-none [-webkit-tap-highlight-color:transparent] active:scale-[0.98] transition-transform"
          aria-label="Tik om de mystery box te openen"
        >
          {boxElem}
        </button>
      ) : (
        boxElem
      )}

      {/* Idle hint */}
      {showIdleHint ? (
        <p className={cn(
          "mt-5 max-w-[18rem] text-center text-[12px] font-medium leading-relaxed",
          dark ? "text-white/50" : "text-stone-500",
        )}>
          {idleHint}
        </p>
      ) : null}
    </div>
  );
}
