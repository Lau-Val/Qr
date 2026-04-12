import "server-only";

import type { PeriodStats } from "@/lib/dashboard/payload-types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPeriodStatsForBarId } from "@/lib/supabase/dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export type BarOverviewRow = {
  slug: string;
  name: string;
  week: PeriodStats;
  month: PeriodStats;
};

export type PlatformOverview =
  | {
      ok: true;
      bars: BarOverviewRow[];
      totalsWeek: PeriodStats;
      totalsMonth: PeriodStats;
    }
  | { ok: false; message: string };

function emptyPeriod(): PeriodStats {
  return {
    scans: 0,
    claims: 0,
    upgrades: 0,
    comebacks: 0,
    whatsappOptIns: 0,
    estimatedDealValue: 0,
  };
}

function sumPeriod(a: PeriodStats, b: PeriodStats): PeriodStats {
  return {
    scans: a.scans + b.scans,
    claims: a.claims + b.claims,
    upgrades: a.upgrades + b.upgrades,
    comebacks: a.comebacks + b.comebacks,
    whatsappOptIns: a.whatsappOptIns + b.whatsappOptIns,
    estimatedDealValue: a.estimatedDealValue + b.estimatedDealValue,
  };
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Supabase is niet geconfigureerd. Controleer environment variables en deploy.",
    };
  }
  const supabase = createAdminClient();
  const { data: bars, error } = await supabase
    .from("bars")
    .select("id, slug, name")
    .order("name", { ascending: true });
  if (error) {
    return { ok: false, message: error.message };
  }

  const rows: BarOverviewRow[] = [];
  let totalsWeek = emptyPeriod();
  let totalsMonth = emptyPeriod();

  for (const b of bars ?? []) {
    const [week, month] = await Promise.all([
      getPeriodStatsForBarId(b.id, "week"),
      getPeriodStatsForBarId(b.id, "month"),
    ]);
    rows.push({ slug: b.slug, name: b.name, week, month });
    totalsWeek = sumPeriod(totalsWeek, week);
    totalsMonth = sumPeriod(totalsMonth, month);
  }

  return { ok: true, bars: rows, totalsWeek, totalsMonth };
}

export type PlatformAdminListRow = {
  email: string;
  userId: string;
  createdAt: string;
};

export async function listPlatformAdmins(): Promise<PlatformAdminListRow[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platform_admins")
    .select("user_id, created_at")
    .order("created_at", { ascending: false });
  if (error || !data?.length) return [];

  const out: PlatformAdminListRow[] = [];
  for (const row of data) {
    const { data: u, error: ue } = await admin.auth.admin.getUserById(row.user_id);
    if (ue || !u.user?.email) continue;
    out.push({
      email: u.user.email,
      userId: row.user_id,
      createdAt: row.created_at,
    });
  }
  return out;
}
