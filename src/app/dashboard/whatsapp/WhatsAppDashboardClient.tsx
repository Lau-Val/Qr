"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { AdminShell } from "@/components/barboost/AdminShell";
import { cn } from "@/lib/cn";
import type { VenueType } from "@/lib/dashboard/payload-types";
import type { WhatsAppConnectionPublic } from "@/lib/whatsapp/types";

type Props = {
  barSlug: string;
  venueType: VenueType;
};

type UiStatus = "loading" | "ready";

function labelForStatus(s: WhatsAppConnectionPublic["status"]): string {
  switch (s) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting";
    case "error":
      return "Problem with connection";
    case "disconnected":
      return "Disconnected";
    default:
      return "Not connected";
  }
}

export function WhatsAppDashboardClient({ barSlug, venueType }: Props) {
  const salon = venueType === "kapper";
  const [ui, setUi] = useState<UiStatus>("loading");
  const [connection, setConnection] = useState<WhatsAppConnectionPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [fbReady, setFbReady] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testOk, setTestOk] = useState<string | null>(null);

  const appId = process.env.NEXT_PUBLIC_META_APP_ID?.trim();
  const configId = process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim();

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (barSlug) p.set("bar", barSlug);
    return p.toString();
  }, [barSlug]);

  const loadConnection = useCallback(async () => {
    setUi("loading");
    setError(null);
    try {
      const res = await fetch(`/api/whatsapp/connection?${qs}`, { cache: "no-store" });
      const json = (await res.json()) as {
        connection?: WhatsAppConnectionPublic;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Could not load connection.");
        setConnection(null);
        return;
      }
      setConnection(json.connection ?? null);
    } catch {
      setError("Network error. Try again.");
      setConnection(null);
    } finally {
      setUi("ready");
    }
  }, [qs]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  const startConnecting = async () => {
    setActionError(null);
    try {
      const res = await fetch("/api/whatsapp/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connecting", barSlug }),
      });
      const json = (await res.json()) as { connection?: WhatsAppConnectionPublic; error?: string };
      if (!res.ok) {
        setActionError(json.error ?? "Could not start.");
        return;
      }
      if (json.connection) setConnection(json.connection);
    } catch {
      setActionError("Network error. Try again.");
    }
  };

  const launchEmbeddedSignup = async () => {
    setActionError(null);
    setTestOk(null);
    if (!appId) {
      setActionError(
        "Meta App ID is not configured (NEXT_PUBLIC_META_APP_ID). Add it in your environment.",
      );
      return;
    }
    if (!configId) {
      setActionError(
        "Embedded Signup config is missing (NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID). Create it in Meta Developer → WhatsApp → Embedded signup.",
      );
      return;
    }
    await startConnecting();

    if (!window.FB) {
      setActionError("Facebook SDK is still loading. Try again in a moment.");
      return;
    }

    window.FB.login(
      async (response) => {
        try {
          /**
           * TODO (Meta): Map the exact Embedded Signup response for your app.
           * Often WABA ID and phone_number_id arrive via `window.postMessage` from
           * https://www.facebook.com — see Meta docs and add a listener below.
           */
          const token = response.authResponse?.accessToken;
          const wabaId =
            typeof (response as unknown as { waba_id?: string }).waba_id === "string"
              ? (response as unknown as { waba_id: string }).waba_id
              : undefined;

          const resSave = await fetch("/api/whatsapp/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barSlug,
              accessToken: token,
              wabaId,
              raw: { sdk: "fb.login", status: response.status },
            }),
          });
          const json = (await resSave.json()) as {
            connection?: WhatsAppConnectionPublic;
            error?: string;
            warning?: string | null;
          };
          if (!resSave.ok) {
            setActionError(json.error ?? "Could not save connection.");
            return;
          }
          if (json.connection) setConnection(json.connection);
          if (json.warning) setActionError(json.warning);
        } catch {
          setActionError("Something went wrong while saving. Try again.");
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          feature: "whatsapp_embedded_signup",
          sessionInfoVersion: "3",
        },
      } as Record<string, unknown>,
    );
  };

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.facebook.com") return;
      const data = event.data;
      if (data == null || typeof data !== "object") return;
      void (async () => {
        try {
          const d = data as Record<string, unknown>;
          /** TODO: align keys with Meta’s WA_EMBEDDED_SIGNUP payload for your app version. */
          const wabaId = typeof d.waba_id === "string" ? d.waba_id : undefined;
          const phoneNumberId =
            typeof d.phone_number_id === "string" ? d.phone_number_id : undefined;
          const businessPhoneNumber =
            typeof d.business_phone_number === "string"
              ? d.business_phone_number
              : typeof d.display_phone_number === "string"
                ? d.display_phone_number
                : undefined;
          const businessName =
            typeof d.business_name === "string" ? d.business_name : undefined;

          if (!wabaId && !phoneNumberId) return;

          const resSave = await fetch("/api/whatsapp/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              barSlug,
              wabaId,
              phoneNumberId,
              businessPhoneNumber,
              businessName,
              raw: d,
            }),
          });
          const json = (await resSave.json()) as {
            connection?: WhatsAppConnectionPublic;
            error?: string;
            warning?: string | null;
          };
          if (resSave.ok && json.connection) setConnection(json.connection);
          if (!resSave.ok) setActionError(json.error ?? "Could not save connection.");
          if (json.warning) setActionError(json.warning ?? null);
        } catch {
          setActionError("Could not process Meta message. Try again.");
        }
      })();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [barSlug]);

  const resetFlow = async () => {
    setActionError(null);
    setTestOk(null);
    try {
      const res = await fetch("/api/whatsapp/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", barSlug }),
      });
      const json = (await res.json()) as { connection?: WhatsAppConnectionPublic; error?: string };
      if (!res.ok) {
        setActionError(json.error ?? "Could not reset.");
        return;
      }
      if (json.connection) setConnection(json.connection);
    } catch {
      setActionError("Network error. Try again.");
    }
  };

  const sendTest = async () => {
    setTestBusy(true);
    setTestOk(null);
    setActionError(null);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTo, barSlug }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; messageId?: string };
      if (!res.ok) {
        setActionError(json.error ?? "Test failed.");
        return;
      }
      setTestOk(json.messageId ? `Sent (id: ${json.messageId})` : "Sent.");
    } catch {
      setActionError("Network error. Try again.");
    } finally {
      setTestBusy(false);
    }
  };

  const cardTone =
    connection?.status === "connected"
      ? salon
        ? "border-emerald-200 bg-emerald-50/90"
        : "border-emerald-500/40 bg-emerald-500/10"
      : connection?.status === "connecting"
        ? salon
          ? "border-amber-200 bg-amber-50/90"
          : "border-amber-400/35 bg-amber-500/10"
        : connection?.status === "error"
          ? salon
            ? "border-red-200 bg-red-50/90"
            : "border-red-500/35 bg-red-500/10"
          : salon
            ? "border-stone-200 bg-white"
            : "border-white/10 bg-white/[0.04]";

  return (
    <AdminShell venueType={venueType}>
      <Script
        id="fb-sdk"
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (!appId) return;
          // SDK is already loaded when onLoad runs — init here (not only fbAsyncInit).
          window.FB?.init({
            appId,
            cookie: true,
            xfbml: true,
            version: "v21.0",
          });
          setFbReady(true);
        }}
      />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          salon ? "text-stone-900" : "text-white",
        )}
      >
        <header
          className={cn(
            "border-b backdrop-blur-xl",
            salon
              ? "border-stone-200 bg-white/95"
              : "border-white/10 bg-[#0b0a12]/90",
          )}
        >
          <div className="mx-auto max-w-3xl px-4 py-8">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.25em]",
                salon ? "text-rose-800/85" : "text-violet-300/80",
              )}
            >
              BarBoost · WhatsApp
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">WhatsApp</h1>
            <p
              className={cn(
                "mt-2 max-w-xl text-sm leading-relaxed",
                salon ? "text-stone-600" : "text-white/50",
              )}
            >
              Connect WhatsApp for your business. Each venue uses its own WhatsApp Business account
              and phone number — we never mix customers between businesses.
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
          {error ? (
            <p
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm",
                salon
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-red-500/30 bg-red-500/10 text-red-100",
              )}
            >
              {error}
            </p>
          ) : null}

          <section
            className={cn(
              "rounded-2xl border p-6 shadow-sm",
              cardTone,
              salon ? "shadow-stone-200/60" : "",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.2em]",
                    salon ? "text-stone-500" : "text-white/45",
                  )}
                >
                  Connection status
                </p>
                <p className="mt-2 text-xl font-semibold">
                  {ui === "loading" ? "Loading…" : labelForStatus(connection?.status ?? "not_connected")}
                </p>
                {connection?.onboardingError ? (
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      salon ? "text-red-800/90" : "text-red-200/90",
                    )}
                  >
                    {connection.onboardingError}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void launchEmbeddedSignup()}
                  disabled={ui === "loading" || !fbReady}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
                    salon
                      ? "bg-stone-900 text-white hover:bg-stone-800"
                      : "bg-white text-black hover:bg-white/90",
                  )}
                >
                  Connect WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => void resetFlow()}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                    salon
                      ? "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                      : "border-white/20 bg-transparent text-white hover:bg-white/10",
                  )}
                >
                  Try again
                </button>
              </div>
            </div>

            {!appId || !configId ? (
              <p
                className={cn(
                  "mt-4 rounded-xl border px-3 py-2 text-xs leading-relaxed",
                  salon
                    ? "border-amber-200 bg-amber-50 text-amber-950"
                    : "border-amber-400/30 bg-amber-500/10 text-amber-100",
                )}
              >
                TODO: Add{" "}
                <code className="rounded bg-black/5 px-1 py-0.5">NEXT_PUBLIC_META_APP_ID</code> and{" "}
                <code className="rounded bg-black/5 px-1 py-0.5">
                  NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID
                </code>{" "}
                from the Meta Developer Console (WhatsApp → Embedded signup).
              </p>
            ) : null}

            {actionError ? (
              <p
                className={cn(
                  "mt-4 rounded-xl border px-3 py-2 text-sm",
                  salon
                    ? "border-red-200 bg-white text-red-900"
                    : "border-red-400/30 bg-black/30 text-red-100",
                )}
              >
                {actionError}
              </p>
            ) : null}

            <dl
              className={cn(
                "mt-6 grid gap-4 sm:grid-cols-2",
                salon ? "text-stone-800" : "text-white/90",
              )}
            >
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  Number connected
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {connection?.businessPhoneNumber ?? "—"}
                </dd>
              </div>
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  WhatsApp Business Account ID
                </dt>
                <dd className="mt-1 break-all font-mono text-sm">{connection?.wabaId ?? "—"}</dd>
              </div>
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  Phone Number ID
                </dt>
                <dd className="mt-1 break-all font-mono text-sm">
                  {connection?.phoneNumberId ?? "—"}
                </dd>
              </div>
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  Last sync
                </dt>
                <dd className="mt-1 text-sm">
                  {connection?.lastSyncedAt
                    ? new Date(connection.lastSyncedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  Quality (Meta)
                </dt>
                <dd className="mt-1 text-sm">{connection?.qualityRating ?? "— (placeholder)"}</dd>
              </div>
              <div>
                <dt className={cn("text-xs font-medium", salon ? "text-stone-500" : "text-white/45")}>
                  Webhook subscribed
                </dt>
                <dd className="mt-1 text-sm">{connection?.webhookSubscribed ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </section>

          <section
            className={cn(
              "rounded-2xl border p-6",
              salon ? "border-stone-200 bg-white" : "border-white/10 bg-white/[0.04]",
            )}
          >
            <h2 className="text-sm font-semibold">Connection health</h2>
            <p
              className={cn(
                "mt-1 text-sm",
                salon ? "text-stone-600" : "text-white/50",
              )}
            >
              Simple signal based on webhooks and last activity. Fine-tune after production traffic.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className={cn("text-xs", salon ? "text-stone-500" : "text-white/45")}>Health</dt>
                <dd className="mt-1 text-sm font-medium capitalize">
                  {connection?.connectionHealth ?? "unknown"}
                </dd>
              </div>
              <div>
                <dt className={cn("text-xs", salon ? "text-stone-500" : "text-white/45")}>
                  Last webhook received
                </dt>
                <dd className="mt-1 text-sm">
                  {connection?.lastWebhookReceivedAt
                    ? new Date(connection.lastWebhookReceivedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section
            className={cn(
              "rounded-2xl border p-6",
              salon ? "border-stone-200 bg-white" : "border-white/10 bg-white/[0.04]",
            )}
          >
            <h2 className="text-sm font-semibold">Send test message</h2>
            <p
              className={cn(
                "mt-1 text-sm",
                salon ? "text-stone-600" : "text-white/50",
              )}
            >
              Sends a text via the Cloud API using your stored token. Requires a connected line and{" "}
              <code className="rounded bg-black/5 px-1">WHATSAPP_TOKEN_ENCRYPTION_KEY</code>.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm">
                <span className={cn(salon ? "text-stone-600" : "text-white/55")}>Test number (E.164)</span>
                <input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="+31612345678"
                  className={cn(
                    "mt-1 w-full rounded-xl border px-3 py-2.5 font-mono text-sm outline-none",
                    salon
                      ? "border-stone-300 bg-white text-stone-900"
                      : "border-white/15 bg-black/30 text-white placeholder:text-white/30",
                  )}
                />
              </label>
              <button
                type="button"
                disabled={testBusy || connection?.status !== "connected"}
                onClick={() => void sendTest()}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50",
                  salon
                    ? "bg-stone-900 text-white hover:bg-stone-800"
                    : "bg-white text-black hover:bg-white/90",
                )}
              >
                {testBusy ? "Sending…" : "Send test"}
              </button>
            </div>
            {testOk ? (
              <p
                className={cn(
                  "mt-3 text-sm",
                  salon ? "text-emerald-800" : "text-emerald-300/90",
                )}
              >
                {testOk}
              </p>
            ) : null}
          </section>

          <section
            className={cn(
              "rounded-2xl border border-dashed p-6",
              salon ? "border-stone-300 bg-stone-50/50" : "border-white/15 bg-black/20",
            )}
          >
            <h2 className="text-sm font-semibold">Templates & campaigns</h2>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed",
                salon ? "text-stone-600" : "text-white/50",
              )}
            >
              Database tables are ready (<code className="rounded bg-black/5 px-1">whatsapp_templates</code>,{" "}
              <code className="rounded bg-black/5 px-1">whatsapp_campaigns</code>). UI for approval flows
              and sending will land here next.
            </p>
          </section>

          <section
            className={cn(
              "rounded-2xl border border-dashed p-6",
              salon ? "border-stone-300 bg-stone-50/50" : "border-white/15 bg-black/20",
            )}
          >
            <h2 className="text-sm font-semibold">Audit log</h2>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed",
                salon ? "text-stone-600" : "text-white/50",
              )}
            >
              Connection events are stored in{" "}
              <code className="rounded bg-black/5 px-1">whatsapp_connection_events</code> (server-side).
              Add an admin view or export when you need history in the UI.
            </p>
          </section>
        </main>
      </div>
    </AdminShell>
  );
}
