import type {
  ChartPoint,
  DashboardKpis,
  Deal,
  LiveAlert,
  LiveTonight,
  MockReview,
  MissedRevenue,
  MonthlyImpact,
  PeriodKey,
  UpgradeFunnelStats,
  WeekendReach,
  WhatsAppCampaignRow,
} from "@/data/types";

export type BarSettings = {
  subscriptionPriceMonthly?: number;
  missedRevenueRange?: { low: number; high: number };
  whatsappCampaignOverview?: {
    lastCampaign?: string;
    openRatePercent?: number;
    claimRatePercent?: number;
    estimatedRevenue?: number;
  };
  weekendReach?: Partial<WeekendReach>;
};

export type DashboardPayload = {
  bar: { id: string; slug: string; name: string; settings: BarSettings };
  deals: Deal[];
  kpisByPeriod: Record<PeriodKey, DashboardKpis>;
  upgradeFunnel: UpgradeFunnelStats;
  monthlyImpact: MonthlyImpact;
  missedRevenue: MissedRevenue;
  liveTonight: LiveTonight;
  weekendReach: WeekendReach;
  whatsappCampaignOverview: {
    contacts: number;
    lastCampaign: string;
    openRatePercent: number;
    claimRatePercent: number;
    estimatedRevenue: number;
  };
  scansPerDay: ChartPoint[];
  claimsPerDay: ChartPoint[];
  revenuePerDay: ChartPoint[];
  whatsappWeekendOptIns: ChartPoint[];
  reviewGrowth: ChartPoint[];
  reviews: MockReview[];
};
