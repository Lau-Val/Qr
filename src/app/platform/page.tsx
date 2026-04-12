import { redirect } from "next/navigation";
import Link from "next/link";
import { isSuperAdminEmail } from "@/lib/auth/super-admin";
import { getSessionUser } from "@/lib/auth/bar-session";
import { PlatformForm } from "./PlatformForm";

export const metadata = {
  title: "Platform — BarBoost",
  description: "Nieuwe zaken en accounts",
};

export default async function PlatformPage() {
  const user = await getSessionUser();
  if (!user?.email || !isSuperAdminEmail(user.email)) {
    redirect("/login?next=/platform");
  }

  return (
    <div className="min-h-dvh bg-[#07060f] px-4 py-10 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/85">
          Platform
        </p>
        <h1 className="mt-2 text-2xl font-bold">Nieuwe zaak + account</h1>
        <p className="mt-2 text-sm text-white/55">
          Maak een bedrijfsprofiel (bar) en een inlog voor de eigenaar. Zij loggen in op{" "}
          <strong className="text-white/80">/login</strong> en zien daarna het dashboard.
        </p>

        <PlatformForm />

        <Link
          href="/dashboard"
          className="mt-8 inline-block text-sm text-violet-300 hover:underline"
        >
          ← Terug naar dashboard
        </Link>
      </div>
    </div>
  );
}
