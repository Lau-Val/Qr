"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/barboost/ui/Button";

type Status = "active" | "expired" | "used";

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function BartenderDealScreen({
  dealTitle,
  totalLabel,
  sessionFooterId,
  used,
  expiresAtMs,
  onMarkUsed,
  onGuestContinue,
}: {
  dealTitle: string;
  totalLabel: string;
  sessionFooterId: string;
  used: boolean;
  expiresAtMs: number;
  onMarkUsed: () => void;
  onGuestContinue?: () => void;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remainingSec = useMemo(() => {
    return Math.floor((expiresAtMs - nowMs) / 1000);
  }, [expiresAtMs, nowMs]);

  const status: Status = used ? "used" : remainingSec <= 0 ? "expired" : "active";

  const headline = dealTitle.toUpperCase();

  const pulseTimer =
    status === "active" && remainingSec > 0 && remainingSec <= 60;

  const coloredShell = !used;
  const isExpired = status === "expired";
  const isActive = status === "active";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden transition-colors duration-500",
        coloredShell && isActive
          ? "relative rounded-3xl border-2 border-emerald-400/55 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(16,185,129,0.22)]"
          : coloredShell && isExpired
            ? "relative rounded-3xl border-2 border-red-400/60 shadow-[0_0_0_1px_rgba(248,113,113,0.28),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(220,38,38,0.28)]"
            : "rounded-3xl border-2 border-white/15 bg-[#1a1a1a]",
      )}
    >
      {coloredShell && isActive ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-[#0a1814] to-black/50"
            aria-hidden
          />
          <div
            className="bb-bartender-bg-drift pointer-events-none absolute inset-0 rounded-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 z-[1] h-40 w-40 rounded-full bg-emerald-500/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-3xl"
            aria-hidden
          >
            <div className="bb-upgrade-gloss-ray" />
            <div className="bb-upgrade-gloss-ray bb-upgrade-gloss-ray--secondary" />
          </div>
        </>
      ) : null}
      {coloredShell && isExpired ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-950/90 via-[#1a0a0c] to-black/50"
            aria-hidden
          />
          <div
            className="bb-bartender-expired-bg-drift pointer-events-none absolute inset-0 rounded-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 z-[1] h-40 w-40 rounded-full bg-red-500/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-3xl"
            aria-hidden
          >
            <div className="bb-upgrade-gloss-ray" />
            <div className="bb-upgrade-gloss-ray bb-upgrade-gloss-ray--secondary" />
          </div>
        </>
      ) : null}

      <div className="relative z-[4] flex min-h-0 flex-1 flex-col">
        {/* Statusbalk — op groene of rode lagen */}
        <div
          className={cn(
            "flex w-full shrink-0 items-center justify-center border-b px-3 py-3 text-center backdrop-blur-[2px] [@media(max-height:720px)]:py-2.5",
            coloredShell && isActive && "border-emerald-400/35 bg-black/25",
            coloredShell && isExpired && "border-red-400/40 bg-black/30",
            status === "used" && "border-white/10 bg-black/40",
          )}
        >
          {status === "active" ? (
            <p
              className={cn(
                "text-[clamp(1rem,4.5vw,1.35rem)] font-black tracking-tight text-emerald-50",
                pulseTimer && "animate-pulse",
              )}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              ACTIEF • {formatMmSs(remainingSec)}
            </p>
          ) : status === "expired" ? (
            <p className="text-[clamp(1.1rem,5vw,1.5rem)] font-black tracking-wide text-red-100">
              VERLOPEN
            </p>
          ) : (
            <p className="text-[clamp(1.1rem,5vw,1.5rem)] font-black tracking-wide text-white/80">
              GEBRUIKT
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-3 pb-3 pt-4 sm:px-4 [@media(max-height:720px)]:gap-1.5 [@media(max-height:720px)]:pb-2.5 [@media(max-height:720px)]:pt-3">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center [@media(max-height:720px)]:gap-2">
            <p
              className="max-w-[100%] text-balance break-words text-[clamp(1.35rem,6.5vw,2.15rem)] font-black leading-[1.1] tracking-tight text-white"
              style={{ wordBreak: "break-word" }}
            >
              {headline}
            </p>
            <p
              className={cn(
                "text-[clamp(1.35rem,5.5vw,1.85rem)] font-black tracking-tight",
                status === "used"
                  ? "text-white/35"
                  : isExpired
                    ? "text-red-100/95"
                    : "text-emerald-100/95",
              )}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {totalLabel}
            </p>
          </div>

          <div className="shrink-0 space-y-2 [@media(max-height:720px)]:space-y-1.5">
            {!used && status === "active" && !confirmOpen ? (
              <button
                type="button"
                className="relative z-[60] w-full touch-manipulation rounded-2xl bg-emerald-600 py-3.5 text-[clamp(1rem,4.5vw,1.25rem)] font-black tracking-wide text-white shadow-lg shadow-emerald-950/45 transition hover:bg-emerald-500 active:scale-[0.99] [@media(max-height:720px)]:py-3"
                onClick={() => setConfirmOpen(true)}
              >
                GEBRUIKT
              </button>
            ) : null}

            {!used && status === "active" && confirmOpen ? (
              <div className="flex flex-col gap-2">
                <p className="text-center text-[13px] font-semibold text-emerald-200/90">
                  Deal als ingewisseld markeren?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="py-4 text-base font-bold"
                    onClick={() => setConfirmOpen(false)}
                  >
                    Annuleren
                  </Button>
                  <button
                    type="button"
                    className="relative z-[60] touch-manipulation rounded-xl bg-emerald-600 py-4 text-base font-black text-white shadow-md shadow-emerald-950/40 hover:bg-emerald-500"
                    onClick={() => {
                      onMarkUsed();
                      setConfirmOpen(false);
                    }}
                  >
                    Bevestigen
                  </button>
                </div>
              </div>
            ) : null}

            {!used && status === "expired" ? (
              <p className="py-2 text-center text-[14px] font-bold text-red-200/80 [@media(max-height:720px)]:py-1.5 [@media(max-height:720px)]:text-[13px]">
                Niet meer geldig — niet verzilveren
              </p>
            ) : null}

            {used ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full py-3 text-sm font-semibold text-white/50"
                onClick={onGuestContinue}
              >
                Verder
              </Button>
            ) : null}
          </div>

          <p
            className={cn(
              "shrink-0 text-center font-mono text-[11px] font-medium tracking-wider",
              isExpired ? "text-red-200/35" : "text-white/35",
            )}
          >
            {sessionFooterId}
          </p>
        </div>
      </div>
    </div>
  );
}
