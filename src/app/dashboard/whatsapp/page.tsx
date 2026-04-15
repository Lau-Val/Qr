import { redirect } from "next/navigation";
import { WhatsAppDashboardClient } from "./WhatsAppDashboardClient";
import { getVenueTypeForBarSlug } from "@/lib/bar-venue";
import { getSessionUser, getVerifiedBarForUser } from "@/lib/auth/bar-session";
import type { VenueType } from "@/lib/dashboard/payload-types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WhatsApp — BarBoost",
  description: "Koppel je WhatsApp Business-account",
};

export default async function WhatsAppPage({
  searchParams,
}: {
  searchParams?: Promise<{ bar?: string | string[] }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/dashboard/whatsapp");
  }

  const params = (await searchParams) ?? {};
  const barParam = params.bar;
  const requested =
    typeof barParam === "string"
      ? barParam
      : Array.isArray(barParam)
        ? barParam[0]
        : undefined;

  const ctx = await getVerifiedBarForUser(user.id, requested?.trim() || null);
  if (!ctx) {
    redirect("/login?next=/dashboard/whatsapp");
  }

  let venueType: VenueType = "horeca";
  const v = await getVenueTypeForBarSlug(ctx.slug);
  if (v) venueType = v;

  return <WhatsAppDashboardClient barSlug={ctx.slug} venueType={venueType} />;
}
