import type { ChartPoint } from "@/data/types";
import { cn } from "@/lib/cn";

export function ChartCard({
  title,
  subtitle,
  data,
  color = "from-fuchsia-500 to-violet-500",
  className,
}: {
  title: string;
  subtitle?: string;
  data: ChartPoint[];
  color?: string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-white/45">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex h-36 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className={cn(
                  "w-full max-w-[28px] rounded-t-lg bg-gradient-to-t opacity-90",
                  color,
                )}
                style={{ height: `${Math.max(8, (d.value / max) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
