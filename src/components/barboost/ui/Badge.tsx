import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "hot" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-white/10 text-white/90 border-white/10",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-200 border-amber-500/35",
  hot: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/40",
  info: "bg-sky-500/15 text-sky-200 border-sky-500/35",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  pulse,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        pulse && "animate-pulse",
        className,
      )}
    >
      {children}
    </span>
  );
}
