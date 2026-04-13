import { redirect } from "next/navigation";
import { DealBeheerClient } from "./DealBeheerClient";
import { getVenueTypeForBarSlug } from "@/lib/bar-venue";
import { getSessionUser, getVerifiedBarSlugForUser } from "@/lib/auth/bar-session";
import type { VenueType } from "@/lib/dashboard/payload-types";

export const metadata = {
  title: "Dealbeheer — BarBoost",
  description: "Deals instellen voor je zaak",
};

export default async function DealBeheerPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/dashboard/beheer");
  }
  const slug = await getVerifiedBarSlugForUser(user.id, null);
  let venueType: VenueType = "horeca";
  if (slug) {
    const v = await getVenueTypeForBarSlug(slug);
    if (v) venueType = v;
  }
  return <DealBeheerClient venueType={venueType} />;
}
