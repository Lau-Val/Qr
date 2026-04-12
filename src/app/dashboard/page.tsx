import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getSessionUser, getVerifiedBarSlugForUser } from "@/lib/auth/bar-session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — BarBoost",
  description: "Cijfers voor je zaak in één oogopslag",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ bar?: string | string[] }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const params = (await searchParams) ?? {};
  const barParam = params.bar;
  const requested =
    typeof barParam === "string"
      ? barParam
      : Array.isArray(barParam)
        ? barParam[0]
        : undefined;

  const slug = await getVerifiedBarSlugForUser(
    user.id,
    requested?.trim() || null,
  );

  if (!slug) {
    return (
      <DashboardClient
        data={{
          configured: false,
          message:
            "Je account heeft nog geen zaak gekoppeld. Vraag toegang aan je beheerder of gebruik het platform-account om een zaak aan te maken.",
        }}
      />
    );
  }

  const data = await getDashboardData(slug);
  return <DashboardClient data={data} />;
}
