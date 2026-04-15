import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies X-Hub-Signature-256 from Meta webhook POSTs.
 * @see https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export function verifyMetaWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = signatureHeader.slice("sha256=".length);
  const hmac = createHmac("sha256", appSecret);
  hmac.update(typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody);
  const digest = hmac.digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(digest, "hex"));
  } catch {
    return false;
  }
}
