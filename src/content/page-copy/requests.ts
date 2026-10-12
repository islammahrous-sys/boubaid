import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("requests", {
  eyebrow: { ar: "بوابة واحدة", en: "One front door" } as BiText,
  title: { ar: "مركز الطلبات", en: "Requests Hub" } as BiText,
  subtitle: {
    ar: "كل ما يمكن طلبه من الأسرة في مكان واحد: اختر نوع الطلب، قدّمه، ثم تابع حالته من حسابك.",
    en: "Everything you can request from the family council in one place: pick a request, submit it, then follow its status from your account.",
  } as BiText,

  submitTitle: { ar: "تقديم طلب", en: "Submit a Request" } as BiText,
  submitNote: {
    ar: "الطلبات مرتبة في مجموعات. يفتح البند إما الصفحة الرسمية الخاصة به على الموقع، أو نموذج تقديم مباشر يصل إلى الأمانة العامة، ولا يوجد نموذج بديل أو مواز.",
    en: "Requests are grouped by subject. Each item either opens its own official page on this site or a direct form that reaches the secretariat; there is no parallel or duplicate form.",
  } as BiText,

  mineTitle: { ar: "طلباتي ومتابعتها", en: "My Requests & Tracking" } as BiText,
  mineNote: {
    ar: "حالة الطلبات والإشعارات والسجل المالي تظهر في حسابك بعد تسجيل الدخول.",
    en: "Request status, notifications, and your contribution record appear in your account after signing in.",
  } as BiText,
  mineCta: { ar: "الانتقال إلى حسابي", en: "Go to my account" } as BiText,
  signInCta: { ar: "تسجيل الدخول لمتابعة طلباتي", en: "Sign in to track my requests" } as BiText,

  approvalsTitle: { ar: "طلبات تنتظر اعتمادي", en: "Awaiting My Approval" } as BiText,
  approvalsNote: {
    ar: "تظهر هذه الروابط لأصحاب الصلاحية فقط، وتفتح شاشات المراجعة النظامية في لوحة الإدارة كما هي.",
    en: "These links appear only to authorised reviewers and open the existing review screens in the console unchanged.",
  } as BiText,

  lifecycleTitle: { ar: "مسار الطلب", en: "How a request travels" } as BiText,
  steps: [
    { ar: "تقديم الطلب", en: "Submit" },
    { ar: "المراجعة", en: "Review" },
    { ar: "الاعتماد أو الاعتذار", en: "Approval or rejection" },
    { ar: "المتابعة والحالة", en: "Status & follow-up" },
    { ar: "الإنجاز", en: "Completion" },
  ] as BiText[],

  action: { ar: "تقديم الطلب", en: "Send a Request" } as BiText,
  committeeIntro: {
    ar: "اختر اللجنة المختصة حتى يصل الطلب مباشرة إلى مسار المتابعة المناسب.",
    en: "Choose the relevant committee so your request reaches the correct review path directly.",
  } as BiText,
  signInNote: { ar: "يتطلب تسجيل الدخول", en: "Requires sign-in" } as BiText,
  trackTitle: {
    ar: "تتبع حالة الطلب برقم المعاملة",
    en: "Track Request by Reference Number",
  } as BiText,
  trackSubtitle: {
    ar: "أدخل رقم الطلب المعطى لك عند التقديم للاطلاع على مرحلة الاعتماد الحالية.",
    en: "Enter the reference number given upon submission to view its current approval stage.",
  } as BiText,
  trackPlaceholder: {
    ar: "مثال: ABF-REQ-261001-A7K2D",
    en: "e.g. ABF-REQ-261001-A7K2D",
  } as BiText,
  trackButton: {
    ar: "استعلام عن الحالة",
    en: "Check Status",
  } as BiText,
  trackSearching: {
    ar: "جارٍ التحقق…",
    en: "Checking…",
  } as BiText,
  trackNotFound: {
    ar: "لم يتم العثور على معاملة مطابقة لهذا الرقم. يرجى التحقق من الرقم والمحاولة مرة أخرى.",
    en: "No request found matching this reference number. Please verify and try again.",
  } as BiText,
  myRecentRequests: {
    ar: "الطلبات المسجلة بحسابك",
    en: "Requests on Your Account",
  } as BiText,
  noRequestsYet: {
    ar: "لا توجد طلبات مسجلة بحسابك حالياً.",
    en: "No requests found on your account yet.",
  } as BiText,
  statusNew: {
    ar: "جديد — قيد الانتظار للمراجعة",
    en: "New — Pending Review",
  } as BiText,
  statusReview: {
    ar: "قيد المراجعة والدراسة من اللجنة",
    en: "Under Review by Committee",
  } as BiText,
  statusApproved: {
    ar: "معتمد ومقبول رسمياً",
    en: "Officially Approved",
  } as BiText,
  statusRejected: {
    ar: "تمت المراجعة والاعتذار",
    en: "Reviewed & Declined",
  } as BiText,
  statusCompleted: {
    ar: "مكتمل ومنجز بالكامل",
    en: "Completed & Executed",
  } as BiText,
  dateSubmitted: {
    ar: "تاريخ التقديم",
    en: "Submission Date",
  } as BiText,
  referenceLabel: {
    ar: "رقم المعاملة",
    en: "Reference No.",
  } as BiText,
});
