import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("initiatives", {
  eyebrow: { ar: "البرامج والمشاريع", en: "Programmes & projects" } as BiText,
  title: { ar: "المبادرات القائمة والمخططة", en: "Current & Planned Initiatives" } as BiText,
  subtitle: {
    ar: "برامج تنموية واجتماعية تنفذها اللجان التنفيذية، إلى جانب مشروع المقر الدائم الذي يمثل أكبر التزام رأسمالي للصندوق.",
    en: "Development and social programmes delivered by the executive committees, alongside the permanent headquarters — the organisation's largest capital commitment.",
  } as BiText,

  metaActive: { ar: "برامج جارية", en: "Active" } as BiText,
  metaPlanned: { ar: "برامج مخططة", en: "Planned" } as BiText,
  metaCapital: { ar: "المشروع الرأسمالي", en: "Capital project" } as BiText,
  metaCapitalValue: { ar: "المقر الدائم", en: "Permanent HQ" } as BiText,

  flagshipEyebrow: { ar: "المشروع الرئيسي", en: "Flagship project" } as BiText,
  specTitle: { ar: "بيانات المشروع", en: "Project particulars" } as BiText,
  specLocation: { ar: "الموقع", en: "Location" } as BiText,
  specArea: { ar: "المساحة", en: "Area" } as BiText,
  specStage: { ar: "المرحلة", en: "Stage" } as BiText,
  specProgress: { ar: "نسبة الإنجاز", en: "Completion" } as BiText,
  specFacilities: { ar: "المرافق المخططة", en: "Planned facilities" } as BiText,
  specFunding: { ar: "التمويل", en: "Funding" } as BiText,
  caption: {
    ar: "تصور معماري للمقر الدائم — حي الحزام الذهبي، المبرز.",
    en: "Architectural rendering of the permanent headquarters — Al-Hizam Al-Dhahabi, Al-Mubarraz.",
  } as BiText,

  scheduleEyebrow: { ar: "جدول البرامج", en: "Programme schedule" } as BiText,
  scheduleTitle: { ar: "المبادرات حسب الحالة", en: "Initiatives by status" } as BiText,
  colProgramme: { ar: "البرنامج", en: "Programme" } as BiText,
  colStatus: { ar: "الحالة", en: "Status" } as BiText,
  active: { ar: "جارية", en: "Active" } as BiText,
  planned: { ar: "مخططة", en: "Planned" } as BiText,
  completed: { ar: "مكتملة", en: "Completed" } as BiText,
  details: { ar: "التفاصيل", en: "Details" } as BiText,
  viewDetails: { ar: "عرض التفاصيل الكاملة", en: "View full details" } as BiText,
  close: { ar: "إغلاق", en: "Close" } as BiText,
  shareWhatsApp: { ar: "مشاركة عبر واتساب", en: "Share on WhatsApp" } as BiText,
  copyLink: { ar: "نسخ الرابط", en: "Copy link" } as BiText,
  copied: { ar: "تم النسخ", en: "Copied" } as BiText,

  supportTitle: { ar: "دعم البرامج", en: "Supporting the programmes" } as BiText,
  supportBody: {
    ar: "تموَّل البرامج من الاشتراكات الشهرية ومن القروض الحسنة المساهمة في مشروع المقر.",
    en: "The programmes are funded from monthly subscriptions and from interest-free contributory loans towards the headquarters project.",
  } as BiText,
  supportCta: { ar: "الاشتراك والمساهمة", en: "Subscribe & contribute" } as BiText,

});
