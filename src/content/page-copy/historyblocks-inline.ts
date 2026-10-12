import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/HistoryBlocks.tsx — editable from the CMS. */
export const inl = registerCopy("historyblocks-inline", {
  t_b2d94934: { ar: "تكبير الصورة", en: "Enlarge image" } as BiText,
  t_a0a792d8: { ar: "عرض بالحجم الكامل", en: "View full size" } as BiText,
  t_1f640bc6: {
    ar: "اسحب الجدول أفقياً لعرض جميع الأعمدة.",
    en: "Scroll the table horizontally to see all columns.",
  } as BiText,
});
