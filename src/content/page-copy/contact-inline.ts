import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/contact.tsx — editable from the CMS. */
export const inl = registerCopy("contact-inline", {
  t_1f3eafc6: { ar: "الكيان الرسمي", en: "Registered entity" } as BiText,
  t_1a458fc3: { ar: "ترخيص NCNP", en: "NCNP Lic." } as BiText,
  t_0d3be1d0: { ar: "الرقم الوطني الموحد", en: "Unified National No." } as BiText,
  t_dae0916e: {
    ar: "الوثائق والتراخيص المكانية",
    en: "Location & Registration Documents",
  } as BiText,
  t_53b54432: { ar: "-- اختر موضوع المراسلة --", en: "-- Select Subject --" } as BiText,
  t_c4cafe4f: { ar: "عرض الموقع على خرائط Google", en: "View on Google Maps" } as BiText,
  t_069e6a26: {
    ar: "السلام عليكم ورحمة الله، أود الاستفسار من أمانة المجلس.",
    en: "Peace be upon you, I have an enquiry for the council.",
  } as BiText,
  t_ca182321: { ar: "محادثة فورية مع الأمانة العامة", en: "Chat on WhatsApp" } as BiText,
});
