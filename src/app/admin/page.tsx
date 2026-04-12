import Link from "next/link";
import { redirect } from "next/navigation";
import { isSuperAdminEmail } from "@/lib/auth/super-admin";
import { getSessionUser } from "@/lib/auth/bar-session";
import { PlatformForm } from "@/app/platform/PlatformForm";
import { SignOutButton } from "@/components/barboost/SignOutButton";

export const metadata = {
  title: "Beheer — BarBoost",
  description: "Platformbeheer: zaken en accounts",
};

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.email || !isSuperAdminEmail(user.email)) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="min-h-dvh bg-[#07060f] px-4 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/85">
              Beheerdersdashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold">Platform</h1>
            <p className="mt-2 text-sm text-white/55">
              Maak een zaak aan en een inlog voor de eigenaar. Zij gebruiken dezelfde{" "}
              <strong className="text-white/80">/login</strong> en zien daarna het zaken-dashboard.
            </p>
          </div>
          <SignOutButton />
        </div>

        <PlatformForm />

        <p className="mt-8 text-sm text-white/45">
          <Link href="/dashboard" className="text-violet-300 hover:underline">
            Naar zaken-dashboard
          </Link>{" "}
          (als jouw account ook aan een zaak is gekoppeld)
        </p>
      </div>
    </div>
  );
}
