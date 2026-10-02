import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/fund-certificates.tsx — editable from the CMS. */
export const inl = registerCopy("fund-certificates-inline", {
  t_48860493: { ar: "صندوق التنمية العائلية", en: "Family Development Fund" } as BiText,
  t_27ea86d5: { ar: "الشهادات و الاثباتات", en: "Certificates & Attestations" } as BiText,
  t_638f6140: {
    ar: "المرجع الرسمي الواحد لجميع شهادات الصندوق ووثائقه النظامية المعتمدة من مجلس الأسرة.",
    en: "The single official reference for all the fund's certificates and statutory documents approved by the Family Council.",
  } as BiText,
  t_d7a60932: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  t_72e06534: { ar: "جهة الإصدار", en: "Issued by" } as BiText,
  t_076a4f5a: { ar: "تاريخ الإشهار", en: "Registered" } as BiText,
  t_ae58750b: { ar: "جديد", en: "New" } as BiText,
  t_5e7c8b48: { ar: "عرض الوثيقة", en: "View document" } as BiText,
});
