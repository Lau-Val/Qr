import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/auth/require-company-session";
import { getConnectionByCompanyId } from "@/lib/whatsapp/connection-repository";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/graph-api";
import { loadDecryptedAccessTokenForCompany } from "@/lib/whatsapp/token-store";

export const dynamic = "force-dynamic";

type PostBody = {
  /** E.164 preferred */
  to?: string;
  barSlug?: string;
  body?: string;
};

/**
 * POST — send a test text message via the Cloud API (requires stored token + phone_number_id).
 */
export async function POST(request: Request) {
  let body: PostBody = {};
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await requireCompanySession(body.barSlug ?? null);
  if (!session.ok) return session.response;

  const to = body.to?.trim();
  if (!to) {
    return NextResponse.json(
      { error: "Enter a phone number (international format)." },
      { status: 400 },
    );
  }

  const connection = await getConnectionByCompanyId(session.ctx.companyId);
  if (!connection || connection.status !== "connected") {
    return NextResponse.json(
      { error: "WhatsApp is not connected yet." },
      { status: 400 },
    );
  }
  if (!connection.phoneNumberId) {
    return NextResponse.json(
      { error: "Missing phone number ID on this connection." },
      { status: 400 },
    );
  }

  const token = await loadDecryptedAccessTokenForCompany(session.ctx.companyId);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "No access token on file. Complete Embedded Signup with WHATSAPP_TOKEN_ENCRYPTION_KEY set so the token can be stored encrypted.",
      },
      { status: 400 },
    );
  }

  const text =
    body.body?.trim() ||
    "Test message from BarBoost — your WhatsApp connection works.";

  const result = await sendWhatsAppTextMessage({
    phoneNumberId: connection.phoneNumberId,
    accessToken: token,
    to,
    body: text,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Meta API error", detail: result.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, messageId: result.messageId ?? null });
}
