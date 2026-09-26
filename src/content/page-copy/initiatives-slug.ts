import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("initiatives-slug", {
  parent: { ar: "المبادرات والمشاريع", en: "Initiatives & projects" } as BiText,
  eyebrow: { ar: "بيان برنامج", en: "Programme note" } as BiText,
  active: { ar: "جارية", en: "Active" } as BiText,
  planned: { ar: "مخططة", en: "Planned" } as BiText,
  completed: { ar: "منتهية", en: "Completed" } as BiText,
  aboutTitle: { ar: "عن البرنامج", en: "About the programme" } as BiText,
  otherTitle: { ar: "برامج أخرى", en: "Other programmes" } as BiText,
  contactTitle: { ar: "المشاركة والاستفسار", en: "Taking part" } as BiText,
  contactBody: {
    ar: "يسعدنا انضمامك لهذه المبادرة. سجّل رغبتك أدناه وسيتواصل معك فريق البرنامج، أو راسل الأمانة العامة مباشرة للاستفسار.",
    en: "We'd welcome you joining this programme. Register your interest below and the programme team will be in touch, or write to the secretariat directly with questions.",
  } as BiText,
  joinCta: { ar: "أرغب بالمشاركة", en: "I want to join" } as BiText,
  contactCta: { ar: "مراسلة الأمانة العامة", en: "Write to the secretariat" } as BiText,
  back: { ar: "كل المبادرات", en: "All initiatives" } as BiText,

  joinDialogTitle: { ar: "التسجيل للمشاركة", en: "Register Your Interest" } as BiText,
  fieldName: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  fieldEmail: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  fieldPhone: { ar: "رقم الهاتف (اختياري)", en: "Phone (optional)" } as BiText,
  fieldNotes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" } as BiText,
  joinSubmit: { ar: "إرسال الرغبة بالمشاركة", en: "Submit interest" } as BiText,
  cancel: { ar: "إلغاء", en: "Cancel" } as BiText,
  joinSuccess: {
    ar: "تم تسجيل رغبتك بالمشاركة. سيتواصل معك فريق البرنامج قريباً.",
    en: "Your interest has been registered. The programme team will be in touch soon.",
  } as BiText,
  joinErrorDuplicate: {
    ar: "لديك تسجيل سابق بنفس البريد الإلكتروني لهذه المبادرة.",
    en: "You've already registered interest in this initiative with this email.",
  } as BiText,
  joinErrorGeneric: {
    ar: "تعذّر إتمام التسجيل. يرجى المحاولة مرة أخرى.",
    en: "Could not complete registration. Please try again.",
  } as BiText,
  joinInvalid: {
    ar: "يرجى مراجعة الحقول المطلوبة.",
    en: "Please check the required fields.",
  } as BiText,
});
