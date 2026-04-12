import type {
  ChartPoint,
  DashboardKpis,
  LiveTonight,
  MissedRevenue,
  MonthlyImpact,
  PeriodKey,
  UpgradeFunnelStats,
  WeekendReach,
} from "../types";

export const upgradeFunnel: UpgradeFunnelStats = {
  pctTakesUpgrade: 58,
  pctLeavesPhone: 38,
  pctUsesFeedbackOrReview: 26,
};

export const kpisByPeriod: Record<PeriodKey, DashboardKpis> = {
  today: {
    scans: 428,
    claims: 163,
    conversionPercent: 38,
    estimatedExtraRevenue: 240,
    comebackActivations: 71,
    whatsappOptIns: 52,
    newGoogleReviews: 3,
    avgReviewScore: 4.6,
    baseDealsClaimed: 58,
    upgradesActivated: 105,
    phonesCollected: 89,
    feedbackSubmissions: 34,
    reviewsViaFlow: 52,
  },
  week: {
    scans: 2840,
    claims: 1092,
    conversionPercent: 38,
    estimatedExtraRevenue: 1310,
    comebackActivations: 412,
    whatsappOptIns: 214,
    newGoogleReviews: 12,
    avgReviewScore: 4.55,
    baseDealsClaimed: 380,
    upgradesActivated: 712,
    phonesCollected: 520,
    feedbackSubmissions: 210,
    reviewsViaFlow: 340,
  },
  month: {
    scans: 11200,
    claims: 4280,
    conversionPercent: 38,
    estimatedExtraRevenue: 5240,
    comebackActivations: 1680,
    whatsappOptIns: 892,
    newGoogleReviews: 28,
    avgReviewScore: 4.52,
    baseDealsClaimed: 1520,
    upgradesActivated: 2760,
    phonesCollected: 1980,
    feedbackSubmissions: 820,
    reviewsViaFlow: 1320,
  },
};

/** Zelfde extra omzet als KPI "Deze maand" (geschatte extra omzet). */
export const monthlyImpact: MonthlyImpact = {
  extraRevenue: 5240,
  avgSpendPerGuestExtra: 4.2,
  repeatVisitPercent: 27,
  newReviews: 28,
  subscriptionPrice: 349,
  roiMultiplier: 15,
};

export const missedRevenue: MissedRevenue = {
  rangeLow: 3200,
  rangeHigh: 7800,
};

export const liveTonight: LiveTonight = {
  scansLastHour: 47,
  activeUsersNow: 23,
  claimsLast30Min: 12,
  topDealId: "d6",
  topDealTitle: "2 cocktails voor €10",
  topDealClaims: 34,
  conversionTonightPercent: 41,
  liveStatus: "busy",
  alerts: [
    {
      id: "a1",
      message:
        "Cocktaildeal converteert 42% — zet deze deal extra in vanavond.",
      tone: "tip",
    },
    {
      id: "a2",
      message: "Weinig activiteit na 01:00 — activeer een korte nachtdeal.",
      tone: "warning",
    },
    {
      id: "a3",
      message:
        "Shots-deal presteert sterk bij groepen — overweeg deze in de late shift te benadrukken.",
      tone: "hot",
    },
  ],
};

export const weekendReach: WeekendReach = {
  whatsappContacts: 214,
  expectedReachFriday: 182,
  expectedReachSaturday: 198,
  estimatedOpenRatePercent: 87,
  estimatedClaimRatePercent: 22,
  expectedExtraRevenueRange: "€600 – €1.200",
};

export const scansPerDay: ChartPoint[] = [
  { label: "Ma", value: 120 },
  { label: "Di", value: 95 },
  { label: "Wo", value: 110 },
  { label: "Do", value: 140 },
  { label: "Vr", value: 280 },
  { label: "Za", value: 310 },
  { label: "Zo", value: 160 },
];

export const claimsPerDay: ChartPoint[] = [
  { label: "Ma", value: 42 },
  { label: "Di", value: 35 },
  { label: "Wo", value: 40 },
  { label: "Do", value: 52 },
  { label: "Vr", value: 108 },
  { label: "Za", value: 118 },
  { label: "Zo", value: 58 },
];

export const revenuePerDay: ChartPoint[] = [
  { label: "Ma", value: 420 },
  { label: "Di", value: 360 },
  { label: "Wo", value: 390 },
  { label: "Do", value: 510 },
  { label: "Vr", value: 920 },
  { label: "Za", value: 980 },
  { label: "Zo", value: 540 },
];

export const whatsappWeekendOptIns: ChartPoint[] = [
  { label: "Week 1", value: 38 },
  { label: "Week 2", value: 44 },
  { label: "Week 3", value: 41 },
  { label: "Week 4", value: 52 },
];

export const reviewGrowth: ChartPoint[] = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 48 },
  { label: "Mrt", value: 55 },
  { label: "Apr", value: 62 },
];

/** WhatsApp campagnes — samenvatting voor dashboard */
export const whatsappCampaignOverview = {
  contacts: 214,
  lastCampaign: "Vrijdag: eerste ronde 50%",
  openRatePercent: 87,
  claimRatePercent: 22,
  estimatedRevenue: 1180,
};
