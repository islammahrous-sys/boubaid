import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/DocumentShowcase.tsx — editable from the CMS. */
export const inl = registerCopy("documentshowcase-inline", {
  t_f5a83b92: {
    ar: "الملف الأصلي محفوظ في أرشيف الأمانة العامة ويخضع لضوابط الاطلاع الرسمية.",
    en: "Original document is archived with the Secretariat under standard access procedures.",
  } as BiText,
  t_5e7c8b48: { ar: "عرض الوثيقة", en: "View document" } as BiText,
  t_43caeaac: { ar: "طلب نسخة", en: "Request copy" } as BiText,
  t_c47895fb: { ar: "عرض", en: "View" } as BiText,
  t_cc57468f: { ar: "PDF (طلب الأمانة)", en: "PDF (request)" } as BiText,
});
