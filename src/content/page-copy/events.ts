import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("events", {
  eyebrow: { ar: "التقويم", en: "Calendar" } as BiText,
  title: { ar: "الفعاليات واللقاءات القادمة", en: "Upcoming Events & Gatherings" } as BiText,
  subtitle: {
    ar: "اللقاءات والمناسبات التي تنظمها الأمانة العامة ولجان مجلس الأسرة. سجّل حضورك من خلال البطاقة الخاصة بكل فعالية.",
    en: "Gatherings and occasions organised by the secretariat and the standing committees. Register your attendance from each event's card.",
  } as BiText,
  metaCount: { ar: "فعاليات قادمة", en: "Upcoming" } as BiText,

  empty: {
    ar: "لا توجد فعاليات قادمة في الوقت الحالي. تابع هذه الصفحة لمعرفة المستجدات.",
    en: "There are no upcoming events right now. Check back here for updates.",
  } as BiText,

  location: { ar: "الموقع", en: "Location" } as BiText,
  seats: { ar: "الحد الأقصى للحضور", en: "Capacity" } as BiText,
  deadline: { ar: "آخر موعد للتسجيل", en: "Registration deadline" } as BiText,

  registerCta: { ar: "تسجيل الحضور", en: "Register to attend" } as BiText,
  closedBadge: { ar: "التسجيل غير متاح", en: "Registration not open" } as BiText,
  deadlinePassedBadge: { ar: "انتهى موعد التسجيل", en: "Registration deadline passed" } as BiText,

  dialogTitle: { ar: "تسجيل الحضور", en: "Register to Attend" } as BiText,
  fieldName: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  fieldEmail: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  fieldPhone: { ar: "رقم الهاتف (اختياري)", en: "Phone (optional)" } as BiText,
  fieldAttendees: { ar: "عدد الحضور", en: "Number of attendees" } as BiText,
  fieldNotes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" } as BiText,
  submit: { ar: "إرسال التسجيل", en: "Submit registration" } as BiText,
  cancel: { ar: "إلغاء", en: "Cancel" } as BiText,

  success: {
    ar: "تم تسجيل حضورك بنجاح. بانتظاركم!",
    en: "Your registration was received. We look forward to seeing you!",
  } as BiText,
  errorClosed: {
    ar: "التسجيل لهذه الفعالية غير متاح حالياً.",
    en: "Registration for this event is not currently open.",
  } as BiText,
  errorDeadline: {
    ar: "انتهى الموعد النهائي للتسجيل في هذه الفعالية.",
    en: "The registration deadline for this event has passed.",
  } as BiText,
  errorFull: {
    ar: "اكتمل العدد المسموح به لهذه الفعالية. عذراً.",
    en: "This event has reached its attendee capacity. Sorry for the inconvenience.",
  } as BiText,
  errorGeneric: {
    ar: "تعذّر إتمام التسجيل. يرجى المحاولة مرة أخرى.",
    en: "Registration could not be completed. Please try again.",
  } as BiText,
  invalid: {
    ar: "يرجى مراجعة الحقول المطلوبة.",
    en: "Please check the required fields.",
  } as BiText,
});
