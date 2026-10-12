import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/AnnouncementTicker.tsx — editable from the CMS. */
export const inl = registerCopy("announcementticker-inline", {
  t_c1896902: { ar: "إغلاق شريط الإعلانات", en: "Dismiss announcement" } as BiText,
});
