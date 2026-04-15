import type { Deal } from "./types";
import { KAPPER_DEALS } from "./mock/deals-kapper";
import { MOCK_DEALS } from "./mock/deals";

export type GastTemplateId = "horeca" | "kapper";

/** Kanalen voor retentiepagina (pagina 5) — lege lijst = sectie verborgen */
export type RetentionSocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "website";

export type RetentionSocialLink = {
  platform: RetentionSocialPlatform;
  /** Volledige https-URL */
  href: string;
};

export type UnlockShowcaseRow = {
  text: string;
  wheelColor: string;
  normaal: string;
  dealId: string;
  weight: number;
};

export interface GastTemplate {
  id: GastTemplateId;
  /** Pad zonder trailing slash, bv. `/gast` of `/gast/kapper` */
  basePath: string;
  /** Getoonde zaaknaam in copy */
  barName: string;
  /** Merkregel bovenaan welcome */
  brandLabel: string;
  dealPool: Deal[];
  unlockShowcase: UnlockShowcaseRow[];
  welcome: {
    title: string;
    subtitle: string;
    badges: { tone: "hot" | "info" | "success"; text: string }[];
    cta: string;
    footerHint: string;
  };
  unlock: {
    /** Tijdens animatie (mystery box) */
    openingHint: string;
    /** Tekst boven de hoofdknop (uitleg: openen via knop) */
    boxIdleHint: string;
    /** Hoofdknop onderaan (start animatie) */
    primaryCta: string;
  };
  baseDeal: {
    upgradeHeadline: string;
    upgradeSubStandard: string;
    upgradeSubUpgraded: string;
    phoneLabel: string;
    upgradeSubmit: string;
    skipUpgrade: string;
  };
  /** Pagina 5: alleen socials (geen comeback-card) */
  retention: {
    /** Hoofdtitel */
    title: string;
    /** Regel onder de titel (kort) */
    subtitle: string;
    /** Optioneel: kleine titel boven de socials (weglaten = meer ruimte) */
    socialHeading?: string;
    socialLinks: RetentionSocialLink[];
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

/** Standaard vijf kanalen (demo-URL’s — per zaak vervangen). */
const DEFAULT_SOCIAL_LINKS_DEMO: RetentionSocialLink[] = [
  { platform: "instagram", href: "https://www.instagram.com/" },
  { platform: "facebook", href: "https://www.facebook.com/" },
  { platform: "tiktok", href: "https://www.tiktok.com/" },
  { platform: "whatsapp", href: "https://wa.me/31612345678" },
  { platform: "website", href: "https://example.com" },
];

const TEMPLATES: Record<GastTemplateId, GastTemplate> = {
  horeca: {
    id: "horeca",
    basePath: "/gast",
    barName: "Café Nova",
    brandLabel: "BarBoost",
    dealPool: HORECA_POOL,
    unlockShowcase: HORECA_UNLOCK,
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
      openingHint: "De mystery box opent…",
      boxIdleHint: "Klik op de knop hieronder om je mystery box te openen.",
      primaryCta: "Klik om te openen",
    },
    baseDeal: {
      upgradeHeadline: "🔥 Unlock betere deal 🔥",
      upgradeSubStandard: "Jouw deal nu",
      upgradeSubUpgraded: "Met upgrade",
      phoneLabel: "Laat je nummer achter om de deal te activeren.",
      upgradeSubmit: "Activeer betere deal",
      skipUpgrade: "Nee, ik ga door met de minder goede deal hierboven",
    },
    retention: {
      title: "Volg Café Nova",
      subtitle:
        "Acties, events en nieuws — tik op het kanaal dat jij gebruikt.",
      socialLinks: DEFAULT_SOCIAL_LINKS_DEMO,
    },
  },
  kapper: {
    id: "kapper",
    basePath: "/gast/kapper",
    barName: "Salon Nova",
    brandLabel: "BarBoost · Salon",
    dealPool: KAPPER_DEALS,
    unlockShowcase: KAPPER_UNLOCK,
    welcome: {
      title: "Jouw salon-voordeel",
      subtitle:
        "Scan de QR bij binnenkomst — open je mystery box met de knop en ontdek je prijs. Toon je voucher bij de balie. Geen app nodig.",
      badges: [
        { tone: "hot", text: "Alleen vandaag" },
        { tone: "info", text: "Afspraak aanbevolen" },
        { tone: "success", text: "Voor nieuwe én vaste klanten" },
      ],
      cta: "Start met prijzen",
      footerHint: "Gemiddeld onder een minuut",
    },
    unlock: {
      openingHint: "De mystery box opent…",
      boxIdleHint: "Klik op de knop hieronder om je mystery box te openen.",
      primaryCta: "Klik om te openen",
    },
    baseDeal: {
      upgradeHeadline: "🔥 Unlock betere deal 🔥",
      upgradeSubStandard: "Jouw prijs nu",
      upgradeSubUpgraded: "Met upgrade",
      phoneLabel: "Laat je nummer achter om de deal te activeren.",
      upgradeSubmit: "Activeer betere deal",
      skipUpgrade: "Nee, ik ga door met de standaardprijs hierboven",
    },
    retention: {
      title: "Volg Salon Nova",
      subtitle:
        "Inspiratie, voor- en na-foto’s en afspraken — vind ons op al onze kanalen.",
      socialLinks: DEFAULT_SOCIAL_LINKS_DEMO,
    },
  },
};

export function getGastTemplate(id: GastTemplateId): GastTemplate {
  return TEMPLATES[id];
}
