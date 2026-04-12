import { cn } from "@/lib/cn";

export function SuccessState({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-emerald-200">{title}</p>
      {subtitle ? (
        <p className="mt-2 text-xs text-emerald-100/80">{subtitle}</p>
      ) : null}
    </div>
  );
}
