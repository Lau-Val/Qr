import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/bar-session";
import { isSuperAdminEmail } from "@/lib/auth/super-admin";

export async function GET() {
  const user = await getSessionUser();
  if (!user?.email) {
    return NextResponse.json({ show: false });
  }
  return NextResponse.json({ show: isSuperAdminEmail(user.email) });
}
