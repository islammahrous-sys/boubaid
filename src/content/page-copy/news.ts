import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("news", {
  masthead: { ar: "المركز الإعلامي", en: "Media Centre" } as BiText,
  issuedBy: { ar: "تصدر عن", en: "Issued by" } as BiText,
  filterAll: { ar: "الكل", en: "All" } as BiText,
  filterFund: { ar: "شؤون الصندوق", en: "Fund Affairs" } as BiText,
  filterFamily: { ar: "شؤون الأسرة", en: "Family" } as BiText,
  lead: { ar: "الخبر الرئيسي", en: "Lead story" } as BiText,
  more: { ar: "أخبار أخرى", en: "More news" } as BiText,
  readOn: { ar: "تتمة الخبر", en: "Continue reading" } as BiText,
  empty: { ar: "لا توجد أخبار في هذا القسم.", en: "No news in this section." } as BiText,
});
