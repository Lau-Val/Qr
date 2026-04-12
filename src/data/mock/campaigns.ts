import type { CampaignTemplate, WhatsAppCampaignRow } from "../types";
import { BAR_NAME } from "../bar";

/** Templates met placeholders {{deal}} {{tijd}} {{extra}} {{bar}} */
export const slotTemplates = [
  {
    id: "slot1",
    label: "Vanavond — standaard",
    pattern:
      "Vanavond bij {{bar}}: {{deal}} tot {{tijd}}. Laat dit bericht zien aan de bar.",
  },
  {
    id: "slot2",
    label: "Zaterdag — kort",
    pattern:
      "Zaterdagdeal bij {{bar}}: {{deal}}. Alleen vanavond geldig tot {{tijd}}. {{extra}}",
  },
  {
    id: "slot3",
    label: "Comeback",
    pattern:
      "Kom je vanavond terug? Laat dit bericht zien en pak: {{deal}}. {{extra}}",
  },
] as const;

export function renderSlotMessage(
  pattern: string,
  vars: { deal: string; tijd: string; extra: string; bar?: string },
): string {
  const bar = vars.bar ?? BAR_NAME;
  return pattern
    .replace(/\{\{bar\}\}/g, bar)
    .replace(/\{\{deal\}\}/g, vars.deal.trim())
    .replace(/\{\{tijd\}\}/g, vars.tijd.trim())
    .replace(/\{\{extra\}\}/g, vars.extra.trim())
    .trim();
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: "t1",
    label: "Eerste ronde 50%",
    body: `Vanavond bij ${BAR_NAME}: 50% korting op je eerste ronde tot 22:00. Laat dit bericht zien aan de bar.`,
  },
  {
    id: "t2",
    label: "Gratis shot",
    body: `Zaterdagdeal: gratis shot bij je eerste bestelling. Alleen vanavond geldig bij ${BAR_NAME}.`,
  },
  {
    id: "t3",
    label: "Groepsdeal",
    body: `Kom je met 3 vrienden? Dan unlock je vanavond een groepsdeal aan de bar. Laat dit bericht zien.`,
  },
];

export const campaignOverview: WhatsAppCampaignRow[] = [
  {
    id: "c1",
    name: "Vrijdag Shot Deal",
    targetGroup: "Alle eerdere gasten",
    scheduledDay: "Vrijdag",
    message: `Vanavond bij ${BAR_NAME}:\n2 cocktails voor €10 tot 22:30.\nLaat dit bericht zien aan de bar.`,
    status: "verzonden",
    sentCount: 182,
    openRate: 87,
    claimRate: 22,
    estimatedRevenue: 620,
    expectedSendTime: "Vrijdag 17:00",
  },
  {
    id: "c2",
    name: "Zaterdag Gratis Shot",
    targetGroup: "Recente bezoekers",
    scheduledDay: "Zaterdag",
    message: `Zaterdag bij ${BAR_NAME}: gratis shot bij eerste bestelling. Alleen vanavond.`,
    status: "gepland",
    sentCount: 0,
    openRate: 0,
    claimRate: 0,
    estimatedRevenue: 0,
    expectedSendTime: "Zaterdag 16:30",
  },
  {
    id: "c3",
    name: "Event: Koningsnacht",
    targetGroup: "Comeback-activaties",
    scheduledDay: "Beide",
    message: `Koningsnacht bij ${BAR_NAME} — groepsdeal bij 4+ personen. Laat dit bericht zien.`,
    status: "concept",
    sentCount: 0,
    openRate: 0,
    claimRate: 0,
    estimatedRevenue: 0,
    expectedSendTime: "N.t.b.",
  },
];

export const campaignResultsHistory = [
  {
    id: "h1",
    name: "Vrijdag 50% eerste ronde",
    sent: 182,
    opened: 154,
    clicked: 89,
    claimed: 37,
    revenue: 620,
  },
  {
    id: "h2",
    name: "Zaterdag 2 cocktails",
    sent: 198,
    opened: 168,
    clicked: 94,
    claimed: 41,
    revenue: 710,
  },
];
