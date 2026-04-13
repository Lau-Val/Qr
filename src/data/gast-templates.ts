import type { Deal } from "./types";
import { KAPPER_DEALS } from "./mock/deals-kapper";
import { MOCK_DEALS } from "./mock/deals";

export type GastTemplateId = "horeca" | "kapper";

export type UnlockShowcaseRow = {
  text: string;
  wheelColor: string;
  normaal: string;
  dealId: string;
  weight: number;
};

export type UnlockMode = "wheel" | "giftBox";

export interface GastTemplate {
  id: GastTemplateId;
  /** Rad (horeca) of cadeaudoos (kapper) */
  unlockMode: UnlockMode;
  /** Pad zonder trailing slash, bv. `/gast` of `/gast/kapper` */
  basePath: string;
  /** Getoonde zaaknaam in copy */
  barName: string;
  /** Merkregel bovenaan welcome */
  brandLabel: string;
  dealPool: Deal[];
  unlockShowcase: UnlockShowcaseRow[];
  /** Scoreband voor rad (0–100) per deal-id */
  luckBand: (dealId: string) => number;
  welcome: {
    title: string;
    subtitle: string;
    badges: { tone: "hot" | "info" | "success"; text: string }[];
    cta: string;
    footerHint: string;
  };
  unlock: {
    listHeading: string;
    listHeadingReveal: string;
    /** Tijdens animatie (rad of doos) */
    openingHint: string;
    /** Hoofdknop onderaan (start animatie) */
    primaryCta: string;
  };
  baseDeal: {
    contextLine: string;
    upgradeHeadline: string;
    upgradeSubStandard: string;
    upgradeSubUpgraded: string;
    phoneLabel: string;
    upgradeSubmit: string;
    skipUpgrade: string;
  };
  retention: {
    comebackBody: string;
  };
}

const HORECA_POOL = MOCK_DEALS.filter((d) => d.category !== "retry");

const HORECA_UNLOCK: UnlockShowcaseRow[] = [
  {
    text: "2 bier voor €6",
    wheelColor: "#6366f1",
    normaal: "€12",
    dealId: "d1",
    weight: 0.52,
  },
  {
    text: "3 shots voor €10",
    wheelColor: "#a855f7",
    normaal: "€18",
    dealId: "d2",
    weight: 0.33,
  },
  {
    text: "2 cocktails voor €10",
    wheelColor: "#14b8a6",
    normaal: "€16",
    dealId: "d6",
    weight: 0.15,
  },
];

const KAPPER_UNLOCK: UnlockShowcaseRow[] = [
  {
    text: "Knipbeurt met €8 korting",
    wheelColor: "#d97706",
    normaal: "€48",
    dealId: "k1",
    weight: 0.52,
  },
  {
    text: "Wash, masker & blowdry voor €32",
    wheelColor: "#ca8a04",
    normaal: "€55",
    dealId: "k2",
    weight: 0.33,
  },
  {
    text: "Kleuren + glans met 20% korting",
    wheelColor: "#b45309",
    normaal: "€95",
    dealId: "k3",
    weight: 0.15,
  },
];

function luckHoreca(dealId: string): number {
  switch (dealId) {
    case "d1":
      return 6 + Math.floor(Math.random() * 32);
    case "d2":
      return 38 + Math.floor(Math.random() * 28);
    case "d6":
      return 70 + Math.floor(Math.random() * 28);
    default:
      return Math.floor(Math.random() * 101);
  }
}

function luckKapper(dealId: string): number {
  switch (dealId) {
    case "k1":
      return 6 + Math.floor(Math.random() * 32);
    case "k2":
      return 38 + Math.floor(Math.random() * 28);
    case "k3":
      return 70 + Math.floor(Math.random() * 28);
    default:
      return Math.floor(Math.random() * 101);
  }
}

const TEMPLATES: Record<GastTemplateId, GastTemplate> = {
  horeca: {
    id: "horeca",
    unlockMode: "wheel",
    basePath: "/gast",
    barName: "Café Nova",
    brandLabel: "BarBoost",
    dealPool: HORECA_POOL,
    unlockShowcase: HORECA_UNLOCK,
    luckBand: luckHoreca,
    welcome: {
      title: "Jouw deal van vanavond",
      subtitle:
        "Scan de QR bij je tafel — daarna claim je direct aan de bar. Geen app nodig.",
      badges: [
        { tone: "hot", text: "Alleen vanavond" },
        { tone: "info", text: "Aan de bar tonen" },
        { tone: "success", text: "Geschikt voor groepen" },
      ],
      cta: "Start met deal",
      footerHint: "Gemiddeld onder een minuut",
    },
    unlock: {
      listHeading: "Wat kan je winnen?",
      listHeadingReveal: "Dit wordt jouw deal",
      openingHint: "Het rad draait…",
      primaryCta: "Draai nu",
    },
    baseDeal: {
      contextLine: "minuten · alleen in",
      upgradeHeadline: "Pak de beste deal van vanavond",
      upgradeSubStandard: "Jouw deal nu",
      upgradeSubUpgraded: "Met upgrade",
      phoneLabel: "Laat je nummer achter om de deal te activeren.",
      upgradeSubmit: "Activeer betere deal",
      skipUpgrade: "Nee, ik ga door met de minder goede deal hierboven",
    },
    retention: {
      comebackBody:
        "Kom binnen 5 dagen — dan krijg je een extraatje aan de bar.",
    },
  },
  kapper: {
    id: "kapper",
    unlockMode: "giftBox",
    basePath: "/gast/kapper",
    barName: "Salon Nova",
    brandLabel: "BarBoost · Salon",
    dealPool: KAPPER_DEALS,
    unlockShowcase: KAPPER_UNLOCK,
    luckBand: luckKapper,
    welcome: {
      title: "Jouw salon-voordeel",
      subtitle:
        "Scan de QR bij binnenkomst — open de cadeaudoos en ontdek je prijs. Toon je voucher bij de balie. Geen app nodig.",
      badges: [
        { tone: "hot", text: "Alleen vandaag" },
        { tone: "info", text: "Afspraak aanbevolen" },
        { tone: "success", text: "Voor nieuwe én vaste klanten" },
      ],
      cta: "Start met prijzen",
      footerHint: "Gemiddeld onder een minuut",
    },
    unlock: {
      listHeading: "Wat zit erin?",
      listHeadingReveal: "Jouw prijs",
      openingHint: "De doos opent…",
      primaryCta: "Open de box",
    },
    baseDeal: {
      contextLine: "minuten · alleen bij",
      upgradeHeadline: "Pak het sterkste salon-voordeel",
      upgradeSubStandard: "Jouw prijs nu",
      upgradeSubUpgraded: "Met upgrade",
      phoneLabel: "Laat je nummer achter om de deal te activeren.",
      upgradeSubmit: "Activeer betere deal",
      skipUpgrade: "Nee, ik ga door met de standaardprijs hierboven",
    },
    retention: {
      comebackBody:
        "Kom binnen 6 weken terug — dan ontvang je een extraatje bij je volgende bezoek.",
    },
  },
};

export function getGastTemplate(id: GastTemplateId): GastTemplate {
  return TEMPLATES[id];
}
