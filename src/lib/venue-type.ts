import type { VenueType } from "@/lib/dashboard/payload-types";

export function parseVenueType(raw: string | null | undefined): VenueType {
  return String(raw ?? "").trim().toLowerCase() === "kapper"
    ? "kapper"
    : "horeca";
}
