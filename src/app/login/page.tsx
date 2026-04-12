import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Inloggen — BarBoost",
  description: "Log in voor je zaak-dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#07060f] px-4 py-12 text-white">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/85">
          BarBoost
        </p>
        <h1 className="mt-3 text-center text-2xl font-bold">Inloggen</h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Alleen voor geregistreerde zaken. Geen account? Neem contact op met je leverancier.
        </p>
        <Suspense fallback={<p className="mt-8 text-center text-sm text-white/40">Laden…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-xs text-white/35">
          <Link href="/" className="text-violet-300 hover:underline">
            ← Terug naar home
          </Link>
        </p>
      </div>
    </div>
  );
}
