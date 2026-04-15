import { NextResponse } from "next/server";
import { verifyMetaWebhookSignature } from "@/lib/whatsapp/meta-signature";
import { processWhatsAppWebhookPayload } from "@/lib/whatsapp/webhook-processor";

export const dynamic = "force-dynamic";

/**
 * GET — Meta webhook verification (hub challenge).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  if (!expected) {
    console.error("[whatsapp] WHATSAPP_WEBHOOK_VERIFY_TOKEN is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  if (mode === "subscribe" && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST — WhatsApp event notifications (statuses, inbound messages, etc.).
 */
export async function POST(request: Request) {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret) {
    console.error("[whatsapp] META_APP_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256");

  if (!verifyMetaWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let json: unknown = null;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await processWhatsAppWebhookPayload(json);
  } catch (e) {
    console.error("[whatsapp] webhook processor", e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
