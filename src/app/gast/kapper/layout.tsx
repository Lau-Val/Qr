import type { ReactNode } from "react";

/** Lichte achtergrond rondom de telefoon-shell — rustiger / vertrouwen. */
export default function KapperGastLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col bg-transparent">
      {children}
    </div>
  );
}
