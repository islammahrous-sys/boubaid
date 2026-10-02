import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/HqProjectVideo.tsx — editable from the CMS. */
export const inl = registerCopy("hqprojectvideo-inline", {
  t_15e4f98a: { ar: "تشغيل الصوت", en: "Sound on" } as BiText,
  t_ac3b32d5: { ar: "كتم الصوت", en: "Sound off" } as BiText,
});
