import type { ReactNode } from "react";

/**
 * Gast-flow: één schermhoogte, geen document-scroll — inhoud wordt in MobileShell verdeeld.
 */
export default function GastLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bb-gast-viewport fixed inset-0 flex min-h-0 w-full flex-col overflow-hidden overscroll-none bg-[#06060a]">
      {children}
    </div>
  );
}
