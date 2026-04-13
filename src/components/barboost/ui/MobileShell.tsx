import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function MobileShell({
  children,
  footer,
  className,
  variant = "dark",
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** `light`: wit/crème (o.a. salon-gastflow) — `dark`: standaard BarBoost. */
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col px-1.5 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] sm:px-2 sm:py-2",
        isLight ? "bg-transparent" : "bg-[#06060a]",
      )}
    >
      <div className="mx-auto flex h-full min-h-0 min-w-0 w-full max-w-[420px] flex-1 flex-col">
        <div
          className={cn(
            "relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem]",
            isLight
              ? "border border-stone-200/90 bg-gradient-to-b from-white via-[#faf9f7] to-[#f3efe8] shadow-[0_20px_48px_rgba(15,23,42,0.07)]"
              : "border border-white/[0.07] bg-gradient-to-b from-[#0e0e14] via-[#0a0a10] to-[#060608] shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
            className,
          )}
        >
          <div
            className={cn(
              "bb-gast-step relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4",
              isLight && "text-stone-800",
            )}
          >
            {children}
          </div>
          {footer ? (
            <div
              className={cn(
                "shrink-0 px-3 py-1.5 sm:px-4 sm:py-2",
                isLight ? "border-t border-stone-200/80" : "border-t border-white/10",
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
