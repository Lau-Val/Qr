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
import {
  clearGastFlowPersist,
  readGastFlowPersist,
  resolveDealFromPersist,
  writeGastFlowPersist,
} from "@/lib/gast-flow-session";
import { buildUpgradedDeal } from "@/data/deal-upgrades";
import type { GastTemplateId } from "@/data/gast-templates";
import { getGastTemplate } from "@/data/gast-templates";
import type { Deal } from "@/data/types";
import { BartenderDealScreen } from "@/components/barboost/BartenderDealScreen";
import { Button, buttonClassName } from "@/components/barboost/ui/Button";
import { Badge } from "@/components/barboost/ui/Badge";
import { KapperPrizeBox } from "@/components/barboost/KapperPrizeBox";
import { RetentionSocialLinks } from "@/components/barboost/RetentionSocialLinks";
import { MobileShell } from "@/components/barboost/ui/MobileShell";
import {
  pickWeightedDealId,
  resolveDealById,
} from "@/lib/unlock-weighted-deal";
import {
  formatDealSessionFooter,
  getBartenderTotalLabel,
  getDealPriceCompare,
} from "@/lib/deal-pricing";
import { formatMmSs } from "@/lib/format-mm-ss";
import { isValidDutchMobile, normalizeDutchPhone } from "@/lib/phone-nl";
import { cn } from "@/lib/cn";
import { fireFallConfetti, fireWinConfetti } from "@/lib/win-confetti";
import { useGuestTheme } from "@/context/GuestThemeContext";
import { GuestThemeSwitcher } from "@/components/gast/GuestThemeSwitcher";

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
  /** Één deadline per gewonnen deal (deel met claim-scherm via sessionStorage). */
  const [baseDealDeadlineMs, setBaseDealDeadlineMs] = useState<number | null>(
    null,
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [spinning, setSpinning] = useState(false);
  /** Na rad: welke deal-id wint — toont reveal voordat we naar baseDeal gaan */
  const [revealDealId, setRevealDealId] = useState<string | null>(null);
  const revealAdvanceRef = useRef<number | null>(null);
  const consumedUrlSpin = useRef(false);

  /** Na reload: flow hervatten zodat mystery box niet opnieuw kan. */
  useLayoutEffect(() => {
    if (initialStep !== "unlock") return;
    const p = readGastFlowPersist(templateId);
    if (!p) return;
    const deal = resolveDealFromPersist(templateId, p);
    if (!deal) {
      clearGastFlowPersist(templateId);
      return;
    }
    setBaseDeal(deal);
    setStep(p.step);
    setIsUpgraded(p.isUpgraded);
  }, [initialStep, templateId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      baseDeal &&
      (step === "baseDeal" || step === "claim" || step === "retention")
    ) {
      writeGastFlowPersist(templateId, {
        dealId: baseDeal.id,
        step,
        isUpgraded,
      });
    }
  }, [templateId, step, baseDeal, isUpgraded]);

  const MYSTERY_BOX_OPEN_MS = 2800;

  const startUnlockAnimation = useCallback(() => {
    const dealId = pickWeightedDealId(
      tpl.unlockShowcase.map(({ dealId, weight }) => ({ dealId, weight })),
    );
    const deal = resolveDealById(tpl.dealPool, dealId);
    if (!deal) {
      return;
    }
    setSpinning(true);
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
    }, MYSTERY_BOX_OPEN_MS);
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
    if (baseDeal) return;
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
  }, [
    step,
    searchParams,
    spinning,
    revealDealId,
    startUnlockAnimation,
    baseDeal,
  ]);

  const goClaim = useCallback(() => {
    setStep("claim");
  }, []);

  const persistedVoucherUsed =
    typeof window !== "undefined" &&
    step === "claim" &&
    effectiveDeal != null &&
    localStorage.getItem(`bb_claim_${effectiveDeal.claimCode}_used`) === "1";

  const voucherUsedEffective = voucherUsed || persistedVoucherUsed;

  /* Deadline voor gewonnen deal: zelfde eindtijd op baseDeal- en claim-stap. */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (step !== "baseDeal" || !baseDeal) {
      setBaseDealDeadlineMs(null);
      return;
    }
    const key = `bb_deal_deadline_${templateId}_${baseDeal.id}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const n = Number(raw);
      if (!Number.isNaN(n)) {
        setBaseDealDeadlineMs(n);
        setNowMs(Date.now());
        return;
      }
    }
    const at = Date.now() + baseDeal.timerSeconds * 1000;
    sessionStorage.setItem(key, String(at));
    setBaseDealDeadlineMs(at);
    setNowMs(Date.now());
  }, [step, baseDeal, templateId]);

  useEffect(() => {
    if (step !== "baseDeal" || baseDealDeadlineMs == null) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step, baseDealDeadlineMs]);

  /* Client-only: read/write sessionStorage for countdown end time (demo persistence). */
  /* eslint-disable react-hooks/set-state-in-effect -- sync expiry into state once per claim step */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (step !== "claim" || !effectiveDeal) {
      return;
    }
    const sharedKey = `bb_deal_deadline_${templateId}_${effectiveDeal.id}`;
    const claimKey = `bb_claim_${effectiveDeal.claimCode}`;
    const claimExpKey = `${claimKey}_exp`;

    const existingClaim = sessionStorage.getItem(claimExpKey);
    if (existingClaim) {
      const n = Number(existingClaim);
      if (!Number.isNaN(n)) {
        setClaimExpiresAt(n);
        return;
      }
    }

    const sharedRaw = sessionStorage.getItem(sharedKey);
    if (sharedRaw) {
      const n = Number(sharedRaw);
      if (!Number.isNaN(n)) {
        sessionStorage.setItem(claimExpKey, String(n));
        setClaimExpiresAt(n);
        return;
      }
    }

    const at = Date.now() + effectiveDeal.timerSeconds * 1000;
    sessionStorage.setItem(claimExpKey, String(at));
    sessionStorage.setItem(sharedKey, String(at));
    setClaimExpiresAt(at);
  }, [step, effectiveDeal, templateId]);
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

  const { palette: p } = useGuestTheme();
  const isHorecaTemplate = tpl.id === "horeca";

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
    <MobileShell variant={p.shell}>
      <div
        className={cn(
          "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          p.stepExtra,
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-[200] select-none font-mono text-[8px] tabular-nums leading-none sm:text-[9px]",
            p.pageNum,
          )}
          aria-hidden
          title={`Stap ${gastFlowPageNumber(step)} (tijdelijk)`}
        >
          {gastFlowPageNumber(step)}
        </span>
        {step === "welcome" ? (
          <section
            className={cn(
              "flex h-full min-h-0 min-w-0 flex-1 flex-col justify-between gap-2 overflow-hidden text-center [@media(max-height:640px)]:gap-1.5",
              p.welcome.section,
            )}
          >
            <div className="min-h-0 shrink">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.35em]",
                  p.welcome.brand,
                )}
              >
                {tpl.brandLabel}
              </p>
              <h1
                className={cn(
                  "mt-3 text-[clamp(1.25rem,4.8vw,1.6rem)] font-bold leading-snug tracking-tight [@media(max-height:640px)]:mt-2",
                  p.welcome.title,
                )}
              >
                {tpl.welcome.title}
              </h1>
              <p
                className={cn(
                  "mt-2 text-[clamp(0.8rem,3.2vw,0.875rem)] leading-relaxed [@media(max-height:640px)]:mt-1.5",
                  p.welcome.subtitle,
                )}
              >
                {tpl.welcome.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 [@media(max-height:640px)]:mt-3 [@media(max-height:640px)]:gap-1">
                {tpl.welcome.badges.map((b) => (
                  <Badge
                    key={b.text}
                    tone={b.tone}
                    className={p.welcome.badge ? p.welcome.badge : undefined}
                  >
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
                  p.welcome.cta
                    ? p.welcome.cta
                    : buttonClassName(
                        "primary",
                        cn(
                          "w-full justify-center py-3.5 text-base text-center no-underline [@media(max-height:640px)]:py-3",
                          p.welcome.ctaPrimaryAddon,
                        ),
                      ),
                )}
              >
                {tpl.welcome.cta}
              </Link>
              <p
                className={cn("text-[11px] sm:text-xs", p.welcome.footerHint)}
              >
                {tpl.welcome.footerHint}
              </p>
            </div>
          </section>
        ) : null}

        {step === "unlock" ? (
          <section className="bb-gast-unlock flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden pb-0">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center pt-0">
              <KapperPrizeBox
                opening={spinning}
                revealDealId={revealDealId}
                showcase={tpl.unlockShowcase.map(({ dealId, text }) => ({
                  dealId,
                  text,
                }))}
                variant={p.prizeBox}
                interactiveBox={false}
                idleHint={tpl.unlock.boxIdleHint}
              />
              {spinning ? (
                <p
                  className={cn(
                    "mt-2 text-center text-[clamp(0.78rem,3.2vw,0.95rem)] font-bold tracking-tight",
                    p.unlock.openingHint,
                  )}
                >
                  {tpl.unlock.openingHint}
                </p>
              ) : null}
              {revealDealId && !spinning ? (
                <p
                  className={cn(
                    "mt-1.5 text-center text-[10px] font-medium leading-tight",
                    p.unlock.revealHint,
                  )}
                >
                  Zo meteen volgt je deal op het volgende scherm
                </p>
              ) : null}
            </div>

            <div className="shrink-0 pt-0.5">
              {spinning || revealDealId ? (
                <div
                  className={cn(
                    buttonClassName(
                      "primary",
                      "w-full cursor-default justify-center py-2.5 text-sm font-semibold opacity-90 sm:py-3 sm:text-base",
                    ),
                    p.unlock.spinDisabled,
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
                    p.unlock.spinLink
                      ? p.unlock.spinLink
                      : buttonClassName(
                          "primary",
                          cn(
                            "w-full justify-center py-2.5 text-center text-sm font-semibold no-underline sm:py-3 sm:text-base",
                            p.unlock.spinLinkPrimaryAddon,
                          ),
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
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden [@media(max-height:760px)]:gap-0.5">
            {(() => {
              const pc = getDealPriceCompare(baseDeal);
              const upgraded = buildUpgradedDeal(baseDeal);
              const remainingSec =
                baseDealDeadlineMs != null
                  ? Math.max(
                      0,
                      Math.floor((baseDealDeadlineMs - nowMs) / 1000),
                    )
                  : 0;
              return (
                <>
                  <div
                    className={cn(
                      "shrink-0 overflow-hidden rounded-xl border px-2 py-1.5 text-center sm:rounded-2xl sm:px-3 sm:py-2 [@media(max-height:760px)]:px-2 [@media(max-height:760px)]:py-1",
                      p.baseWon.card,
                    )}
                  >
                    <p
                      className={cn(
                        "text-[clamp(0.85rem,3.5vw,1.05rem)] font-bold [@media(max-height:760px)]:text-[clamp(0.8rem,3.2vw,0.95rem)]",
                        p.baseWon.label,
                      )}
                    >
                      Dit heb je gewonnen
                    </p>
                    <h2
                      className={cn(
                        "mt-1 line-clamp-3 text-[clamp(1rem,4.2vw,1.5rem)] font-bold leading-tight [@media(max-height:760px)]:mt-0.5 [@media(max-height:760px)]:line-clamp-2 [@media(max-height:760px)]:text-[clamp(0.92rem,3.8vw,1.25rem)]",
                        p.baseWon.title,
                      )}
                    >
                      {baseDeal.title}
                    </h2>
                    {isHorecaTemplate ? (
                      <p
                        className={cn(
                          "mt-1 text-[clamp(0.82rem,3.2vw,1rem)] line-through decoration-white/30 [@media(max-height:760px)]:mt-0.5",
                          p.baseWon.normalPrice || "text-white/45",
                        )}
                      >
                        normaal {pc.normal}
                      </p>
                    ) : null}
                    <div
                      className={cn(
                        "mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 [@media(max-height:760px)]:mt-1",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[clamp(0.7rem,2.9vw,0.88rem)] font-medium leading-none [@media(max-height:760px)]:text-[clamp(0.65rem,2.6vw,0.8rem)]",
                          p.baseWon.timerLead,
                        )}
                      >
                        Je deal verloopt over
                      </p>
                      <p
                        className={cn(
                          "font-mono text-[clamp(1.1rem,4.2vw,1.55rem)] font-bold tabular-nums leading-none tracking-tight [@media(max-height:760px)]:text-[clamp(1rem,3.8vw,1.35rem)]",
                          p.baseWon.timerMono,
                        )}
                        aria-live="polite"
                      >
                        {baseDealDeadlineMs != null
                          ? formatMmSs(remainingSec)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div
                      className={cn(
                        "relative isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 p-2.5 sm:rounded-3xl sm:p-3.5 [@media(max-height:760px)]:p-2",
                        p.upgrade.outer,
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl",
                          p.upgrade.ambientA,
                        )}
                        aria-hidden
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl",
                          p.upgrade.ambientB,
                        )}
                        aria-hidden
                      />
                      <div
                        className={cn(
                          "pointer-events-none absolute -right-16 -top-16 z-[1] h-40 w-40 rounded-full blur-3xl",
                          p.upgrade.ambientBlur,
                        )}
                        aria-hidden
                      />
                      {p.upgrade.secondaryBlob ? (
                        <div className={p.upgrade.secondaryBlob} aria-hidden />
                      ) : null}
                      <div
                        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-2xl sm:rounded-3xl"
                        aria-hidden
                      >
                        <div className="bb-upgrade-gloss-ray" />
                        <div className="bb-upgrade-gloss-ray bb-upgrade-gloss-ray--secondary" />
                      </div>
                      <div className="relative z-[3] flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                        <h3
                          className={cn(
                            "shrink-0 px-0.5 text-center text-[clamp(0.82rem,3.4vw,1.1rem)] leading-tight tracking-tight [@media(max-height:760px)]:text-[clamp(0.78rem,3.2vw,0.98rem)]",
                            p.shell === "luxury"
                              ? "font-medium"
                              : "font-extrabold",
                            p.upgrade.headline,
                          )}
                        >
                          <span className="line-clamp-2 break-words">
                            {tpl.baseDeal.upgradeHeadline}
                          </span>
                        </h3>

                        <div className="mt-1 shrink-0 overflow-hidden px-0.5 [@media(max-height:760px)]:mt-0.5">
                          <div className="space-y-1 [@media(max-height:760px)]:space-y-0.5">
                            <div>
                              <p
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-[0.18em] [@media(max-height:760px)]:text-[8px]",
                                  p.upgrade.subMuted,
                                )}
                              >
                                {tpl.baseDeal.upgradeSubStandard}
                              </p>
                              <p
                                className={cn(
                                  "mt-0.5 line-clamp-2 text-[clamp(0.78rem,3.2vw,0.98rem)] font-semibold leading-tight [@media(max-height:760px)]:text-[0.76rem]",
                                  p.upgrade.dealStandard,
                                )}
                              >
                                {baseDeal.title}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "h-px w-full shrink-0 bg-gradient-to-r from-transparent to-transparent",
                                p.upgrade.divider,
                              )}
                            />
                            <div>
                              <p
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-[0.18em] [@media(max-height:760px)]:text-[8px]",
                                  p.upgrade.subAccent,
                                )}
                              >
                                <span aria-hidden>{p.upgrade.upgradeEmoji}</span>{" "}
                                {tpl.baseDeal.upgradeSubUpgraded}
                              </p>
                              <p
                                className={cn(
                                  "mt-0.5 line-clamp-2 text-[clamp(0.82rem,3.4vw,1.05rem)] font-bold leading-tight [@media(max-height:760px)]:text-[clamp(0.78rem,3.2vw,0.98rem)]",
                                  p.upgrade.dealUpgraded,
                                )}
                              >
                                {upgraded.upgradePreviewDelta ?? upgraded.title}
                              </p>
                            </div>
                          </div>
                        </div>

                        <form
                          className={cn(
                            "mt-1.5 flex w-full min-w-0 shrink-0 flex-col gap-1.5 border-t pt-1.5 [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:gap-1 [@media(max-height:760px)]:pt-1",
                            p.upgrade.formBorder,
                          )}
                          onSubmit={handleUpgradeSubmit}
                          autoComplete="on"
                        >
                          <div className="w-full min-w-0 space-y-1.5 [@media(max-height:760px)]:space-y-1">
                            <p
                              className={cn(
                                "text-center text-[clamp(0.88rem,3.5vw,1.05rem)] font-bold leading-tight [@media(max-height:760px)]:text-[clamp(0.82rem,3.2vw,0.98rem)]",
                                p.upgrade.formLead,
                              )}
                            >
                              Ontvang direct je betere deal
                            </p>
                            <div>
                              <label
                                htmlFor="guest-tel"
                                className={cn(
                                  "mb-0.5 block w-full px-2 text-center text-[10px] font-semibold leading-snug sm:px-3 sm:text-[11px]",
                                  p.upgrade.label,
                                )}
                              >
                                {tpl.baseDeal.phoneLabel}
                              </label>
                              <input
                                id="guest-tel"
                                name="tel"
                                type="tel"
                                inputMode="tel"
                                autoComplete="section-contact tel-national"
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
                                  phoneError ? "guest-tel-error" : undefined
                                }
                                className={cn(
                                  "w-full rounded-2xl border px-3 py-2.5 text-[clamp(0.95rem,4vw,1.15rem)] leading-snug shadow-inner outline-none focus:ring-2 [@media(max-height:760px)]:py-2",
                                  p.upgrade.input,
                                )}
                              />
                              {/* Vaste hoogte: geen layout-shift bij fout, geen scroll nodig */}
                              <div className="mt-1 min-h-[2.5rem]">
                                {phoneError ? (
                                  <p
                                    id="guest-tel-error"
                                    className={cn(
                                      "line-clamp-2 text-[12px] font-medium leading-snug [@media(max-height:760px)]:text-[11px]",
                                      p.upgrade.error,
                                    )}
                                    role="alert"
                                  >
                                    {phoneError}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className={cn(
                              "w-full shrink-0 py-3 text-[clamp(0.95rem,3.6vw,1.1rem)] font-extrabold [@media(max-height:760px)]:py-2.5",
                              p.upgrade.submit,
                            )}
                          >
                            {tpl.baseDeal.upgradeSubmit}
                          </Button>
                          <p
                            className={cn(
                              "shrink-0 px-1 text-center text-[9px] leading-tight sm:text-[10px] [@media(max-height:760px)]:leading-snug",
                              p.upgrade.formTiny,
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
                        "mt-1.5 w-full shrink-0 py-1.5 text-[12px] leading-snug [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:py-1 [@media(max-height:760px)]:text-[11px]",
                        p.upgrade.skip,
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
          <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden [@media(max-height:700px)]:gap-1.5">
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-hidden [@media(max-height:640px)]:gap-2 [@media(max-height:560px)]:gap-1.5">
              <h2
                className={cn(
                  "shrink-0 text-center text-[clamp(1.1rem,4.5vw,1.45rem)] font-bold leading-tight [@media(max-height:640px)]:text-[clamp(1rem,4vw,1.25rem)]",
                  p.retention.title,
                )}
              >
                {tpl.retention.title}
              </h2>
              <p
                className={cn(
                  "shrink-0 text-center text-[clamp(0.8rem,3.2vw,0.95rem)] leading-snug [@media(max-height:640px)]:line-clamp-3 [@media(max-height:640px)]:text-[0.8rem]",
                  p.retention.subtitle,
                )}
              >
                {tpl.retention.subtitle}
              </p>

              <div className="min-h-0 w-full shrink">
                <RetentionSocialLinks
                  heading={tpl.retention.socialHeading}
                  links={tpl.retention.socialLinks}
                  salonStyle={p.retentionLightSurface}
                />
              </div>
            </div>

            <Link
              href={tpl.basePath}
              onClick={() => clearGastFlowPersist(templateId)}
              className={buttonClassName(
                "ghost",
                cn(
                  "shrink-0 w-full justify-center py-2 text-center text-sm no-underline [@media(max-height:700px)]:py-1.5",
                  p.retention.ghostLink,
                ),
              )}
            >
              Terug naar start
            </Link>
          </section>
        ) : null}

        <div className="pointer-events-auto absolute right-1 top-9 z-[250] max-w-[min(92vw,220px)] sm:right-2 sm:top-10">
          <GuestThemeSwitcher />
        </div>
      </div>
    </MobileShell>
  );
}
