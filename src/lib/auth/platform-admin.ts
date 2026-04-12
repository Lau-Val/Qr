import "server-only";

import type { User } from "@supabase/supabase-js";
import { isSuperAdminEmail } from "@/lib/auth/super-admin";
import { createServerSupabase } from "@/utils/supabase/server";

/**
 * Platform-admin: e-mail in SUPER_ADMIN_EMAILS (bootstrap) óf rij in `platform_admins`.
 */
export async function isPlatformAdminUser(
  user: User | null | undefined,
): Promise<boolean> {
  if (!user?.id) return false;
  if (isSuperAdminEmail(user.email)) return true;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
}
