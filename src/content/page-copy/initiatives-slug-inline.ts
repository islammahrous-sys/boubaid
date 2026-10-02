import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/initiatives.$slug.tsx — editable from the CMS. */
export const inl = registerCopy("initiatives-slug-inline", {
  t_159b4c80: { ar: "تم نسخ الرابط بنجاح", en: "Link copied to clipboard" } as BiText,
  t_4b393e5f: { ar: "تعذر نسخ الرابط", en: "Failed to copy link" } as BiText,
  t_62a6b97c: { ar: "مشاركة عبر واتساب", en: "WhatsApp" } as BiText,
  t_6cf4d226: { ar: "تم النسخ", en: "Copied" } as BiText,
  t_2cb5c425: { ar: "نسخ الرابط", en: "Copy" } as BiText,
  t_719f7fd9: { ar: "دعم وتمويل البرنامج", en: "Program Funding & Support" } as BiText,
  t_1461042f: {
    ar: "ساهم في دعم وتحقيق أهداف هذه المبادرة",
    en: "Support and contribute to this initiative",
  } as BiText,
  t_f741ab62: {
    ar: "تُدار المساهمات عبر الحساب البنكي الرسمي لصندوق التنمية العائلية.",
    en: "Contributions are handled via the official Family Development Fund account.",
  } as BiText,
  t_364e0e12: { ar: "المساهمة في المبادرة", en: "Contribute Now" } as BiText,
});
