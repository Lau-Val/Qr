"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Demo home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/beheer", label: "Dealbeheer" },
  { href: "/campagnes", label: "Campagnes" },
  { href: "/gast", label: "Gastflow" },
] as const;

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-[#07060f] text-white">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-white/10 bg-[#0c0b14] px-3 py-6 md:flex">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-fuchsia-300/70">
          BarBoost
        </p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0b0a12]/95 px-3 py-2 md:hidden"
          aria-label="Demo navigatie"
        >
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-white text-black"
                    : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </div>
  );
}
