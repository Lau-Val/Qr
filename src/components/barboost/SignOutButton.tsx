"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/utils/supabase/client";

export type SignOutButtonProps = {
  /** Standaard: subtiel in zijbalk. `emphasized`: duidelijke knop (o.a. beheerdersdashboard). */
  variant?: "default" | "emphasized";
  className?: string;
  /** Na uitloggen (standaard /login) */
  redirectTo?: string;
};

export function SignOutButton({
  variant = "default",
  className,
  redirectTo = "/login",
}: SignOutButtonProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className={cn(
        "rounded-lg font-medium transition-colors",
        variant === "emphasized"
          ? "border border-white/25 bg-white/[0.08] px-4 py-2.5 text-sm text-white shadow-sm hover:bg-white/[0.14]"
          : "px-3 py-1.5 text-xs text-white/55 hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      Uitloggen
    </button>
  );
}
