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
});
