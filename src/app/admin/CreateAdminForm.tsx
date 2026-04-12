"use client";

import { useState, type FormEvent } from "react";
import { createPlatformAdminUser } from "./actions";

export function CreateAdminForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await createPlatformAdminUser(fd);
    setPending(false);
    if (r.ok) {
      setSuccess(true);
      e.currentTarget.reset();
    } else {
      setError(r.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      {error ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Beheerdersaccount aangemaakt. De gebruiker kan inloggen op{" "}
          <strong className="text-emerald-50">/login</strong> en ziet dit beheerdersdashboard.
        </p>
      ) : null}

      <div>
        <label htmlFor="adminEmail" className="block text-xs text-white/45">
          E-mail (inlog)
        </label>
        <input
          id="adminEmail"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
          placeholder="beheerder@voorbeeld.nl"
        />
      </div>
      <div>
        <label htmlFor="adminPassword" className="block text-xs text-white/45">
          Tijdelijk wachtwoord (min. 8 tekens)
        </label>
        <input
          id="adminPassword"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-950/40 disabled:opacity-60"
      >
        {pending ? "Bezig…" : "Beheerdersaccount aanmaken"}
      </button>
    </form>
  );
}
