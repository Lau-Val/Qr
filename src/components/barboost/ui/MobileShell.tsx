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
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#06060a] px-1.5 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] sm:px-2 sm:py-2">
      <div className="mx-auto flex h-full min-h-0 min-w-0 w-full max-w-[420px] flex-1 flex-col">
        <div
          className={cn(
            "relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-gradient-to-b from-[#0e0e14] via-[#0a0a10] to-[#060608] shadow-[0_24px_64px_rgba(0,0,0,0.55)] sm:rounded-[1.75rem]",
            className,
          )}
        >
          <div className="bb-gast-step relative flex h-full min-h-0 max-h-full min-w-0 flex-1 flex-col overflow-hidden px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-4">
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 border-t border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
