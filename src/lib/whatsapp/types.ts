/**
 * Types for WhatsApp Business Platform (Embedded Signup + Cloud API).
 * company_id in the database maps to public.bars.id (tenant).
 */

export type WhatsAppConnectionStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export type WhatsAppConnectionHealth = "ok" | "degraded" | "unknown";

export type WhatsAppCampaignStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "completed"
  | "cancelled"
  | "failed";

export type WhatsAppMessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type RecipientOptInStatus = "unknown" | "opted_in" | "opted_out";

/** Row shape for public.whatsapp_connections (subset for API responses). */
export type WhatsAppConnectionRow = {
  id: string;
  company_id: string;
  waba_id: string | null;
  phone_number_id: string | null;
  business_phone_number: string | null;
  business_name: string | null;
  status: WhatsAppConnectionStatus;
  access_token_vault_ref: string | null;
  webhook_subscribed: boolean;
  quality_rating: string | null;
  meta_business_id: string | null;
  meta_user_id: string | null;
  graph_api_version: string;
  last_synced_at: string | null;
  last_webhook_received_at: string | null;
  connection_health: WhatsAppConnectionHealth;
  onboarding_error: string | null;
  created_at: string;
  updated_at: string;
};

/** Safe fields returned to the browser (no tokens). */
export type WhatsAppConnectionPublic = {
  id: string;
  companyId: string;
  status: WhatsAppConnectionStatus;
  /** WhatsApp Business Account ID from Meta */
  wabaId: string | null;
  phoneNumberId: string | null;
  businessPhoneNumber: string | null;
  businessName: string | null;
  webhookSubscribed: boolean;
  qualityRating: string | null;
  lastSyncedAt: string | null;
  lastWebhookReceivedAt: string | null;
  connectionHealth: WhatsAppConnectionHealth;
  onboardingError: string | null;
  updatedAt: string;
};

/** Client → server payload after Embedded Signup (flexible / partial). */
export type WhatsAppEmbeddedSignupPayload = {
  /** Ignored by API — tenant comes from the signed-in session. */
  companyId?: string;
  /** Bar slug when the user belongs to multiple venues */
  barSlug?: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessPhoneNumber?: string;
  businessName?: string;
  metaBusinessId?: string;
  metaUserId?: string;
  /** Short-lived user token from FB.login — handled server-side only; never logged in full. */
  accessToken?: string;
  /** Raw extras from FB SDK / postMessage for debugging (optional). */
  raw?: Record<string, unknown>;
  /** User closed popup or cancelled */
  cancelled?: boolean;
};

export type WhatsAppWebhookStatus = "sent" | "delivered" | "read" | "failed";

export type ParsedWebhookEvent = {
  phoneNumberId?: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  statuses?: Array<{
    id: string;
    status: WhatsAppWebhookStatus;
    timestamp?: string;
    errors?: unknown[];
  }>;
  inboundMessages?: Array<{
    from: string;
    id?: string;
    type?: string;
    timestamp?: string;
  }>;
};
