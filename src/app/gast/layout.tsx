import type { ReactNode } from "react";
import { GastHtmlLock } from "./GastHtmlLock";

/**
 * Gast-flow: één schermhoogte, geen document-scroll — inhoud wordt in MobileShell verdeeld.
 */
export default function GastLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GastHtmlLock />
      <div className="bb-gast-viewport fixed inset-0 flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden overscroll-none bg-[#06060a]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </>
  );
}
