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

  if (user && pathname === "/login") {
    const next =
      request.nextUrl.searchParams.get("next")?.trim() || "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  const needsBarAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/campagnes");

  if (!user && needsBarAuth) {
    const u = new URL("/login", request.url);
    u.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(u);
  }

  if (!user && pathname.startsWith("/platform")) {
    const u = new URL("/login", request.url);
    u.searchParams.set("next", "/platform");
    return NextResponse.redirect(u);
  }

  if (user && pathname.startsWith("/platform")) {
    const email = user.email?.toLowerCase() ?? "";
    if (!admins.length || !admins.includes(email)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
