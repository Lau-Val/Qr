"use client";

import { useGuestTheme } from "@/context/GuestThemeContext";
import { GUEST_UI_THEMES } from "@/lib/guest-ui-theme";
import { cn } from "@/lib/cn";

const LABELS: Record<(typeof GUEST_UI_THEMES)[number], string> = {
  bar: "Bar",
  salon: "Salon",
  luxury: "Luxury",
  playful: "Playful",
};

/**
 * Compacte themakiezer — past alleen visuele stijl aan (`?theme=` + localStorage).
 */
export function GuestThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, palette } = useGuestTheme();
  const lightChrome = palette.retentionLightSurface;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 rounded-2xl border px-2 py-1.5 backdrop-blur-sm",
        lightChrome
          ? "border-stone-300/60 bg-white/85 shadow-sm"
          : "border-white/15 bg-black/45",
        className,
      )}
    >
      <span
        className={cn(
          "text-[9px] font-medium uppercase tracking-wider",
          lightChrome ? "text-stone-500" : "text-white/45",
        )}
      >
        Thema
      </span>
      {GUEST_UI_THEMES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={cn(
            "rounded-lg px-2 py-1 text-[10px] font-semibold transition",
            lightChrome
              ? theme === t
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
              : theme === t
                ? "bg-white/20 text-white"
                : "text-white/50 hover:bg-white/10 hover:text-white/85",
          )}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  );
}
