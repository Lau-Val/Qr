import type { PeriodStats } from "@/lib/dashboard/payload-types";
import type { PlatformOverview, PlatformAdminListRow } from "@/lib/supabase/platform-overview";

function fmtEuro(n: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function TotalStrip({ label, s }: { label: string; s: PeriodStats }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/80">
        {label}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-white/45">Scans</dt>
          <dd className="font-semibold tabular-nums text-white">{s.scans}</dd>
        </div>
        <div>
          <dt className="text-white/45">Claims</dt>
          <dd className="font-semibold tabular-nums text-white">{s.claims}</dd>
        </div>
        <div>
          <dt className="text-white/45">Upgrades + terugkomers</dt>
          <dd className="font-semibold tabular-nums text-white">
            {s.upgrades + s.comebacks}
          </dd>
        </div>
        <div>
          <dt className="text-white/45">Geschatte dealwaarde</dt>
          <dd className="font-semibold tabular-nums text-emerald-200/95">
            {fmtEuro(s.estimatedDealValue)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function AdminStatsSection({
  overview,
  admins,
}: {
  overview: PlatformOverview;
  admins: PlatformAdminListRow[];
}) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="all-stats">
        <h2 id="all-stats" className="text-lg font-semibold text-white">
          Statistieken (alle klanten / zaken)
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Zelfde periodes als op het zaken-dashboard: week en maand (Amsterdam-tijd). Zo zie je in één oogopslag
          hoe alle zaken performen.
        </p>

        {overview.ok === false ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {overview.message}
          </p>
        ) : overview.bars.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">
            Nog geen zaken in de database. Maak hieronder een klantaccount (zaak + eigenaar) aan.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <TotalStrip label="Totaal · deze week" s={overview.totalsWeek} />
              <TotalStrip label="Totaal · deze maand" s={overview.totalsMonth} />
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.08]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-4 py-3 font-semibold text-white/75">Zaak</th>
                    <th className="px-3 py-3 font-semibold text-white/75">Week · scans</th>
                    <th className="px-3 py-3 font-semibold text-white/75">Week · claims</th>
                    <th className="px-3 py-3 font-semibold text-white/75">Maand · scans</th>
                    <th className="px-3 py-3 font-semibold text-white/75">Maand · claims</th>
                    <th className="px-3 py-3 font-semibold text-white/75">Maand · waarde</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.bars.map((b) => (
                    <tr key={b.slug} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{b.name}</div>
                        <div className="text-xs text-white/40">{b.slug}</div>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-white/85">{b.week.scans}</td>
                      <td className="px-3 py-3 tabular-nums text-white/85">{b.week.claims}</td>
                      <td className="px-3 py-3 tabular-nums text-white/85">{b.month.scans}</td>
                      <td className="px-3 py-3 tabular-nums text-white/85">{b.month.claims}</td>
                      <td className="px-3 py-3 tabular-nums text-emerald-200/90">
                        {fmtEuro(b.month.estimatedDealValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="admins-list">
        <h2 id="admins-list" className="text-lg font-semibold text-white">
          Beheerdersaccounts (database)
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Naast e-mail(s) in <code className="rounded bg-white/10 px-1">SUPER_ADMIN_EMAILS</code> staan hier
          accounts die via dit scherm zijn toegevoegd.
        </p>
        {admins.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">
            Geen extra beheerders in de tabel — alleen bootstrap via environment indien ingesteld.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            {admins.map((a) => (
              <li
                key={a.userId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] py-2 last:border-0"
              >
                <span className="font-medium text-white">{a.email}</span>
                <span className="text-xs text-white/40">
                  toegevoegd {new Date(a.createdAt).toLocaleString("nl-NL")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
