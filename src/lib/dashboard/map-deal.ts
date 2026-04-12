import type { Deal, DealCategory } from "@/data/types";

export type DealRow = {
  id: string;
  external_key: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  tag: string;
  urgency_text: string;
  claim_code: string;
  popularity_count: number;
  timer_seconds: number;
  revenue_impact_estimate: number;
  conversion_percent: number | null;
  insight_label: string | null;
  active: boolean;
};

const CATEGORY_MAP: Record<string, DealCategory> = {
  bier: "bier",
  shots: "shots",
  cocktail: "cocktail",
  food: "food",
  groep: "groep",
  comeback: "comeback",
  retry: "retry",
};

export function dealRowToDeal(row: DealRow, claims?: number): Deal {
  const cat = CATEGORY_MAP[row.category] ?? "bier";
  return {
    id: row.external_key,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: cat,
    tag: row.tag,
    urgencyText: row.urgency_text,
    claimCode: row.claim_code,
    popularityCount: row.popularity_count,
    timerSeconds: row.timer_seconds,
    revenueImpactEstimate: row.revenue_impact_estimate,
    conversionPercent: row.conversion_percent ?? undefined,
    claims: claims ?? 0,
    insightLabel: (row.insight_label as Deal["insightLabel"]) ?? undefined,
  };
}

/** Row from `public.deals` (uuid PK + deal_key) */
export type DealsTableRow = {
  deal_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  tag: string | null;
  urgency_text: string | null;
  claim_code: string | null;
  popularity_count: number | null;
  timer_seconds: number | null;
  revenue_impact_estimate: number | null;
  conversion_percent: number | null;
  claims: number | null;
  insight_label: string | null;
};

export function dealsTableRowToDeal(row: DealsTableRow): Deal {
  const cat = CATEGORY_MAP[row.category ?? ""] ?? "bier";
  return {
    id: row.deal_key,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    category: cat,
    tag: row.tag ?? "",
    urgencyText: row.urgency_text ?? "",
    claimCode: row.claim_code ?? "",
    popularityCount: row.popularity_count ?? 0,
    timerSeconds: row.timer_seconds ?? 0,
    revenueImpactEstimate: row.revenue_impact_estimate ?? 0,
    conversionPercent: row.conversion_percent ?? undefined,
    claims: row.claims ?? undefined,
    insightLabel: (row.insight_label as Deal["insightLabel"]) ?? undefined,
  };
}

function dealSortRank(id: string): number {
  if (id === "d0") return 1000;
  const m = /^d(\d+)$/.exec(id);
  return m ? Number(m[1]) : 500;
}

export function sortDealsForDashboard(deals: Deal[]): Deal[] {
  return [...deals].sort((a, b) => dealSortRank(a.id) - dealSortRank(b.id));
}
