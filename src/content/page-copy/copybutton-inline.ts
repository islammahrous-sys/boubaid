import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/CopyButton.tsx — editable from the CMS. */
export const inl = registerCopy("copybutton-inline", {
  t_ffe8c95d: { ar: "نسخ", en: "Copy" } as BiText,
  t_6cf4d226: { ar: "تم النسخ", en: "Copied" } as BiText,
});
