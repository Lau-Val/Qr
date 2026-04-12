"use client";

import { useEffect } from "react";

/**
 * Voorkomt document-/body-scroll op gast-routes (iOS Safari e.d.),
 * naast de fixed viewport-wrapper.
 */
export function GastHtmlLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.classList.add("bb-gast-lock");
    body.classList.add("bb-gast-lock");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.classList.remove("bb-gast-lock");
      body.classList.remove("bb-gast-lock");
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);
  return null;
}
