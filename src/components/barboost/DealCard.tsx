import type { Deal } from "@/data/types";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/cn";

export function DealCard({
  deal,
  large,
  boosted,
  className,
}: {
  deal: Deal;
  large?: boolean;
  boosted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-gradient-to-br p-4 text-left ring-1 transition-all duration-300",
        boosted
          ? "border-violet-400/45 from-violet-950/45 to-[#0c0b14] shadow-[0_20px_50px_rgba(99,102,241,0.12)] ring-violet-500/25"
          : "border-white/10 from-white/10 to-white/[0.03] ring-white/5",
        large && "scale-[1.02] p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info" pulse={!!boosted}>
          {boosted ? "Extra zichtbaar" : deal.tag}
        </Badge>
        {boosted ? (
          <Badge tone="neutral" className="border-white/15 text-white/70">
            Voorrang in flow
          </Badge>
        ) : null}
      </div>
      <h3
        className={cn(
          "mt-3 font-bold tracking-tight text-white",
          large ? "text-2xl" : "text-xl",
        )}
      >
        {deal.title}
      </h3>
      <p className="mt-1 text-sm text-white/60">{deal.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/75">
        {deal.description}
      </p>
    </div>
  );
}
