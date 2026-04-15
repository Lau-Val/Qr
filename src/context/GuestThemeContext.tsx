"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  defaultThemeForPath,
  GUEST_THEME_QUERY_PARAM,
  GUEST_THEME_STORAGE_KEY,
  parseGuestUiTheme,
  type GuestUiTheme,
} from "@/lib/guest-ui-theme";
import {
  getGuestVisualPalette,
  type GuestVisualPalette,
} from "@/lib/guest-palette";

type GuestThemeContextValue = {
  theme: GuestUiTheme;
  setTheme: (t: GuestUiTheme) => void;
  palette: GuestVisualPalette;
};

const GuestThemeContext = createContext<GuestThemeContextValue | null>(null);

export function GuestThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const defaultForRoute = useMemo(
    () => defaultThemeForPath(pathname ?? "/gast"),
    [pathname],
  );

  const [theme, setThemeState] = useState<GuestUiTheme>(defaultForRoute);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromUrl = parseGuestUiTheme(
      new URL(window.location.href).searchParams.get(GUEST_THEME_QUERY_PARAM),
    );
    if (fromUrl) {
      setThemeState(fromUrl);
      try {
        localStorage.setItem(GUEST_THEME_STORAGE_KEY, fromUrl);
      } catch {
        /* ignore */
      }
      return;
    }

    try {
      const stored = parseGuestUiTheme(
        localStorage.getItem(GUEST_THEME_STORAGE_KEY),
      );
      if (stored) {
        setThemeState(stored);
        return;
      }
    } catch {
      /* ignore */
    }

    setThemeState(defaultForRoute);
  }, [defaultForRoute, pathname]);

  const setTheme = useCallback((t: GuestUiTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(GUEST_THEME_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const palette = useMemo(() => getGuestVisualPalette(theme), [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, palette }),
    [theme, setTheme, palette],
  );

  return (
    <GuestThemeContext.Provider value={value}>
      {children}
    </GuestThemeContext.Provider>
  );
}

export function useGuestTheme(): GuestThemeContextValue {
  const ctx = useContext(GuestThemeContext);
  if (!ctx) {
    throw new Error("useGuestTheme must be used within GuestThemeProvider");
  }
  return ctx;
}
