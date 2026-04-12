import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function superAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Zaken-dashboard, campagnes, gast-flow — niet voor platformbeheerders. */
function isCustomerAppPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/campagnes") ||
    pathname.startsWith("/gast")
  );
}

/** next= query kan /dashboard?bar= zijn */
function isCustomerAppNext(next: string): boolean {
  const path = next.split("?")[0] ?? "";
  return isCustomerAppPath(path);
}

async function resolvePlatformAdmin(
  supabase: ReturnType<typeof createServerClient>,
  user: User,
  envAdmins: string[],
): Promise<boolean> {
  const email = user.email?.toLowerCase() ?? "";
  if (envAdmins.length > 0 && envAdmins.includes(email)) return true;
  if (!user.id) return false;
  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
}

/**
 * Auth-sessie verversen + route-bescherming (bar-dashboard + platform).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const admins = superAdminEmails();

  const isPlatformAdminPath = (p: string) =>
    p.startsWith("/platform") || p.startsWith("/admin");

  if (user && pathname === "/login") {
    const nextParam = request.nextUrl.searchParams.get("next")?.trim();
    let next = nextParam || "/dashboard";
    const isPa = await resolvePlatformAdmin(supabase, user, admins);
    if (isPa) {
      if (
        !nextParam ||
        nextParam === "/dashboard" ||
        nextParam === "/platform" ||
        isCustomerAppNext(next)
      ) {
        next = "/admin";
      }
    }
    return NextResponse.redirect(new URL(next, request.url));
  }

  const needsBarAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/campagnes");

  if (!user && needsBarAuth) {
    const u = new URL("/login", request.url);
    u.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(u);
  }

  if (!user && isPlatformAdminPath(pathname)) {
    const u = new URL("/login", request.url);
    u.searchParams.set("next", pathname.startsWith("/admin") ? "/admin" : "/platform");
    return NextResponse.redirect(u);
  }

  if (user && isPlatformAdminPath(pathname)) {
    const isAllowed = await resolvePlatformAdmin(supabase, user, admins);
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (user && isCustomerAppPath(pathname)) {
    const isPa = await resolvePlatformAdmin(supabase, user, admins);
    if (isPa) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return supabaseResponse;
}
