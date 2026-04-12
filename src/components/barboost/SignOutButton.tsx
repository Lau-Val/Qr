"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white"
    >
      Uitloggen
    </button>
  );
}
