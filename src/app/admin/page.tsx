import Link from "next/link";
import { redirect } from "next/navigation";
import { isPlatformAdminUser } from "@/lib/auth/platform-admin";
import { getSessionUser } from "@/lib/auth/bar-session";
import { PlatformForm } from "@/app/platform/PlatformForm";
import { SignOutButton } from "@/components/barboost/SignOutButton";
import {
  getPlatformOverview,
  listPlatformAdmins,
} from "@/lib/supabase/platform-overview";
import { AdminStatsSection } from "./AdminStatsSection";
import { CreateAdminForm } from "./CreateAdminForm";

export const metadata = {
  title: "Beheerdersdashboard — BarBoost",
  description: "Platform: klanten, beheerders en totaalstatistieken",
};

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user || !(await isPlatformAdminUser(user))) {
    redirect("/login?next=/admin");
  }

  const [overview, admins] = await Promise.all([
    getPlatformOverview(),
    listPlatformAdmins(),
  ]);

  return (
    <div className="min-h-dvh bg-[#07060f] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/85">
              Beheerdersdashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Platformbeheer</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
              Dit scherm is alleen voor <strong className="text-white/80">platformbeheerders</strong>.{" "}
              <strong className="text-white/80">Klanten</strong> (eigenaren en personeel van een zaak) loggen
              in op dezelfde pagina maar zien alleen het zaken-dashboard, campagnes en dealbeheer voor hun zaak —
              niet deze beheerfuncties.
            </p>
          </div>
          <SignOutButton />
        </div>

        <AdminStatsSection overview={overview} admins={admins} />

        <section className="grid gap-10 border-t border-white/10 pt-12 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Klantaccount (zaak + eigenaar)</h2>
            <p className="mt-2 text-sm text-white/50">
              Maakt een bar in het systeem en een Supabase-login voor de eigenaar. Zij gebruiken{" "}
              <strong className="text-white/75">/login</strong> en krijgen het normale dashboard voor hun zaak.
            </p>
            <PlatformForm />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Beheerdersaccount</h2>
            <p className="mt-2 text-sm text-white/50">
              Nieuwe platformbeheerder: zelfde rechten als jij op dit scherm (zaken aanmaken, andere beheerders,
              alle statistieken). Geef het wachtwoord veilig door; ze kunnen het later zelf wijzigen als je
              wachtwoord-reset inschakelt in Supabase.
            </p>
            <CreateAdminForm />
          </div>
        </section>

        <p className="border-t border-white/10 pt-8 text-sm text-white/45">
          <Link href="/dashboard" className="text-violet-300 hover:underline">
            Naar zaken-dashboard
          </Link>{" "}
          — alleen relevant als jouw account ook aan een zaak is gekoppeld.
        </p>
      </div>
    </div>
  );
}
