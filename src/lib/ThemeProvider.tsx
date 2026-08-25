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
  // Always return "light" initially so server and client match during hydration.
  // The useEffect below will sync it with the actual DOM/localStorage state.
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Sync React state with the actual theme that was applied by the inline script
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState(currentTheme);

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
