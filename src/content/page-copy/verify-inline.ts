import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/verify.tsx — editable from the CMS. */
export const inl = registerCopy("verify-inline", {
  t_bab803ce: {
    ar: "منظومة التوثيق الرقمي المعتمدة",
    en: "Official Verification System",
  } as BiText,
  t_07e2a46b: { ar: "مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council" } as BiText,
  t_9134218c: {
    ar: "صندوق التنمية العائلية · ترخيص المركز الوطني لتنمية القطاع غير الربحي رقم 1200758400",
    en: "Family Development Fund · NCNP License #1200758400",
  } as BiText,
  t_c4e7d225: {
    ar: "جاري التحقق من السجل العائلي الرسمي...",
    en: "Verifying official record...",
  } as BiText,
  t_7d198118: {
    ar: "شهادة عضوية رقمية موثقة",
    en: "Official Digital Member Certificate",
  } as BiText,
  t_b76b522b: { ar: "سجل نظامي معتمد ونشط", en: "Verified & Active Member Record" } as BiText,
  t_2b061d8a: { ar: "الفرع العائلي", en: "Family Branch" } as BiText,
  t_8581c532: { ar: "رقم العضوية", en: "Member Code" } as BiText,
  t_1c4c862c: { ar: "الجهة المصدرة:", en: "Issuing Authority:" } as BiText,
  t_105a5ebd: { ar: "أمانة مجلس أسرة آل بوعبيد", en: "General Secretariat" } as BiText,
  t_4915b1f7: { ar: "الترخيص الحكومي:", en: "Gov. License:" } as BiText,
  t_fb2fca84: { ar: "الموقع الجغرافي:", en: "Location:" } as BiText,
  t_d1556f71: { ar: "المملكة العربية السعودية · الأحساء", en: "Saudi Arabia, Al-Ahsa" } as BiText,
  t_ddcdca2d: { ar: "طباعة / حفظ شهادة العضوية", en: "Print / Save Certificate" } as BiText,
  t_abc40af5: {
    ar: "تمت مطابقة هذا الباركود المشفر مع قاعدة البيانات السحابية الرسمية.",
    en: "Cryptographically verified against the official cloud database.",
  } as BiText,
  t_87c5926e: { ar: "تعذر التحقق من رمز العضوية", en: "Verification Failed" } as BiText,
  t_690cdee5: {
    ar: "الرمز المدخل غير مسجل أو غير مكتمل التوثيق في سجلات أمانة الأسرة الرسمية.",
    en: "The scanned code is invalid or not registered in official records.",
  } as BiText,
  t_c3ba4b9e: { ar: "العودة إلى البوابة الرئيسية", en: "Back to Home" } as BiText,
});
