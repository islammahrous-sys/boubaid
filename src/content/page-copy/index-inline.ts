import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/index.tsx — editable from the CMS. */
export const inl = registerCopy("index-inline", {
  t_fbfc687f: { ar: "شعار مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council mark" } as BiText,
  t_dceea135: { ar: "تصفح مشجرة النسب", en: "Explore Family Tree" } as BiText,
  t_279322fd: { ar: "أرقام ومنجزات", en: "Numbers & Achievements" } as BiText,
  t_881212c1: { ar: "الأسرة في أرقام ومنجزات", en: "The Family in Numbers" } as BiText,
  t_2fb3840b: { ar: "الشجرة التفاعلية", en: "Interactive Tree" } as BiText,
  t_d858321e: {
    ar: "شجرة العائلة الرقمية التفاعلية",
    en: "Interactive Digital Family Tree",
  } as BiText,
  t_5090b82d: { ar: "فتح الشجرة التفاعلية", en: "Open Tree Canvas" } as BiText,
  t_b5065b03: { ar: "التقويم", en: "Calendar" } as BiText,
  t_c6f2e4b6: {
    ar: "الفعاليات والاجتماعات العائلية",
    en: "Family Events & Council Meetings",
  } as BiText,
  t_cecded4a: { ar: "سجل الفعاليات", en: "View all events" } as BiText,
  t_0e0bb33d: { ar: "الأرشيف", en: "Archive" } as BiText,
  t_e3e60439: { ar: "المزيد", en: "More" } as BiText,
});
