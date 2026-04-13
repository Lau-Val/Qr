import type { Deal } from "./types";

/** Sterkere deal na upgrade (telefoon of feedback) — gekoppeld aan basisdeal-id */
const UPGRADE_COPY: Record<
  string,
  { title: string; subtitle: string; description: string; tag: string }
> = {
  d1: {
    title: "3 bier voor €7 + gratis shot",
    subtitle: "Meer volume, scherpere prijs",
    description: "Alleen vanavond — minimaal 1 ronde.",
    tag: "Geüpgraded",
  },
  d2: {
    title: "4 shots + 1 gratis shot",
    subtitle: "Groepsvoordeel",
    description: "Laat je voucher zien bij de volgende ronde.",
    tag: "Geüpgraded",
  },
  d6: {
    title: "2 cocktails + gratis upgrade",
    subtitle: "Premium mixers inbegrepen",
    description: "Geldig op geselecteerde cocktails vanavond.",
    tag: "Geüpgraded",
  },
  d4: {
    title: "Cocktail upgrade inbegrepen",
    subtitle: "Geen extra toeslag",
    description: "Premium cocktail i.p.v. standaard — upgrade geactiveerd.",
    tag: "Geüpgraded",
  },
  d5: {
    title: "Nachos + pitcher + bittergarnituur",
    subtitle: "Extra op tafel",
    description: "Combinatie alleen vanavond.",
    tag: "Geüpgraded",
  },
  d7: {
    title: "Bitterballen + 2 huisbier",
    subtitle: "Meer voor dezelfde avond",
    description: "Snackdeal met extra ronde bier.",
    tag: "Geüpgraded",
  },
  d8: {
    title: "Groepsdeal: 5 shotjes staffelprijs",
    subtitle: "Minimaal 4 personen",
    description: "Toon aan de bar — groepsvoordeel geactiveerd.",
    tag: "Geüpgraded",
  },
  d3: {
    title: "Gratis shot + voorrang bij volgende ronde",
    subtitle: "Extra voor terugkerende gasten",
    description: "Geactiveerd via BarBoost.",
    tag: "Geüpgraded",
  },
  k1: {
    title: "Knip + wenkbrauw touch-up pakket",
    subtitle: "Extra verzorging inbegrepen",
    description: "Geldig bij je volgende bezoek — toon de voucher.",
    tag: "Geüpgraded",
  },
  k2: {
    title: "Wash, masker & blowdry + oliebehandeling",
    subtitle: "Langdurige glans",
    description: "Upgrade op het standaard pakket — alleen op afspraak.",
    tag: "Geüpgraded",
  },
  k3: {
    title: "Kleuren + glans + mini styling-set mee naar huis",
    subtitle: "Compleet pakket",
    description: "Inclusief verzorgingsadvies van je stylist.",
    tag: "Geüpgraded",
  },
};

export function buildUpgradedDeal(base: Deal): Deal {
  const extra = UPGRADE_COPY[base.id];
  const digits = base.claimCode.replace(/\D/g, "").slice(-4).padStart(4, "0");
  const upgradedCode = `BB-U${digits}`;
  if (!extra) {
    return {
      ...base,
      title: `${base.title} — extra voordeel`,
      subtitle: "Geactiveerd via BarBoost",
      description:
        "Je hebt een sterkere deal geactiveerd. Alleen vanavond geldig.",
      tag: "Geüpgraded",
      claimCode: upgradedCode,
    };
  }
  return {
    ...base,
    ...extra,
    claimCode: upgradedCode,
    timerSeconds: base.timerSeconds,
  };
}
