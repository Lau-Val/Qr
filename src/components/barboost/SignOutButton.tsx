"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { createClient } from "@/utils/supabase/client";

export type SignOutButtonProps = {
  className?: string;
  /** Na uitloggen (standaard /login) */
  redirectTo?: string;
  /** Volle breedte (o.a. mobiele footer) */
  fullWidth?: boolean;
};

export function SignOutButton({
  className,
  redirectTo = "/login",
  fullWidth = false,
}: SignOutButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setConfirmOpen(false);
    router.push(redirectTo);
    router.refresh();
  }, [redirectTo, router]);

  useEffect(() => {
    if (!confirmOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [confirmOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className={cn(
          "rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-950/40 transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07060f]",
          fullWidth && "w-full",
          className,
        )}
      >
        Uitloggen
      </button>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14121c] p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="signout-dialog-title" className="text-lg font-semibold">
              Uitloggen?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Weet je zeker dat je wilt uitloggen?
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Ja, uitloggen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
