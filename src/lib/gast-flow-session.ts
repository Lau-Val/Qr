import type { GastTemplateId } from "@/data/gast-templates";
import { getGastTemplate } from "@/data/gast-templates";
import type { Deal } from "@/data/types";
import { resolveDealById } from "@/lib/unlock-weighted-deal";

const SCHEMA = 1;

export type PersistedGastStep = "baseDeal" | "claim" | "retention";

export type GastFlowPersist = {
  v: typeof SCHEMA;
  dealId: string;
  step: PersistedGastStep;
  isUpgraded: boolean;
};

function storageKey(templateId: GastTemplateId) {
  return `bb_gast_flow_v${SCHEMA}_${templateId}`;
}

export function readGastFlowPersist(
  templateId: GastTemplateId,
): GastFlowPersist | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(templateId));
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<GastFlowPersist>;
    if (p.v !== SCHEMA || !p.dealId || !p.step) return null;
    if (!["baseDeal", "claim", "retention"].includes(p.step)) return null;
    return {
      v: SCHEMA,
      dealId: p.dealId,
      step: p.step as PersistedGastStep,
      isUpgraded: Boolean(p.isUpgraded),
    };
  } catch {
    return null;
  }
}

export function writeGastFlowPersist(
  templateId: GastTemplateId,
  data: Omit<GastFlowPersist, "v">,
) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    storageKey(templateId),
    JSON.stringify({ ...data, v: SCHEMA } satisfies GastFlowPersist),
  );
}

export function clearGastFlowPersist(templateId: GastTemplateId) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(templateId));
}

export function resolveDealFromPersist(
  templateId: GastTemplateId,
  p: GastFlowPersist,
): Deal | null {
  const tpl = getGastTemplate(templateId);
  const deal = resolveDealById(tpl.dealPool, p.dealId);
  return deal ?? null;
}
