import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/MediaViewerDialog.tsx — editable from the CMS. */
export const inl = registerCopy("mediaviewerdialog-inline", {
  t_6a1b9996: { ar: "إغلاق العارض", en: "Close viewer" } as BiText,
  t_21250b81: { ar: "إغلاق", en: "Close" } as BiText,
});
