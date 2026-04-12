import { BAR_NAME } from "@/data/bar";
import { cn } from "@/lib/cn";

function CheckTicks() {
  return (
    <svg
      className="inline h-3.5 w-5 text-sky-200"
      viewBox="0 0 24 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 7l4 4 10-10M8 7l4 4 10-10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsAppPreview({
  message,
  time = "17:02",
  className,
}: {
  message: string;
  time?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-[#0b141a] shadow-inner",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#1f2c34] px-3 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]/20 text-lg">
          💬
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{BAR_NAME}</p>
          <p className="text-[11px] text-white/50">Zakelijk · laatst online zojuist</p>
        </div>
      </div>
      <div
        className="relative px-2 py-4"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 24px)",
          backgroundColor: "#0b141a",
        }}
      >
        <div className="mx-auto max-w-[92%]">
          <div className="flex justify-end">
            <div className="max-w-[95%] rounded-lg rounded-br-sm bg-[#005c4b] px-2.5 py-1.5 shadow-md ring-1 ring-black/20">
              <p className="whitespace-pre-line text-[13px] leading-snug text-white/95">
                {message}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-white/55">
                <span>{time}</span>
                <CheckTicks />
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/35">
            Dit is een visuele preview — geen echt WhatsApp-bericht
          </p>
        </div>
      </div>
    </div>
  );
}
