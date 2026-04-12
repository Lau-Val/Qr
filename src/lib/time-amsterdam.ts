/**
 * Fallback periode-grenzen (Europe/Amsterdam) als RPC `period_bounds_amsterdam` ontbreekt.
 */

function partsAmsterdam(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { y, m, day };
}

function amsterdamLocalToUtc(
  y: number,
  m: number,
  day: number,
  h: number,
  min: number,
  sec: number,
): Date {
  const pad = (n: number) => String(n).padStart(2, "0");
  const isoLocal = `${y}-${pad(m)}-${pad(day)}T${pad(h)}:${pad(min)}:${pad(sec)}`;
  const withOffset = new Date(`${isoLocal}+02:00`);
  if (!Number.isNaN(withOffset.getTime())) return withOffset;
  return new Date(`${isoLocal}+01:00`);
}

export function rangeTodayAmsterdam(now: Date = new Date()): { start: string; end: string } {
  const { y, m, day } = partsAmsterdam(now);
  const start = amsterdamLocalToUtc(y, m, day, 0, 0, 0);
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 1);
  return { start: start.toISOString(), end: next.toISOString() };
}

export function rangeWeekAmsterdam(now: Date = new Date()): { start: string; end: string } {
  const { y, m, day } = partsAmsterdam(now);
  const todayMidnight = amsterdamLocalToUtc(y, m, day, 0, 0, 0);
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
  }).format(now);
  const toMonday: Record<string, number> = {
    Mon: 0,
    Tue: -1,
    Wed: -2,
    Thu: -3,
    Fri: -4,
    Sat: -5,
    Sun: -6,
  };
  const deltaDays = toMonday[short] ?? 0;
  const mondayInstant = new Date(todayMidnight.getTime() + deltaDays * 24 * 60 * 60 * 1000);
  const { y: ym, m: mm, day: dm } = partsAmsterdam(mondayInstant);
  const start = amsterdamLocalToUtc(ym, mm, dm, 0, 0, 0);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function rangeMonthAmsterdam(now: Date = new Date()): { start: string; end: string } {
  const { y, m } = partsAmsterdam(now);
  const start = amsterdamLocalToUtc(y, m, 1, 0, 0, 0);
  const end =
    m === 12
      ? amsterdamLocalToUtc(y + 1, 1, 1, 0, 0, 0)
      : amsterdamLocalToUtc(y, m + 1, 1, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}
