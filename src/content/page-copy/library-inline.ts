import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/library.tsx — editable from the CMS. */
export const inl = registerCopy("library-inline", {
  t_0e0bb33d: { ar: "الأرشيف", en: "Archive" } as BiText,
  t_2132f4cb: { ar: "١٤٤٨ هـ", en: "1448 AH" } as BiText,
  t_ad92c9cf: { ar: "١٤٤٤ هـ", en: "1444 AH" } as BiText,
  t_5e7c8b48: { ar: "عرض الوثيقة", en: "View document" } as BiText,
});
