import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type MobileShellVariant = "dark" | "light" | "luxury" | "playful";

export function MobileShell({
  children,
  footer,
  className,
  variant = "dark",
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** `light` / `dark` = bestaand — `luxury` / `playful` = extra merkstijlen. */
  variant?: MobileShellVariant;
}) {
  const isLight = variant === "light";
  const isLuxury = variant === "luxury";
  const isPlayful = variant === "playful";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col px-1.5 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] sm:px-2 sm:py-2",
        isLuxury
          ? "bg-[#e8e2d8]"
          : isPlayful
            ? "bg-transparent"
            : isLight
              ? "bg-transparent"
              : "bg-[#06060a]",
      )}
    >
      <div className="mx-auto flex h-full min-h-0 min-w-0 w-full max-w-[420px] flex-1 flex-col">
        <div
          className={cn(
            "relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]",
            isLuxury &&
              "border border-[#dcd0c4]/90 bg-[#faf7f2] shadow-[0_16px_48px_rgba(45,40,30,0.08)]",
            isPlayful &&
              "border-2 border-fuchsia-500/45 bg-gradient-to-b from-[#2a0d42]/95 via-[#18082a]/98 to-[#0a0414] shadow-[0_0_40px_rgba(168,85,247,0.22),0_24px_48px_rgba(0,0,0,0.45)]",
            isLight &&
              !isLuxury &&
              !isPlayful &&
              "border border-stone-200/90 bg-gradient-to-b from-white via-[#faf9f7] to-[#f3efe8] shadow-[0_20px_48px_rgba(15,23,42,0.07)]",
            !isLight &&
              !isLuxury &&
              !isPlayful &&
              "border border-white/[0.07] bg-gradient-to-b from-[#0e0e14] via-[#0a0a10] to-[#060608] shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
            className,
          )}
        >
          <div
            className={cn(
              "bb-gast-step relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4",
              isLight && !isLuxury && !isPlayful && "text-stone-800",
              isLuxury && "text-[#3a342c] font-medium tracking-[0.02em]",
              isPlayful && "font-semibold tracking-wide text-white",
            )}
          >
            {children}
          </div>
          {footer ? (
            <div
              className={cn(
                "shrink-0 px-3 py-1.5 sm:px-4 sm:py-2",
                isLuxury && "border-t border-[#e0d6c8]/90",
                isPlayful && "border-t border-fuchsia-500/25",
                isLight && !isLuxury && !isPlayful && "border-t border-stone-200/80",
                !isLight && !isLuxury && !isPlayful && "border-t border-white/10",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
