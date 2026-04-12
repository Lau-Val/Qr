import type {
  ChartPoint,
  DashboardKpis,
  LiveTonight,
  MissedRevenue,
  MonthlyImpact,
  PeriodKey,
  UpgradeFunnelStats,
  WeekendReach,
} from "@/data/types";

export interface DashboardMetricsCharts {
  scansPerDay: ChartPoint[];
  claimsPerDay: ChartPoint[];
  revenuePerDay: ChartPoint[];
  whatsappWeekendOptIns: ChartPoint[];
  reviewGrowth: ChartPoint[];
}

export interface WhatsappCampaignOverviewPayload {
  contacts: number;
  lastCampaign: string;
  openRatePercent: number;
  claimRatePercent: number;
  estimatedRevenue: number;
}

export interface WeekendCampaignSummaryPayload {
  activeContacts: number;
  lastCampaign: string;
  openRateLabel: string;
  claimRateLabel: string;
}

/** JSON stored in `bar_dashboard_metrics.payload` */
export interface DashboardMetricsPayload {
  referenceDateIso?: string;
  kpisByPeriod: Record<PeriodKey, DashboardKpis>;
  upgradeFunnel: UpgradeFunnelStats;
  liveTonight: LiveTonight;
  missedRevenue: MissedRevenue;
  monthlyImpact: MonthlyImpact;
  weekendReach: WeekendReach;
  charts: DashboardMetricsCharts;
  whatsappCampaignOverview: WhatsappCampaignOverviewPayload;
  weekendCampaignSummary?: WeekendCampaignSummaryPayload;
}
