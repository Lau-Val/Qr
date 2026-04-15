import type { GuestUiTheme } from "@/lib/guest-ui-theme";

/**
 * Visuele tokens voor de gast-flow (alleen CSS-klassen).
 * `bar` = Nightclub premium (diep donker, goud-accent, ingetogen); `salon` = Clean licht (neutraal, flat);
 * `luxury` = premium crème; `playful` = fel gamified.
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
  /** Optionele NL-copy bovenop `gast-templates` (o.a. Bar VIP — ingetogen taal) */
  themeCopy?: {
    upgradeHeadline?: string;
    upgradeSubUpgraded?: string;
    formLead?: string;
    unlockBoxIdleHint?: string;
    phoneLabel?: string;
    upgradeSubmit?: string;
    skipUpgrade?: string;
  };
};

const bar: GuestVisualPalette = {
  id: "bar",
  shell: "dark",
  prizeBox: "dark",
  retentionLightSurface: false,
  pageNum: "text-white/20",
  welcome: {
    section: "",
    brand: "text-amber-200/40 tracking-[0.32em] font-normal",
    title: "text-white/95 font-medium tracking-tight",
    subtitle: "text-white/45",
    badge: "",
    ctaPrimaryAddon:
      "!border !border-amber-900/35 !bg-amber-950 !text-amber-100/95 !shadow-[0_6px_20px_rgba(0,0,0,0.45)] transition-colors duration-200 hover:!bg-[#422006] active:!brightness-[0.98]",
    footerHint: "text-white/30",
  },
  unlock: {
    openingHint: "text-white/50 font-normal",
    revealHint: "text-white/32",
    spinDisabled: "",
    spinLinkPrimaryAddon:
      "!border !border-amber-900/35 !bg-amber-950 !text-amber-100/95 !shadow-md !shadow-black/40 transition-colors duration-200 hover:!bg-[#422006] active:!brightness-[0.98]",
  },
  baseWon: {
    card: "border border-white/[0.06] bg-[#0e0e12] shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
    label: "text-amber-200/50 font-normal tracking-wide",
    title: "text-white/95 font-medium",
    normalPrice: "text-white/35",
    timerLead: "text-white/38",
    timerMono: "text-amber-200/70 font-medium tabular-nums",
  },
  upgrade: {
    outer:
      "border border-white/[0.05] bg-[#0a0a0e] shadow-[0_18px_48px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.03)]",
    ambientA: "bg-[#0c0c10]",
    ambientB: "bb-upgrade-bg-drift-bar",
    ambientBlur: "bg-white/[0.03]",
    headline: "text-white/95 font-medium tracking-tight",
    subMuted: "text-white/35 font-normal",
    subAccent: "text-amber-200/55 font-normal",
    dealStandard: "text-white/60",
    dealUpgraded: "text-white/90 font-medium",
    divider: "via-white/[0.06]",
    formBorder: "border-white/[0.06]",
    formLead: "text-white/85 font-normal",
    label: "text-white/40",
    input:
      "border-white/[0.1] bg-black/35 text-white/95 ring-0 placeholder:text-white/30 focus:border-amber-900/50 focus:ring-1 focus:ring-amber-900/30",
    error: "text-amber-200/75",
    submit:
      "!border !border-amber-900/35 !bg-amber-950 !text-amber-100/95 !shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-colors duration-200 hover:!bg-[#422006] active:!brightness-[0.98]",
    formTiny: "text-white/28",
    skip: "text-white/35 transition-colors hover:text-white/55",
    upgradeEmoji: "",
  },
  retention: {
    title: "text-white/95 font-medium",
    subtitle: "text-white/40",
    ghostLink: "text-amber-200/50 hover:text-amber-100/80",
  },
  viewportBg: "bg-[#030304]",
  stepExtra: "bb-guest-theme-bar",
  themeCopy: {
    upgradeHeadline: "Exclusieve deal beschikbaar",
    upgradeSubUpgraded: "Upgrade je voordeel",
    formLead: "Alleen vanavond beschikbaar",
    unlockBoxIdleHint: "Tik om verder te gaan",
    phoneLabel: "Telefoonnummer voor activatie",
    upgradeSubmit: "Activeren",
    skipUpgrade: "Doorgaan zonder upgrade",
  },
};

const salon: GuestVisualPalette = {
  id: "salon",
  shell: "light",
  prizeBox: "light",
  retentionLightSurface: true,
  pageNum: "text-slate-400",
  welcome: {
    section: "text-slate-800",
    brand: "text-slate-500 font-medium tracking-[0.32em]",
    title: "text-slate-900 font-semibold",
    subtitle: "text-slate-600 font-normal",
    badge: "border-slate-200 bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
    cta:
      "flex w-full cursor-pointer touch-manipulation select-none items-center justify-center rounded-xl border border-sky-700/10 bg-sky-600 px-5 py-3.5 text-center text-base font-medium tracking-tight text-white shadow-sm no-underline transition hover:bg-sky-700 active:bg-sky-800 [@media(max-height:640px)]:py-3",
    footerHint: "text-slate-500",
  },
  unlock: {
    openingHint: "text-slate-600 font-medium",
    revealHint: "text-slate-500",
    spinDisabled:
      "!border-slate-200 !bg-slate-100 !text-slate-600 !shadow-none",
    spinLink:
      "flex w-full touch-manipulation select-none items-center justify-center rounded-xl border border-sky-700/10 bg-sky-600 py-2.5 text-center text-sm font-medium text-white shadow-sm no-underline transition hover:bg-sky-700 active:bg-sky-800 sm:py-3 sm:text-base",
  },
  baseWon: {
    card: "border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]",
    label: "text-slate-500 font-medium",
    title: "text-slate-900 font-semibold",
    normalPrice: "",
    timerLead: "text-slate-500",
    timerMono: "text-slate-800 font-semibold tabular-nums",
  },
  upgrade: {
    outer:
      "border border-slate-200/90 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.07)]",
    ambientA: "bg-gradient-to-br from-slate-50 via-white to-slate-50/90",
    ambientB: "bb-upgrade-bg-drift-clean",
    ambientBlur: "bg-sky-200/25",
    secondaryBlob:
      "pointer-events-none absolute -left-10 bottom-0 z-[1] h-28 w-28 rounded-full bg-sky-100/50 blur-2xl",
    headline: "text-slate-900 font-semibold",
    subMuted: "text-slate-500",
    subAccent: "text-sky-800",
    dealStandard: "text-slate-700",
    dealUpgraded: "text-slate-900 font-semibold",
    divider: "via-slate-200",
    formBorder: "border-slate-200/80",
    formLead: "text-slate-800 font-semibold",
    label: "text-slate-600",
    input:
      "border-slate-300 bg-white text-slate-900 ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-500",
    error: "text-red-600",
    submit:
      "!border !border-sky-700/10 !bg-sky-600 !text-white !shadow-sm hover:!bg-sky-700 active:!bg-sky-800",
    formTiny: "text-slate-500",
    skip: "text-slate-500 hover:text-slate-800",
    upgradeEmoji: "✨",
  },
  retention: {
    title: "text-slate-900 font-semibold",
    subtitle: "text-slate-600",
    ghostLink: "text-slate-600 hover:text-slate-900",
  },
  viewportBg: "bg-slate-50",
  stepExtra: "bb-guest-theme-clean",
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
  /** Bar-copy overschrijven — Playful gebruikt weer template-teksten uit gast-templates */
  themeCopy: undefined,
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
