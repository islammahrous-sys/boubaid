import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("library-museum-slug", {
  back: { ar: "المكتبة الرقمية", en: "Digital Library" } as BiText,
  empty: {
    ar: "لا توجد صور منشورة في هذه المجموعة بعد.",
    en: "No published images yet.",
  } as BiText,
  loadMore: { ar: "عرض المزيد من الصور", en: "Load more images" } as BiText,
});
