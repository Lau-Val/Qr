import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Deal, MockReview } from "@/data/types";
import type { DashboardMetricsPayload } from "./metrics-types";
import {
  dealsTableRowToDeal,
  sortDealsForDashboard,
  type DealsTableRow,
} from "./map-deal";

export type LoadedBar = {
  id: string;
  slug: string;
  name: string;
  settings: Record<string, unknown>;
};

export type LoadDashboardResult = {
  bar: LoadedBar;
  deals: Deal[];
  reviews: MockReview[];
  metrics: DashboardMetricsPayload;
};

export async function loadDashboardData(
  barSlug: string,
): Promise<LoadDashboardResult> {
  const supabase = createAdminClient();

  const { data: barRow, error: barError } = await supabase
    .from("bars")
    .select("id, slug, name, settings")
    .eq("slug", barSlug)
    .maybeSingle();

  if (barError) throw barError;
  if (!barRow) {
    throw new Error(`Geen bar gevonden voor slug "${barSlug}".`);
  }

  const barId = barRow.id as string;
  const settings =
    barRow.settings && typeof barRow.settings === "object" && barRow.settings !== null
      ? (barRow.settings as Record<string, unknown>)
      : {};

  const [dealsRes, reviewsRes, metricsRes] = await Promise.all([
    supabase.from("deals").select("*").eq("bar_id", barId),
    supabase
      .from("bar_reviews")
      .select("id, body, author, rating, date_label, sort_order")
      .eq("bar_id", barId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("bar_dashboard_metrics")
      .select("payload")
      .eq("bar_id", barId)
      .maybeSingle(),
  ]);

  if (dealsRes.error) throw dealsRes.error;
  if (reviewsRes.error) throw reviewsRes.error;
  if (metricsRes.error) throw metricsRes.error;

  const deals = sortDealsForDashboard(
    (dealsRes.data ?? []).map((r) => dealsTableRowToDeal(r as DealsTableRow)),
  );

  const reviews: MockReview[] = (reviewsRes.data ?? []).map((r) => ({
    id: String(r.id),
    text: (r.body as string) ?? "",
    author: (r.author as string) ?? "",
    rating: Number(r.rating) || 0,
    date: (r.date_label as string) ?? "",
  }));

  const rawPayload = metricsRes.data?.payload;
  if (rawPayload === null || rawPayload === undefined) {
    throw new Error(
      `Geen dashboard metrics voor bar "${barSlug}". Voer supabase/seed.sql uit.`,
    );
  }

  const metrics = rawPayload as DashboardMetricsPayload;

  return {
    bar: {
      id: barId,
      slug: barRow.slug as string,
      name: barRow.name as string,
      settings,
    },
    deals,
    reviews,
    metrics,
  };
}
