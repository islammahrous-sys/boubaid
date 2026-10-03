import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/contribute.tsx — editable from the CMS. */
export const inl = registerCopy("contribute-inline", {
  t_5bd3ce0b: { ar: "اسم البنك", en: "Bank name" } as BiText,
  t_2d5a1294: { ar: "اسم الحساب", en: "Account name" } as BiText,
  t_4a27396d: {
    ar: "رقم العميل / الهوية / السجل",
    en: "Customer ID / National ID / CR number",
  } as BiText,
  t_5d70aa49: { ar: "رقم الحساب", en: "Account number" } as BiText,
  t_39d195d6: { ar: "رقم الآيبان", en: "IBAN number" } as BiText,
  t_80fbdcaf: { ar: "البنك", en: "Bank" } as BiText,
  t_2f3fb2d5: { ar: "رقم الآيبان", en: "IBAN" } as BiText,
  t_34bf31bf: {
    ar: "يُرجى التحقق من مطابقة اسم الحساب ورقم الآيبان قبل أي تحويل.",
    en: "Please verify the account name and IBAN match before making any transfer.",
  } as BiText,
  verifiedTitle: { ar: "حساب رسمي موثّق", en: "Verified official account" } as BiText,
  verifiedBody: {
    ar: "الحساب مسجّل باسم صندوق التنمية العائلية، الكيان الأهلي المرخّص للأسرة. لا تحوّل لأي حساب آخر يصلك عبر الرسائل.",
    en: "The account is registered to the Family Development Fund, the family's licensed nonprofit. Never transfer to any other account sent to you by message.",
  } as BiText,
  verifiedAuthority: { ar: "جهة الترخيص", en: "Licensing authority" } as BiText,
  verifiedLicense: { ar: "رقم الترخيص", en: "License number" } as BiText,
  verifiedUnified: { ar: "الرقم الوطني الموحّد", en: "Unified national number" } as BiText,
  verifiedLink: {
    ar: "شهادة الترخيص وخطاب البنك",
    en: "License certificate and bank letter",
  } as BiText,
});
