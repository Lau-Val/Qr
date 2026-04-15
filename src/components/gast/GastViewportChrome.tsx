"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useGuestTheme } from "@/context/GuestThemeContext";

/** Buitenste viewport-kleur volgens gekozen gast-thema. */
export function GastViewportChrome({ children }: { children: ReactNode }) {
  const { palette } = useGuestTheme();

  return (
    <div
      className={cn(
        "bb-gast-viewport fixed inset-0 flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden overscroll-none transition-colors duration-500",
        palette.viewportBg,
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
