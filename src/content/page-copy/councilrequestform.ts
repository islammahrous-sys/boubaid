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
  successTitle: {
    ar: "تم تقديم الطلب بنجاح",
    en: "Request Submitted Successfully",
  } as BiText,
  successSubtitle: {
    ar: "تم تسجيل طلبكم رسمياً وإحالته إلى مسار الاعتماد لدى أمانة المجلس واللجنة المعنية.",
    en: "Your request has been officially recorded and forwarded to the council secretariat and committee review path.",
  } as BiText,
  refLabel: {
    ar: "رقم المعاملة / الطلب",
    en: "Reference / Request Number",
  } as BiText,
  copyRef: {
    ar: "نسخ الرقم",
    en: "Copy Number",
  } as BiText,
  copiedRef: {
    ar: "تم نسخ رقم المعاملة بنجاح",
    en: "Reference number copied",
  } as BiText,
  workflowTitle: {
    ar: "مراحل مسار الاعتماد",
    en: "Approval Process Stages",
  } as BiText,
  stage1: {
    ar: "تم الاستلام وتسجيل المعاملة",
    en: "Received & Registered",
  } as BiText,
  stage2: {
    ar: "المراجعة والتدقيق من اللجنة المختصة",
    en: "Committee Review & Verification",
  } as BiText,
  stage3: {
    ar: "قرار الاعتماد أو الاعتذار والإشعار",
    en: "Approval Decision & Official Notification",
  } as BiText,
  stage4: {
    ar: "التنفيذ والإنجاز النهائي",
    en: "Execution & Final Completion",
  } as BiText,
  emailNotice: {
    ar: "تم إرسال إشعار تأكيد إلى بريدك الإلكتروني يتضمن رقم المرجع وتفاصيل الطلب.",
    en: "A confirmation email containing your reference number and request details has been sent to your address.",
  } as BiText,
  close: {
    ar: "إغلاق",
    en: "Close",
  } as BiText,
});

