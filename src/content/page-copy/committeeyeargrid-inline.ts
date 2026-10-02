import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/CommitteeYearGrid.tsx — editable from the CMS. */
export const inl = registerCopy("committeeyeargrid-inline", {
  t_2b8d6ac1: { ar: "مسابقة رمضان الثقافية", en: "Ramadan Cultural Quiz" } as BiText,
  t_c1732587: { ar: "الأعمال التطوعية", en: "Volunteer Work" } as BiText,
  t_d170f0ca: { ar: "ساعات التطوع", en: "Volunteer Hours" } as BiText,
  t_9560802a: {
    ar: "مشروع المقر الدائم للأسرة",
    en: "Permanent Family Headquarters Project",
  } as BiText,
  t_9bd0a74d: { ar: "الأنشطة المخطط لها ١٤٤٨ هـ", en: "Planned activities 1448 AH" } as BiText,
  t_6715c119: {
    ar: "تُحدّث الأنشطة وفق الجدول الزمني المعتمد للجنة.",
    en: "Activities are updated according to the committee's approved schedule.",
  } as BiText,
  t_a3f57888: { ar: "لا توجد مواد مؤرشفة بعد.", en: "No archived materials yet." } as BiText,
  t_c47895fb: { ar: "عرض", en: "View" } as BiText,
  t_ee037f30: { ar: "تحميل", en: "Download" } as BiText,
});
