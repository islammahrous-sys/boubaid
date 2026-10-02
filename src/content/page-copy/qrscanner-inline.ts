import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/QrScanner.tsx — editable from the CMS. */
export const inl = registerCopy("qrscanner-inline", {
  t_a313b90d: { ar: "مسح بطاقة عضو بالكاميرا", en: "Scan a member card" } as BiText,
});
