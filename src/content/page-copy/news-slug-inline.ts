import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/news.$slug.tsx — editable from the CMS. */
export const inl = registerCopy("news-slug-inline", {
  t_af4f8578: { ar: "متابعة القراءة", en: "Continue reading" } as BiText,
  t_4b393e5f: { ar: "تعذر نسخ الرابط", en: "Failed to copy link" } as BiText,
  t_6cf4d226: { ar: "تم النسخ", en: "Copied" } as BiText,
});
