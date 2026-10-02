import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/ContentNotFound.tsx — editable from the CMS. */
export const inl = registerCopy("contentnotfound-inline", {
  t_d52c0478: { ar: "هذا الخبر غير متاح", en: "This article is no longer available" } as BiText,
  t_d1fbd711: { ar: "هذه الصفحة غير متاحة", en: "This page is no longer available" } as BiText,
  t_3377fd40: {
    ar: "ربما نُقل أو أُزيل. يمكنك تصفح المحتوى المتاح من الرابط أدناه.",
    en: "It may have been moved or removed. You can browse the available content below.",
  } as BiText,
  t_ce7f04dc: { ar: "العودة إلى المركز الإعلامي", en: "Back to the Media Center" } as BiText,
  t_bca93df5: { ar: "العودة إلى الرئيسية", en: "Back to home" } as BiText,
});
