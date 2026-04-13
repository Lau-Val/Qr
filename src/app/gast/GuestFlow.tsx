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
import { buildUpgradedDeal } from "@/data/deal-upgrades";
import type { GastTemplateId } from "@/data/gast-templates";
import { getGastTemplate } from "@/data/gast-templates";
import type { Deal } from "@/data/types";
import { BartenderDealScreen } from "@/components/barboost/BartenderDealScreen";
import { PrizeShowcaseCard } from "@/components/barboost/PrizeShowcaseCard";
import { Button, buttonClassName } from "@/components/barboost/ui/Button";
import { Badge } from "@/components/barboost/ui/Badge";
import { KapperPrizeBox } from "@/components/barboost/KapperPrizeBox";
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

export function GuestFlow(props: {
  initialStep?: Step;
  templateId?: GastTemplateId;
}) {
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

function GuestFlowInner({
  initialStep = "welcome",
  templateId = "horeca",
}: {
  initialStep?: Step;
  templateId?: GastTemplateId;
}) {
  const searchParams = useSearchParams();
  const tpl = useMemo(() => getGastTemplate(templateId), [templateId]);
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

  const GIFT_BOX_OPEN_MS = 2800;
  const WHEEL_SPIN_MS = 5850;

  const startUnlockAnimation = useCallback(() => {
    const dealId = pickWeightedDealId(
      tpl.unlockShowcase.map(({ dealId, weight }) => ({ dealId, weight })),
    );
    const deal = resolveDealById(tpl.dealPool, dealId);
    if (!deal) {
      return;
    }
    setSpinning(true);
    if (tpl.unlockMode === "giftBox") {
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
      }, GIFT_BOX_OPEN_MS);
      return;
    }
    const luck = tpl.luckBand(dealId);
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
    }, WHEEL_SPIN_MS);
  }, [tpl]);

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
    startUnlockAnimation();
    /* State eerst laten committen; daarna alleen history — geen Next-router (voorkomt remount). */
    queueMicrotask(() => {
      stripSpinQueryFromAddressBar();
    });
  }, [step, searchParams, spinning, revealDealId, startUnlockAnimation]);

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
    const row = tpl.unlockShowcase.find((r) => r.dealId === revealDealId);
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
  }, [revealDealId, tpl.unlockShowcase]);

  useEffect(() => {
    if (step !== "baseDeal" || !baseDeal) return;
    const row = tpl.unlockShowcase.find((r) => r.dealId === baseDeal.id);
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
  }, [step, baseDeal, tpl.unlockShowcase]);

  const salonStyle = tpl.unlockMode === "giftBox";

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
    <MobileShell
      className={
        salonStyle
          ? "border-amber-200/20 shadow-[0_28px_70px_rgba(50,35,8,0.55)] bg-gradient-to-b from-[#353026] via-[#252014] to-[#141008]"
          : undefined
      }
    >
      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <span
          className="pointer-events-none absolute left-0 top-0 z-[200] select-none font-mono text-[8px] tabular-nums leading-none text-white/40 sm:text-[9px]"
          aria-hidden
          title={`Stap ${gastFlowPageNumber(step)} (tijdelijk)`}
        >
          {gastFlowPageNumber(step)}
        </span>
        {step === "welcome" ? (
          <section
            className={cn(
              "flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 overflow-hidden text-center [@media(max-height:640px)]:gap-1.5",
              salonStyle && "text-amber-50",
            )}
          >
            <div className="min-h-0 shrink">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.35em]",
                  salonStyle ? "text-amber-200/75" : "text-white/45",
                )}
              >
                {tpl.brandLabel}
              </p>
              <h1
                className={cn(
                  "mt-3 text-[clamp(1.25rem,4.8vw,1.6rem)] font-bold leading-snug tracking-tight [@media(max-height:640px)]:mt-2",
                  salonStyle ? "text-amber-50" : "text-white",
                )}
              >
                {tpl.welcome.title}
              </h1>
              <p
                className={cn(
                  "mt-2 text-[clamp(0.8rem,3.2vw,0.875rem)] leading-relaxed [@media(max-height:640px)]:mt-1.5",
                  salonStyle ? "text-amber-100/80" : "text-white/52",
                )}
              >
                {tpl.welcome.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 [@media(max-height:640px)]:mt-3 [@media(max-height:640px)]:gap-1">
                {tpl.welcome.badges.map((b) => (
                  <Badge key={b.text} tone={b.tone}>
                    {b.text}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="shrink-0 space-y-2 pt-2 [@media(max-height:640px)]:space-y-1.5 [@media(max-height:640px)]:pt-1">
              <Link
                href={`${tpl.basePath}/unlock`}
                prefetch
                className={cn(
                  salonStyle
                    ? "flex w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500 px-5 py-3.5 text-center text-base font-semibold tracking-tight text-stone-900 shadow-lg shadow-amber-950/35 no-underline transition hover:bg-amber-400 active:bg-amber-600 [@media(max-height:640px)]:py-3"
                    : buttonClassName(
                        "primary",
                        "w-full justify-center py-3.5 text-base text-center no-underline [@media(max-height:640px)]:py-3",
                      ),
                )}
              >
                {tpl.welcome.cta}
              </Link>
              <p
                className={cn(
                  "text-[11px] sm:text-xs",
                  salonStyle ? "text-amber-200/50" : "text-white/38",
                )}
              >
                {tpl.welcome.footerHint}
              </p>
            </div>
          </section>
        ) : null}

        {step === "unlock" ? (
          <section className="bb-gast-unlock flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden pb-0">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center pt-0">
              {tpl.unlockMode === "giftBox" ? (
                <KapperPrizeBox
                  opening={spinning}
                  revealDealId={revealDealId}
                  showcase={tpl.unlockShowcase.map(({ dealId, text }) => ({
                    dealId,
                    text,
                  }))}
                  onBoxPress={() => startUnlockAnimation()}
                  idleHint="Tik op de box — hij gaat open en je prijs komt tevoorschijn."
                />
              ) : (
                <LuckWheel
                  rotationDeg={wheelRotation}
                  spinning={spinning}
                  mini
                  unlockLayout
                  emphasized={spinning}
                  showCaption={false}
                  segmentColors={tpl.unlockShowcase.map((r) => r.wheelColor)}
                />
              )}
              {spinning ? (
                <p
                  className={cn(
                    "mt-2 text-center text-[clamp(0.78rem,3.2vw,0.95rem)] font-bold tracking-tight",
                    salonStyle
                      ? "text-amber-200"
                      : "bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-300 bg-clip-text text-transparent",
                  )}
                >
                  {tpl.unlock.openingHint}
                </p>
              ) : null}
              {revealDealId && !spinning ? (
                <p
                  className={cn(
                    "mt-1.5 text-center text-[10px] font-medium leading-tight",
                    salonStyle ? "text-amber-200/70" : "text-white/45",
                  )}
                >
                  Zo meteen volgt je deal op het volgende scherm
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                "flex max-h-[min(318px,40dvh)] min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border px-2 py-2 transition-all duration-500 sm:max-h-[min(340px,42dvh)] sm:rounded-[1.1rem] sm:px-2.5 sm:py-2.5",
                salonStyle
                  ? "border-amber-200/15 bg-amber-950/20 ring-1 ring-amber-400/10"
                  : "border-white/[0.08]",
                spinning && "pointer-events-none opacity-[0.92]",
                !spinning && !revealDealId && !salonStyle && "bg-white/[0.035]",
                !spinning && !revealDealId && salonStyle && "bg-amber-950/15",
                revealDealId && !salonStyle && "relative bg-black/40 ring-1 ring-white/10",
                revealDealId && salonStyle && "relative bg-amber-950/35 ring-1 ring-amber-400/20",
              )}
            >
              <h2
                className={cn(
                  "shrink-0 text-[clamp(0.78rem,3.3vw,1.08rem)] font-bold leading-tight tracking-tight",
                  salonStyle ? "text-amber-50" : "text-white",
                )}
              >
                {revealDealId
                  ? tpl.unlock.listHeadingReveal
                  : tpl.unlock.listHeading}
              </h2>
              <div
                className={cn(
                  "mt-1.5 flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-hidden pb-0.5 sm:mt-2 sm:gap-3.5",
                  revealDealId && "gap-3.5 sm:gap-4",
                )}
              >
                {tpl.unlockShowcase.map((row, i) => {
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
                          <p
                            className={cn(
                              "mb-0.5 text-center text-[8px] font-bold uppercase tracking-[0.22em]",
                              salonStyle
                                ? "text-amber-200"
                                : "text-emerald-300/95",
                            )}
                          >
                            Jouw prijs
                          </p>
                        ) : null}
                        <p
                          className={cn(
                            "font-semibold leading-snug tracking-tight",
                            salonStyle ? "text-amber-50" : "text-white",
                            isWinner && revealDealId
                              ? "text-[clamp(0.88rem,3.5vw,1.18rem)]"
                              : "text-[clamp(0.8rem,3.1vw,1.05rem)]",
                          )}
                        >
                          {row.text}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-[10px] leading-tight sm:text-[11px]",
                            salonStyle ? "text-amber-200/55" : "text-white/50",
                          )}
                        >
                          Normaal{" "}
                          <span
                            className={cn(
                              "font-medium line-through",
                              salonStyle
                                ? "text-amber-100/70 decoration-amber-200/35"
                                : "text-white/65 decoration-white/35",
                            )}
                          >
                            {row.normaal}
                          </span>
                        </p>
                      </PrizeShowcaseCard>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              {spinning || revealDealId ? (
                <div
                  className={cn(
                    buttonClassName(
                      "primary",
                      "w-full cursor-default justify-center py-2.5 text-sm font-semibold opacity-90 sm:py-3 sm:text-base",
                    ),
                    salonStyle &&
                      "!bg-amber-600/90 !text-amber-50 !shadow-amber-950/40",
                  )}
                  aria-live="polite"
                >
                  {spinning ? "Even geduld…" : "Zo meteen…"}
                </div>
              ) : (
                <Link
                  href={`${tpl.basePath}/unlock?${SPIN_QUERY}=1`}
                  prefetch={false}
                  className={cn(
                    salonStyle
                      ? "flex w-full touch-manipulation select-none items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500 py-2.5 text-center text-sm font-semibold text-stone-900 shadow-md shadow-amber-950/35 no-underline transition hover:bg-amber-400 sm:py-3 sm:text-base"
                      : buttonClassName(
                          "primary",
                          "w-full justify-center py-2.5 text-center text-sm font-semibold no-underline sm:py-3 sm:text-base",
                        ),
                  )}
                >
                  {tpl.unlock.primaryCta}
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
                  <div
                    className={cn(
                      "shrink-0 rounded-xl border px-2.5 py-2 text-center sm:rounded-2xl sm:px-3 sm:py-2.5 [@media(max-height:760px)]:py-2",
                      salonStyle
                        ? "border-amber-300/25 bg-amber-950/30"
                        : "border-white/10 bg-white/[0.04]",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[clamp(0.95rem,3.8vw,1.125rem)] font-bold",
                        salonStyle ? "text-amber-200" : "text-emerald-300/95",
                      )}
                    >
                      Dit heb je gewonnen
                    </p>
                    <h2
                      className={cn(
                        "mt-1.5 text-[clamp(1.15rem,5vw,1.75rem)] font-bold leading-tight [@media(max-height:760px)]:mt-1",
                        salonStyle ? "text-amber-50" : "text-white",
                      )}
                    >
                      {baseDeal.title}
                    </h2>
                    <p
                      className={cn(
                        "mt-2 text-[clamp(0.9rem,3.5vw,1.125rem)] line-through [@media(max-height:760px)]:mt-1.5",
                        salonStyle
                          ? "text-amber-200/45 decoration-amber-300/35"
                          : "text-white/45 decoration-white/30",
                      )}
                    >
                      normaal {pc.normal}
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[clamp(0.8rem,3.2vw,1rem)] font-medium [@media(max-height:760px)]:mt-1.5",
                        salonStyle ? "text-amber-100/80" : "text-white/70",
                      )}
                    >
                      Nog {mins} {tpl.baseDeal.contextLine} {tpl.barName}
                    </p>
                  </div>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div
                      className={cn(
                        "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 p-3 sm:rounded-3xl sm:p-4 [@media(max-height:760px)]:p-2.5",
                        salonStyle
                          ? "border-amber-400/45 shadow-[0_0_0_1px_rgba(217,119,6,0.25),0_20px_50px_rgba(0,0,0,0.5),0_0_70px_rgba(245,158,11,0.18)]"
                          : "border-violet-400/55 shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(124,58,237,0.22)]",
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0",
                          salonStyle
                            ? "bg-gradient-to-b from-amber-950/85 via-[#1c160c] to-black/55"
                            : "bg-gradient-to-b from-violet-950/90 via-[#15101f] to-black/50",
                        )}
                        aria-hidden
                      />
                      <div
                        className="bb-upgrade-bg-drift pointer-events-none absolute inset-0 rounded-3xl"
                        aria-hidden
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute -right-16 -top-16 z-[1] h-40 w-40 rounded-full blur-3xl",
                          salonStyle ? "bg-amber-500/30" : "bg-violet-500/25",
                        )}
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
                        <h3
                          className={cn(
                            "shrink-0 text-center text-[clamp(1rem,4vw,1.35rem)] font-extrabold leading-tight tracking-tight",
                            salonStyle ? "text-amber-50" : "text-white",
                          )}
                        >
                          <span aria-hidden>{salonStyle ? "✨" : "🔥"}</span>{" "}
                          {tpl.baseDeal.upgradeHeadline}
                        </h3>

                        <div className="mt-2 shrink-0 space-y-2 [@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:space-y-1.5">
                          <div>
                            <p
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.2em] [@media(max-height:760px)]:text-[9px]",
                                salonStyle
                                  ? "text-amber-200/55"
                                  : "text-white/38",
                              )}
                            >
                              {tpl.baseDeal.upgradeSubStandard}
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-[clamp(0.9rem,3.5vw,1.05rem)] font-semibold leading-snug [@media(max-height:760px)]:mt-0.5",
                                salonStyle
                                  ? "text-amber-100/85"
                                  : "text-white/70",
                              )}
                            >
                              {baseDeal.title}
                            </p>
                          </div>
                          <div
                            className={cn(
                              "h-px w-full bg-gradient-to-r from-transparent to-transparent",
                              salonStyle
                                ? "via-amber-300/25"
                                : "via-white/20",
                            )}
                          />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90 [@media(max-height:760px)]:text-[9px]">
                              <span aria-hidden>{salonStyle ? "✨" : "🔥"}</span>{" "}
                              {tpl.baseDeal.upgradeSubUpgraded}
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-[clamp(1rem,4vw,1.35rem)] font-bold leading-snug [@media(max-height:760px)]:mt-0.5",
                                salonStyle ? "text-amber-50" : "text-white",
                              )}
                            >
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
                            <p
                              className={cn(
                                "text-center text-[clamp(0.95rem,3.8vw,1.15rem)] font-bold leading-snug",
                                salonStyle ? "text-amber-50" : "text-white",
                              )}
                            >
                              Ontvang direct je betere deal
                            </p>
                            <div>
                              <label
                                htmlFor="phone"
                                className={cn(
                                  "mb-1 block w-full px-2 text-center text-[10px] font-semibold leading-snug sm:px-3 sm:text-[11px]",
                                  salonStyle ? "text-amber-100/85" : "text-white",
                                )}
                              >
                                {tpl.baseDeal.phoneLabel}
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
                                className={cn(
                                  "w-full rounded-2xl border px-4 py-3 text-[clamp(1rem,4.2vw,1.25rem)] leading-snug shadow-inner outline-none focus:ring-2 [@media(max-height:760px)]:py-2.5",
                                  salonStyle
                                    ? "border-amber-400/35 bg-stone-950/60 text-amber-50 ring-amber-400/30 placeholder:text-amber-200/35 focus:border-amber-400/60"
                                    : "border-white/25 bg-black/50 text-white ring-violet-400/40 placeholder:text-white/35 focus:border-violet-400/55",
                                )}
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
                            className={cn(
                              "w-full shrink-0 py-4 text-[clamp(1rem,3.8vw,1.15rem)] font-extrabold [@media(max-height:760px)]:py-3.5",
                              salonStyle
                                ? "!bg-amber-500 !text-stone-900 shadow-lg shadow-amber-950/40 hover:!bg-amber-400"
                                : "shadow-lg shadow-violet-900/40",
                            )}
                          >
                            {tpl.baseDeal.upgradeSubmit}
                          </Button>
                          <p
                            className={cn(
                              "shrink-0 px-1 text-center text-[9px] leading-relaxed sm:text-[10px]",
                              salonStyle
                                ? "text-amber-200/40"
                                : "text-white/38",
                            )}
                          >
                            Je ontvangt de nieuwste deals en nieuwsbrieven.
                          </p>
                        </form>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className={cn(
                        "mt-2 w-full shrink-0 py-2 text-[13px] leading-snug [@media(max-height:760px)]:mt-1.5 [@media(max-height:760px)]:py-1.5 [@media(max-height:760px)]:text-[12px]",
                        salonStyle
                          ? "text-amber-200/50 hover:text-amber-100/80"
                          : "text-white/45",
                      )}
                      onClick={goClaim}
                    >
                      {tpl.baseDeal.skipUpgrade}
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
              <h2
                className={cn(
                  "text-[clamp(1.25rem,5vw,1.5rem)] font-bold",
                  salonStyle ? "text-amber-50" : "text-white",
                )}
              >
                Nog iets extra?
              </h2>
              <p
                className={cn(
                  "mt-1 text-[clamp(0.9rem,3.8vw,1.05rem)] [@media(max-height:700px)]:mt-0.5",
                  salonStyle ? "text-amber-100/65" : "text-white/55",
                )}
              >
                Mag je overslaan.
              </p>

              <div className="mt-3 space-y-3 [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:space-y-2">
                <div
                  className={cn(
                    "rounded-2xl border p-3 [@media(max-height:700px)]:p-2.5",
                    salonStyle
                      ? "border-amber-300/20 bg-amber-950/25"
                      : "border-white/[0.1] bg-white/[0.04]",
                  )}
                >
                  <p
                    className={cn(
                      "text-[clamp(1rem,4vw,1.125rem)] font-bold",
                      salonStyle ? "text-amber-50" : "text-white",
                    )}
                  >
                    Binnenkort terug?
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[clamp(0.85rem,3.5vw,1.05rem)] [@media(max-height:700px)]:mt-1",
                      salonStyle ? "text-amber-100/70" : "text-white/60",
                    )}
                  >
                    {tpl.retention.comebackBody}
                  </p>
                  <Button
                    className={cn(
                      "mt-3 w-full py-3 text-base font-bold [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:py-2.5",
                      salonStyle &&
                        "!border-amber-400/30 !bg-amber-500/20 !text-amber-50 hover:!bg-amber-500/30",
                    )}
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
              href={tpl.basePath}
              className={buttonClassName(
                "ghost",
                cn(
                  "shrink-0 w-full justify-center py-2 text-center text-sm no-underline [@media(max-height:700px)]:py-1.5",
                  salonStyle && "text-amber-200/75 hover:text-amber-100",
                ),
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
