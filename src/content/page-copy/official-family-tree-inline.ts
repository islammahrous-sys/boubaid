import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/official-family-tree.tsx — editable from the CMS. */
export const inl = registerCopy("official-family-tree-inline", {
  t_05dd125b: { ar: "الإصدار", en: "Edition" } as BiText,
  t_c49d1e60: { ar: "الأول ١٤٤٧هـ", en: "First 1447H" } as BiText,
  t_9f0aa08e: { ar: "التوصيل", en: "Delivery" } as BiText,
  t_f258e00e: { ar: "مؤطر وجاهز", en: "Framed & ready" } as BiText,
  t_df17112f: { ar: "مقاس خاص", en: "Custom size" } as BiText,
  t_d4bc22a3: { ar: "متاح", en: "Available" } as BiText,
  t_4274ddfd: { ar: "الشراء الآن", en: "Buy now" } as BiText,
  t_84ce44b7: {
    ar: "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد",
    en: "The official illustrated family tree of the Al Bu Obaid family",
  } as BiText,
});
