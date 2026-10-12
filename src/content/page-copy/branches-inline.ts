import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/branches.tsx — editable from the CMS. */
export const inl = registerCopy("branches-inline", {
  t_f92a2d84: { ar: "سبعة", en: "Seven" } as BiText,
  t_de3d384a: { ar: "الرقم", en: "No." } as BiText,
  t_f05616f7: {
    ar: "حقوق اللوحة محفوظة لمجلس أسرة آل بوعبيد",
    en: "Copyright © Al Bu Obaid Family Council",
  } as BiText,
  t_11cb866d: { ar: "فتح في نافذة مستقلة", en: "Open in new window" } as BiText,
});
