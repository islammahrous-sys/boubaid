import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/initiatives.$slug.tsx — editable from the CMS. */
export const inl = registerCopy("initiatives-slug-inline", {
  t_159b4c80: { ar: "تم نسخ الرابط بنجاح", en: "Link copied to clipboard" } as BiText,
  t_4b393e5f: { ar: "تعذر نسخ الرابط", en: "Failed to copy link" } as BiText,
  t_62a6b97c: { ar: "مشاركة عبر واتساب", en: "WhatsApp" } as BiText,
  t_6cf4d226: { ar: "تم النسخ", en: "Copied" } as BiText,
  t_2cb5c425: { ar: "نسخ الرابط", en: "Copy" } as BiText,
});
