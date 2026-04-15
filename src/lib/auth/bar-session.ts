import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/utils/supabase/server";

export async function getSessionUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Bepaalt welke bar-slug een ingelogde gebruiker mag zien (eerste lidmaatschap of gevraagde slug).
 */
export async function getVerifiedBarSlugForUser(
  userId: string,
  requestedSlug?: string | null,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("bar_members")
    .select("bar_id")
    .eq("user_id", userId);
  if (error || !members?.length) return null;
  const barIds = members.map((m) => m.bar_id);
  const { data: bars, error: barErr } = await admin
    .from("bars")
    .select("slug")
    .in("id", barIds);
  if (barErr || !bars?.length) return null;
  const slugs = bars.map((b) => b.slug);
  if (requestedSlug && slugs.includes(requestedSlug)) return requestedSlug;
  return slugs[0] ?? null;
}

/** company_id in WhatsApp-tabellen = bars.id */
export async function getVerifiedBarForUser(
  userId: string,
  requestedSlug?: string | null,
): Promise<{ companyId: string; slug: string } | null> {
  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("bar_members")
    .select("bar_id")
    .eq("user_id", userId);
  if (error || !members?.length) return null;
  const barIds = members.map((m) => m.bar_id);
  const { data: bars, error: barErr } = await admin
    .from("bars")
    .select("id, slug")
    .in("id", barIds);
  if (barErr || !bars?.length) return null;
  const req = requestedSlug?.trim();
  if (req) {
    const match = bars.find((b) => b.slug === req);
    if (match) return { companyId: match.id, slug: match.slug };
  }
  const first = bars[0];
  return first ? { companyId: first.id, slug: first.slug } : null;
}
