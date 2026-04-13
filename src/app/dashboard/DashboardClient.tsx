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
  light,
}: {
  label: string;
  value: string | number;
  hint?: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-5 sm:px-5 sm:py-6",
        light
          ? "border border-stone-200 bg-white shadow-sm"
          : "border border-white/[0.1] bg-white/[0.04]",
      )}
    >
      <p
        className={cn(
          "text-[13px] font-medium leading-snug",
          light ? "text-stone-500" : "text-white/55",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl",
          light ? "text-stone-900" : "text-white",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-xs leading-relaxed",
            light ? "text-stone-500" : "text-white/38",
          )}
        >
          {hint}
        </p>
      ) : null}
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
          <p className="mt-6 text-xs leading-relaxed text-white/38">
            <strong className="font-medium text-white/55">Vercel:</strong> Settings → Environment
            Variables → voeg dezelfde keys toe als lokaal, dan Redeploy.{" "}
            <strong className="font-medium text-white/55">Lokaal:</strong>{" "}
            <code className="rounded bg-white/10 px-1 py-0.5">.env.local</code>. Daarnaast:
            migraties + <code className="rounded bg-white/10 px-1 py-0.5">seed.sql</code> in het
            Supabase SQL-scherm.
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
  const salon = data.venueType === "kapper";

  const conversionLabel = useMemo(() => {
    if (stats.scans <= 0) return "—";
    const pct = Math.round((stats.claims / stats.scans) * 100);
    return `${pct}%`;
  }, [stats.scans, stats.claims]);

  return (
    <AdminShell venueType={data.venueType}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          salon ? "text-stone-900" : "text-white",
        )}
      >
        <header
          className={cn(
            "border-b backdrop-blur-xl",
            salon
              ? "border-stone-200 bg-white/95"
              : "border-white/10 bg-[#0b0a12]/90",
          )}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
            <div>
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.2em]",
                  salon ? "text-rose-800/85" : "text-emerald-300/85",
                )}
              >
                Jouw cijfers
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{data.barName}</h1>
              <p
                className={cn(
                  "mt-2 max-w-xl text-base leading-relaxed",
                  salon ? "text-stone-600" : "text-white/55",
                )}
              >
                {salon
                  ? "Hoe vaak gasten je QR openen, hoeveel deals bij jullie worden gebruikt, en hoeveel mensen hun telefoon geven voor een betere deal. Zonder ingewikkelde termen."
                  : "Hoe vaak gasten je QR openen, hoeveel deals aan de bar worden gebruikt, en hoeveel mensen hun telefoon geven voor een betere deal. Zonder ingewikkelde termen."}
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
                    salon
                      ? period === key
                        ? "bg-stone-900 text-white"
                        : "bg-stone-200/80 text-stone-600 hover:bg-stone-300/90 hover:text-stone-900"
                      : period === key
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
                light={salon}
              />
              <BigNumber
                label={salon ? "Deal gebruikt bij jullie" : "Deal gebruikt aan de bar"}
                value={stats.claims}
                hint={
                  salon
                    ? "Gast toont de deal en jullie verzilveren die."
                    : "Gast toont de deal en jullie verzilveren die."
                }
                light={salon}
              />
              <BigNumber
                label="Met telefoon voor betere deal"
                value={stats.upgrades}
                hint="Upgrade-stap of deal met upgrade — telt mee als iemand die stap zet."
                light={salon}
              />
              <BigNumber
                label="Van scan naar deal"
                value={conversionLabel}
                hint="Hoeveel scans eindigen met een gebruikte deal."
                light={salon}
              />
            </div>
          </section>

          <section
            className={cn(
              "rounded-2xl border p-5",
              salon
                ? "border-stone-200 bg-white shadow-sm"
                : "border-white/[0.08] bg-[#0c0b14]",
            )}
          >
            <h3
              className={cn(
                "text-sm font-semibold",
                salon ? "text-stone-800" : "text-white/80",
              )}
            >
              Ook geteld
            </h3>
            <ul
              className={cn(
                "mt-4 space-y-3 text-sm",
                salon ? "text-stone-600" : "text-white/65",
              )}
            >
              <li
                className={cn(
                  "flex justify-between gap-4 border-b pb-3",
                  salon ? "border-stone-200" : "border-white/[0.06]",
                )}
              >
                <span>Terugkomen (comeback)</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    salon ? "text-stone-900" : "text-white",
                  )}
                >
                  {stats.comebacks}
                </span>
              </li>
              <li
                className={cn(
                  "flex justify-between gap-4 border-b pb-3",
                  salon ? "border-stone-200" : "border-white/[0.06]",
                )}
              >
                <span>Toestemming voor WhatsApp</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    salon ? "text-stone-900" : "text-white",
                  )}
                >
                  {stats.whatsappOptIns}
                </span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Geschatte dealwaarde (claims)</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    salon ? "text-emerald-800" : "text-emerald-200/95",
                  )}
                >
                  €{stats.estimatedDealValue.toLocaleString("nl-NL")}
                </span>
              </li>
            </ul>
            <p
              className={cn(
                "mt-4 text-xs leading-relaxed",
                salon ? "text-stone-500" : "text-white/35",
              )}
            >
              De dealwaarde is een indicatie op basis van jullie ingestelde schattingen per deal —
              geen belofte van omzet.
            </p>
          </section>

          <section>
            <h3 className={cn("text-lg font-bold", salon ? "text-stone-900" : "text-white")}>
              QR-codes (deze maand)
            </h3>
            <p
              className={cn("mt-1 text-sm", salon ? "text-stone-600" : "text-white/45")}
            >
              Elk bordje of tafel kan een eigen code hebben — zo zie je waar het druk wordt.
            </p>
            {data.qrRows.length === 0 ? (
              <p className={cn("mt-4 text-sm", salon ? "text-stone-500" : "text-white/40")}>
                Nog geen QR-codes voor deze zaak.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.qrRows.map((row) => (
                  <li
                    key={row.slug}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm",
                      salon
                        ? "border-stone-200 bg-white shadow-sm"
                        : "border-white/[0.07] bg-white/[0.03]",
                    )}
                  >
                    <span
                      className={cn("font-medium", salon ? "text-stone-900" : "text-white")}
                    >
                      {row.label ?? row.slug}
                      <span
                        className={cn("ml-2", salon ? "text-stone-500" : "text-white/35")}
                      >
                        ({row.slug})
                      </span>
                    </span>
                    <span className={salon ? "text-stone-600" : "text-white/55"}>
                      <span
                        className={cn(
                          "tabular-nums",
                          salon ? "text-stone-900" : "text-white",
                        )}
                      >
                        {row.scans}
                      </span>{" "}
                      scans ·{" "}
                      <span
                        className={cn(
                          "tabular-nums",
                          salon ? "text-stone-900" : "text-white",
                        )}
                      >
                        {row.claims}
                      </span>{" "}
                      deals
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className={cn("text-lg font-bold", salon ? "text-stone-900" : "text-white")}>
              Welke deals doen het (deze maand)
            </h3>
            <p
              className={cn("mt-1 text-sm", salon ? "text-stone-600" : "text-white/45")}
            >
              Hoe vaak een deal is geclaimd.
            </p>
            {data.dealRows.length === 0 ? (
              <p className={cn("mt-4 text-sm", salon ? "text-stone-500" : "text-white/40")}>
                Nog geen claims deze maand.
              </p>
            ) : (
              <ol className="mt-4 space-y-2">
                {data.dealRows.map((d, i) => (
                  <li
                    key={d.externalKey}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
                      salon
                        ? "border-stone-200 bg-white shadow-sm"
                        : "border-white/[0.07] bg-white/[0.03]",
                    )}
                  >
                    <span className="min-w-0 flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          salon
                            ? "bg-stone-200 text-stone-700"
                            : "bg-white/[0.08] text-white/80",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={cn(
                          "truncate font-medium",
                          salon ? "text-stone-900" : "text-white",
                        )}
                      >
                        {d.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums font-semibold",
                        salon ? "text-emerald-800" : "text-emerald-200/90",
                      )}
                    >
                      {d.claims}×
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {data.reviews.length > 0 ? (
            <section>
              <h3 className={cn("text-lg font-bold", salon ? "text-stone-900" : "text-white")}>
                Recente reacties
              </h3>
              <ul className="mt-4 space-y-3">
                {data.reviews.map((r, idx) => (
                  <li
                    key={`${r.author}-${idx}`}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm",
                      salon
                        ? "border-stone-200 bg-white text-stone-700 shadow-sm"
                        : "border-white/[0.07] bg-white/[0.03] text-white/75",
                    )}
                  >
                    <p
                      className={cn(
                        "font-medium",
                        salon ? "text-stone-900" : "text-white",
                      )}
                    >
                      {r.author}
                    </p>
                    <p className="mt-1 leading-relaxed">{r.text}</p>
                    <p
                      className={cn(
                        "mt-2 text-xs",
                        salon ? "text-stone-500" : "text-white/35",
                      )}
                    >
                      {r.rating}★ · {r.reviewDate}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div
            className={cn(
              "flex flex-col gap-3 border-t pt-8 sm:flex-row sm:justify-between",
              salon ? "border-stone-200" : "border-white/10",
            )}
          >
            <Link
              href="/dashboard/beheer"
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold ring-1",
                salon
                  ? "bg-rose-50 text-rose-900 ring-rose-200 hover:bg-rose-100"
                  : "bg-violet-500/20 text-violet-100 ring-violet-400/30 hover:bg-violet-500/30",
              )}
            >
              Deals aanpassen
            </Link>
            <Link
              href="/campagnes"
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold",
                salon
                  ? "border border-stone-300 bg-white text-stone-800 shadow-sm hover:bg-stone-50"
                  : "bg-white/[0.06] text-white/85 hover:bg-white/10",
              )}
            >
              WhatsApp-berichten
            </Link>
          </div>
        </main>
      </div>
    </AdminShell>
  );
}
