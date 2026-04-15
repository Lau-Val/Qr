import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  WhatsAppConnectionPublic,
  WhatsAppConnectionStatus,
  WhatsAppEmbeddedSignupPayload,
} from "@/lib/whatsapp/types";

function rowToPublic(r: Record<string, unknown>): WhatsAppConnectionPublic {
  return {
    id: String(r.id),
    companyId: String(r.company_id),
    status: r.status as WhatsAppConnectionPublic["status"],
    wabaId: (r.waba_id as string) ?? null,
    phoneNumberId: (r.phone_number_id as string) ?? null,
    businessPhoneNumber: (r.business_phone_number as string) ?? null,
    businessName: (r.business_name as string) ?? null,
    webhookSubscribed: Boolean(r.webhook_subscribed),
    qualityRating: (r.quality_rating as string) ?? null,
    lastSyncedAt: (r.last_synced_at as string) ?? null,
    lastWebhookReceivedAt: (r.last_webhook_received_at as string) ?? null,
    connectionHealth: r.connection_health as WhatsAppConnectionPublic["connectionHealth"],
    onboardingError: (r.onboarding_error as string) ?? null,
    updatedAt: String(r.updated_at),
  };
}

export async function getConnectionByCompanyId(
  companyId: string,
): Promise<WhatsAppConnectionPublic | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_connections")
    .select(
      "id, company_id, status, waba_id, phone_number_id, business_phone_number, business_name, webhook_subscribed, quality_rating, last_synced_at, last_webhook_received_at, connection_health, onboarding_error, updated_at",
    )
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToPublic(data as Record<string, unknown>);
}

export async function ensureConnectionRow(
  companyId: string,
  status: WhatsAppConnectionStatus,
): Promise<WhatsAppConnectionPublic> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("whatsapp_connections")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();
  if (existing) {
    const { data, error } = await admin
      .from("whatsapp_connections")
      .update({ status, onboarding_error: null, updated_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .select(
        "id, company_id, status, waba_id, phone_number_id, business_phone_number, business_name, webhook_subscribed, quality_rating, last_synced_at, last_webhook_received_at, connection_health, onboarding_error, updated_at",
      )
      .single();
    if (error) throw error;
    return rowToPublic(data as Record<string, unknown>);
  }
  const { data, error } = await admin
    .from("whatsapp_connections")
    .insert({
      company_id: companyId,
      status,
    })
    .select(
      "id, company_id, status, waba_id, phone_number_id, business_phone_number, business_name, webhook_subscribed, quality_rating, last_synced_at, last_webhook_received_at, connection_health, onboarding_error, updated_at",
    )
    .single();
  if (error) throw error;
  return rowToPublic(data as Record<string, unknown>);
}

export async function upsertConnectionFromOnboarding(input: {
  companyId: string;
  payload: WhatsAppEmbeddedSignupPayload;
  accessTokenEncrypted: Buffer | null;
}): Promise<WhatsAppConnectionPublic> {
  const { companyId, payload, accessTokenEncrypted } = input;
  const admin = createAdminClient();

  const wabaId = payload.wabaId?.trim() || null;
  const phoneNumberId = payload.phoneNumberId?.trim() || null;
  const businessPhoneNumber = payload.businessPhoneNumber?.trim() || null;
  const businessName = payload.businessName?.trim() || null;
  const metaBusinessId = payload.metaBusinessId?.trim() || null;
  const metaUserId = payload.metaUserId?.trim() || null;

  const hasCoreIds = Boolean(wabaId && phoneNumberId);
  const status: WhatsAppConnectionStatus = hasCoreIds
    ? "connected"
    : payload.cancelled
      ? "not_connected"
      : "error";

  const onboardingError = hasCoreIds
    ? null
    : payload.cancelled
      ? "Signup cancelled."
      : "Incomplete data from Meta (missing WhatsApp Business Account or phone number).";

  const now = new Date().toISOString();

  const row: Record<string, unknown> = {
    company_id: companyId,
    waba_id: payload.cancelled ? null : wabaId,
    phone_number_id: payload.cancelled ? null : phoneNumberId,
    business_phone_number: payload.cancelled ? null : businessPhoneNumber,
    business_name: payload.cancelled ? null : businessName,
    meta_business_id: payload.cancelled ? null : metaBusinessId,
    meta_user_id: payload.cancelled ? null : metaUserId,
    status,
    onboarding_error: onboardingError,
    last_synced_at: now,
    connection_health: hasCoreIds ? "ok" : "unknown",
    updated_at: now,
  };

  if (accessTokenEncrypted) {
    row.access_token_encrypted = accessTokenEncrypted;
    row.access_token_vault_ref = null;
  }

  const { data: existing } = await admin
    .from("whatsapp_connections")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await admin
      .from("whatsapp_connections")
      .update(row)
      .eq("company_id", companyId)
      .select(
        "id, company_id, status, waba_id, phone_number_id, business_phone_number, business_name, webhook_subscribed, quality_rating, last_synced_at, last_webhook_received_at, connection_health, onboarding_error, updated_at",
      )
      .single();
    if (error) throw error;
    return rowToPublic(data as Record<string, unknown>);
  }

  const { data, error } = await admin
    .from("whatsapp_connections")
    .insert(row)
    .select(
      "id, company_id, status, waba_id, phone_number_id, business_phone_number, business_name, webhook_subscribed, quality_rating, last_synced_at, last_webhook_received_at, connection_health, onboarding_error, updated_at",
    )
    .single();
  if (error) throw error;
  return rowToPublic(data as Record<string, unknown>);
}

export async function findCompanyIdByPhoneNumberId(
  phoneNumberId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_connections")
    .select("company_id")
    .eq("phone_number_id", phoneNumberId)
    .maybeSingle();
  if (error) throw error;
  return data?.company_id ?? null;
}

export async function findCompanyIdByWabaId(wabaId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_connections")
    .select("company_id")
    .eq("waba_id", wabaId)
    .maybeSingle();
  if (error) throw error;
  return data?.company_id ?? null;
}

export async function touchWebhookReceived(companyId: string): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin
    .from("whatsapp_connections")
    .update({
      last_webhook_received_at: now,
      connection_health: "ok",
      updated_at: now,
    })
    .eq("company_id", companyId);
}

export async function logConnectionEvent(input: {
  companyId: string | null;
  eventType: string;
  detail: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("whatsapp_connection_events").insert({
    company_id: input.companyId,
    event_type: input.eventType,
    detail: input.detail,
  });
  if (error) {
    console.error("[whatsapp] logConnectionEvent failed", error.message);
  }
}

export async function getMessageRowByExternalId(
  externalMessageId: string,
): Promise<{
  id: string;
  company_id: string;
  campaign_id: string | null;
  status: string;
} | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_messages")
    .select("id, company_id, campaign_id, status")
    .eq("external_message_id", externalMessageId)
    .maybeSingle();
  if (error) throw error;
  return data as {
    id: string;
    company_id: string;
    campaign_id: string | null;
    status: string;
  } | null;
}

export async function updateMessageDeliveryState(input: {
  messageRowId: string;
  companyId: string;
  newStatus: "sent" | "delivered" | "read" | "failed";
  errorMessage?: string | null;
}): Promise<{ previousStatus: string } | null> {
  const admin = createAdminClient();
  const { data: row, error: fetchErr } = await admin
    .from("whatsapp_messages")
    .select("id, status, campaign_id")
    .eq("id", input.messageRowId)
    .eq("company_id", input.companyId)
    .maybeSingle();
  if (fetchErr || !row) return null;
  const previousStatus = row.status as string;

  const ts = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: input.newStatus,
    updated_at: ts,
  };
  if (input.newStatus === "sent") patch.sent_at = ts;
  if (input.newStatus === "delivered") patch.delivered_at = ts;
  if (input.newStatus === "read") patch.read_at = ts;
  if (input.newStatus === "failed") {
    patch.failed_at = ts;
    patch.error_message = input.errorMessage ?? "Unknown error";
  }

  const { error } = await admin
    .from("whatsapp_messages")
    .update(patch)
    .eq("id", input.messageRowId);
  if (error) throw error;

  const campaignId = row.campaign_id as string | null;
  if (campaignId) {
    const col = campaignCounterField(previousStatus, input.newStatus);
    if (col) {
      await incrementCampaignField(admin, campaignId, col);
    }
  }

  return { previousStatus };
}

function campaignCounterField(
  previousStatus: string,
  next: "sent" | "delivered" | "read" | "failed",
): "sent_count" | "delivered_count" | "read_count" | "failed_count" | null {
  if (next === "sent" && previousStatus === "pending") return "sent_count";
  if (next === "delivered" && !["delivered", "read"].includes(previousStatus)) {
    return "delivered_count";
  }
  if (next === "read" && previousStatus !== "read") return "read_count";
  if (next === "failed" && previousStatus !== "failed") return "failed_count";
  return null;
}

async function incrementCampaignField(
  admin: ReturnType<typeof createAdminClient>,
  campaignId: string,
  field: "sent_count" | "delivered_count" | "read_count" | "failed_count",
): Promise<void> {
  const col = field;
  if (!col) return;
  const { data: cur } = await admin
    .from("whatsapp_campaigns")
    .select(col)
    .eq("id", campaignId)
    .maybeSingle();
  if (!cur) return;
  const next = Number((cur as Record<string, unknown>)[col] ?? 0) + 1;
  await admin
    .from("whatsapp_campaigns")
    .update({ [col]: next, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
}

export async function insertInboundMessageStub(input: {
  companyId: string;
  phoneNumber: string;
  externalMessageId?: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("whatsapp_messages").insert({
    company_id: input.companyId,
    phone_number: input.phoneNumber,
    external_message_id: input.externalMessageId ?? null,
    message_type: "inbound",
    status: "delivered",
    delivered_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[whatsapp] insertInboundMessageStub", error.message);
  }
}
