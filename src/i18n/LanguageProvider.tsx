import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import { copyId } from "@/i18n/editable-copy";
import { setPageImageOverrides } from "@/content/images";
import { useLiveEdit } from "@/lib/live-edit/store";
import { tagText } from "@/lib/live-edit/stega";

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
  // Live editor (admins only): unpublished drafts are previewed — and every
  // registered string is tagged with its copy id — only while edit mode is on.
  const edit = useLiveEdit();
  const editing = edit.enabled;
  const draftTexts = edit.texts;
  const draftImages = edit.images;

  // Admin-replaced page figures (site_settings key `page_images`). Applied
  // during render, before any page reads `pageImages.*.src`, so SSR and the
  // first client paint already show the admin's choice.
  const publishedImages = (settings as Record<string, any> | undefined)?.page_images;
  setPageImageOverrides(editing ? withImageDrafts(publishedImages, draftImages) : publishedImages);
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
        const id = copyId(entry as object);
        const builtIn = lang === "ar" ? entry.ar : entry.en;
        let text: unknown = builtIn;
        const o = id ? overrides?.[id]?.[lang] : undefined;
        if (typeof o === "string" && o.trim()) text = o;
        if (editing && id) {
          // An emptied field publishes as "back to built-in", so preview it that way.
          const draft = draftTexts[id]?.[lang];
          if (draft === null || (typeof draft === "string" && !draft.trim())) text = builtIn;
          else if (typeof draft === "string") text = draft;
          if (typeof text === "string") text = tagText(text, id);
        }
        return text as never;
      },
    }),
    [lang, overrides, editing, draftTexts],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Published `page_images` with the live editor's drafts on top (null = back to built-in). */
function withImageDrafts(
  published: Record<string, unknown> | undefined,
  drafts: Record<string, string | null>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...published };
  for (const [id, url] of Object.entries(drafts)) {
    if (url === null) delete merged[id];
    else merged[id] = url;
  }
  return merged;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

export type BiText = { ar: string; en: string };
