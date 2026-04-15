import type { ReactNode } from "react";
import { GuestThemeProvider } from "@/context/GuestThemeContext";
import { GastViewportChrome } from "@/components/gast/GastViewportChrome";
import { GastHtmlLock } from "./GastHtmlLock";

/**
 * Gast-flow: één schermhoogte, geen document-scroll — inhoud wordt in MobileShell verdeeld.
 * Thema (bar / salon / luxury / playful) via `?theme=` of localStorage `bb_guest_ui_theme`.
 */
export default function GastLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GastHtmlLock />
      <GuestThemeProvider>
        <GastViewportChrome>{children}</GastViewportChrome>
      </GuestThemeProvider>
    </>
  );
}
