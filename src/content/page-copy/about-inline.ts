import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/about.tsx — editable from the CMS. */
export const inl = registerCopy("about-inline", {
  t_35e79b4e: { ar: "عمود النسب", en: "Chain of descent" } as BiText,
  t_1f3eafc6: { ar: "الكيان الرسمي", en: "Registered entity" } as BiText,
  t_16176c56: { ar: "المحطات والشواهد", en: "Milestones & Records" } as BiText,
  t_edbe22de: {
    ar: "المحطات التاريخية والوقائع الموثقة",
    en: "Documented Historical Milestones",
  } as BiText,
  t_10533dee: {
    ar: "سجل زمني يوثق أبرز المحطات والوثائق التاريخية المحفوظة لأسرة آل بوعبيد عبر العصور.",
    en: "Chronological register documenting key historical milestones and preserved family records.",
  } as BiText,
});
