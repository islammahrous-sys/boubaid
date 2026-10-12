import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import { copyId } from "@/i18n/editable-copy";
import { setPageImageOverrides } from "@/content/images";

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

export function LanguageProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  /** Public site settings already loaded by the root route (SSR-safe seed). */
  initialSettings?: Record<string, any>;
}) {
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

  // Admin overrides for registered page copy (site_settings key `page_texts`).
  const { data: settings } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
    initialData: initialSettings,
  });
  // Admin-replaced page figures (site_settings key `page_images`). Applied
  // during render, before any page reads `pageImages.*.src`, so SSR and the
  // first client paint already show the admin's choice.
  setPageImageOverrides((settings as Record<string, any> | undefined)?.page_images);
  const overrides = (settings as Record<string, any> | undefined)?.page_texts as
    Record<string, { ar?: string; en?: string }> | undefined;

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
      t: (entry) => {
        const id = overrides ? copyId(entry as object) : undefined;
        const o = id ? overrides?.[id]?.[lang] : undefined;
        if (typeof o === "string" && o.trim()) return o as never;
        return lang === "ar" ? entry.ar : entry.en;
      },
    }),
    [lang, overrides],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export type BiText = { ar: string; en: string };
