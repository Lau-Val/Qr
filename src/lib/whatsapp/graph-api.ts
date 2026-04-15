import "server-only";

const DEFAULT_VERSION = "v21.0";

export async function sendWhatsAppTextMessage(input: {
  phoneNumberId: string;
  accessToken: string;
  /** E.164 without + is fine; Graph accepts digits */
  to: string;
  body: string;
}): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  const v = process.env.WHATSAPP_CLOUD_API_VERSION?.trim() || DEFAULT_VERSION;
  const url = `https://graph.facebook.com/${v}/${encodeURIComponent(input.phoneNumberId)}/messages`;
  const to = input.to.replace(/\s+/g, "").replace(/^\+/, "");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: input.body },
    }),
  });

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!res.ok) {
    const err =
      json && typeof json.error === "object" && json.error
        ? JSON.stringify(json.error)
        : `HTTP ${res.status}`;
    return { ok: false, error: err };
  }
  const mid =
    json && typeof json.messages === "object" && json.messages
      ? (() => {
          const m = (json.messages as { id?: string }[])[0];
          return m?.id;
        })()
      : undefined;
  return { ok: true, messageId: mid };
}
