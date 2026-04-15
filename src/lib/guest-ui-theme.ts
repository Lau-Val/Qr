export const GUEST_UI_THEMES = ["bar", "salon", "luxury", "playful"] as const;
export type GuestUiTheme = (typeof GUEST_UI_THEMES)[number];

export const GUEST_THEME_STORAGE_KEY = "bb_guest_ui_theme";
export const GUEST_THEME_QUERY_PARAM = "theme";

export function defaultThemeForPath(pathname: string): GuestUiTheme {
  return pathname.includes("/kapper") ? "salon" : "bar";
}

export function parseGuestUiTheme(raw: string | null | undefined): GuestUiTheme | null {
  if (!raw) return null;
  return GUEST_UI_THEMES.includes(raw as GuestUiTheme)
    ? (raw as GuestUiTheme)
    : null;
}
