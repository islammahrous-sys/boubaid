import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/CollateralsLibrary.tsx — editable from the CMS. */
export const inl = registerCopy("collateralslibrary-inline", {
  t_b1a5cd06: { ar: "مستند نصي", en: "Word" } as BiText,
  t_2e80c8b0: { ar: "عرض تقديمي", en: "PowerPoint" } as BiText,
  t_c4c89894: { ar: "جدول بيانات", en: "Excel" } as BiText,
});
