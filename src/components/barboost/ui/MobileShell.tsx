import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function MobileShell({
  children,
  footer,
  className,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#06060a] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-3 sm:py-3">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[420px] flex-1 flex-col">
        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-b from-[#0e0e14] via-[#0a0a10] to-[#060608] shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
            className,
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pt-7">
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 border-t border-white/10 px-4 py-2 sm:px-5 sm:py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
