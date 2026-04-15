import type { GuestUiTheme } from "@/lib/guest-ui-theme";

/**
 * Visuele tokens voor de gast-flow (geen functionele wijzigingen — alleen CSS-klassen).
 * `bar` / `salon` = bestaande BarBoost-stijlen; `luxury` / `playful` = nieuwe thema's.
 */
export type GuestVisualPalette = {
  id: GuestUiTheme;
  /** MobileShell-variant */
  shell: "dark" | "light" | "luxury" | "playful";
  /** KapperPrizeBox */
  prizeBox: "light" | "dark";
  /** RetentionSocialLinks: licht oppervlak (salon/luxury) vs donker */
  retentionLightSurface: boolean;
  /** Stapnummer linksboven */
  pageNum: string;
  welcome: {
    section: string;
    brand: string;
    title: string;
    subtitle: string;
    badge: string;
    /** Volledige klasse voor primaire CTA (light / luxury shells) */
    cta?: string;
    /** Dark / playful: tail op `buttonClassName("primary", …)` */
    ctaPrimaryAddon?: string;
    footerHint: string;
  };
  unlock: {
    openingHint: string;
    revealHint: string;
    spinDisabled: string;
    spinLink?: string;
    spinLinkPrimaryAddon?: string;
  };
  baseWon: {
    card: string;
    label: string;
    title: string;
    normalPrice: string;
    timerLead: string;
    timerMono: string;
  };
  upgrade: {
    outer: string;
    ambientA: string;
    ambientB: string;
    /** Rechtsboven blur-vlek */
    ambientBlur: string;
    /** Optioneel: extra zachte blob linksonder (salon / luxury) */
    secondaryBlob?: string;
    headline: string;
    subMuted: string;
    subAccent: string;
    dealStandard: string;
    dealUpgraded: string;
    divider: string;
    formBorder: string;
    formLead: string;
    label: string;
    input: string;
    error: string;
    submit: string;
    formTiny: string;
    skip: string;
    upgradeEmoji: string;
  };
  retention: {
    title: string;
    subtitle: string;
    ghostLink: string;
  };
  /** Vaste gast-layout (buiten MobileShell) */
  viewportBg: string;
  /** Extra klasse op de gast-stap voor typografie / motion */
  stepExtra: string;
};

const bar: GuestVisualPalette = {
  id: "bar",
  shell: "dark",
  prizeBox: "dark",
  retentionLightSurface: false,
  pageNum: "text-white/40",
  welcome: {
    section: "",
    brand: "text-white/45",
    title: "text-white",
    subtitle: "text-white/52",
    badge: "",
    ctaPrimaryAddon: "",
    footerHint: "text-white/38",
  },
  unlock: {
    openingHint:
      "bg-gradient-to-r from-violet-200 via-fuchsia-200 to-violet-300 bg-clip-text text-transparent",
    revealHint: "text-white/45",
    spinDisabled: "",
    spinLinkPrimaryAddon: "",
  },
  baseWon: {
    card: "border-white/10 bg-white/[0.04]",
    label: "text-emerald-300/95",
    title: "text-white",
    normalPrice: "text-white/45",
    timerLead: "text-white/55",
    timerMono: "text-emerald-200/95",
  },
  upgrade: {
    outer:
      "border-violet-400/55 bg-[#1a0f2e] shadow-[0_0_0_1px_rgba(167,139,250,0.2),0_20px_50px_rgba(0,0,0,0.55),0_0_80px_rgba(124,58,237,0.22)]",
    ambientA: "bg-gradient-to-b from-violet-950 via-[#1a1228] to-[#12081f]",
    ambientB: "bb-upgrade-bg-drift",
    ambientBlur: "bg-violet-500/25",
    headline: "text-white",
    subMuted: "text-white/38",
    subAccent: "text-amber-200/90",
    dealStandard: "text-white/70",
    dealUpgraded: "text-white",
    divider: "via-white/20",
    formBorder: "border-white/10",
    formLead: "text-white",
    label: "text-white",
    input:
      "border-white/25 bg-black/50 text-white ring-violet-400/40 placeholder:text-white/35 focus:border-violet-400/55",
    error: "text-amber-200/95",
    submit: "shadow-lg shadow-violet-900/40",
    formTiny: "text-white/38",
    skip: "text-white/45",
    upgradeEmoji: "🔥",
  },
  retention: {
    title: "text-white",
    subtitle: "text-white/55",
    ghostLink: "",
  },
  viewportBg: "bg-[#06060a]",
  stepExtra: "",
};

const salon: GuestVisualPalette = {
  id: "salon",
  shell: "light",
  prizeBox: "light",
  retentionLightSurface: true,
  pageNum: "text-stone-400",
  welcome: {
    section: "text-stone-800",
    brand: "text-stone-500",
    title: "text-stone-900",
    subtitle: "text-stone-600",
    badge: "border-stone-200/90 bg-white text-stone-600 shadow-sm",
    cta:
      "flex w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-3.5 text-center text-base font-semibold tracking-tight text-stone-900 shadow-sm no-underline transition hover:bg-stone-50 active:bg-stone-100 [@media(max-height:640px)]:py-3",
    footerHint: "text-stone-500",
  },
  unlock: {
    openingHint: "text-stone-600",
    revealHint: "text-stone-500",
    spinDisabled:
      "!border-stone-200 !bg-stone-100 !text-stone-600 !shadow-none",
    spinLink:
      "flex w-full touch-manipulation select-none items-center justify-center rounded-xl border border-stone-300 bg-white py-2.5 text-center text-sm font-semibold text-stone-900 shadow-sm no-underline transition hover:bg-stone-50 sm:py-3 sm:text-base",
  },
  baseWon: {
    card: "border-stone-200 bg-white shadow-sm",
    label: "text-stone-600",
    title: "text-stone-900",
    normalPrice: "",
    timerLead: "text-stone-500",
    timerMono: "text-stone-800",
  },
  upgrade: {
    outer:
      "border-amber-400/70 bg-[#fff7e8] shadow-[0_16px_48px_rgba(180,83,9,0.16),0_4px_20px_rgba(251,191,36,0.12),0_0_0_1px_rgba(253,230,138,0.45)]",
    ambientA: "bg-gradient-to-br from-[#fffbeb] via-amber-100/95 to-amber-200/90",
    ambientB: "bb-upgrade-bg-drift-salon",
    ambientBlur: "bg-amber-400/40",
    secondaryBlob:
      "pointer-events-none absolute -left-10 bottom-0 z-[1] h-32 w-32 rounded-full bg-amber-300/25 blur-2xl",
    headline: "text-amber-950 drop-shadow-[0_1px_0_rgba(255,251,235,0.9)]",
    subMuted: "text-amber-900/75",
    subAccent: "text-amber-950/85",
    dealStandard: "text-amber-950/90",
    dealUpgraded: "text-amber-950",
    divider: "via-amber-600/35",
    formBorder: "border-amber-800/20",
    formLead: "text-amber-950",
    label: "text-amber-900/80",
    input:
      "border-amber-300/80 bg-white/95 text-amber-950 ring-amber-400/40 placeholder:text-amber-900/35 focus:border-amber-500",
    error: "text-red-700",
    submit:
      "!border !border-amber-500/40 !bg-gradient-to-b !from-amber-300/75 !via-amber-400/65 !to-amber-700/60 !text-amber-950 !shadow-[0_6px_22px_rgba(180,83,9,0.2)] backdrop-blur-[1px] hover:!from-amber-300/88 hover:!via-amber-400/78 hover:!to-amber-700/72 active:!brightness-[0.97]",
    formTiny: "text-amber-900/55",
    skip: "text-amber-900/60 hover:text-amber-950",
    upgradeEmoji: "✨",
  },
  retention: {
    title: "text-stone-900",
    subtitle: "text-stone-600",
    ghostLink: "text-stone-600 hover:text-stone-900",
  },
  viewportBg: "bg-[#f5f3ef]",
  stepExtra: "",
};

/** Luxury: rustig, crème, goud — geen harde contrasten */
const luxury: GuestVisualPalette = {
  ...salon,
  id: "luxury",
  shell: "luxury",
  prizeBox: "light",
  retentionLightSurface: true,
  pageNum: "text-[#8a7d6b]",
  welcome: {
    ...salon.welcome,
    section: "text-[#3d3830]",
    brand: "text-[#7a6f62] tracking-[0.28em] font-medium",
    title:
      "text-[#2c2820] font-medium tracking-[0.02em] font-normal [@media(max-height:640px)]:tracking-[0.01em]",
    subtitle: "text-[#5c554a] font-light leading-relaxed tracking-wide",
    badge:
      "border-[#e8e0d4] bg-[#faf8f4] text-[#6b6358] shadow-sm font-medium tracking-wide",
    cta:
      "flex w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-2xl border border-[#d4c9b8] bg-[#f6f1e8] px-5 py-3.5 text-center text-base font-medium tracking-[0.12em] text-[#3a342c] shadow-sm no-underline transition hover:bg-[#efe8dd] active:bg-[#e8dfd2] [@media(max-height:640px)]:py-3",
    footerHint: "text-[#8a8275] font-light tracking-wide",
  },
  unlock: {
    openingHint: "text-[#6b6358] font-light tracking-wide",
    revealHint: "text-[#8a8275]",
    spinDisabled:
      "!border-[#e8e0d4] !bg-[#faf8f4] !text-[#8a8275] !shadow-none !font-medium",
    spinLink:
      "flex w-full touch-manipulation select-none items-center justify-center rounded-2xl border border-[#d4c9b8] bg-[#faf8f4] py-2.5 text-center text-sm font-medium tracking-wide text-[#3a342c] shadow-sm no-underline transition hover:bg-[#f3ede4] sm:py-3 sm:text-base",
  },
  baseWon: {
    card: "border-[#e8e0d4] bg-[#faf8f4] shadow-[0_8px_32px_rgba(45,40,30,0.06)]",
    label: "text-[#a89878] font-medium tracking-[0.15em]",
    title: "text-[#2c2820] font-medium tracking-wide",
    normalPrice:
      "text-[#8a8275] line-through decoration-[#c4b8a8]/70",
    timerLead: "text-[#7a7368] font-light tracking-wide",
    timerMono: "text-[#8a7a58] font-medium tabular-nums tracking-wider",
  },
  upgrade: {
    outer:
      "border-[#d4c9b8] bg-[#faf6ef] shadow-[0_12px_40px_rgba(45,40,30,0.08),0_0_0_1px_rgba(212,201,184,0.5)]",
    ambientA: "bg-gradient-to-br from-[#faf8f4] via-[#f5f0e8] to-[#ebe4d8]",
    ambientB: "bb-upgrade-bg-drift-luxury",
    ambientBlur: "bg-[#c9b896]/25",
    secondaryBlob:
      "pointer-events-none absolute -left-10 bottom-0 z-[1] h-28 w-28 rounded-full bg-[#d4c4a8]/18 blur-2xl",
    headline: "text-[#3a342c] font-medium tracking-[0.06em]",
    subMuted: "text-[#8a8275]",
    subAccent: "text-[#9a8a68]",
    dealStandard: "text-[#5c554a]",
    dealUpgraded: "text-[#2c2820]",
    divider: "via-[#d4c9b8]/60",
    formBorder: "border-[#e0d6c8]",
    formLead: "text-[#3a342c]",
    label: "text-[#6b6358]",
    input:
      "border-[#d4c9b8] bg-white text-[#3a342c] ring-[#c9b896]/40 placeholder:text-[#a89e90] focus:border-[#b8a990]",
    error: "text-red-800/90",
    submit:
      "!border-[#b8a990] !bg-[#d4c4a8] !text-[#2c2820] shadow-md shadow-[#3a342c]/10 hover:!bg-[#c9b896] active:!brightness-95 !font-medium !tracking-wide",
    formTiny: "text-[#8a8275]",
    skip: "text-[#8a8275] hover:text-[#5c554a]",
    upgradeEmoji: "✦",
  },
  retention: {
    title: "text-[#2c2820] font-medium tracking-wide",
    subtitle: "text-[#6b6358] font-light",
    ghostLink: "text-[#8a8275] hover:text-[#3a342c]",
  },
  viewportBg: "bg-[#ebe6dc]",
  stepExtra: "bb-guest-theme-luxury",
};

/** Playful: fel, gradient, game-achtig — maximale aandacht op CTA */
const playful: GuestVisualPalette = {
  ...bar,
  id: "playful",
  shell: "playful",
  prizeBox: "dark",
  retentionLightSurface: false,
  pageNum: "text-fuchsia-300/80",
  welcome: {
    section: "",
    brand: "text-fuchsia-200/90 font-bold tracking-widest",
    title: "text-white font-extrabold drop-shadow-[0_0_24px_rgba(217,70,239,0.35)]",
    subtitle: "text-orange-100/90 font-semibold",
    badge: "",
    ctaPrimaryAddon:
      "shadow-[0_0_28px_rgba(168,85,247,0.45)] hover:shadow-[0_0_36px_rgba(249,115,22,0.5)] hover:!brightness-110 bb-playful-welcome-cta",
    footerHint: "text-orange-200/70 font-medium",
  },
  unlock: {
    openingHint:
      "bg-gradient-to-r from-orange-300 via-fuchsia-300 to-purple-300 bg-clip-text font-extrabold text-transparent drop-shadow-[0_0_12px_rgba(251,146,60,0.4)]",
    revealHint: "text-orange-200/80 font-semibold",
    spinDisabled: "",
    spinLinkPrimaryAddon:
      "shadow-[0_0_26px_rgba(249,115,22,0.45)] !bg-gradient-to-r !from-orange-500 !to-fuchsia-600 !text-white hover:!brightness-110 bb-playful-spin-cta",
  },
  baseWon: {
    card: "border-2 border-fuchsia-500/50 bg-gradient-to-b from-purple-950/80 to-[#1a0528]/90 shadow-[0_0_40px_rgba(168,85,247,0.25)]",
    label: "text-orange-300 font-extrabold",
    title: "text-white font-extrabold",
    normalPrice: "text-orange-200/70 font-bold line-through decoration-orange-400/50",
    timerLead: "text-fuchsia-200/90 font-bold",
    timerMono:
      "bg-gradient-to-r from-orange-300 to-fuchsia-300 bg-clip-text font-black text-transparent tabular-nums",
  },
  upgrade: {
    outer:
      "border-2 border-fuchsia-500/70 bg-gradient-to-b from-[#2d0a45] via-[#1a0528] to-[#0c0218] shadow-[0_0_0_1px_rgba(217,70,239,0.35),0_20px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(249,115,22,0.25)]",
    ambientA: "bg-gradient-to-b from-fuchsia-950/90 via-[#2a0a3c] to-[#12041c]",
    ambientB: "bb-upgrade-bg-drift-playful",
    ambientBlur: "bg-orange-500/35",
    headline:
      "text-white font-extrabold drop-shadow-[0_0_20px_rgba(249,115,22,0.35)]",
    subMuted: "text-fuchsia-200/80 font-bold",
    subAccent: "text-orange-300 font-extrabold",
    dealStandard: "text-orange-100/85 font-semibold",
    dealUpgraded: "text-white font-extrabold",
    divider: "via-fuchsia-500/40",
    formBorder: "border-orange-500/30",
    formLead: "text-white font-extrabold",
    label: "text-orange-100 font-bold",
    input:
      "border-2 border-fuchsia-500/40 bg-black/60 text-white ring-orange-400/50 placeholder:text-fuchsia-200/50 focus:border-orange-400",
    error: "text-orange-300 font-bold",
    submit:
      "!bg-gradient-to-r !from-orange-500 !via-fuchsia-600 !to-purple-600 !text-white !font-extrabold !border-0 shadow-[0_0_28px_rgba(249,115,22,0.55)] hover:brightness-110 bb-playful-cta-pulse",
    formTiny: "text-fuchsia-200/60",
    skip: "text-orange-200/80 hover:text-white font-semibold",
    upgradeEmoji: "🎮",
  },
  retention: {
    title: "text-white font-extrabold",
    subtitle: "text-orange-100/85 font-semibold",
    ghostLink: "text-fuchsia-200 hover:text-orange-200",
  },
  viewportBg: "bg-gradient-to-b from-[#1a0528] via-[#0f0220] to-[#060010]",
  stepExtra: "bb-guest-theme-playful",
};

export const GUEST_VISUAL_PALETTES: Record<GuestUiTheme, GuestVisualPalette> = {
  bar,
  salon,
  luxury,
  playful,
};

export function getGuestVisualPalette(theme: GuestUiTheme): GuestVisualPalette {
  return GUEST_VISUAL_PALETTES[theme];
}
