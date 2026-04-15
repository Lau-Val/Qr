import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/auth/require-company-session";
import {
  logConnectionEvent,
  upsertConnectionFromOnboarding,
} from "@/lib/whatsapp/connection-repository";
import type { WhatsAppEmbeddedSignupPayload } from "@/lib/whatsapp/types";
import { encryptAccessTokenIfConfigured } from "@/lib/whatsapp/token-store";

export const dynamic = "force-dynamic";

/**
 * POST — save Embedded Signup result. Tenant is always taken from the session (never from body.companyId).
 */
export async function POST(request: Request) {
  let body: WhatsAppEmbeddedSignupPayload = {};
  try {
    body = (await request.json()) as WhatsAppEmbeddedSignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const session = await requireCompanySession(body.barSlug ?? null);
  if (!session.ok) return session.response;

  const companyId = session.ctx.companyId;

  if (body.cancelled) {
    const connection = await upsertConnectionFromOnboarding({
      companyId,
      payload: { ...body, cancelled: true },
      accessTokenEncrypted: null,
    });
    await logConnectionEvent({
      companyId,
      eventType: "embedded_signup_cancelled",
      detail: {},
    });
    return NextResponse.json({ connection, warning: null as string | null });
  }

  let encrypted = null as Buffer | null;
  if (body.accessToken?.trim()) {
    encrypted = encryptAccessTokenIfConfigured(body.accessToken.trim());
    if (!encrypted) {
      await logConnectionEvent({
        companyId,
        eventType: "token_not_persisted_missing_encryption_key",
        detail: {
          note: "Set WHATSAPP_TOKEN_ENCRYPTION_KEY to store tokens at rest.",
        },
      });
    }
  }

  try {
    const connection = await upsertConnectionFromOnboarding({
      companyId,
      payload: body,
      accessTokenEncrypted: encrypted,
    });
    await logConnectionEvent({
      companyId,
      eventType: "embedded_signup_completed",
      detail: {
        hasWabaId: Boolean(body.wabaId),
        hasPhoneNumberId: Boolean(body.phoneNumberId),
        tokenStored: Boolean(encrypted),
      },
    });

    const warning =
      body.accessToken && !encrypted
        ? "Access token was not saved: configure WHATSAPP_TOKEN_ENCRYPTION_KEY for encrypted storage."
        : null;

    return NextResponse.json({ connection, warning });
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "message" in e ? String(e.message) : String(e);
    console.error("[whatsapp] onboarding upsert", e);
    await logConnectionEvent({
      companyId,
      eventType: "embedded_signup_failed",
      detail: { message: msg },
    });

    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        {
          error:
            "This WhatsApp number or Business Account is already linked to another venue. Contact support if this is a mistake.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not save WhatsApp connection. Try again." },
      { status: 500 },
    );
  }
}
