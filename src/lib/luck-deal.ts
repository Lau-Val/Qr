import type { Deal } from "@/data/types";

/**
 * Hogere geluksscore → betere deal (op basis van geschatte omzet-impact in mockdata).
 */
export function dealForLuck(luck: number, pool: Deal[]): Deal {
  const sorted = [...pool].sort(
    (a, b) => a.revenueImpactEstimate - b.revenueImpactEstimate,
  );
  const n = sorted.length;
  if (n === 0) {
    throw new Error("Lege dealpool");
  }
  const idx = Math.min(n - 1, Math.floor((luck / 100) * n));
  return sorted[idx]!;
}
