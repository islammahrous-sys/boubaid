import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("contribute", {
  eyebrow: { ar: "الاشتراكات والمساهمات", en: "Subscriptions & contributions" } as BiText,
  title: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } as BiText,
  subtitle: {
    ar: "بيانات الحساب البنكي المعتمد لصندوق التنمية العائلية، لاستخدام أفراد الأسرة عند الاشتراك أو المساهمة.",
    en: "The approved bank account details of the Family Development Fund, for family members subscribing or contributing.",
  } as BiText,
  sectionTitle: { ar: "بيانات الحساب البنكي", en: "Bank account details" } as BiText,
});
