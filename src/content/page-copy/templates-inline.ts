import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/templates.tsx — editable from the CMS. */
export const inl = registerCopy("templates-inline", {
  t_b1b794d1: { ar: "ملف", en: "File" } as BiText,
  t_95af43cf: { ar: "صورة", en: "Image" } as BiText,
  t_5ffb3096: { ar: "مستند", en: "PDF" } as BiText,
  t_698de4a1: { ar: "خط", en: "Font" } as BiText,
  t_6441cd5c: { ar: "أنماط", en: "CSS" } as BiText,
});
