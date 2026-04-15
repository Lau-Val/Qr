import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptWhatsAppToken, encryptWhatsAppToken } from "@/lib/whatsapp/token-crypto";

function byteaToBuffer(v: unknown): Buffer | null {
  if (v == null) return null;
  if (Buffer.isBuffer(v)) return v;
  if (v instanceof Uint8Array) return Buffer.from(v);
  if (typeof v === "string") {
    if (v.startsWith("\\x")) return Buffer.from(v.slice(2), "hex");
    try {
      return Buffer.from(v, "base64");
    } catch {
      return Buffer.from(v, "utf8");
    }
  }
  return null;
}

export async function loadDecryptedAccessTokenForCompany(
  companyId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_connections")
    .select("access_token_encrypted")
    .eq("company_id", companyId)
    .maybeSingle();
  if (error) throw error;
  const buffer = byteaToBuffer(data?.access_token_encrypted);
  if (!buffer) return null;
  try {
    return decryptWhatsAppToken(buffer);
  } catch (e) {
    console.error("[whatsapp] decrypt token failed", e);
    return null;
  }
}

export function encryptAccessTokenIfConfigured(plain: string): Buffer | null {
  if (!process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY?.trim()) {
    return null;
  }
  try {
    return encryptWhatsAppToken(plain);
  } catch (e) {
    console.error("[whatsapp] encrypt token failed", e);
    return null;
  }
}
