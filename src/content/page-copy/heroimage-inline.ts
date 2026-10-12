import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/HeroImage.tsx — editable from the CMS. */
export const inl = registerCopy("heroimage-inline", {
  t_7c264f79: { ar: "التحكم في صور الواجهة", en: "Hero slides control" } as BiText,
});
