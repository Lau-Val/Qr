export type DealCategory =
  | "bier"
  | "shots"
  | "cocktail"
  | "food"
  | "groep"
  | "comeback"
  | "retry";

export interface Deal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: DealCategory;
  tag: string;
  urgencyText: string;
  claimCode: string;
  popularityCount: number;
  timerSeconds: number;
  revenueImpactEstimate: number;
  conversionPercent?: number;
  claims?: number;
  insightLabel?:
    | "Beste omzet"
    | "Sterk deze week"
    | "Beste upsell"
    | "Beste comeback deal"
    | "Populair";
}

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  price: string;
}

export interface MockReview {
  id: string;
  text: string;
  author: string;
  rating: number;
  date: string;
}

export type LiveStatusLevel = "busy" | "medium" | "quiet";

export interface LiveAlert {
  id: string;
  message: string;
  tone: "tip" | "warning" | "hot";
}

export interface LiveTonight {
  scansLastHour: number;
  activeUsersNow: number;
  claimsLast30Min: number;
  topDealId: string;
  topDealTitle: string;
  topDealClaims: number;
  conversionTonightPercent: number;
  liveStatus: LiveStatusLevel;
  alerts: LiveAlert[];
}

export interface WeekendReach {
  whatsappContacts: number;
  expectedReachFriday: number;
  expectedReachSaturday: number;
  estimatedOpenRatePercent: number;
  estimatedClaimRatePercent: number;
  expectedExtraRevenueRange: string;
}

export interface MonthlyImpact {
  extraRevenue: number;
  avgSpendPerGuestExtra: number;
  repeatVisitPercent: number;
  newReviews: number;
  subscriptionPrice: number;
  roiMultiplier: number;
}

export interface MissedRevenue {
  rangeLow: number;
  rangeHigh: number;
}

export interface DashboardKpis {
  scans: number;
  claims: number;
  conversionPercent: number;
  estimatedExtraRevenue: number;
  comebackActivations: number;
  whatsappOptIns: number;
  newGoogleReviews: number;
  avgReviewScore: number;
  /** Basisdeals ingewisseld (zonder upgrade) */
  baseDealsClaimed: number;
  /** Deals met upgrade geactiveerd */
  upgradesActivated: number;
  /** Telefoonnummers verzameld */
  phonesCollected: number;
  /** Privé feedback inzendingen */
  feedbackSubmissions: number;
  /** Reviews via flow (mock) */
  reviewsViaFlow: number;
}

/** Funnel upgrade — mock percentages */
export interface UpgradeFunnelStats {
  pctTakesUpgrade: number;
  pctLeavesPhone: number;
  pctUsesFeedbackOrReview: number;
}

export type PeriodKey = "today" | "week" | "month";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface WhatsAppCampaignRow {
  id: string;
  name: string;
  targetGroup: string;
  scheduledDay: string;
  message: string;
  status: "gepland" | "verzonden" | "concept";
  sentCount: number;
  openRate: number;
  claimRate: number;
  estimatedRevenue: number;
  expectedSendTime?: string;
}

export interface CampaignTemplate {
  id: string;
  label: string;
  body: string;
}
