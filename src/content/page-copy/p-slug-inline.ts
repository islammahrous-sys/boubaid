import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/p.$slug.tsx — editable from the CMS. */
export const inl = registerCopy("p-slug-inline", {
  t_4da3eb17: { ar: "جاري الإرسال...", en: "Sending..." } as BiText,
  t_ca691bb0: { ar: "إرسال", en: "Send" } as BiText,
});
