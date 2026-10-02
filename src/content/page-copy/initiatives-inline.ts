import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/initiatives.tsx — editable from the CMS. */
export const inl = registerCopy("initiatives-inline", {
  t_c8caa056: { ar: "تكلفة البناء والتمويل", en: "Construction cost & funding" } as BiText,
  t_ac8caaf4: { ar: "ننتظر دعمك", en: "We await your support" } as BiText,
});
