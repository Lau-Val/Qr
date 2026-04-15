"use client";

import Link from "next/link";
import type {
  RetentionSocialLink,
  RetentionSocialPlatform,
} from "@/data/gast-templates";
import { cn } from "@/lib/cn";

const LABELS: Record<RetentionSocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  website: "Website",
};

/** Icon badge: leesbaar op licht (salon) en donker (bar). */
const PLATFORM_ICON_SHELL: Record<
  RetentionSocialPlatform,
  { salon: string; bar: string }
> = {
  instagram: {
    salon:
      "bg-gradient-to-br from-fuchsia-100 to-orange-100 text-pink-600 ring-1 ring-pink-500/15",
    bar: "bg-gradient-to-br from-fuchsia-500/30 to-orange-500/25 text-pink-200 ring-1 ring-white/10",
  },
  facebook: {
    salon: "bg-blue-50 text-[#1877F2] ring-1 ring-blue-500/20",
    bar: "bg-blue-500/25 text-blue-200 ring-1 ring-white/10",
  },
  tiktok: {
    salon: "bg-stone-900 text-white ring-1 ring-stone-800/20",
    bar: "bg-white/15 text-white ring-1 ring-white/15",
  },
  whatsapp: {
    salon: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20",
    bar: "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/25",
  },
  website: {
    salon: "bg-violet-50 text-violet-700 ring-1 ring-violet-500/20",
    bar: "bg-violet-500/25 text-violet-200 ring-1 ring-white/10",
  },
};

function ExternalArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function Icon({ platform }: { platform: RetentionSocialPlatform }) {
  const common = "h-5 w-5 shrink-0 sm:h-6 sm:w-6";
  switch (platform) {
    case "instagram":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9.101 23.691v-9.29H6.127v-3.622h2.974v-2.71c0-2.966 1.708-4.602 4.411-4.602 1.248 0 2.318.093 2.63.134v3.051h-1.806c-1.415 0-1.689.673-1.689 1.662v2.465h3.39l-.439 3.622h-2.951V23.69H9.101z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "website":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

export function RetentionSocialLinks({
  heading,
  links,
  salonStyle,
}: {
  /** Optioneel; leeg/weg = geen regel (meer ruimte voor de knoppen). */
  heading?: string;
  links: RetentionSocialLink[];
  salonStyle: boolean;
}) {
  if (!links.length) return null;

  const showHeading = Boolean(heading?.trim());

  return (
    <div>
      {showHeading ? (
        <p
          className={cn(
            "text-center text-[11px] font-bold uppercase tracking-[0.2em]",
            salonStyle ? "text-stone-500" : "text-white/45",
          )}
        >
          {heading}
        </p>
      ) : null}
      <ul
        className={cn(
          "flex max-w-md flex-col gap-2 [@media(max-height:700px)]:gap-1.5 [@media(max-height:600px)]:gap-1.5",
          "mx-auto w-full",
          showHeading ? "mt-3 [@media(max-height:700px)]:mt-2.5" : "mt-0",
        )}
        role="list"
      >
        {links.map(({ platform, href }) => (
          <li key={`${platform}-${href}`} className="min-w-0">
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={LABELS[platform]}
              aria-label={`${LABELS[platform]} (opent in nieuw tabblad)`}
              className={cn(
                "group flex min-h-[3.25rem] w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left shadow-sm transition active:scale-[0.99] sm:min-h-[3.5rem] sm:gap-3.5 sm:px-4 sm:py-3",
                "[@media(max-height:640px)]:min-h-[3rem] [@media(max-height:640px)]:py-2 [@media(max-height:640px)]:sm:min-h-[3.25rem]",
                salonStyle
                  ? "border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50"
                  : "border-white/12 bg-white/[0.07] hover:border-white/20 hover:bg-white/[0.11]",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12",
                  "[@media(max-height:640px)]:h-10 [@media(max-height:640px)]:w-10",
                  salonStyle
                    ? PLATFORM_ICON_SHELL[platform].salon
                    : PLATFORM_ICON_SHELL[platform].bar,
                )}
              >
                <Icon platform={platform} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-[0.9375rem]",
                  salonStyle ? "text-stone-800" : "text-white/95",
                )}
              >
                {LABELS[platform]}
              </span>
              <ExternalArrowIcon
                className={cn(
                  "h-4 w-4 shrink-0 opacity-50 transition group-hover:opacity-80 sm:h-[1.125rem] sm:w-[1.125rem]",
                  salonStyle ? "text-stone-400" : "text-white/50",
                )}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
