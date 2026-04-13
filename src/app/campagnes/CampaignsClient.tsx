"use client";

import { useMemo, useState } from "react";
import { BAR_NAME } from "@/data/bar";
import { CampaignCard } from "@/components/barboost/CampaignCard";
import { WhatsAppPreview } from "@/components/barboost/WhatsAppPreview";
import { Button } from "@/components/barboost/ui/Button";
import { Badge } from "@/components/barboost/ui/Badge";
import {
  campaignOverview,
  campaignResultsHistory,
  renderSlotMessage,
  slotTemplates,
} from "@/data/mock/campaigns";
import type { VenueType } from "@/lib/dashboard/payload-types";
import { AdminShell } from "@/components/barboost/AdminShell";
import { cn } from "@/lib/cn";

const DEAL_PRESETS: Record<string, string> = {
  "50": "50% op je eerste ronde",
  shot: "gratis shot bij je eerste bestelling",
  cocktails: "2 cocktails voor €10",
  groep: "groepsdeal aan de bar (4+ personen)",
  eigen: "jouw eigen actie — invullen hieronder",
};

export function CampaignsClient({ venueType }: { venueType: VenueType }) {
  const salon = venueType === "kapper";
  const [name, setName] = useState("Weekend push");
  const [day, setDay] = useState<"vrijdag" | "zaterdag" | "beide">("vrijdag");
  const [audience, setAudience] = useState<
    "alle" | "recent" | "comeback" | "claimers"
  >("alle");
  const [dealType, setDealType] = useState<
    "50" | "shot" | "cocktails" | "groep" | "eigen"
  >("cocktails");
  const [dealText, setDealText] = useState(DEAL_PRESETS.cocktails);
  const [tijd, setTijd] = useState("22:30");
  const [extra, setExtra] = useState("Alleen bij tonen van dit bericht.");
  const [patternId, setPatternId] = useState<string>("slot1");
  const [saved, setSaved] = useState(false);

  const pattern = slotTemplates.find((s) => s.id === patternId)?.pattern ?? slotTemplates[0].pattern;

  const previewBody = useMemo(
    () =>
      renderSlotMessage(pattern, {
        deal: dealText,
        tijd,
        extra: extra ? ` ${extra}` : "",
        bar: BAR_NAME,
      }),
    [pattern, dealText, tijd, extra],
  );

  const inField = salon
    ? "mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900"
    : "mt-1 w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 text-sm";

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
            "border-b backdrop-blur-xl",
            salon
              ? "border-stone-200 bg-white/95"
              : "border-white/10 bg-[#0b0a12]/90",
          )}
        >
          <div className="mx-auto max-w-6xl px-4 py-6">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.25em]",
                salon ? "text-rose-800/85" : "text-violet-300/80",
              )}
            >
              BarBoost · Campagnes
            </p>
            <h1 className="mt-2 text-2xl font-bold">WhatsApp — {BAR_NAME}</h1>
            <p
              className={cn(
                "mt-1 max-w-2xl text-sm leading-relaxed",
                salon ? "text-stone-600" : "text-white/48",
              )}
            >
              Geen koude mailinglijst: alleen mensen die in je zaak zijn geweest en toestemming
              hebben gegeven. Jij kiest dag, tijd en deal — het bericht blijft kort en herkenbaar.
              Templates met vaste opbouw, geen onbeheerde vrije tekst (demo).
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
          <section>
            <h2
              className={cn(
                "text-lg font-semibold",
                salon ? "text-stone-900" : "text-white",
              )}
            >
              Campagne-overzicht
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {campaignOverview.map((c) => (
                <CampaignCard key={c.id} c={c} />
              ))}
            </div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2
                className={cn(
                  "text-lg font-semibold",
                  salon ? "text-stone-900" : "text-white",
                )}
              >
                Nieuwe campagne
              </h2>
              <p
                className={cn("mt-1 text-sm", salon ? "text-stone-600" : "text-white/42")}
              >
                Vul dag, deal en tijd in — de template zet het om naar een bericht dat past bij
                WhatsApp (demo).
              </p>
              {saved ? (
                <p
                  className={cn(
                    "mt-3 rounded-xl border px-3 py-2 text-sm",
                    salon
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
                  )}
                >
                  Campagne opgeslagen (demo).
                </p>
              ) : null}

              <label
                className={cn(
                  "mt-6 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Campagnenaam
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inField}
              />

              <p
                className={cn("mt-5 text-xs", salon ? "text-stone-600" : "text-white/45")}
              >
                Dag
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["vrijdag", "Vrijdag"],
                    ["zaterdag", "Zaterdag"],
                    ["beide", "Beide"],
                  ] as const
                ).map(([k, lab]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setDay(k)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold",
                      day === k
                        ? salon
                          ? "bg-stone-900 text-white"
                          : "bg-white text-black"
                        : salon
                          ? "border border-stone-300 bg-white text-stone-700"
                          : "border border-white/15 text-white/70",
                    )}
                  >
                    {lab}
                  </button>
                ))}
              </div>

              <label
                className={cn(
                  "mt-5 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Doelgroep
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className={inField}
              >
                <option value="alle">Alle contacten met nummer</option>
                <option value="recent">Recente bezoekers</option>
                <option value="comeback">Comeback-deals geactiveerd</option>
                <option value="claimers">Eerder geclaimd aan de bar</option>
              </select>

              <label
                className={cn(
                  "mt-5 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Type deal (startpunt)
              </label>
              <select
                value={dealType}
                onChange={(e) => {
                  const v = e.target.value as typeof dealType;
                  setDealType(v);
                  setDealText(DEAL_PRESETS[v] ?? dealText);
                }}
                className={inField}
              >
                <option value="50">50% op eerste ronde</option>
                <option value="shot">Gratis shot</option>
                <option value="cocktails">2 cocktails voor €10</option>
                <option value="groep">Groepsdeal</option>
                <option value="eigen">Eigen deal</option>
              </select>

              <label
                className={cn(
                  "mt-5 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Deal (in bericht)
              </label>
              <input
                value={dealText}
                onChange={(e) => setDealText(e.target.value)}
                className={inField}
              />

              <label
                className={cn(
                  "mt-5 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Eindtijd
              </label>
              <input
                value={tijd}
                onChange={(e) => setTijd(e.target.value)}
                placeholder="22:30"
                className={inField}
              />

              <label
                className={cn(
                  "mt-5 block text-xs",
                  salon ? "text-stone-600" : "text-white/45",
                )}
              >
                Korte extra zin (optioneel)
              </label>
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                className={inField}
              />

              <p
                className={cn(
                  "mt-6 text-xs font-medium",
                  salon ? "text-stone-700" : "text-white/55",
                )}
              >
                Kies template
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {slotTemplates.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPatternId(s.id)}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium",
                      patternId === s.id
                        ? salon
                          ? "border-rose-300 bg-rose-50 text-rose-950"
                          : "border-violet-500/40 bg-violet-500/15 text-white"
                        : salon
                          ? "border-stone-300 text-stone-700 hover:border-stone-400"
                          : "border-white/10 text-white/65 hover:border-white/20",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <Button className="mt-8" onClick={() => setSaved(true)}>
                Campagne opslaan (demo)
              </Button>
            </div>

            <div>
              <h2
                className={cn(
                  "text-lg font-semibold",
                  salon ? "text-stone-900" : "text-white",
                )}
              >
                Live preview
              </h2>
              <p
                className={cn("mt-1 text-sm", salon ? "text-stone-600" : "text-white/42")}
              >
                Zo oogt het ongeveer op de telefoon — herkenbaar, zonder spamgevoel.
              </p>
              <div className="mt-4">
                <WhatsAppPreview message={previewBody} time="17:02" />
              </div>
              <p
                className={cn("mt-4 text-xs", salon ? "text-stone-500" : "text-white/35")}
              >
                Verwachte CTA {salon ? "bij jullie" : "aan de bar"}:{" "}
                <Badge tone="success">
                  {salon ? "Laat zien bij de balie" : "Laat zien aan de bar"}
                </Badge>
              </p>
            </div>
          </section>

          <section>
            <h2
              className={cn(
                "text-lg font-semibold",
                salon ? "text-stone-900" : "text-white",
              )}
            >
              Resultaten eerdere campagnes
            </h2>
            <div
              className={cn(
                "mt-4 overflow-x-auto rounded-2xl border",
                salon
                  ? "border-stone-200 bg-white shadow-sm"
                  : "border-white/[0.07]",
              )}
            >
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead
                  className={cn(
                    "border-b text-xs uppercase tracking-wide",
                    salon
                      ? "border-stone-200 bg-stone-100 text-stone-600"
                      : "border-white/10 bg-black/40 text-white/45",
                  )}
                >
                  <tr>
                    <th className="px-4 py-3">Campagne</th>
                    <th className="px-4 py-3">Verzonden</th>
                    <th className="px-4 py-3">Geopend</th>
                    <th className="px-4 py-3">Geklikt</th>
                    <th className="px-4 py-3">Geclaimd</th>
                    <th className="px-4 py-3">Geschatte omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignResultsHistory.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b",
                        salon
                          ? "border-stone-100 hover:bg-stone-50"
                          : "border-white/5 hover:bg-white/[0.02]",
                      )}
                    >
                      <td
                        className={cn(
                          "px-4 py-3 font-medium",
                          salon ? "text-stone-900" : "text-white",
                        )}
                      >
                        {row.name}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular-nums",
                          salon ? "text-stone-700" : "text-white/75",
                        )}
                      >
                        {row.sent}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular-nums",
                          salon ? "text-stone-700" : "text-white/75",
                        )}
                      >
                        {row.opened}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular-nums",
                          salon ? "text-stone-700" : "text-white/75",
                        )}
                      >
                        {row.clicked}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 tabular-nums",
                          salon ? "text-emerald-800" : "text-emerald-300",
                        )}
                      >
                        {row.claimed}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 font-semibold",
                          salon ? "text-stone-900" : "text-white",
                        )}
                      >
                        €{row.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p
            className={cn(
              "pb-8 text-center text-xs",
              salon ? "text-stone-500" : "text-white/30",
            )}
          >
            Prototype — geen echte WhatsApp-integratie.
          </p>
        </main>
      </div>
    </AdminShell>
  );
}
