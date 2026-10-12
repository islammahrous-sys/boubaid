import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/fund-financials.tsx — editable from the CMS. */
export const inl = registerCopy("fund-financials-inline", {
  t_2f0f9843: {
    ar: "القوائم المالية بداية من عام 2026",
    en: "Financial statements from 2026 onward",
  } as BiText,
  t_6c22913c: {
    ar: "تُحوَّل طلبات الاستعلام المالي إلى رئيس مجلس الأسرة د. خالد بوعبيد للاعتماد قبل تزويد مقدّم الطلب بالبيانات.",
    en: "Financial inquiries are routed to the Family Council President, Dr. Khaled Bu Obaid, for approval before any figures are released.",
  } as BiText,
});
