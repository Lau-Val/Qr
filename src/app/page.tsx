import Link from "next/link";
import { Badge } from "@/components/barboost/ui/Badge";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#07060f] text-white">
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-5 py-14">
        <div className="text-center">
          <Badge tone="neutral" className="mb-4 border-white/15 bg-white/[0.06] text-white/75">
            Omzet &amp; terugkomst voor horeca
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            BarBoost
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/62">
            Van eerste scan tot weekend-herhaal — één flow die je cijfers laat zien.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/42">
            Interactieve demo: geen backend, geen echte betalingen of WhatsApp-koppeling. Wel: de
            volledige ervaring zoals voor een bar live zou kunnen.
          </p>
        </div>

        <div className="mt-14 grid flex-1 gap-4 sm:grid-cols-3">
          <Link
            href="/gast"
            className="group flex flex-col rounded-3xl border border-white/[0.09] bg-gradient-to-br from-violet-950/50 to-[#0c0b14] p-6 transition-all hover:border-violet-400/35 hover:shadow-[0_24px_60px_rgba(99,102,241,0.12)]"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-300/85">
              Aan de tafel
            </span>
            <h2 className="mt-3 text-xl font-bold">Gast-flow</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
              QR, deal, optionele upgrade, claim — plus comeback en WhatsApp met toestemming.
            </p>
            <span className="mt-4 text-sm font-semibold text-violet-200/90 group-hover:underline">
              Demo starten →
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="group flex flex-col rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 transition-all hover:border-emerald-500/30"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300/80">
              Achter de bar
            </span>
            <h2 className="mt-3 text-xl font-bold">Dashboard</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
              Omzetindicaties, funnel, deals, WhatsApp-bereik en ROI — in één overzicht.
            </p>
            <span className="mt-4 text-sm font-semibold text-emerald-200/90 group-hover:underline">
              Dashboard openen →
            </span>
          </Link>

          <Link
            href="/campagnes"
            className="group flex flex-col rounded-3xl border border-white/[0.09] bg-white/[0.035] p-6 transition-all hover:border-sky-500/30"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-300/80">
              Weekend
            </span>
            <h2 className="mt-3 text-xl font-bold">WhatsApp</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
              Korte berichten naar gasten die je zaak al kennen — met templates en preview.
            </p>
            <span className="mt-4 text-sm font-semibold text-sky-200/90 group-hover:underline">
              Campagnes bekijken →
            </span>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/32">
            Alle schermen gebruiken dezelfde demo: Café Nova.
          </p>
        </div>
      </div>
    </div>
  );
}
