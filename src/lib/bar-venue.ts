import "server-only";
import type { VenueType } from "@/lib/dashboard/payload-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseVenueType } from "@/lib/venue-type";

export async function getVenueTypeForBarSlug(
  slug: string,
): Promise<VenueType | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bars")
    .select("venue_type")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return parseVenueType(data.venue_type as string);
}
