import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("archivevideoplayer", {
  soundOn: { ar: "تشغيل الصوت", en: "Turn Sound On" } as BiText,
  soundOff: { ar: "كتم الصوت", en: "Mute" } as BiText,
  unsupported: {
    ar: "لا يدعم متصفحك تشغيل هذا المقطع.",
    en: "Your browser cannot play this clip.",
  } as BiText,
});
