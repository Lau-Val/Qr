"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { BAR_NAME } from "@/data/bar";
import { buildUpgradedDeal } from "@/data/deal-upgrades";
import { MOCK_DEALS } from "@/data/mock/deals";
import type { Deal } from "@/data/types";
import { BartenderDealScreen } from "@/components/barboost/BartenderDealScreen";
import { PrizeShowcaseCard } from "@/components/barboost/PrizeShowcaseCard";
import { Button, buttonClassName } from "@/components/barboost/ui/Button";
import { Badge } from "@/components/barboost/ui/Badge";
import { MobileShell } from "@/components/barboost/ui/MobileShell";
import { LuckWheel } from "@/components/barboost/LuckWheel";
import {
  pickWeightedDealId,
  resolveDealById,
} from "@/lib/unlock-weighted-deal";
import {
  formatDealSessionFooter,
  getBartenderTotalLabel,
  getDealPriceCompare,
} from "@/lib/deal-pricing";
import { isValidDutchMobile, normalizeDutchPhone } from "@/lib/phone-nl";
import { cn } from "@/lib/cn";
import { fireFallConfetti, fireWinConfetti } from "@/lib/win-confetti";

const DEAL_POOL = MOCK_DEALS.filter((d) => d.category !== "retry");

/**
 * 3 deals op rad + lijst. Gewichten: lager voordeel = vaker (hogere kans).
 * Cocktaildeal (d6) = zeldzamer dan shots (d2) dan bier (d1).
 */
const UNLOCK_SHOWCASE: {
  text: string;
  wheelColor: string;
  normaal: string;
  dealId: string;
  weight: number;
}[] = [
  {
    text: "2 bier voor €6",
    wheelColor: "#6366f1",
    normaal: "€12",
    dealId: "d1",
    weight: 0.52,
  },
  {
    text: "3 shots voor €10",
    wheelColor: "#a855f7",
    normaal: "€18",
    dealId: "d2",
    weight: 0.33,
  },
  {
    text: "2 cocktails voor €10",
    wheelColor: "#14b8a6",
    normaal: "€16",
    dealId: "d6",
    weight: 0.15,
  },
];

/** Score voor rad + label op baseDeal — band sluit aan bij gekozen deal */
function luckScoreBandForDealId(dealId: string): number {
  switch (dealId) {
    case "d1":
      return 6 + Math.floor(Math.random() * 32);
    case "d2":
      return 38 + Math.floor(Math.random() * 28);
    case "d6":
      return 70 + Math.floor(Math.random() * 28);
    default:
      return Math.floor(Math.random() * 101);
  }
}

type Step =
  | "welcome"
  | "unlock"
  | "baseDeal"
  | "claim"
  | "retention";

/** Tijdelijk: volgordenummer voor ontwerp/test (verwijderen voor productie). */
function gastFlowPageNumber(s: Step): number {
  const n: Record<Step, number> = {
    welcome: 1,
    unlock: 2,
    baseDeal: 3,
    claim: 4,
    retention: 5,
  };
  return n[s];
}

/** Query die het rad start — zelfde patroon als route-`Link` (werkt op iOS waar `click` faalt). */
const SPIN_QUERY = "spin";

/** Alleen de adresbalk opschonen — géén `router.replace` (kan de App Router-tree remounten en spin-state wissen). */
function stripSpinQueryFromAddressBar() {
  if (typeof window === "undefined") return;
  const u = new URL(window.location.href);
  if (u.searchParams.get(SPIN_QUERY) !== "1") return;
  u.searchParams.delete(SPIN_QUERY);
  const path = u.pathname + (u.search ? `${u.search}` : "") + u.hash;
  window.history.replaceState(window.history.state, "", path);
}

export function GuestFlow(props: { initialStep?: Step }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-[#06060a] px-4 text-sm text-white/45">
            Laden…
          </div>
        }
      >
        <GuestFlowInner {...props} />
      </Suspense>
    </div>
  );
}

function GuestFlowInner({ initialStep = "welcome" }: { initialStep?: Step }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(initialStep);
  const [baseDeal, setBaseDeal] = useState<Deal | null>(null);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [voucherUsed, setVoucherUsed] = useState(false);
  const [claimExpiresAt, setClaimExpiresAt] = useState<number | null>(null);
  const [comebackActivated, setComebackActivated] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  /** Na rad: welke deal-id wint — toont reveal voordat we naar baseDeal gaan */
  const [revealDealId, setRevealDealId] = useState<string | null>(null);
  const revealAdvanceRef = useRef<number | null>(null);
  const consumedUrlSpin = useRef(false);

  const startWheelSpin = useCallback(() => {
    const dealId = pickWeightedDealId(
      UNLOCK_SHOWCASE.map(({ dealId, weight }) => ({ dealId, weight })),
    );
    const deal = resolveDealById(DEAL_POOL, dealId);
    if (!deal) {
      return;
    }
    const luck = luckScoreBandForDealId(dealId);
    setSpinning(true);
    setWheelRotation((r) => r + 360 * 10 + luck * 4.2);
    window.setTimeout(() => {
      setSpinning(false);
      setRevealDealId(deal.id);
      if (revealAdvanceRef.current) {
        window.clearTimeout(revealAdvanceRef.current);
      }
      revealAdvanceRef.current = window.setTimeout(() => {
        setBaseDeal(deal);
        setStep("baseDeal");
        setRevealDealId(null);
        revealAdvanceRef.current = null;
      }, 4200);
    }, 5850);
  }, []);

  const effectiveDeal = useMemo(() => {
    if (!baseDeal) return null;
    return isUpgraded ? buildUpgradedDeal(baseDeal) : baseDeal;
  }, [baseDeal, isUpgraded]);

  useEffect(() => {
    if (step !== "unlock") {
      consumedUrlSpin.current = false;
      return;
    }
    /* Echte URL én Next searchParams: op iOS/hydration loopt dat soms uiteen. */
    const fromBar =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get(SPIN_QUERY)
        : null;
    const fromNext = searchParams.get(SPIN_QUERY);
    const wantsSpin = fromBar === "1" || fromNext === "1";

    if (!wantsSpin) {
      consumedUrlSpin.current = false;
      return;
    }
    if (consumedUrlSpin.current) return;
    if (spinning || revealDealId) return;
    consumedUrlSpin.current = true;
    startWheelSpin();
    /* State eerst laten committen; daarna alleen history — geen Next-router (voorkomt remount). */
    queueMicrotask(() => {
      stripSpinQueryFromAddressBar();
    });
  }, [step, searchParams, spinning, revealDealId, startWheelSpin]);

  const goClaim = useCallback(() => {
    setStep("claim");
  }, []);

  const persistedVoucherUsed =
    typeof window !== "undefined" &&
    step === "claim" &&
    effectiveDeal != null &&
    localStorage.getItem(`bb_claim_${effectiveDeal.claimCode}_used`) === "1";

  const voucherUsedEffective = voucherUsed || persistedVoucherUsed;

  /* Client-only: read/write sessionStorage for countdown end time (demo persistence). */
  /* eslint-disable react-hooks/set-state-in-effect -- sync expiry into state once per claim step */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (step !== "claim" || !effectiveDeal) {
      return;
    }
    const key = `bb_claim_${effectiveDeal.claimCode}`;
    const expStr = sessionStorage.getItem(`${key}_exp`);
    if (expStr) {
      const n = Number(expStr);
      if (!Number.isNaN(n)) {
        setClaimExpiresAt(n);
        return;
      }
    }
    const at = Date.now() + effectiveDeal.timerSeconds * 1000;
    sessionStorage.setItem(`${key}_exp`, String(at));
    setClaimExpiresAt(at);
  }, [step, effectiveDeal]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!revealDealId) return;
    const row = UNLOCK_SHOWCASE.find((r) => r.dealId === revealDealId);
    const hex = row?.wheelColor ?? "#a855f7";

    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) fireWinConfetti([hex]);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [revealDealId]);

  useEffect(() => {
    if (step !== "baseDeal" || !baseDeal) return;
    const row = UNLOCK_SHOWCASE.find((r) => r.dealId === baseDeal.id);
    const hex = row?.wheelColor ?? "#a855f7";

    let cancelled = false;
    let stopFall: (() => void) | undefined;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) stopFall = fireFallConfetti([hex]);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopFall?.();
    };
  }, [step, baseDeal]);

  const handleUpgradeSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const normalized = normalizeDutchPhone(phone);
      if (!isValidDutchMobile(normalized)) {
        setPhoneError("Vul een geldig mobiel nummer in");
        return;
      }
      setPhoneError(null);
      setPhone(normalized);
      setIsUpgraded(true);
      goClaim();
    },
    [phone, goClaim],
  );

  return (
    <MobileShell>
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <span
          className="pointer-events-none absolute left-0 top-0 z-[200] select-none font-mono text-[8px] tabular-nums leading-none text-white/40 sm:text-[9px]"
          aria-hidden
          title={`Stap ${gastFlowPageNumber(step)} (tijdelijk)`}
        >
          {gastFlowPageNumber(step)}
        </span>
        {step === "welcome" ? (
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 overflow-hidden text-center [@media(max-height:640px)]:gap-1.5">
            <div className="min-h-0 shrink">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
                BarBoost
              </p>
              <h1 className="mt-3 text-[clamp(1.25rem,4.8vw,1.6rem)] font-bold leading-snug tracking-tight text-white [@media(max-height:640px)]:mt-2">
                Jouw deal van vanavond
              </h1>
              <p className="mt-2 text-[clamp(0.8rem,3.2vw,0.875rem)] leading-relaxed text-white/52 [@media(max-height:640px)]:mt-1.5">
                Scan de QR bij je tafel — daarna claim je direct aan de bar. Geen app nodig.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 [@media(max-height:640px)]:mt-3 [@media(max-height:640px)]:gap-1">
                <Badge tone="hot">Alleen vanavond</Badge>
                <Badge tone="info">Aan de bar tonen</Badge>
                <Badge tone="success">Geschikt voor groepen</Badge>
              </div>
            </div>
            <div className="shrink-0 space-y-2 pt-2 [@media(max-height:640px)]:space-y-1.5 [@media(max-height:640px)]:pt-1">
              <Link
                href="/gast/unlock"
                prefetch
                className={buttonClassName(
                  "primary",
                  "w-full justify-center py-3.5 text-base text-center no-underline [@media(max-height:640px)]:py-3",
                )}
              >
                Start met deal
              </Link>
              <p className="text-[11px] text-white/38 sm:text-xs">
                Gemiddeld onder een minuut
              </p>
            </div>
          </section>
        ) : null}

        {step === "unlock" ? (
          <section className="bb-gast-unlock flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden pb-0">
            <div className="flex shrink-0 flex-col items-center pt-0">
              <LuckWheel
                rotationDeg={wheelRotation}
                spinning={spinning}
                mini
                unlockLayout
                emphasized={spinning}
                showCaption={false}
                segmentColors={UNLOCK_SHOWCASE.map((r) => r.wheelColor)}
              />
              {spinning ? (
                <p className="mt-1.5 text-center text-[clamp(0.78rem,3.2vw,0.95rem)] font-bold tracking-tight text-transparent bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-300 bg-clip-text">
                  Het rad draait…
                </p>
              ) : null}
              {revealDealId && !spinning ? (
                <p className="mt-1.5 text-center text-[10px] font-medium leading-tight text-white/45">
                  Zo meteen volgt je deal op het volgende scherm
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08] px-2 py-2 transition-all duration-500 sm:rounded-[1.15rem] sm:px-2.5 sm:py-2.5",
                spinning && "pointer-events-none bg-white/[0.025] opacity-[0.92]",
                !spinning && !revealDealId && "bg-white/[0.035]",
                revealDealId && "relative bg-black/40 ring-1 ring-white/10",
              )}
            >
              <h2 className="shrink-0 text-[clamp(0.78rem,3.4vw,1.1rem)] font-bold leading-tight tracking-tight text-white">
                {revealDealId ? "Dit wordt jouw deal" : "Wat kan je winnen?"}
              </h2>
              <div
                className={cn(
                  "mt-1.5 flex min-h-0 flex-1 flex-col justify-center gap-1 overflow-hidden sm:mt-2 sm:gap-1.5",
                  revealDealId && "gap-1.5 sm:gap-2",
                )}
              >
                {UNLOCK_SHOWCASE.map((row, i) => {
                  const isWinner = revealDealId === row.dealId;
                  const emphasis = revealDealId
                    ? isWinner
                      ? "winner"
                      : "dimmed"
                    : "normal";
                  return (
                    <div
                      key={row.dealId}
                      className={cn(
                        "min-h-0 shrink",
                        isWinner && revealDealId && "order-first",
                      )}
                    >
                      <PrizeShowcaseCard
                        accentHex={row.wheelColor}
                        staggerIndex={i}
                        emphasis={emphasis}
                        dealId={row.dealId}
                        compact
                        dense
                      >
                        {isWinner && revealDealId ? (
                          <p className="mb-0.5 text-center text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-300/95">
                            Jouw prijs
                          </p>
                        ) : null}
                        <p
                          className={cn(
                            "font-semibold leading-tight tracking-tight text-white",
                            isWinner && revealDealId
                              ? "text-[clamp(0.88rem,3.6vw,1.2rem)]"
                              : "text-[clamp(0.82rem,3.2vw,1.05rem)]",
                          )}
                        >
                          {row.text}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-tight text-white/50 sm:text-[11px]">
                          Normaal{" "}
                          <span className="font-medium text-white/65 line-through decoration-white/35">
                            {row.normaal}
                          </span>
                        </p>
                      </PrizeShowcaseCard>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 shrink-0 text-center text-[10px] font-medium leading-snug text-white/40 sm:mt-2 sm:text-[11px]">
                {spinning
                  ? "Eén van deze prijzen wordt zo je deal"
                  : revealDealId
                    ? "Even rustig bekijken — daarna zie je alle details"
                    : "Draai en unlock 1 van deze deals"}
              </p>
            </div>

            <div className="shrink-0 pt-0.5">
              {spinning || revealDealId ? (
                <div
                  className={buttonClassName(
                    "primary",
                    "w-full cursor-default justify-center py-2.5 text-sm font-semibold opacity-90 sm:py-3 sm:text-base",
                  )}
                  aria-live="polite"
                >
                  {spinning ? "Even geduld…" : "Zo meteen…"}
                </div>
              ) : (
                <Link
                  href={`/gast/unlock?${SPIN_QUERY}=1`}
                  prefetch={false}
                  className={buttonClassName(
                    "primary",
                    "w-full justify-center py-2.5 text-center text-sm font-semibold no-underline sm:py-3 sm:text-base",
                  )}
                >
                  Draai nu
                </Link>
              )}
            </div>
          </section>
        ) : null}

        {step === "baseDeal" && baseDeal ? (
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden [@media(max-height:760px)]:gap-1">
            {(() => {
              const pc = getDealPriceCompare(baseDeal);
              const upgraded = buildUpgradedDeal(baseDeal);
              const mins = Math.max(1, Math.ceil(baseDeal.timerSeconds / 60));
              return (
                <>
                  <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-center sm:rounded-2xl sm:px-3 sm:py-2.5 [@media(max-height:760px)]:py-2">
                    <p className="text-[clamp(0.95rem,3.8vw,1.125rem)] font-bold text-emerald-300/95">
                      Dit heb je gewonnen
                    </p>
                    <h2 className="mt-1.5 text-[clamp(1.15rem,5vw,1.75rem)] font-bold leading-tight text-white [@media(max-height:760px)]:mt-1">
                      {baseDeal.title}
                    </h2>
                    <p className="mt-2 text-[clamp(0.9rem,3.5vw,1.125rem)] text-white/45 line-through decoration-white/30 [@media(max-height:760px)]:mt-1.5">
                      normaal {pc.normal}
                    </p>
                    <p className="mt-2 text-[clamp(0.8rem,3.2vw,1rem)] font-medium text-white/70 [@media(max-height:760px)]:mt-1.5">
                      Nog {mins} minuten · alleen in {BAR_NAME}
                    </p>
                  </div>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-violet-400/55 p-3 shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(124,58,237,0.22)] sm:rounded-3xl sm:p-4 [@media(max-height:760px)]:p-2.5">
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/90 via-[#15101f] to-black/50"
                        aria-hidden
                      />
                      <div
                        className="bb-upgrade-bg-drift pointer-events-none absolute inset-0 rounded-3xl"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute -right-16 -top-16 z-[1] h-40 w-40 rounded-full bg-violet-500/25 blur-3xl"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-3xl"
                        aria-hidden
                      >
                        <div className="bb-upgrade-gloss-ray" />
                        <div className="bb-upgrade-gloss-ray bb-upgrade-gloss-ray--secondary" />
                      </div>
                      <div className="relative z-[3] flex min-h-0 flex-1 flex-col overflow-hidden">
                        <h3 className="shrink-0 text-center text-[clamp(1rem,4vw,1.35rem)] font-extrabold leading-tight tracking-tight text-white">
                          <span aria-hidden>🔥</span> Pak de beste deal van vanavond
                        </h3>

                        <div className="mt-2 shrink-0 space-y-2 [@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:space-y-1.5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38 [@media(max-height:760px)]:text-[9px]">
                              Jouw deal nu
                            </p>
                            <p className="mt-1 text-[clamp(0.9rem,3.5vw,1.05rem)] font-semibold leading-snug text-white/70 [@media(max-height:760px)]:mt-0.5">
                              {baseDeal.title}
                            </p>
                          </div>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90 [@media(max-height:760px)]:text-[9px]">
                              <span aria-hidden>🔥</span> Met upgrade
                            </p>
                            <p className="mt-1 text-[clamp(1rem,4vw,1.35rem)] font-bold leading-snug text-white [@media(max-height:760px)]:mt-0.5">
                              {upgraded.title}
                            </p>
                          </div>
                        </div>

                        <form
                          className="mt-2 flex min-h-0 min-w-0 flex-1 flex-col justify-end gap-2 [@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:gap-1.5"
                          onSubmit={handleUpgradeSubmit}
                          autoComplete="on"
                        >
                          <div className="min-h-0 space-y-2">
                            <p className="text-center text-[clamp(0.95rem,3.8vw,1.15rem)] font-bold leading-snug text-white">
                              Ontvang direct je betere deal
                            </p>
                            <div>
                              <label
                                htmlFor="phone"
                                className="mb-1 block w-full px-2 text-center text-[10px] font-semibold leading-snug text-white sm:px-3 sm:text-[11px]"
                              >
                                Laat je nummer achter om de deal te activeren.
                              </label>
                              <input
                                id="phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                enterKeyHint="go"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                placeholder="06 12345678"
                                value={phone}
                                onChange={(e) => {
                                  setPhone(e.target.value);
                                  if (phoneError) setPhoneError(null);
                                }}
                                aria-invalid={phoneError ? true : undefined}
                                aria-describedby={
                                  phoneError ? "phone-error" : undefined
                                }
                                className="w-full rounded-2xl border border-white/25 bg-black/50 px-4 py-3 text-[clamp(1rem,4.2vw,1.25rem)] leading-snug text-white shadow-inner outline-none ring-violet-400/40 placeholder:text-white/35 focus:border-violet-400/55 focus:ring-2 [@media(max-height:760px)]:py-2.5"
                              />
                              {phoneError ? (
                                <p
                                  id="phone-error"
                                  className="mt-1 text-[13px] font-medium text-amber-200/95"
                                  role="alert"
                                >
                                  {phoneError}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full shrink-0 py-4 text-[clamp(1rem,3.8vw,1.15rem)] font-extrabold shadow-lg shadow-violet-900/40 [@media(max-height:760px)]:py-3.5"
                          >
                            Activeer betere deal
                          </Button>
                          <p className="shrink-0 px-1 text-center text-[9px] leading-relaxed text-white/38 sm:text-[10px]">
                            Je ontvangt de nieuwste deals en nieuwsbrieven.
                          </p>
                        </form>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="mt-2 w-full shrink-0 py-2 text-[13px] leading-snug text-white/45 [@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:py-1.5 [@media(max-height:760px)]:text-[12px]"
                      onClick={goClaim}
                    >
                      Nee, ik ga door met de minder goede deal hierboven
                    </Button>
                  </div>
                </>
              );
            })()}
          </section>
        ) : null}

        {step === "claim" && effectiveDeal && claimExpiresAt !== null ? (
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BartenderDealScreen
              dealTitle={effectiveDeal.title}
              totalLabel={getBartenderTotalLabel(effectiveDeal, isUpgraded)}
              sessionFooterId={formatDealSessionFooter(effectiveDeal.claimCode)}
              used={voucherUsedEffective}
              expiresAtMs={claimExpiresAt}
              onMarkUsed={() => {
                const k = `bb_claim_${effectiveDeal.claimCode}`;
                localStorage.setItem(`${k}_used`, "1");
                setVoucherUsed(true);
              }}
              onGuestContinue={() => setStep("retention")}
            />
          </section>
        ) : step === "claim" && effectiveDeal ? (
          <div className="flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden text-sm text-white/40">
            Laden…
          </div>
        ) : null}

        {step === "retention" ? (
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 overflow-hidden [@media(max-height:700px)]:gap-1.5">
            <div className="min-h-0 shrink">
              <h2 className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold text-white">
                Nog iets extra?
              </h2>
              <p className="mt-1 text-[clamp(0.9rem,3.8vw,1.05rem)] text-white/55 [@media(max-height:700px)]:mt-0.5">
                Mag je overslaan.
              </p>

              <div className="mt-3 space-y-3 [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:space-y-2">
                <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-3 [@media(max-height:700px)]:p-2.5">
                  <p className="text-[clamp(1rem,4vw,1.125rem)] font-bold text-white">
                    Binnenkort terug?
                  </p>
                  <p className="mt-1 text-[clamp(0.85rem,3.5vw,1.05rem)] text-white/60 [@media(max-height:700px)]:mt-1">
                    Kom binnen 5 dagen — dan krijg je een extraatje aan de bar.
                  </p>
                  <Button
                    className="mt-3 w-full py-3 text-base font-bold [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:py-2.5"
                    variant="secondary"
                    disabled={comebackActivated}
                    onClick={() => setComebackActivated(true)}
                  >
                    {comebackActivated ? "Opgeslagen" : "Ja, dat wil ik"}
                  </Button>
                </div>
              </div>
            </div>

            <Link
              href="/gast"
              className={buttonClassName(
                "ghost",
                "shrink-0 w-full justify-center py-2 text-center text-sm no-underline [@media(max-height:700px)]:py-1.5",
              )}
            >
              Terug naar start
            </Link>
          </section>
        ) : null}
      </div>
    </MobileShell>
  );
}
