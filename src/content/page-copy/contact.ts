import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("contact", {
  eyebrow: { ar: "المراسلة", en: "Correspondence" } as BiText,
  title: { ar: "التواصل مع الأمانة العامة", en: "Contact the Secretariat" } as BiText,
  subtitle: {
    ar: "تُوجَّه الاستفسارات والمقترحات وطلبات القيد إلى الأمانة العامة، فتحال إلى اللجنة المختصة. مدة الرد المعتادة ثلاثة أيام عمل.",
    en: "Enquiries, proposals, and registration requests go to the secretariat and are referred to the relevant committee. The usual response time is three working days.",
  } as BiText,

  formTitle: { ar: "نموذج المراسلة", en: "Correspondence form" } as BiText,
  fieldName: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  fieldEmail: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  fieldSubject: { ar: "الموضوع", en: "Subject" } as BiText,
  fieldMessage: { ar: "نص الرسالة", en: "Message" } as BiText,
  submit: { ar: "إرسال", en: "Send" } as BiText,
  sent: {
    ar: "تم استلام رسالتك. ستصلك إفادة الأمانة العامة قريباً.",
    en: "Your message has been received. The secretariat will respond shortly.",
  } as BiText,
  invalid: {
    ar: "يرجى مراجعة الحقول المطلوبة.",
    en: "Please check the required fields.",
  } as BiText,
  failed: {
    ar: "تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    en: "The message could not be sent. Please try again.",
  } as BiText,
  rateLimited: {
    ar: "تم استلام عدة رسائل من هذا الجهاز. يرجى المحاولة بعد قليل.",
    en: "Several messages have arrived from this device. Please try again shortly.",
  } as BiText,
  verificationFailed: {
    ar: "تعذّر التحقق من أنك لست آلياً. يرجى إعادة المحاولة.",
    en: "We couldn't complete the anti-bot check. Please try again.",
  } as BiText,
  required: { ar: "مطلوب", en: "required" } as BiText,

  subjects: [
    { ar: "استفسار عام", en: "General enquiry" },
    { ar: "قيد في المشجرة أو تصحيح بيانات", en: "Family tree entry or correction" },
    { ar: "ترشيح لسجل المتميزين", en: "Nomination for the roll of honour" },
    { ar: "إدراج منشأة في دليل الأعمال", en: "Business directory listing" },
    { ar: "الاشتراكات والمساهمات", en: "Subscriptions and contributions" },
    { ar: "الأرشيف والوثائق", en: "Archive and documents" },
  ] as BiText[],

  detailsTitle: { ar: "بيانات التواصل", en: "Contact particulars" } as BiText,
  labelAddress: { ar: "العنوان", en: "Address" } as BiText,
  labelPhone: { ar: "الهاتف", en: "Telephone" } as BiText,
  labelEmail: { ar: "البريد", en: "Email" } as BiText,
  labelChannel: { ar: "قناة الأسرة", en: "Family channel" } as BiText,
  joinChannel: { ar: "الانضمام لقناة واتساب", en: "Join the WhatsApp channel" } as BiText,

  hoursTitle: { ar: "أوقات العمل", en: "Office hours" } as BiText,
  hoursValue: {
    ar: "الأحد إلى الخميس، ٤:٠٠ — ٨:٠٠ مساءً بتوقيت المملكة.",
    en: "Sunday to Thursday, 4:00 — 8:00 pm Saudi time.",
  } as BiText,

  noteTitle: { ar: "ملاحظة", en: "Note" } as BiText,
  noteBody: {
    ar: "لا تُقبل عبر هذا النموذج أي بيانات مالية أو أرقام حسابات. أما المساهمات فتتم حصراً عبر القنوات المعتمدة في صفحة الاشتراك.",
    en: "Please do not submit financial details or account numbers through this form. Contributions are made only through the approved channels on the subscription page.",
  } as BiText,
});
