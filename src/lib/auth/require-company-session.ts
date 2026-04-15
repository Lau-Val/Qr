import "server-only";
import { NextResponse } from "next/server";
import { getSessionUser, getVerifiedBarForUser } from "@/lib/auth/bar-session";

export type CompanySessionOk = {
  userId: string;
  companyId: string;
  barSlug: string;
};

/**
 * Resolves the tenant (company / bar) for API routes from session + optional bar slug.
 */
export async function requireCompanySession(
  barSlug?: string | null,
): Promise<{ ok: true; ctx: CompanySessionOk } | { ok: false; response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const bar = await getVerifiedBarForUser(user.id, barSlug?.trim() || null);
  if (!bar) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No company access for this account." },
        { status: 403 },
      ),
    };
  }
  return {
    ok: true,
    ctx: { userId: user.id, companyId: bar.companyId, barSlug: bar.slug },
  };
}
