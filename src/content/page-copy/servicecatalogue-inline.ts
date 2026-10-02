import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/ServiceCatalogue.tsx — editable from the CMS. */
export const inl = registerCopy("servicecatalogue-inline", {
  t_3e83ce6f: { ar: "خدمات أفراد الأسرة", en: "Services for Family Members" } as BiText,
  t_19fc1d8d: { ar: "خدمات المنشآت", en: "Services for Establishments" } as BiText,
  t_d6efcc71: {
    ar: "لمزيد من التفاصيل حول هذه الخدمة، يُرجى التواصل مع أمانة مجلس الأسرة.",
    en: "For further details about this service, please contact the Family Council secretariat.",
  } as BiText,
  t_5801bca6: { ar: "الوثائق المرتبطة", en: "Related documents" } as BiText,
  t_f240ee05: {
    ar: "لا توجد وثائق منشورة لهذه الخدمة في الوقت الحالي.",
    en: "No documents have been published for this service yet.",
  } as BiText,
  t_c47895fb: { ar: "عرض", en: "View" } as BiText,
  t_ec475806: { ar: "سجّل خدمتك", en: "Register your service" } as BiText,
  t_1260a420: { ar: "وثيقة", en: "documents" } as BiText,
});
