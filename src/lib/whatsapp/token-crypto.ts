import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const PREFIX = "bbw1"; // BarBoost WhatsApp v1

function getKey(): Buffer {
  const b64 = process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY;
  if (!b64?.trim()) {
    throw new Error(
      "Missing WHATSAPP_TOKEN_ENCRYPTION_KEY (32-byte key, base64-encoded).",
    );
  }
  const key = Buffer.from(b64.trim(), "base64");
  if (key.length !== 32) {
    throw new Error(
      "WHATSAPP_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (AES-256).",
    );
  }
  return key;
}

/** Encrypts a Meta system-user / access token for at-rest storage. Server-only. */
export function encryptWhatsAppToken(plaintext: string): Buffer {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([
    Buffer.from(PREFIX, "utf8"),
    iv,
    tag,
    enc,
  ]);
}

export function decryptWhatsAppToken(blob: Buffer): string {
  const key = getKey();
  const header = Buffer.from(PREFIX, "utf8");
  if (blob.length < header.length + 12 + 16) {
    throw new Error("Invalid encrypted token buffer.");
  }
  if (!blob.subarray(0, header.length).equals(header)) {
    throw new Error("Unknown encrypted token format.");
  }
  let o = header.length;
  const iv = blob.subarray(o, o + 12);
  o += 12;
  const tag = blob.subarray(o, o + 16);
  o += 16;
  const data = blob.subarray(o);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Optional dev helper: derive a key from a passphrase (do not use in production). */
export function deriveKeyFromPassphraseDevOnly(passphrase: string): string {
  return scryptSync(passphrase, "whatsapp-salt", 32).toString("base64");
}
