"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VenueType } from "@/lib/dashboard/payload-types";
import { cn } from "@/lib/cn";
import { PlatformNavLink } from "@/components/barboost/PlatformNavLink";
import { SignOutButton } from "@/components/barboost/SignOutButton";

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/gast") return pathname === "/gast" || pathname.startsWith("/gast/unlock");
  if (href === "/gast/kapper") return pathname.startsWith("/gast/kapper");
  return pathname.startsWith(href);
}

function navItemsForVenue(venueType: VenueType) {
  const core = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/beheer", label: "Dealbeheer" },
    { href: "/campagnes", label: "Campagnes" },
  ] as const;
  if (venueType === "kapper") {
    return [
      ...core,
      { href: "/gast/kapper", label: "Gast-flow (salon)" },
      { href: "/gast", label: "Gast-flow (bar-demo)" },
    ];
  }
  return [
    ...core,
    { href: "/gast", label: "Gast-flow (bar)" },
    { href: "/gast/kapper", label: "Gast-flow (salon-demo)" },
  ];
}

export function AdminShell({
  children,
  venueType = "horeca",
}: {
  children: React.ReactNode;
  /** `kapper` = licht wit/stone thema; `horeca` = donker bar-thema. */
  venueType?: VenueType;
}) {
  const pathname = usePathname();
  const light = venueType === "kapper";
  const NAV = navItemsForVenue(venueType);

  return (
    <div
      className={cn(
        "flex min-h-dvh",
        light ? "bg-[#f0eeeb] text-stone-900" : "bg-[#07060f] text-white",
      )}
    >
      <aside
        className={cn(
          "hidden min-h-dvh w-52 shrink-0 flex-col px-3 py-6 md:flex",
          light
            ? "border-r border-stone-200 bg-white shadow-sm"
            : "border-r border-white/10 bg-[#0c0b14]",
        )}
      >
        <p
          className={cn(
            "px-2 text-[10px] font-semibold uppercase tracking-[0.35em]",
            light ? "text-rose-800/70" : "text-fuchsia-300/70",
          )}
        >
          BarBoost
        </p>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  light
                    ? active
                      ? "bg-stone-200/90 text-stone-900"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    : active
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div
          className={cn(
            "mt-auto border-t pt-4",
            light ? "border-stone-200" : "border-white/10",
          )}
        >
          <PlatformNavLink light={light} />
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <nav
          className={cn(
            "flex shrink-0 items-center gap-1 overflow-x-auto px-2 py-2 md:hidden",
            light
              ? "border-b border-stone-200 bg-white/95"
              : "border-b border-white/10 bg-[#0b0a12]/95",
          )}
          aria-label="Hoofdnavigatie"
        >
          <PlatformNavLink light={light} />
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  light
                    ? active
                      ? "bg-stone-800 text-white"
                      : "text-stone-600 hover:bg-stone-100"
                    : active
                      ? "bg-white text-black"
                      : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">{children}</div>
          <footer
            className={cn(
              "shrink-0 border-t px-4 py-8",
              light ? "border-stone-200 bg-white" : "border-white/10 bg-[#07060f]",
            )}
          >
            <div className="mx-auto max-w-md">
              <SignOutButton fullWidth light={light} />
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
