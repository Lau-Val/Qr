"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/barboost/SignOutButton";
import { createClient } from "@/utils/supabase/client";

/**
 * Home header: Inloggen als uitgelogd; anders snelkoppeling naar app + uitloggen.
 */
export function HomeHeaderAuth() {
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session);
      setMounted(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-10 w-28 animate-pulse rounded-full bg-white/[0.08]"
        aria-hidden
      />
    );
  }

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400"
      >
        Inloggen
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href="/dashboard"
        className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Mijn omgeving
      </Link>
      <SignOutButton variant="emphasized" />
    </div>
  );
}
