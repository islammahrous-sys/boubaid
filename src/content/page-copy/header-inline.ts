import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/Header.tsx — editable from the CMS. */
export const inl = registerCopy("header-inline", {
  t_02518b8c: { ar: "كيان أهلي مرخص", en: "Licensed Nonprofit" } as BiText,
  t_07e2a46b: { ar: "مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council" } as BiText,
  t_619c3dd1: { ar: "القائمة الفرعية", en: "submenu" } as BiText,
  t_e3e60439: { ar: "المزيد", en: "More" } as BiText,
  t_0768bd9e: { ar: "بحث في المنظومة (Ctrl+K)", en: "Search portal (Ctrl+K)" } as BiText,
  t_7ef1fce0: { ar: "بحث...", en: "Search..." } as BiText,
  t_d5d7bb61: { ar: "بحث", en: "Search" } as BiText,
  t_9c76836f: { ar: "متجر شجرة العائلة", en: "Family tree store" } as BiText,
  t_b3f688b6: { ar: "الخزينة", en: "Treasury" } as BiText,
  t_9658eb71: { ar: "حسابي", en: "My account" } as BiText,
  t_ebee3f50: { ar: "تسجيل الدخول", en: "Sign in" } as BiText,
  t_61f0b078: { ar: "الاشتراك", en: "Subscribe" } as BiText,
  t_1ef1fc5e: { ar: "إغلاق القائمة", en: "Close menu" } as BiText,
  t_d74f57d4: { ar: "فتح القائمة", en: "Open menu" } as BiText,
  t_e9db4aa5: { ar: "الروابط الرئيسية", en: "Main Navigation" } as BiText,
  t_c330a77d: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } as BiText,
});
