"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#06060a] px-4 text-sm text-white/45">
          Laden…
        </div>
      }
    >
      <GuestFlowInner {...props} />
    </Suspense>
  );
}

function GuestFlowInner({ initialStep = "welcome" }: { initialStep?: Step }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(initialStep);
  const [baseDeal, setBaseDeal] = useState<Deal | null>(null);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [voucherUsed, setVoucherUsed] = useState(false);
  const [claimExpiresAt, setClaimExpiresAt] = useState<number | null>(null);
  const [demoKey, setDemoKey] = useState(0);
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

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("bb_claim_")) localStorage.removeItem(k);
        }
        for (const k of Object.keys(sessionStorage)) {
          if (k.startsWith("bb_claim_")) sessionStorage.removeItem(k);
        }
      } catch {
        /* ignore */
      }
    }

    /* Vanaf /gast/unlock: echte route-wissel — betrouwbaar op mobiel (geen JS-click nodig). */
    if (pathname?.includes("/gast/unlock")) {
      router.push("/gast");
      return;
    }

    setStep("welcome");
    setBaseDeal(null);
    setIsUpgraded(false);
    setPhone("");
    setPhoneError(null);
    setVoucherUsed(false);
    setClaimExpiresAt(null);
    setDemoKey((k) => k + 1);
    setComebackActivated(false);
    setWheelRotation(0);
    setSpinning(false);
    setRevealDealId(null);
    if (revealAdvanceRef.current) {
      window.clearTimeout(revealAdvanceRef.current);
      revealAdvanceRef.current = null;
    }
  }, [pathname, router]);

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

    const scrollT = window.setTimeout(() => {
      document
        .getElementById(`prize-reveal-${revealDealId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(scrollT);
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

  const footer = (
    <div className="flex flex-col gap-2">
      <p className="text-center text-[10px] leading-relaxed text-white/32">
        Demonstratie — geen echte betalingen, berichten of koppelingen.
      </p>
      <Button variant="ghost" className="w-full py-2 text-xs" onClick={reset}>
        Demo resetten
      </Button>
    </div>
  );

  return (
    <MobileShell footer={footer}>
      <div key={demoKey} className="flex flex-1 flex-col">
        {step === "welcome" ? (
          <section className="flex flex-1 flex-col text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
              BarBoost
            </p>
            <h1 className="mt-5 text-[1.6rem] font-bold leading-snug tracking-tight text-white">
              Jouw deal van vanavond
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/52">
              Scan de QR bij je tafel — daarna claim je direct aan de bar. Geen app nodig.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge tone="hot">Alleen vanavond</Badge>
              <Badge tone="info">Aan de bar tonen</Badge>
              <Badge tone="success">Geschikt voor groepen</Badge>
            </div>
            <div className="mt-auto space-y-3 pt-12">
              <Link
                href="/gast/unlock"
                prefetch
                className={buttonClassName(
                  "primary",
                  "w-full justify-center py-4 text-base text-center no-underline",
                )}
              >
                Start met deal
              </Link>
              <p className="text-xs text-white/38">Gemiddeld onder een minuut</p>
            </div>
          </section>
        ) : null}

        {step === "unlock" ? (
          <section className="flex min-h-0 flex-1 flex-col gap-5 pb-2">
            <div className="flex flex-col items-center pt-1">
              <LuckWheel
                rotationDeg={wheelRotation}
                spinning={spinning}
                mini
                emphasized={spinning}
                showCaption={false}
                segmentColors={UNLOCK_SHOWCASE.map((r) => r.wheelColor)}
              />
              {spinning ? (
                <p className="mt-5 text-center text-[1.05rem] font-bold tracking-tight text-transparent bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-300 bg-clip-text">
                  Het rad draait…
                </p>
              ) : null}
              {revealDealId && !spinning ? (
                <p className="mt-4 text-center text-[13px] font-medium text-white/50">
                  Zo meteen volgt je deal op het volgende scherm
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                "rounded-[1.25rem] border border-white/[0.08] px-4 py-5 transition-all duration-500",
                spinning && "pointer-events-none bg-white/[0.025] opacity-[0.92]",
                !spinning && !revealDealId && "bg-white/[0.035]",
                revealDealId && "relative bg-black/40 py-6 ring-1 ring-white/10",
              )}
            >
              <h2 className="text-[1.35rem] font-bold leading-tight tracking-tight text-white">
                {revealDealId ? "Dit wordt jouw deal" : "Wat kan je winnen?"}
              </h2>
              <div
                className={cn(
                  "mt-4 flex flex-col gap-3",
                  revealDealId && "gap-4",
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
                      className={cn(isWinner && revealDealId && "order-first")}
                    >
                      <PrizeShowcaseCard
                        accentHex={row.wheelColor}
                        staggerIndex={i}
                        emphasis={emphasis}
                        dealId={row.dealId}
                      >
                        {isWinner && revealDealId ? (
                          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300/95">
                            Jouw prijs
                          </p>
                        ) : null}
                        <p
                          className={cn(
                            "font-semibold leading-snug tracking-tight text-white",
                            isWinner && revealDealId
                              ? "text-[1.42rem] leading-tight sm:text-[1.55rem]"
                              : "text-[1.2rem]",
                          )}
                        >
                          {row.text}
                        </p>
                        <p className="mt-2 text-[14px] text-white/50">
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
              <p className="mt-5 text-center text-[14px] font-medium leading-snug text-white/45">
                {spinning
                  ? "Eén van deze prijzen wordt zo je deal"
                  : revealDealId
                    ? "Even rustig bekijken — daarna zie je alle details"
                    : "Draai en unlock 1 van deze deals"}
              </p>
            </div>

            {spinning || revealDealId ? (
              <div
                className={buttonClassName(
                  "primary",
                  "w-full cursor-default justify-center py-4 text-lg font-semibold opacity-90",
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
                  "w-full justify-center py-4 text-center text-lg font-semibold no-underline",
                )}
              >
                Draai nu
              </Link>
            )}
          </section>
        ) : null}

        {step === "baseDeal" && baseDeal ? (
          <section className="flex flex-1 flex-col gap-6">
            {(() => {
              const pc = getDealPriceCompare(baseDeal);
              const upgraded = buildUpgradedDeal(baseDeal);
              const mins = Math.max(1, Math.ceil(baseDeal.timerSeconds / 60));
              return (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 text-center">
                    <p className="text-lg font-bold text-emerald-300/95">Dit heb je gewonnen</p>
                    <h2 className="mt-3 text-[1.75rem] font-bold leading-tight text-white">
                      {baseDeal.title}
                    </h2>
                    <p className="mt-5 text-lg text-white/45 line-through decoration-white/30">
                      normaal {pc.normal}
                    </p>
                    <p className="mt-5 text-[17px] font-medium text-white/70">
                      Nog {mins} minuten · alleen in {BAR_NAME}
                    </p>
                  </div>

                  <div>
                    <div className="relative overflow-hidden rounded-3xl border-2 border-violet-400/55 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(124,58,237,0.22)]">
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
                      <div className="relative z-[3]">
                        <h3 className="text-center text-[1.35rem] font-extrabold leading-tight tracking-tight text-white">
                          <span aria-hidden>🔥</span> Pak de beste deal van vanavond
                        </h3>

                        <div className="mt-6 space-y-5">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/38">
                              Jouw deal nu
                            </p>
                            <p className="mt-2 text-[1.05rem] font-semibold leading-snug text-white/70">
                              {baseDeal.title}
                            </p>
                          </div>
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/90">
                              <span aria-hidden>🔥</span> Met upgrade
                            </p>
                            <p className="mt-2 text-[1.35rem] font-bold leading-snug text-white">
                              {upgraded.title}
                            </p>
                          </div>
                        </div>

                        <form
                          className="mt-8 flex flex-col gap-5"
                          onSubmit={handleUpgradeSubmit}
                          autoComplete="on"
                        >
                          <div className="space-y-3">
                            <p className="text-center text-[1.15rem] font-bold leading-snug text-white">
                              Ontvang direct je betere deal
                            </p>
                            <div>
                              <label
                                htmlFor="phone"
                                className="mb-2 block w-full px-3 text-center text-[11px] font-semibold leading-snug text-white sm:px-4 sm:text-[12px]"
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
                                className="w-full rounded-2xl border border-white/25 bg-black/50 px-5 py-5 text-xl leading-snug text-white shadow-inner outline-none ring-violet-400/40 placeholder:text-white/35 focus:border-violet-400/55 focus:ring-2"
                              />
                              {phoneError ? (
                                <p
                                  id="phone-error"
                                  className="mt-2 text-[15px] font-medium text-amber-200/95"
                                  role="alert"
                                >
                                  {phoneError}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full py-6 text-[1.15rem] font-extrabold shadow-lg shadow-violet-900/40"
                          >
                            Activeer betere deal
                          </Button>
                          <p className="px-2 text-center text-[10px] leading-relaxed text-white/38 sm:text-[11px]">
                            Je ontvangt de nieuwste deals en nieuwsbrieven.
                          </p>
                        </form>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="mt-4 w-full py-3 text-[16px] text-white/45"
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
          <section className="flex min-h-0 flex-1 flex-col">
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
          <div className="flex flex-1 items-center justify-center text-sm text-white/40">
            Laden…
          </div>
        ) : null}

        {step === "retention" ? (
          <section className="flex flex-1 flex-col gap-5">
            <h2 className="text-2xl font-bold text-white">Nog iets extra?</h2>
            <p className="text-[17px] text-white/55">
              Mag je overslaan.
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4">
                <p className="text-lg font-bold text-white">Binnenkort terug?</p>
                <p className="mt-2 text-[17px] text-white/60">
                  Kom binnen 5 dagen — dan krijg je een extraatje aan de bar.
                </p>
                <Button
                  className="mt-4 w-full py-4 text-lg font-bold"
                  variant="secondary"
                  disabled={comebackActivated}
                  onClick={() => setComebackActivated(true)}
                >
                  {comebackActivated ? "Opgeslagen" : "Ja, dat wil ik"}
                </Button>
              </div>
            </div>

            <Link
              href="/gast"
              className={buttonClassName(
                "ghost",
                "mt-auto w-full justify-center pt-8 text-center no-underline",
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
