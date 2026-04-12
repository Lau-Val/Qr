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
    <div className="flex min-h-dvh flex-col bg-[#06060a] px-3 py-6 sm:px-0">
      <div className="mx-auto flex min-h-0 w-full max-w-[420px] flex-1 flex-col">
        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-b from-[#0e0e14] via-[#0a0a10] to-[#060608] shadow-[0_24px_64px_rgba(0,0,0,0.55)]",
            className,
          )}
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-9">
            {children}
          </div>
          {footer ? (
            <div className="border-t border-white/10 px-5 py-3">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
