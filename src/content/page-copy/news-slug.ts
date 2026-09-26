import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("news-slug", {
  bulletin: { ar: "نشرة الأسرة", en: "The Family Bulletin" } as BiText,
  fund: { ar: "شؤون الصندوق", en: "Fund Affairs" } as BiText,
  family: { ar: "شؤون الأسرة", en: "Family" } as BiText,
  share: { ar: "مشاركة", en: "Share" } as BiText,
  copyLink: { ar: "نسخ الرابط", en: "Copy link" } as BiText,
  copied: { ar: "تم نسخ الرابط.", en: "Link copied." } as BiText,
  back: { ar: "العودة إلى النشرة", en: "Back to the bulletin" } as BiText,
  alsoIn: { ar: "في العدد نفسه", en: "Also in this issue" } as BiText,
  issuedBy: { ar: "صادر عن", en: "Issued by" } as BiText,
  home: { ar: "الرئيسية", en: "Home" } as BiText,
  next: { ar: "الخبر التالي", en: "Next dispatch" } as BiText,
  prev: { ar: "الخبر السابق", en: "Previous dispatch" } as BiText,
});
