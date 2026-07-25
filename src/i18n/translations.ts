import type { BiText } from "./LanguageProvider";

export const T = {
  brand: {
    ar: "آل بوعبيد",
    en: "Al Bu Obaid",
  } as BiText,
  brandSub: {
    ar: "صندوق التنمية العائلية",
    en: "Family Development Fund",
  } as BiText,
  nav: {
    home: { ar: "الرئيسية", en: "Home" } as BiText,
    about: { ar: "عن الأسرة", en: "About" } as BiText,
    foundation: { ar: "الصندوق", en: "The Fund" } as BiText,
    tree: { ar: "شجرة العائلة", en: "Family Tree" } as BiText,
    achievers: { ar: "المتميزون", en: "Achievers" } as BiText,
    initiatives: { ar: "المبادرات", en: "Initiatives" } as BiText,
    news: { ar: "الأخبار", en: "News" } as BiText,
    library: { ar: "المكتبة", en: "Library" } as BiText,
    contact: { ar: "تواصل معنا", en: "Contact" } as BiText,
    contribute: { ar: "المساهمة", en: "Contribute" } as BiText,
  },
  common: {
    readMore: { ar: "اقرأ المزيد", en: "Read more" } as BiText,
    viewAll: { ar: "عرض الكل", en: "View all" } as BiText,
    details: { ar: "التفاصيل", en: "Details" } as BiText,
    download: { ar: "تحميل", en: "Download" } as BiText,
    placeholder: { ar: "قيد التحديث", en: "To be updated" } as BiText,
    submit: { ar: "إرسال", en: "Submit" } as BiText,
    name: { ar: "الاسم", en: "Name" } as BiText,
    email: { ar: "البريد الإلكتروني", en: "Email" } as BiText,
    message: { ar: "الرسالة", en: "Message" } as BiText,
    date: { ar: "التاريخ", en: "Date" } as BiText,
    share: { ar: "مشاركة", en: "Share" } as BiText,
    back: { ar: "رجوع", en: "Back" } as BiText,
  },
  status: {
    upcoming: { ar: "قادمة", en: "Upcoming" } as BiText,
    ongoing: { ar: "جارية", en: "Ongoing" } as BiText,
    completed: { ar: "منجزة", en: "Completed" } as BiText,
  },
} as const;
