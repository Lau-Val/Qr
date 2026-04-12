import type { WhatsAppCampaignRow } from "@/data/types";
import { Badge } from "./ui/Badge";

export function CampaignCard({ c }: { c: WhatsAppCampaignRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{c.name}</h3>
        <Badge
          tone={
            c.status === "verzonden"
              ? "success"
              : c.status === "gepland"
                ? "info"
                : "warning"
          }
        >
          {c.status}
        </Badge>
      </div>
      <p className="text-xs text-white/45">Doelgroep: {c.targetGroup}</p>
      <p className="whitespace-pre-line rounded-xl bg-black/30 p-3 text-xs leading-relaxed text-white/70">
        {c.message}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-white/45">
        <span>Dag: {c.scheduledDay}</span>
        {c.expectedSendTime ? (
          <span>Verzenden: {c.expectedSendTime}</span>
        ) : null}
      </div>
    </div>
  );
}
