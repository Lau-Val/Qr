import { DashboardClient } from "./DashboardClient";
import { loadDashboardData } from "@/lib/dashboard/load-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — BarBoost",
  description: "Omzet en groei voor de bar",
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
        : undefined) ??
    process.env.NEXT_PUBLIC_DEFAULT_BAR_SLUG ??
    "cafe-nova";

  try {
    const data = await loadDashboardData(slug);
    const referenceDateDefault =
      data.metrics.referenceDateIso ?? new Date().toISOString().slice(0, 10);

    return (
      <DashboardClient
        barName={data.bar.name}
        deals={data.deals}
        reviews={data.reviews}
        metrics={data.metrics}
        referenceDateDefault={referenceDateDefault}
      />
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Onbekende fout";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0a12] px-4 text-white">
        <p className="text-lg font-semibold">Dashboard niet geladen</p>
        <p className="mt-2 max-w-md text-center text-sm text-white/60">{message}</p>
      </div>
    );
  }
}
