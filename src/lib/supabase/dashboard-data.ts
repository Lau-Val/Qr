import "server-only";
import type {
  DashboardData,
  DealRowStat,
  PeriodKey,
  PeriodStats,
  QrRowStat,
  ReviewRow,
} from "@/lib/dashboard/payload-types";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  rangeMonthAmsterdam,
  rangeTodayAmsterdam,
  rangeWeekAmsterdam,
} from "@/lib/time-amsterdam";

export type {
  DashboardData,
  DashboardPayload,
  DealRowStat,
  DashboardUnconfigured,
  PeriodKey,
  PeriodStats,
  QrRowStat,
  ReviewRow,
} from "@/lib/dashboard/payload-types";

async function periodRange(
  supabase: ReturnType<typeof createServiceClient>,
  kind: PeriodKey,
): Promise<{ start: string; end: string }> {
  const { data, error } = await supabase.rpc("period_bounds_amsterdam", {
    p_kind: kind,
  });
  if (!error && data && Array.isArray(data) && data[0]) {
    const row = data[0] as { period_start: string; period_end: string };
    return { start: row.period_start, end: row.period_end };
  }
  const fallback =
    kind === "today"
      ? rangeTodayAmsterdam()
      : kind === "week"
        ? rangeWeekAmsterdam()
        : rangeMonthAmsterdam();
  return fallback;
}

async function countEvents(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  start: string,
  end: string,
  eventType: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("guest_events")
    .select("*", { count: "exact", head: true })
    .eq("bar_id", barId)
    .eq("event_type", eventType)
    .gte("created_at", start)
    .lt("created_at", end);
  if (error) throw error;
  return count ?? 0;
}

async function countUpgradedClaims(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  start: string,
  end: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("guest_events")
    .select("*", { count: "exact", head: true })
    .eq("bar_id", barId)
    .eq("event_type", "claim")
    .contains("metadata", { claim_tier: "upgraded" })
    .gte("created_at", start)
    .lt("created_at", end);
  if (error) throw error;
  return count ?? 0;
}

async function sumClaimRevenue(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  start: string,
  end: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("guest_events")
    .select("deal_id, deals ( revenue_impact_estimate )")
    .eq("bar_id", barId)
    .eq("event_type", "claim")
    .gte("created_at", start)
    .lt("created_at", end);
  if (error) throw error;
  let sum = 0;
  for (const row of data ?? []) {
    const d = row.deals as unknown as { revenue_impact_estimate: number } | null;
    if (d?.revenue_impact_estimate != null) {
      sum += Number(d.revenue_impact_estimate);
    }
  }
  return sum;
}

async function buildPeriodStats(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  kind: PeriodKey,
): Promise<PeriodStats> {
  const { start, end } = await periodRange(supabase, kind);
  const [scans, claims, upgradesEvt, upgradedClaims, comebacks, whatsappOptIns] =
    await Promise.all([
      countEvents(supabase, barId, start, end, "scan"),
      countEvents(supabase, barId, start, end, "claim"),
      countEvents(supabase, barId, start, end, "upgrade"),
      countUpgradedClaims(supabase, barId, start, end),
      countEvents(supabase, barId, start, end, "comeback"),
      countEvents(supabase, barId, start, end, "whatsapp_opt_in"),
    ]);
  const upgrades = upgradesEvt + upgradedClaims;
  const estimatedDealValue = await sumClaimRevenue(supabase, barId, start, end);
  return {
    scans,
    claims,
    upgrades,
    comebacks,
    whatsappOptIns,
    estimatedDealValue,
  };
}

async function qrBreakdown(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  start: string,
  end: string,
): Promise<QrRowStat[]> {
  const { data: codes, error: e1 } = await supabase
    .from("qr_codes")
    .select("id, slug, label")
    .eq("bar_id", barId)
    .order("created_at", { ascending: true });
  if (e1) throw e1;
  const rows: QrRowStat[] = [];
  for (const q of codes ?? []) {
    const [{ count: scans }, { count: claims }] = await Promise.all([
      supabase
        .from("guest_events")
        .select("*", { count: "exact", head: true })
        .eq("bar_id", barId)
        .eq("qr_code_id", q.id)
        .eq("event_type", "scan")
        .gte("created_at", start)
        .lt("created_at", end)
        .then((r) => ({ count: r.count ?? 0 })),
      supabase
        .from("guest_events")
        .select("*", { count: "exact", head: true })
        .eq("bar_id", barId)
        .eq("qr_code_id", q.id)
        .eq("event_type", "claim")
        .gte("created_at", start)
        .lt("created_at", end)
        .then((r) => ({ count: r.count ?? 0 })),
    ]);
    rows.push({ slug: q.slug, label: q.label, scans, claims });
  }
  return rows;
}

async function dealClaimCounts(
  supabase: ReturnType<typeof createServiceClient>,
  barId: string,
  start: string,
  end: string,
): Promise<DealRowStat[]> {
  const { data: deals, error } = await supabase
    .from("deals")
    .select("id, external_key, title, active")
    .eq("bar_id", barId)
    .neq("category", "retry")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const out: DealRowStat[] = [];
  for (const d of deals ?? []) {
    const { count } = await supabase
      .from("guest_events")
      .select("*", { count: "exact", head: true })
      .eq("bar_id", barId)
      .eq("deal_id", d.id)
      .eq("event_type", "claim")
      .gte("created_at", start)
      .lt("created_at", end);
    out.push({
      externalKey: d.external_key,
      title: d.title,
      claims: count ?? 0,
    });
  }
  return out.sort((a, b) => b.claims - a.claims);
}

export async function getDashboardData(barSlug: string): Promise<DashboardData> {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      message:
        "Supabase is niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env.local en voer de migraties uit.",
    };
  }
  const supabase = createServiceClient();
  const { data: bar, error: barErr } = await supabase
    .from("bars")
    .select("id, name, slug")
    .eq("slug", barSlug)
    .maybeSingle();
  if (barErr) throw barErr;
  if (!bar) {
    return {
      configured: false,
      message: `Geen bar gevonden met slug "${barSlug}". Voeg de bar toe in Supabase of pas de URL ?bar= aan.`,
    };
  }

  const [today, week, month] = await Promise.all([
    buildPeriodStats(supabase, bar.id, "today"),
    buildPeriodStats(supabase, bar.id, "week"),
    buildPeriodStats(supabase, bar.id, "month"),
  ]);

  const { start: monthStart, end: monthEnd } = await periodRange(supabase, "month");
  const [qrRows, dealRows, reviewsRes] = await Promise.all([
    qrBreakdown(supabase, bar.id, monthStart, monthEnd),
    dealClaimCounts(supabase, bar.id, monthStart, monthEnd),
    supabase
      .from("bar_reviews")
      .select("author, text, rating, review_date")
      .eq("bar_id", bar.id)
      .order("review_date", { ascending: false })
      .limit(8),
  ]);

  if (reviewsRes.error) throw reviewsRes.error;

  const reviews: ReviewRow[] = (reviewsRes.data ?? []).map((r) => ({
    author: r.author,
    text: r.text,
    rating: r.rating,
    reviewDate: r.review_date,
  }));

  return {
    configured: true,
    barSlug: bar.slug,
    barName: bar.name,
    periods: {
      today,
      week,
      month,
    },
    qrRows,
    dealRows,
    reviews,
  };
}
