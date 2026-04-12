"use client";

import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/barboost/SignOutButton";
import { createClient } from "@/utils/supabase/client";

/** Onderaan de home-pagina (in de scroll-flow), alleen als ingelogd. */
export function HomeFooterAuth() {
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

  if (!mounted || !signedIn) return null;

  return (
    <footer className="mt-16 border-t border-white/10 pt-10">
      <div className="mx-auto max-w-md">
        <SignOutButton fullWidth />
      </div>
    </footer>
  );
}
