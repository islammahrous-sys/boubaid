import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("councilrequestform", {
  name: { ar: "الاسم الكامل *", en: "Full name *" } as BiText,
  phone: { ar: "رقم التواصل *", en: "Contact number *" } as BiText,
  email: { ar: "البريد الإلكتروني", en: "Email" } as BiText,
  branch: { ar: "الفرع", en: "Branch" } as BiText,
  link: { ar: "رابط (اختياري)", en: "Link (optional)" } as BiText,
  attachments: {
    ar: "مرفقات (صورة أو مستند — حتى ٣ ملفات)",
    en: "Attachments (photo or document — up to 3 files)",
  } as BiText,
  templateLabel: { ar: "القالب الرسمي المرتبط", en: "Linked official template" } as BiText,
  committeeLabel: { ar: "اللجنة المختصة", en: "Destination committee" } as BiText,
  submit: { ar: "إرسال الطلب", en: "Send a Request" } as BiText,
  sending: { ar: "جارٍ الإرسال…", en: "Sending…" } as BiText,
  success: {
    ar: "تم استلام طلبك، وستتم مراجعته من الأمانة العامة.",
    en: "Your request has been received and will be reviewed by the secretariat.",
  } as BiText,
  successRef: { ar: "رقم الطلب", en: "Request reference" } as BiText,
  failure: {
    ar: "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.",
    en: "The request could not be sent. Please try again.",
  } as BiText,
  rateLimited: {
    ar: "تم استلام عدد كبير من الطلبات، يرجى المحاولة بعد قليل.",
    en: "Too many requests received. Please try again shortly.",
  } as BiText,
  attachmentTooLarge: {
    ar: "حجم الملف كبير، الحد الأقصى ١٠ ميغابايت لكل ملف.",
    en: "That file is too large; the limit is 10 MB per file.",
  } as BiText,
  attachmentType: {
    ar: "نوع الملف غير مدعوم. المسموح: PDF أو صورة.",
    en: "Unsupported file type. Allowed: PDF or image.",
  } as BiText,
});
