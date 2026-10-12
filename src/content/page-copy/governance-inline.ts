import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/governance.tsx — editable from the CMS. */
export const inl = registerCopy("governance-inline", {
  t_023027f8: { ar: "الغرض والاختصاص", en: "Purpose & remit" } as BiText,
  t_14f8ec2c: { ar: "مجلس الأمناء", en: "Board of Trustees" } as BiText,
  t_a9d15d4f: { ar: "عرض المخطط بالحجم الكامل", en: "Open chart full size" } as BiText,
  t_696002a3: {
    ar: "اضغط على المخطط لعرضه بالحجم الكامل.",
    en: "Tap the chart to view it full size.",
  } as BiText,
  t_d1f1355b: {
    ar: "المركز الوطني لتنمية القطاع غير الربحي",
    en: "NATIONAL CENTER FOR NONPROFIT SECTOR",
  } as BiText,
  t_efd48093: { ar: "مرخص رسمياً", en: "REGISTERED" } as BiText,
  t_203448fe: {
    ar: "الهيكل التنظيمي لمجلس أمناء الصندوق",
    en: "Organizational Chart of the Fund's Board of Trustees",
  } as BiText,
});
