import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Inloggen — BarBoost",
  description: "Inloggen voor zaken (eigenaren/personeel) en platformbeheerders",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-[#07060f] px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/85">
            BarBoost
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Inloggen</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
            Eén inlogpagina voor iedereen. Vul je e-mail en wachtwoord in — daarna brengen we je
            automatisch naar het <strong className="text-white/80">zaken-dashboard</strong> of het{" "}
            <strong className="text-white/80">beheerdersdashboard</strong>, afhankelijk van je account.
          </p>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
              Klant (zaak)
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Eigenaren en personeel: na inloggen zie je cijfers, campagnes en dealbeheer voor jouw zaak.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/90">
              Platformbeheer
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Beheerders: na inloggen zie je het platformscherm (zaken aanmaken, statistieken totaal).
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#0c0b14] px-5 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <p className="text-center text-sm font-medium text-white/75">Log in met je account</p>
          <Suspense
            fallback={<p className="mt-8 text-center text-sm text-white/40">Laden…</p>}
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-10 text-center text-xs text-white/40">
          <Link href="/" className="text-violet-300 hover:underline">
            ← Terug naar home
          </Link>
        </p>
      </div>
    </div>
  );
}
