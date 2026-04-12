import { cn } from "@/lib/cn";

export function ToggleTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-2xl bg-black/40 p-1 ring-1 ring-white/10",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
            value === o.id
              ? "bg-gradient-to-r from-fuchsia-600/90 to-violet-600/90 text-white shadow-md"
              : "text-white/55 hover:text-white/80",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
