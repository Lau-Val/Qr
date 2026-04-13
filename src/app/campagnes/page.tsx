import { redirect } from "next/navigation";
import { CampaignsClient } from "./CampaignsClient";
import { getVenueTypeForBarSlug } from "@/lib/bar-venue";
import { getSessionUser, getVerifiedBarSlugForUser } from "@/lib/auth/bar-session";
import type { VenueType } from "@/lib/dashboard/payload-types";

export const metadata = {
  title: "Campagnes — BarBoost",
  description: "Weekend WhatsApp campagnes",
};

export default async function CampagnesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/campagnes");
  }
  const slug = await getVerifiedBarSlugForUser(user.id, null);
  let venueType: VenueType = "horeca";
  if (slug) {
    const v = await getVenueTypeForBarSlug(slug);
    if (v) venueType = v;
  }
  return <CampaignsClient venueType={venueType} />;
}
