"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/barboost/StatCard";
import { ChartCard } from "@/components/barboost/ChartCard";
import { ReviewCard } from "@/components/barboost/ReviewCard";
import { Badge } from "@/components/barboost/ui/Badge";
import { Button } from "@/components/barboost/ui/Button";
import { cn } from "@/lib/cn";
import type { Deal, LiveStatusLevel, MockReview, PeriodKey } from "@/data/types";
import type { DashboardMetricsPayload } from "@/lib/dashboard/metrics-types";
import Link from "next/link";
import { AdminShell } from "@/components/barboost/AdminShell";

function LiveStatusPill({ level }: { level: LiveStatusLevel }) {
  const map = {
    busy: {
      label: "Druk",
      cls: "bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.45)]",
      ring: "ring-emerald-400/50",
    },
    medium: {
      label: "Gemiddeld",
      cls: "bg-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.4)]",
      ring: "ring-amber-400/45",
    },
    quiet: {
      label: "Rustig",
      cls: "bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.45)]",
      ring: "ring-red-400/45",
    },
  };
  const m = map[level];
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "relative inline-flex h-3 w-3 rounded-full ring-2",
          m.cls,
          m.ring,
        )}
      />
      <span className="text-sm font-semibold text-white">{m.label}</span>
      <span className="text-xs text-white/40">indicatie</span>
    </div>
  );
}

export type DashboardClientProps = {
  barName: string;
  deals: Deal[];
  reviews: MockReview[];
  metrics: DashboardMetricsPayload;
  referenceDateDefault: string;
};

export function DashboardClient({
  barName,
  deals,
  reviews,
  metrics,
  referenceDateDefault,
}: DashboardClientProps) {
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [boostedId, setBoostedId] = useState<string | null>(null);
  const [focusUpsell, setFocusUpsell] = useState(false);
  const [focusVolume, setFocusVolume] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    kpisByPeriod,
    upgradeFunnel,
    liveTonight,
    missedRevenue,
    monthlyImpact,
    weekendReach,
    charts,
    whatsappCampaignOverview,
    weekendCampaignSummary,
  } = metrics;

  const kpi = kpisByPeriod[period];

  const performanceDeals = useMemo(
    () => deals.filter((d) => d.category !== "retry"),
    [deals],
  );

  const boostedDealTitle = useMemo(() => {
    const d = performanceDeals.find((x) => x.id === boostedId);
    return d?.title ?? null;
  }, [boostedId, performanceDeals]);

  const dealsDisplay = useMemo(() => {
    return performanceDeals.map((d) => {
      const boosted = d.id === boostedId;
      const mult = boosted ? 1.28 : 1;
      const claims = Math.round((d.claims ?? 0) * mult);
      const revenue = Math.round(d.revenueImpactEstimate * mult);
      return { ...d, claims, revenue, boosted };
    });
  }, [performanceDeals, boostedId]);

  const topDealNow = useMemo(() => {
    const d = dealsDisplay.find((x) => x.id === liveTonight.topDealId);
    return d ?? dealsDisplay[0]!;
  }, [dealsDisplay, liveTonight.topDealId]);

  const wa = whatsappCampaignOverview;
  const wk = weekendCampaignSummary;

  return (
    <AdminShell>
      <div className="flex min-h-0 flex-1 flex-col text-white">
      <div className="border-b border-white/10 bg-[#0b0a12]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/85">
              BarBoost
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{barName}</h1>
            <p className="mt-1 text-sm text-white/55">
              Meer omzet uit bestaande gasten — zonder extra personeel.
            </p>
            <Link
              href="/dashboard/beheer"
              className="mt-3 inline-flex text-sm font-medium text-violet-300 hover:underline"
            >
              Dealbeheer →
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              defaultValue={referenceDateDefault}
            />
            <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
              {(
                [
                  ["today", "Vandaag"],
                  ["week", "Deze week"],
                  ["month", "Deze maand"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    period === key
                      ? "bg-white text-black"
                      : "text-white/55 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {toast ? (
          <div className="rounded-2xl border border-violet-500/35 bg-violet-950/35 px-4 py-3 text-sm text-violet-100">
            {toast}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Vanavond Live</h2>
              <p className="mt-1 text-sm text-white/48">
                Indicatoren van vanavond — bijsturen als het druk wordt of juist stil blijft.
              </p>
            </div>
            <LiveStatusPill level={liveTonight.liveStatus} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Live scans (1u)"
              value={String(liveTonight.scansLastHour)}
              hint="QR-scans"
            />
            <StatCard
              label="Actief nu"
              value={String(liveTonight.activeUsersNow)}
              hint="Gasten in flow"
            />
            <StatCard
              label="Claims (30 min)"
              value={String(liveTonight.claimsLast30Min)}
            />
            <StatCard
              label="Topdeal nu"
              value={topDealNow.title}
              hint={`${topDealNow.claims} claims`}
            />
            <StatCard
              label="Conversie vanavond"
              value={`${liveTonight.conversionTonightPercent}%`}
              hint="Scan → claim"
            />
          </div>
          <div className="mt-5 grid gap-2 md:grid-cols-3">
            {liveTonight.alerts.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-start gap-2 rounded-2xl border px-3 py-2 text-xs transition-transform duration-300 hover:scale-[1.01]",
                  a.tone === "hot" &&
                    "border-fuchsia-500/35 bg-fuchsia-500/10 text-fuchsia-100",
                  a.tone === "tip" &&
                    "border-sky-500/30 bg-sky-500/10 text-sky-100",
                  a.tone === "warning" &&
                    "border-amber-500/35 bg-amber-500/10 text-amber-100",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    a.tone === "hot" && "bg-fuchsia-500/20 text-fuchsia-100",
                    a.tone === "tip" && "bg-sky-500/20 text-sky-100",
                    a.tone === "warning" && "bg-amber-500/20 text-amber-100",
                  )}
                >
                  {a.tone === "hot" ? "Signaal" : a.tone === "warning" ? "Let op" : "Tip"}
                </span>
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0c0b14] p-5">
          <h2 className="text-lg font-bold">Sturing vanavond</h2>
          <p className="mt-1 text-sm text-white/48">
            Kies waar je de druk legt: hogere besteding per gast of meer volume aan de bar.
          </p>
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setFocusUpsell((v) => !v);
                  setToast("Focus op upsells (demo)");
                }}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
                  focusUpsell
                    ? "border-violet-400/45 bg-violet-500/12 text-white"
                    : "border-white/15 bg-black/30 text-white/70 hover:text-white",
                )}
              >
                Focus op upsells
              </button>
              <button
                type="button"
                onClick={() => {
                  setFocusVolume((v) => !v);
                  setToast("Focus op volume (demo)");
                }}
                className={cn(
                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition-all",
                  focusVolume
                    ? "border-violet-400/50 bg-violet-500/15 text-white"
                    : "border-white/15 bg-black/30 text-white/70 hover:text-white",
                )}
              >
                Focus op volume
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => setToast("Extra deal geactiveerd voor vanavond (demo)")}
              >
                Activeer extra deal
              </Button>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => setToast("Timers verlengd met 10 min (demo)")}
              >
                Verleng timer deals
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-violet-500/25 bg-gradient-to-r from-violet-950/45 to-[#0c0b14] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold">Deal extra zichtbaar maken</h2>
              <p className="mt-1 text-sm text-white/60">
                Eén deal krijgt voorrang in de gast-flow — handig als je een specifieke actie wilt
                vullen.
              </p>
              {boostedId ? (
                <p className="mt-3 text-sm font-medium text-violet-200">
                  Deze deal staat nu vooraan voor nieuwe scans
                  {boostedDealTitle ? `: ${boostedDealTitle}` : ""}
                </p>
              ) : (
                <p className="mt-3 text-xs text-white/42">
                  Nog geen deal gemarkeerd — activeer om te zien hoe dat in het dashboard
                  doorspeelt (demo).
                </p>
              )}
            </div>
            <Button
              className="shrink-0 px-6"
              onClick={() => {
                setBoostedId(liveTonight.topDealId);
                setToast("Deal gemarkeerd als extra zichtbaar voor nieuwe scans (demo)");
              }}
            >
              Extra zichtbaar voor vanavond
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/45">
            Prestaties ({period === "today" ? "vandaag" : period === "week" ? "week" : "maand"})
          </h2>
          <p className="mb-4 text-sm text-white/38">
            {kpi.claims} claims op {kpi.scans} scans — waarvan {kpi.baseDealsClaimed} basisdeal en{" "}
            {kpi.upgradesActivated} met upgrade. Geschatte extra omzet in deze periode: €
            {kpi.estimatedExtraRevenue.toLocaleString("nl-NL")}.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Scans" value={String(kpi.scans)} />
            <StatCard
              label="Basisdeals geclaimd"
              value={String(kpi.baseDealsClaimed)}
            />
            <StatCard
              label="Upgrades geactiveerd"
              value={String(kpi.upgradesActivated)}
            />
            <StatCard
              label="Geschatte extra omzet"
              value={`€${kpi.estimatedExtraRevenue.toLocaleString("nl-NL")}`}
            />
            <StatCard
              label="Telefoonnummers verzameld"
              value={String(kpi.phonesCollected)}
            />
            <StatCard label="WhatsApp opt-ins" value={String(kpi.whatsappOptIns)} />
            <StatCard
              label="Feedback (privé)"
              value={String(kpi.feedbackSubmissions)}
            />
            <StatCard label="Reviews via flow" value={String(kpi.reviewsViaFlow)} />
            <StatCard
              label="Comeback geactiveerd"
              value={String(kpi.comebackActivations)}
            />
            <StatCard
              label="Conversie scan → claim"
              value={`${kpi.conversionPercent}%`}
            />
            <StatCard label="Nieuwe Google reviews" value={String(kpi.newGoogleReviews)} />
            <StatCard label="Gem. reviewscore" value={String(kpi.avgReviewScore)} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h2 className="text-lg font-semibold text-white">Upgrade conversie</h2>
          <p className="mt-1 text-sm text-white/42">
            Percentages uit deze demodata — in productie te koppelen aan echte funnel-stappen.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Kiest upgrade"
              value={`${upgradeFunnel.pctTakesUpgrade}%`}
              hint="Telefoon of feedback-route"
            />
            <StatCard
              label="Laat nummer achter"
              value={`${upgradeFunnel.pctLeavesPhone}%`}
              hint="Van alle scans"
            />
            <StatCard
              label="Feedback of review"
              value={`${upgradeFunnel.pctUsesFeedbackOrReview}%`}
              hint="Van alle scans"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/15 bg-emerald-950/10 p-5">
          <h2 className="text-lg font-semibold text-white">WhatsApp campagnes</h2>
          <p className="mt-1 text-sm text-white/42">
            WhatsApp bereikt mensen die al in je zaak zijn geweest — geen koude mailing, wel een
            duidelijke reden om terug te komen (demo-cijfers).
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Contacten" value={String(wa.contacts)} />
            <StatCard
              label="Laatste campagne"
              value={wa.lastCampaign}
            />
            <StatCard
              label="Open rate"
              value={`${wa.openRatePercent}%`}
            />
            <StatCard
              label="Claim rate"
              value={`${wa.claimRatePercent}%`}
            />
            <StatCard
              label="Geschatte omzet"
              value={`€${wa.estimatedRevenue.toLocaleString("nl-NL")}`}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-950/15 p-5">
          <h2 className="text-lg font-bold">Weekend bereik & impact</h2>
          <p className="mt-1 text-sm text-white/48">
            Weekend is waar veel zalen pieken: korte berichten op het juiste moment verlagen lege
            tafels (indicatief).
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="WhatsApp contacten"
              value={String(weekendReach.whatsappContacts)}
            />
            <StatCard
              label="Verwacht bereik vrijdag"
              value={String(weekendReach.expectedReachFriday)}
            />
            <StatCard
              label="Verwacht bereik zaterdag"
              value={String(weekendReach.expectedReachSaturday)}
            />
            <StatCard
              label="Geschatte open rate"
              value={`${weekendReach.estimatedOpenRatePercent}%`}
            />
            <StatCard
              label="Geschatte claim rate"
              value={`${weekendReach.estimatedClaimRatePercent}%`}
            />
            <StatCard
              label="Verwachte extra omzet weekend"
              value={weekendReach.expectedExtraRevenueRange}
              hint="Op basis van bereik × conversie (demo)"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold">Impact deze maand</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Extra omzet"
              value={`€${monthlyImpact.extraRevenue.toLocaleString("nl-NL")}`}
            />
            <StatCard
              label="Gem. besteding per gast"
              value={`+€${monthlyImpact.avgSpendPerGuestExtra.toFixed(2).replace(".", ",")}`}
            />
            <StatCard
              label="Herhaalbezoek"
              value={`+${monthlyImpact.repeatVisitPercent}%`}
            />
            <StatCard label="Nieuwe reviews" value={`+${monthlyImpact.newReviews}`} />
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-violet-500/25 bg-black/30 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/60">Abonnement BarBoost</p>
              <p className="text-2xl font-bold">
                €{monthlyImpact.subscriptionPrice}
                <span className="text-base font-normal text-white/45">/maand</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Geschatte ROI</p>
              <p className="text-3xl font-bold text-emerald-300">
                {monthlyImpact.roiMultiplier}x
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-500/35 bg-gradient-to-br from-amber-950/35 to-[#0c0b14] p-5">
          <div className="flex flex-wrap items-start gap-3">
            <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
              Inschatting
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-amber-100">Gemiste omzet</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
                Gebaseerd op vergelijkbare bars laat{" "}
                <span className="font-semibold text-white">{barName}</span>{" "}
                geschat{" "}
                <span className="font-bold text-amber-200">
                  €{missedRevenue.rangeLow.toLocaleString("nl-NL")} – €
                  {missedRevenue.rangeHigh.toLocaleString("nl-NL")}
                </span>{" "}
                per maand liggen zonder BarBoost — vooral in lege uren en
                terugkerende gasten.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Scans per dag" data={charts.scansPerDay} />
          <ChartCard title="Claims per dag" data={charts.claimsPerDay} color="from-emerald-400 to-teal-500" />
          <ChartCard
            title="Geschatte extra omzet per dag"
            data={charts.revenuePerDay}
            color="from-amber-400 to-orange-500"
          />
          <ChartCard
            title="WhatsApp opt-ins per weekend"
            data={charts.whatsappWeekendOptIns}
            color="from-sky-400 to-indigo-500"
          />
          <ChartCard
            title="Reviewgroei"
            data={charts.reviewGrowth}
            color="from-pink-400 to-fuchsia-600"
            className="lg:col-span-2"
          />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Deal performance</h2>
          <div className="space-y-3">
            {dealsDisplay.map((d) => (
              <div
                key={d.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all",
                  d.boosted
                    ? "border-violet-400/40 bg-violet-950/20 ring-1 ring-violet-500/25"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <h3 className="font-semibold text-white">{d.title}</h3>
                      {d.boosted ? (
                        <Badge tone="info" pulse>
                          Extra zichtbaar
                        </Badge>
                      ) : null}
                      {d.insightLabel ? (
                        <Badge tone="info">{d.insightLabel}</Badge>
                      ) : null}
                    </div>
                    {d.boosted ? (
                      <p className="mt-1 text-xs text-violet-200/85">
                        Handmatig gemarkeerd — vaker getoond in de gast-flow
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-white">{d.claims} claims</p>
                    <p className="text-white/50">
                      {d.conversionPercent ?? 0}% conv. · €{d.revenue} geschat
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-bold">Recente reviews</h2>
            {reviews.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <h3 className="text-sm font-semibold text-white/80">
              Nieuwe Google-reviews ({period === "today" ? "vandaag" : period === "week" ? "week" : "maand"})
            </h3>
            <p className="mt-3 text-3xl font-bold text-white">+{kpi.newGoogleReviews}</p>
            <p className="text-xs text-white/42">via flow en directe reviews (demo)</p>
            <p className="mt-4 text-sm text-emerald-300/90">Gemiddelde score: {kpi.avgReviewScore}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0c0b14] p-5">
          <h2 className="text-lg font-bold">Weekendcampagnes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Actieve contacten"
              value={String(wk?.activeContacts ?? wa.contacts)}
            />
            <StatCard
              label="Laatste campagne"
              value={wk?.lastCampaign ?? wa.lastCampaign}
            />
            <StatCard
              label="Open rate"
              value={wk?.openRateLabel ?? `${wa.openRatePercent}%`}
            />
            <StatCard
              label="Claim rate"
              value={wk?.claimRateLabel ?? `${wa.claimRatePercent}%`}
            />
          </div>
          <p className="mt-4 text-sm text-white/50">
            Komende preview: zaterdag groepsdeal —{" "}
            <Link className="font-medium text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200" href="/campagnes">
              Campagnes openen
            </Link>
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/28 to-transparent p-5">
          <h2 className="text-lg font-bold">Waarom dit werkt</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
              <span className="font-semibold text-white">Hogere besteding</span>{" "}
              door deals die passen bij drukte en beschikbaarheid aan de bar.
            </li>
            <li className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
              <span className="font-semibold text-white">Terugkerende gasten</span>{" "}
              via comeback-stappen en gerichte WhatsApp op het weekend.
            </li>
            <li className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
              <span className="font-semibold text-white">Sterkere Google-profiel</span>{" "}
              wanneer tevreden gasten op het juiste moment worden gevraagd om een review.
            </li>
            <li className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
              <span className="font-semibold text-white">Minder lege uren</span>{" "}
              door korte campagnes naar mensen die je zaak al kennen — geen koude leads.
            </li>
          </ul>
        </section>

      </main>
      </div>
    </AdminShell>
  );
}
