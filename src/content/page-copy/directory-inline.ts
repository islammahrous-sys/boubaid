import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/directory.tsx — editable from the CMS. */
export const inl = registerCopy("directory-inline", {
  t_397a5063: {
    ar: "تم نسخ بيانات المنشأة للحافظة",
    en: "Business contact info copied to clipboard",
  } as BiText,
  t_18f3dba4: { ar: "دليل أعمال أسرة آل بوعبيد", en: "Al Bu Obaid Directory" } as BiText,
});
