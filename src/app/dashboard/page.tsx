import { DashboardClient } from "./DashboardClient";
import { getDashboardData } from "@/lib/queries/dashboard";

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
  const params = (await searchParams) ?? {};
  const barParam = params.bar;
  const slug =
    (typeof barParam === "string"
      ? barParam
      : Array.isArray(barParam)
        ? barParam[0]
        : undefined)?.trim() ||
    process.env.NEXT_PUBLIC_BAR_SLUG?.trim() ||
    process.env.NEXT_PUBLIC_DEFAULT_BAR_SLUG?.trim() ||
    "cafe-nova";

  const data = await getDashboardData(slug);
  return <DashboardClient data={data} />;
}
