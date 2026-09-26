import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("family-tree", {
  eyebrow: { ar: "المشجرة", en: "Family tree" } as BiText,
  title: { ar: "الفروع امتداد الجذور", en: "The Branches Extend the Roots" } as BiText,
  patriarch: { ar: "الجد الجامع", en: "Root ancestor" } as BiText,
  patriarchValue: {
    ar: "عبد الله بن دارم — العبادل من بني تميم",
    en: "ʿAbd Allāh ibn Dārim — the ʿAbadil of Banu Tamim",
  } as BiText,
  fullscreen: { ar: "فتح بملء الشاشة", en: "Open full screen" } as BiText,
});
