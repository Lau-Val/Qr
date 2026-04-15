import { NextResponse } from "next/server";
import { requireCompanySession } from "@/lib/auth/require-company-session";
import {
  ensureConnectionRow,
  getConnectionByCompanyId,
} from "@/lib/whatsapp/connection-repository";

export const dynamic = "force-dynamic";

/**
 * GET — current WhatsApp connection for the signed-in company.
 * Query: ?bar=slug when the user has multiple bars.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const bar = url.searchParams.get("bar");
  const session = await requireCompanySession(bar);
  if (!session.ok) return session.response;

  try {
    const row =
      (await getConnectionByCompanyId(session.ctx.companyId)) ??
      (await ensureConnectionRow(session.ctx.companyId, "not_connected"));
    return NextResponse.json({ connection: row });
  } catch (e) {
    console.error("[whatsapp] GET connection", e);
    return NextResponse.json(
      { error: "Could not load WhatsApp connection." },
      { status: 500 },
    );
  }
}

type PostBody = {
  action?: "connecting" | "reset";
  barSlug?: string;
};

/**
 * POST — mark "connecting" before Embedded Signup, or reset local state.
 */
export async function POST(request: Request) {
  let body: PostBody = {};
  try {
    body = (await request.json()) as PostBody;
  } catch {
    body = {};
  }
  const session = await requireCompanySession(body.barSlug ?? null);
  if (!session.ok) return session.response;

  try {
    if (body.action === "reset") {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      await admin
        .from("whatsapp_connections")
        .update({
          status: "not_connected",
          onboarding_error: null,
          connection_health: "unknown",
          updated_at: new Date().toISOString(),
        })
        .eq("company_id", session.ctx.companyId);
      const row =
        (await getConnectionByCompanyId(session.ctx.companyId)) ??
        (await ensureConnectionRow(session.ctx.companyId, "not_connected"));
      return NextResponse.json({ connection: row });
    }

    const row = await ensureConnectionRow(session.ctx.companyId, "connecting");
    return NextResponse.json({ connection: row });
  } catch (e) {
    console.error("[whatsapp] POST connection", e);
    return NextResponse.json(
      { error: "Could not update connection state." },
      { status: 500 },
    );
  }
}
