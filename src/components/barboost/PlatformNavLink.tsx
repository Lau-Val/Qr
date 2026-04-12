"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function PlatformNavLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/platform-access")
      .then((r) => r.json())
      .then((d: { show?: boolean }) => setShow(Boolean(d.show)))
      .catch(() => setShow(false));
  }, []);

  if (!show) return null;

  return (
    <Link
      href="/admin"
      className="rounded-xl px-3 py-2 text-sm font-medium text-amber-200/90 transition-colors hover:bg-amber-500/15"
    >
      Platformbeheer
    </Link>
  );
}
