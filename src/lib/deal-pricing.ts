import type { Deal } from "@/data/types";

/** Demo-prijzen voor vergelijking op het scherm — niet uit titel geparsed */
const BY_ID: Record<
  string,
  { normal: string; now: string; upgradeLine: string }
> = {
  d1: {
    normal: "€12",
    now: "€6",
    upgradeLine: "€7 — meer volume + shot",
  },
  d2: {
    normal: "€18",
    now: "€10",
    upgradeLine: "Extra shot inbegrepen",
  },
  d3: {
    normal: "€8",
    now: "Gratis shot",
    upgradeLine: "Nog scherpere loyaliteit",
  },
  d4: {
    normal: "+€5",
    now: "+€2",
    upgradeLine: "Upgrade zonder toeslag",
  },
  d5: {
    normal: "€42",
    now: "€28",
    upgradeLine: "Meer op tafel voor €2 extra",
  },
  d6: {
    normal: "€16",
    now: "€10",
    upgradeLine: "Cocktails + upgrade inbegrepen",
  },
  d7: {
    normal: "€22",
    now: "€14",
    upgradeLine: "Twee biertjes extra",
  },
  d8: {
    normal: "€35",
    now: "€24",
    upgradeLine: "Staffelvoordeel groep",
  },
};

export function getDealPriceCompare(deal: Deal): {
  normal: string;
  now: string;
  upgradeLine: string;
} {
  return (
    BY_ID[deal.id] ?? {
      normal: "—",
      now: "—",
      upgradeLine: "Meer voordeel bij upgrade",
    }
  );
}

/** Eerste €-bedrag in een string (voor upgrade-prijsregels), anders null */
function firstEuroToken(s: string): string | null {
  const m = s.match(/€\s*[\d.,]+/);
  return m ? m[0].replace(/\s/g, "") : null;
}

/**
 * Totaalregel voor barpersoneel: "€X TOTAAL".
 * Bij upgrade: voorkeur voor prijs in upgradeLine als die begint met €, anders `now`.
 */
export function getBartenderTotalLabel(deal: Deal, isUpgraded: boolean): string {
  const p = getDealPriceCompare(deal);
  if (isUpgraded) {
    const fromUpgrade = firstEuroToken(p.upgradeLine);
    if (fromUpgrade) {
      return `${fromUpgrade} TOTAAL`;
    }
  }
  return `${p.now} TOTAAL`;
}

/** Korte id voor bar (#A7X2) — laatste 4 alfanumerieke tekens */
export function formatDealSessionFooter(claimCode: string): string {
  const alnum = claimCode.replace(/[^a-zA-Z0-9]/g, "");
  const tail = (alnum.slice(-4) || "----").toUpperCase();
  return `#${tail.padStart(4, "0").slice(-4)}`;
}
