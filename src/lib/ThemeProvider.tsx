import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

type Ctx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<Ctx | null>(null);
export const THEME_STORAGE_KEY = "alboabid.theme";

/**
 * The inline script in `__root.tsx`'s `<head>` already resolved and applied
 * the `dark` class before this component mounts — this only needs to read
 * that same resolution back into state so React and the DOM agree, and to
 * own writes from here on.
 */
function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    // No stored preference yet — the page is still following the OS
    // setting. Keep it in sync until the visitor makes an explicit choice.
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      setThemeState(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme: (t) => {
        setThemeState(t);
        document.documentElement.classList.toggle("dark", t === "dark");
        try {
          localStorage.setItem(THEME_STORAGE_KEY, t);
        } catch {
          // ignore storage failures (private browsing, quota, etc.)
        }
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
