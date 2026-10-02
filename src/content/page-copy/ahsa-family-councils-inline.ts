import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/ahsa-family-councils.tsx — editable from the CMS. */
export const inl = registerCopy("ahsa-family-councils-inline", {
  t_6a4948f2: { ar: "الشراكات الأسرية", en: "Family partnerships" } as BiText,
  t_a7e0e1eb: { ar: "مجالس أسر الأحساء", en: "Al-Ahsa Family Councils" } as BiText,
  t_2c3a3d5a: { ar: "المجالس", en: "Councils" } as BiText,
  t_9ce31333: {
    ar: "تنسق أمانة مجلس الأسرة مع مجالس أسر الأحساء المعتمدة لتعزيز أواصر التعاون والعمل الأهلي المشترك وتبادل المبادرات الاجتماعية.",
    en: "The Family Council Secretariat coordinates with accredited Al-Ahsa family councils to enhance mutual cooperation and exchange social initiatives.",
  } as BiText,
  t_851a6386: {
    ar: "الانضمام إلى مجالس أسر الأحساء",
    en: "Join the Al-Ahsa Family Councils",
  } as BiText,
});
