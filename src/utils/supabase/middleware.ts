import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function superAdminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
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
    const email = user.email?.toLowerCase() ?? "";
    const isEnvAdmin = admins.length > 0 && admins.includes(email);
    let isDbAdmin = false;
    if (!isEnvAdmin && user.id) {
      const { data } = await supabase
        .from("platform_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      isDbAdmin = !!data;
    }
    const isPlatformAdmin = isEnvAdmin || isDbAdmin;
    if (
      isPlatformAdmin &&
      (!nextParam || nextParam === "/dashboard" || nextParam === "/platform")
    ) {
      next = "/admin";
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
    const email = user.email?.toLowerCase() ?? "";
    const isEnvAdmin = admins.length > 0 && admins.includes(email);
    let allowed = isEnvAdmin;
    if (!allowed && user.id) {
      const { data } = await supabase
        .from("platform_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      allowed = !!data;
    }
    if (!allowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
