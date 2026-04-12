import type { MockReview } from "@/data/types";

export function ReviewCard({ r }: { r: MockReview }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{r.author}</p>
        <p className="text-xs text-amber-300">{"★".repeat(r.rating)}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{r.text}</p>
      <p className="mt-2 text-xs text-white/40">{r.date}</p>
    </div>
  );
}
