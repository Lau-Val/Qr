"use client";

import { useState, type FormEvent } from "react";
import { createBarWithOwner } from "./actions";

export function PlatformForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const r = await createBarWithOwner(fd);
    setPending(false);
    if (r.ok) {
      setSuccess(true);
      e.currentTarget.reset();
    } else {
      setError(r.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {error ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Opgeslagen. De eigenaar kan nu inloggen met het e-mailadres en wachtwoord.
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-xs text-white/45">
          Zaaknaam
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
          placeholder="Bijv. Café Nova"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-xs text-white/45">
          URL-slug (uniek)
        </label>
        <input
          id="slug"
          name="slug"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
          placeholder="cafe-nova"
        />
      </div>
      <div>
        <label htmlFor="ownerEmail" className="block text-xs text-white/45">
          E-mail eigenaar (inlog)
        </label>
        <input
          id="ownerEmail"
          name="ownerEmail"
          type="email"
          required
          autoComplete="off"
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm"
          placeholder="eigenaar@voorbeeld.nl"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs text-white/45">
          Tijdelijk wachtwoord (min. 8 tekens)
        </label>
        <input
          id="password"
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
        className="mt-6 w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
      >
        {pending ? "Bezig…" : "Zaak en account aanmaken"}
      </button>
    </form>
  );
}
