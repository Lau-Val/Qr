import type { Deal } from "@/data/types";
import { Badge } from "./ui/Badge";
import { Timer } from "./ui/Timer";
import { cn } from "@/lib/cn";
import { BAR_NAME } from "@/data/bar";

export function VoucherCard({
  deal,
  used,
  code,
  isUpgraded,
}: {
  deal: Deal;
  used: boolean;
  code: string;
  /** Toon subtiele upgrade-strook */
  isUpgraded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border p-6 text-center shadow-xl transition-all duration-500",
        used
          ? "border-white/[0.08] bg-white/[0.02] opacity-55 grayscale"
          : "border-emerald-400/25 bg-gradient-to-b from-[#0f1f18] to-[#0a1210] ring-1 ring-emerald-500/15",
      )}
    >
      {isUpgraded && !used ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300/90">
          Geüpgraded deal
        </p>
      ) : (
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          BarBoost · voucher
        </p>
      )}
      <p className="mt-4 font-mono text-[1.65rem] font-bold tracking-[0.2em] text-white sm:text-3xl">
        {code}
      </p>
      <p className="mt-5 text-lg font-semibold leading-snug text-white">{deal.title}</p>
      <p className="mt-1.5 text-sm text-white/55">{deal.subtitle}</p>
      <p className="mt-4 text-xs text-white/45">Geldig bij {BAR_NAME}</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Badge tone={used ? "neutral" : "success"}>
          {used ? "Gebruikt" : "Actief"}
        </Badge>
        {!used ? (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span>Geldig nog</span>
            <Timer initialSeconds={deal.timerSeconds} className="!text-base text-emerald-200/90" />
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-white/35">
        1× per groep · Alleen vanavond zolang de timer loopt
      </p>
    </div>
  );
}
