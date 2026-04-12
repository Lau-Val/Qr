"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function Timer({
  initialSeconds,
  className,
}: {
  initialSeconds: number;
  className?: string;
}) {
  const [s, setS] = useState(initialSeconds);

  useEffect(() => {
    setS(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    const t = setInterval(() => {
      setS((x) => (x <= 0 ? 0 : x - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [initialSeconds]);

  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");

  return (
    <div
      className={cn(
        "tabular-nums text-lg font-bold tracking-tight text-violet-200/95",
        s < 120 && "text-amber-200/95",
        className,
      )}
    >
      {mm}:{ss}
    </div>
  );
}
