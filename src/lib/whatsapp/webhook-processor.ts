import "server-only";
import {
  findCompanyIdByPhoneNumberId,
  findCompanyIdByWabaId,
  getMessageRowByExternalId,
  insertInboundMessageStub,
  logConnectionEvent,
  touchWebhookReceived,
  updateMessageDeliveryState,
} from "@/lib/whatsapp/connection-repository";
import type { WhatsAppWebhookStatus } from "@/lib/whatsapp/types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function normalizeMetaStatus(s: string): WhatsAppWebhookStatus | null {
  const x = s.toLowerCase();
  if (x === "sent" || x === "delivered" || x === "read" || x === "failed") {
    return x;
  }
  return null;
}

/**
 * Processes WhatsApp Cloud API webhook JSON (messages / statuses / account updates).
 */
export async function processWhatsAppWebhookPayload(body: unknown): Promise<{
  handled: boolean;
  summary: string;
}> {
  const root = asRecord(body);
  if (!root) {
    await logConnectionEvent({
      companyId: null,
      eventType: "webhook_invalid_json",
      detail: { note: "Body was not an object." },
    });
    return { handled: false, summary: "invalid_root" };
  }

  if (root.object !== "whatsapp_business_account") {
    await logConnectionEvent({
      companyId: null,
      eventType: "webhook_unexpected_object",
      detail: { object: root.object },
    });
    return { handled: false, summary: "unexpected_object" };
  }

  const entries = root.entry;
  if (!Array.isArray(entries) || entries.length === 0) {
    return { handled: true, summary: "no_entries" };
  }

  let handledSomething = false;

  for (const ent of entries) {
    const entry = asRecord(ent);
    if (!entry) continue;
    const wabaFromEntry = typeof entry.id === "string" ? entry.id : undefined;
    const changes = entry.changes;
    if (!Array.isArray(changes)) continue;

    for (const ch of changes) {
      const change = asRecord(ch);
      if (!change) continue;
      const field = typeof change.field === "string" ? change.field : "";
      const value = asRecord(change.value);
      if (!value) continue;

      const metadata = asRecord(value.metadata);
      const phoneNumberId =
        metadata && typeof metadata.phone_number_id === "string"
          ? metadata.phone_number_id
          : typeof value.phone_number_id === "string"
            ? value.phone_number_id
            : undefined;

      let companyId: string | null = null;
      if (phoneNumberId) {
        companyId = await findCompanyIdByPhoneNumberId(phoneNumberId);
      }
      if (!companyId && wabaFromEntry) {
        companyId = await findCompanyIdByWabaId(wabaFromEntry);
      }

      if (companyId) {
        await touchWebhookReceived(companyId);
      }

      if (field === "messages" || value.statuses || value.messages) {
        handledSomething = true;
        await handleMessagingValue({
          companyId,
          wabaId: wabaFromEntry,
          phoneNumberId,
          value,
        });
      } else {
        await logConnectionEvent({
          companyId,
          eventType: "webhook_field_unhandled",
          detail: { field, keys: Object.keys(value) },
        });
      }
    }
  }

  return {
    handled: handledSomething,
    summary: handledSomething ? "processed" : "no_handled_changes",
  };
}

async function handleMessagingValue(input: {
  companyId: string | null;
  wabaId?: string;
  phoneNumberId?: string;
  value: Record<string, unknown>;
}): Promise<void> {
  const { companyId, value } = input;

  const statuses = Array.isArray(value.statuses) ? value.statuses : [];
  for (const st of statuses) {
    const s = asRecord(st);
    if (!s) continue;
    const id = typeof s.id === "string" ? s.id : null;
    const rawStatus = typeof s.status === "string" ? s.status : "";
    const mapped = normalizeMetaStatus(rawStatus);
    if (!id || !mapped || !companyId) {
      await logConnectionEvent({
        companyId,
        eventType: "status_skipped",
        detail: { id, rawStatus, companyId },
      });
      continue;
    }

    const row = await getMessageRowByExternalId(id);
    if (!row || row.company_id !== companyId) {
      await logConnectionEvent({
        companyId,
        eventType: "status_unknown_message",
        detail: { external_id: id, mapped },
      });
      continue;
    }

    await updateMessageDeliveryState({
      messageRowId: row.id,
      companyId,
      newStatus: mapped,
      errorMessage:
        mapped === "failed"
          ? JSON.stringify(s.errors ?? "delivery_failed")
          : null,
    });
  }

  const messages = Array.isArray(value.messages) ? value.messages : [];
  for (const msg of messages) {
    const m = asRecord(msg);
    if (!m || !companyId) continue;
    const from = typeof m.from === "string" ? m.from : null;
    const mid = typeof m.id === "string" ? m.id : undefined;
    if (!from) continue;
    await insertInboundMessageStub({
      companyId,
      phoneNumber: from,
      externalMessageId: mid,
    });
  }
}
