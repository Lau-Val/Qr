"use client";

import { useState } from "react";
import { BAR_NAME } from "@/data/bar";
import type { VenueType } from "@/lib/dashboard/payload-types";
import { AdminShell } from "@/components/barboost/AdminShell";
import { Button } from "@/components/barboost/ui/Button";
import { Badge } from "@/components/barboost/ui/Badge";
import Link from "next/link";
import { cn } from "@/lib/cn";

type DealType =
  | "Bier deal"
  | "Shot deal"
  | "Cocktail deal"
  | "Snack + drankje"
  | "Groepsdeal"
  | "Comeback deal";

interface DealRow {
  id: string;
  type: DealType;
  naam: string;
  omschrijving: string;
  prijs: string;
  tijdslimiet: string;
  label: string;
  actief: boolean;
}

const INITIAL: DealRow[] = [
  {
    id: "1",
    type: "Bier deal",
    naam: "2 bier voor €6",
    omschrijving: "Minimaal 1 ronde",
    prijs: "€6",
    tijdslimiet: "Tot sluiting",
    label: "Populair",
    actief: true,
  },
  {
    id: "2",
    type: "Shot deal",
    naam: "3 shots voor €10",
    omschrijving: "Groepsprijs",
    prijs: "€10",
    tijdslimiet: "22:30",
    label: "Groepsdeal",
    actief: true,
  },
  {
    id: "3",
    type: "Cocktail deal",
    naam: "2 cocktails voor €10",
    omschrijving: "Selectie van de kaart",
    prijs: "€10",
    tijdslimiet: "23:00",
    label: "Alleen vanavond",
    actief: true,
  },
  {
    id: "4",
    type: "Comeback deal",
    naam: "Gratis shot eerste ronde",
    omschrijving: "Binnen 5 dagen terug",
    prijs: "Gratis",
    tijdslimiet: "5 dagen",
    label: "Comeback",
    actief: true,
  },
];

const TYPES: DealType[] = [
  "Bier deal",
  "Shot deal",
  "Cocktail deal",
  "Snack + drankje",
  "Groepsdeal",
  "Comeback deal",
];

export function DealBeheerClient({ venueType }: { venueType: VenueType }) {
  const [rows, setRows] = useState<DealRow[]>(INITIAL);
  const [saved, setSaved] = useState(false);
  const salon = venueType === "kapper";

  const update = (id: string, patch: Partial<DealRow>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setSaved(false);
  };

  return (
    <AdminShell venueType={venueType}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          salon ? "text-stone-900" : "text-white",
        )}
      >
        <header
          className={cn(
            "border-b px-4 py-6",
            salon
              ? "border-stone-200 bg-white/95"
              : "border-white/10 bg-[#0b0a12]/90",
          )}
        >
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.25em]",
              salon ? "text-rose-800/80" : "text-violet-300/80",
            )}
          >
            BarBoost · Beheer
          </p>
          <h1 className="mt-2 text-2xl font-bold">Deals voor {BAR_NAME}</h1>
          <p
            className={cn("mt-1 text-sm", salon ? "text-stone-600" : "text-white/50")}
          >
            Kies vooraf ingestelde dealtypes — geen rommelige vrije invoer. Alles is
            demo-state op dit apparaat.
          </p>
          <Link
            href="/dashboard"
            className={cn(
              "mt-4 inline-block text-sm",
              salon ? "text-rose-800 hover:underline" : "text-violet-300 hover:underline",
            )}
          >
            ← Terug naar dashboard
          </Link>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
          {saved ? (
            <p
              className={cn(
                "rounded-xl border px-4 py-3 text-sm",
                salon
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
              )}
            >
              Opgeslagen (demo) — instellingen zijn lokaal.
            </p>
          ) : null}

          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "rounded-2xl border p-4",
                  salon
                    ? "border-stone-200 bg-white shadow-sm"
                    : "border-white/[0.07] bg-white/[0.02]",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone={row.actief ? "success" : "neutral"}>
                    {row.actief ? "Actief" : "Uit"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => update(row.id, { actief: !row.actief })}
                    className={cn(
                      "text-xs font-medium",
                      salon
                        ? "text-stone-500 hover:text-stone-900"
                        : "text-white/50 hover:text-white",
                    )}
                  >
                    {row.actief ? "Deactiveren" : "Activeren"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label
                    className={cn(
                      "block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Type
                    <select
                      value={row.type}
                      onChange={(e) =>
                        update(row.id, { type: e.target.value as DealType })
                      }
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label
                    className={cn(
                      "block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Dealnaam
                    <input
                      value={row.naam}
                      onChange={(e) => update(row.id, { naam: e.target.value })}
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    />
                  </label>
                  <label
                    className={cn(
                      "sm:col-span-2 block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Korte omschrijving
                    <input
                      value={row.omschrijving}
                      onChange={(e) =>
                        update(row.id, { omschrijving: e.target.value })
                      }
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    />
                  </label>
                  <label
                    className={cn(
                      "block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Prijs / voordeel
                    <input
                      value={row.prijs}
                      onChange={(e) => update(row.id, { prijs: e.target.value })}
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    />
                  </label>
                  <label
                    className={cn(
                      "block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Tijdslimiet
                    <input
                      value={row.tijdslimiet}
                      onChange={(e) =>
                        update(row.id, { tijdslimiet: e.target.value })
                      }
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    />
                  </label>
                  <label
                    className={cn(
                      "sm:col-span-2 block text-xs",
                      salon ? "text-stone-600" : "text-white/45",
                    )}
                  >
                    Label (zoals op voucher)
                    <input
                      value={row.label}
                      onChange={(e) => update(row.id, { label: e.target.value })}
                      className={cn(
                        "mt-1 w-full rounded-lg border px-2 py-2 text-sm",
                        salon
                          ? "border-stone-300 bg-white text-stone-900"
                          : "border-white/10 bg-black/40",
                      )}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setSaved(true)}
            className="w-full sm:w-auto"
          >
            Instellingen opslaan (demo)
          </Button>
        </main>
      </div>
    </AdminShell>
  );
}
