import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/ThemeToggle.tsx — editable from the CMS. */
export const inl = registerCopy("themetoggle-inline", {
  t_acf22999: { ar: "التبديل إلى الوضع الداكن", en: "Switch to dark mode" } as BiText,
});
