import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/bar-session";
import { isPlatformAdminUser } from "@/lib/auth/platform-admin";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ show: false });
  }
  return NextResponse.json({ show: await isPlatformAdminUser(user) });
}
