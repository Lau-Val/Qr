"use client";

import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/barboost/SignOutButton";
import { createClient } from "@/utils/supabase/client";

/** Vaste onderbalk met uitloggen als de gebruiker ingelogd is (home). */
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
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#07060f]/98 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto max-w-4xl">
        <SignOutButton fullWidth />
      </div>
    </footer>
  );
}
