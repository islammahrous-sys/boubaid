import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: <T>(entry: { ar: T; en: T }) => T;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<Ctx | null>(null);
export const LANG_STORAGE_KEY = "alboabid.lang";

/**
 * The inline script in `__root.tsx`'s `<head>` already resolved and applied
 * `lang`/`dir` on `<html>` before this component mounts (same technique as
 * `ThemeProvider`) — this only reads that same resolution back into state so
 * a returning visitor's stored language never flashes to Arabic first.
 */
function readInitialLang(): Lang {
  // Always return "ar" initially so server and client match during hydration.
  // The useEffect below will sync it with the actual DOM/localStorage state.
  return "ar";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    // Only run this ONCE on mount to sync React state with the initial SSR/DOM state
    if (typeof document === "undefined") return;
    const currentLang = document.documentElement.lang === "en" ? "en" : "ar";
    if (lang !== currentLang) {
      setLangState(currentLang);
    }
  }, []); // Empty dependency array so it only runs once!

  useEffect(() => {
    // Run this whenever the user changes the language to update the DOM
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(LANG_STORAGE_KEY, l);
        } catch {
          // ignore storage failures
        }
      },
      t: ({ ar, en }) => (lang === "ar" ? ar : en),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export type BiText = { ar: string; en: string };
