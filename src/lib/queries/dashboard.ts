/** Re-export voor imports als `@/lib/queries/dashboard`. */
export {
  getDashboardData,
} from "@/lib/supabase/dashboard-data";
export type {
  DashboardData,
  DashboardPayload,
  DealRowStat,
  DashboardUnconfigured,
  PeriodKey,
  PeriodStats,
  QrRowStat,
  ReviewRow,
  VenueType,
} from "@/lib/dashboard/payload-types";
