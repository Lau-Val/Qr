import type { Deal } from "./types";

type UpgradeExtra = {
  /** Volledige titel op voucher / claim-scherm */
  title: string;
  /** Alleen het extra t.o.v. de basisdeal — kolom „Met upgrade” in upgrade-box */
  previewDelta: string;
  subtitle: string;
  description: string;
  tag: string;
};

/** Sterkere deal na upgrade (telefoon) — gekoppeld aan basisdeal-id */
const UPGRADE_COPY: Record<string, UpgradeExtra> = {
  d1: {
    title: "3 bier voor €7 + gratis shot",
    previewDelta: "+ 1 bier + gratis shot",
    subtitle: "Meer volume, scherpere prijs",
    description: "Alleen vanavond — minimaal 1 ronde.",
    tag: "Geüpgraded",
  },
  d2: {
    title: "4 shots + 1 gratis shot",
    previewDelta: "+ 1 shot + gratis shot",
    subtitle: "Groepsvoordeel",
    description: "Laat je voucher zien bij de volgende ronde.",
    tag: "Geüpgraded",
  },
  d6: {
    title: "3 cocktails voor €10",
    previewDelta: "+ extra cocktail",
    subtitle: "Premium mixers inbegrepen",
    description: "Geldig op geselecteerde cocktails vanavond.",
    tag: "Geüpgraded",
  },
  d4: {
    title: "Premium cocktail zonder extra toeslag",
    previewDelta: "+ premium cocktail (geen toeslag)",
    subtitle: "Geen extra toeslag",
    description: "Premium cocktail i.p.v. standaard — upgrade geactiveerd.",
    tag: "Geüpgraded",
  },
  d5: {
    title: "Nachos + pitcher + bittergarnituur",
    previewDelta: "+ bittergarnituur & extra op tafel",
    subtitle: "Extra op tafel",
    description: "Combinatie alleen vanavond.",
    tag: "Geüpgraded",
  },
  d7: {
    title: "Bitterballen + 2 huisbier",
    previewDelta: "+ extra ronde huisbier",
    subtitle: "Meer voor dezelfde avond",
    description: "Snackdeal met extra ronde bier.",
    tag: "Geüpgraded",
  },
  d8: {
    title: "Groepsdeal: 5 shotjes staffelprijs",
    previewDelta: "+ staffelvoordeel op 5 shotjes",
    subtitle: "Minimaal 4 personen",
    description: "Toon aan de bar — groepsvoordeel geactiveerd.",
    tag: "Geüpgraded",
  },
  d3: {
    title: "Gratis shot + voorrang bij volgende ronde",
    previewDelta: "+ voorrang volgende ronde",
    subtitle: "Extra voor terugkerende gasten",
    description: "Geactiveerd via BarBoost.",
    tag: "Geüpgraded",
  },
  k1: {
    title: "Knip + wenkbrauw touch-up pakket",
    previewDelta: "+ wenkbrauw touch-up",
    subtitle: "Extra verzorging inbegrepen",
    description: "Geldig bij je volgende bezoek — toon de voucher.",
    tag: "Geüpgraded",
  },
  k2: {
    title: "Wash, masker & blowdry + oliebehandeling",
    previewDelta: "+ oliebehandeling",
    subtitle: "Langdurige glans",
    description: "Upgrade op het standaard pakket — alleen op afspraak.",
    tag: "Geüpgraded",
  },
  k3: {
    title: "Kleuren + glans + mini styling-set mee naar huis",
    previewDelta: "+ mini styling-set mee naar huis",
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
      upgradePreviewDelta: "+ extra voordeel",
      claimCode: upgradedCode,
    };
  }
  return {
    ...base,
    title: extra.title,
    subtitle: extra.subtitle,
    description: extra.description,
    tag: extra.tag,
    upgradePreviewDelta: extra.previewDelta,
    claimCode: upgradedCode,
    timerSeconds: base.timerSeconds,
  };
}
