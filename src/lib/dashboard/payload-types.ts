export type PeriodKey = "today" | "week" | "month";

export interface PeriodStats {
  scans: number;
  claims: number;
  upgrades: number;
  comebacks: number;
  whatsappOptIns: number;
  estimatedDealValue: number;
}

export interface QrRowStat {
  slug: string;
  label: string | null;
  scans: number;
  claims: number;
}

export interface DealRowStat {
  externalKey: string;
  title: string;
  claims: number;
}

export interface ReviewRow {
  author: string;
  text: string;
  rating: number;
  reviewDate: string;
}

export interface DashboardPayload {
  configured: true;
  barSlug: string;
  barName: string;
  periods: Record<PeriodKey, PeriodStats>;
  qrRows: QrRowStat[];
  dealRows: DealRowStat[];
  reviews: ReviewRow[];
}

export interface DashboardUnconfigured {
  configured: false;
  message: string;
}

export type DashboardData = DashboardPayload | DashboardUnconfigured;
