"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  DashboardData,
  DashboardPayload,
  PeriodKey,
} from "@/lib/dashboard/payload-types";
import { AdminShell } from "@/components/barboost/AdminShell";
import { cn } from "@/lib/cn";

const PERIOD_LABEL: Record<PeriodKey, string> = {
  today: "Vandaag",
  week: "Deze week",
  month: "Deze maand",
};

function BigNumber({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-5 sm:px-5 sm:py-6">
      <p className="text-[13px] font-medium leading-snug text-white/55">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-white/38">{hint}</p> : null}
    </div>
  );
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<PeriodKey>("today");

  if (!data.configured) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center text-white">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">{data.message}</p>
          <p className="mt-6 text-xs text-white/38">
            Zet <code className="rounded bg-white/10 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            en <code className="rounded bg-white/10 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            in <code className="rounded bg-white/10 px-1.5 py-0.5">.env.local</code> en voer de
            Supabase-migraties + <code className="rounded bg-white/10 px-1.5 py-0.5">seed.sql</code>{" "}
            uit.
          </p>
        </div>
      </AdminShell>
    );
  }

  return <DashboardReady data={data} period={period} setPeriod={setPeriod} />;
}

function DashboardReady({
  data,
  period,
  setPeriod,
}: {
  data: DashboardPayload;
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
}) {
  const stats = data.periods[period];

  const conversionLabel = useMemo(() => {
    if (stats.scans <= 0) return "—";
    const pct = Math.round((stats.claims / stats.scans) * 100);
    return `${pct}%`;
  }, [stats.scans, stats.claims]);

  return (
    <AdminShell>
      <div className="flex min-h-0 flex-1 flex-col text-white">
        <header className="border-b border-white/10 bg-[#0b0a12]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/85">
                Jouw cijfers
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{data.barName}</h1>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-white/55">
                Hoe vaak gasten je QR openen, hoeveel deals aan de bar worden gebruikt, en hoeveel
                mensen hun telefoon geven voor een betere deal. Zonder ingewikkelde termen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(PERIOD_LABEL) as PeriodKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    period === key
                      ? "bg-white text-black"
                      : "bg-white/[0.06] text-white/65 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {PERIOD_LABEL[key]}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 py-10">
          <section aria-labelledby="main-stats">
            <h2 id="main-stats" className="sr-only">
              Belangrijkste cijfers
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <BigNumber
                label="QR gescand"
                value={stats.scans}
                hint="Iemand opent de link vanaf jullie QR."
              />
              <BigNumber
                label="Deal gebruikt aan de bar"
                value={stats.claims}
                hint="Gast toont de deal en jullie verzilveren die."
              />
              <BigNumber
                label="Met telefoon voor betere deal"
                value={stats.upgrades}
                hint="Upgrade-stap of deal met upgrade — telt mee als iemand die stap zet."
              />
              <BigNumber
                label="Van scan naar deal"
                value={conversionLabel}
                hint="Hoeveel scans eindigen met een gebruikte deal."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#0c0b14] p-5">
            <h3 className="text-sm font-semibold text-white/80">Ook geteld</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
                <span>Terugkomen (comeback)</span>
                <span className="font-semibold tabular-nums text-white">{stats.comebacks}</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-white/[0.06] pb-3">
                <span>Toestemming voor WhatsApp</span>
                <span className="font-semibold tabular-nums text-white">
                  {stats.whatsappOptIns}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Geschatte dealwaarde (claims)</span>
                <span className="font-semibold tabular-nums text-emerald-200/95">
                  €{stats.estimatedDealValue.toLocaleString("nl-NL")}
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-white/35">
              De dealwaarde is een indicatie op basis van jullie ingestelde schattingen per deal —
              geen belofte van omzet.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white">QR-codes (deze maand)</h3>
            <p className="mt-1 text-sm text-white/45">
              Elk bordje of tafel kan een eigen code hebben — zo zie je waar het druk wordt.
            </p>
            {data.qrRows.length === 0 ? (
              <p className="mt-4 text-sm text-white/40">Nog geen QR-codes voor deze bar.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.qrRows.map((row) => (
                  <li
                    key={row.slug}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-white">
                      {row.label ?? row.slug}
                      <span className="ml-2 text-white/35">({row.slug})</span>
                    </span>
                    <span className="text-white/55">
                      <span className="tabular-nums text-white">{row.scans}</span> scans ·{" "}
                      <span className="tabular-nums text-white">{row.claims}</span> deals
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-lg font-bold text-white">Welke deals doen het (deze maand)</h3>
            <p className="mt-1 text-sm text-white/45">Hoe vaak een deal is geclaimd.</p>
            {data.dealRows.length === 0 ? (
              <p className="mt-4 text-sm text-white/40">Nog geen claims deze maand.</p>
            ) : (
              <ol className="mt-4 space-y-2">
                {data.dealRows.map((d, i) => (
                  <li
                    key={d.externalKey}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm"
                  >
                    <span className="min-w-0 flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-bold text-white/80">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium text-white">{d.title}</span>
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold text-emerald-200/90">
                      {d.claims}×
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {data.reviews.length > 0 ? (
            <section>
              <h3 className="text-lg font-bold text-white">Recente reacties</h3>
              <ul className="mt-4 space-y-3">
                {data.reviews.map((r, idx) => (
                  <li
                    key={`${r.author}-${idx}`}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                  >
                    <p className="font-medium text-white">{r.author}</p>
                    <p className="mt-1 leading-relaxed">{r.text}</p>
                    <p className="mt-2 text-xs text-white/35">
                      {r.rating}★ · {r.reviewDate}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
            <Link
              href="/dashboard/beheer"
              className="inline-flex items-center justify-center rounded-xl bg-violet-500/20 px-5 py-3 text-sm font-semibold text-violet-100 ring-1 ring-violet-400/30 hover:bg-violet-500/30"
            >
              Deals aanpassen
            </Link>
            <Link
              href="/campagnes"
              className="inline-flex items-center justify-center rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              WhatsApp-berichten
            </Link>
          </div>
        </main>
      </div>
    </AdminShell>
  );
}
