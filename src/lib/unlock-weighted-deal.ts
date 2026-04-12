import type { Deal } from "@/data/types";

export type ShowcaseRow = {
  dealId: string;
  weight: number;
};

/**
 * Trekt één deal-id: hogere `weight` = vaker.
 * `weight`-waarden moeten sommeren tot 1 (of worden genormaliseerd).
 */
export function pickWeightedDealId(rows: ShowcaseRow[]): string {
  if (rows.length === 0) {
    throw new Error("Geen showcase-rijen");
  }
  const sum = rows.reduce((s, r) => s + r.weight, 0);
  const r = Math.random() * (sum > 0 ? sum : 1);
  let cum = 0;
  for (const row of rows) {
    cum += row.weight;
    if (r < cum) return row.dealId;
  }
  return rows[rows.length - 1]!.dealId;
}

export function resolveDealById(pool: Deal[], id: string): Deal | undefined {
  return pool.find((d) => d.id === id);
}
