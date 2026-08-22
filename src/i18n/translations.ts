import type { BiText } from "./LanguageProvider";
export type { BiText };

export const T = {
  brand: {
    ar: "صندوق التنمية العائلية",
    en: "Family Development Fund",
  } as BiText,
  brandSub: {
    ar: "أسرة آل بوعبيد — ترخيص رقم 1200758400",
    en: "Al Bu Obaid Family — License #1200758400",
  } as BiText,
  nav: {
    home: { ar: "الرئيسية", en: "Home" } as BiText,
    about: { ar: "من نحن والنسب", en: "About & Lineage" } as BiText,
    foundation: { ar: "عن الصندوق والحوكمة", en: "The Fund & Governance" } as BiText,
    branches: { ar: "الفروع السبعة", en: "7 Family Branches" } as BiText,
    tree: { ar: "شجرة الأسرة", en: "Family Tree" } as BiText,
    dna: { ar: "البحث الجيني (DNA)", en: "Genetic Genealogy" } as BiText,
    achievers: { ar: "الكفاءات والمتميزون", en: "Achievers" } as BiText,
    initiatives: { ar: "المبادرات والبرامج", en: "Initiatives & Programs" } as BiText,
    directory: { ar: "دليل الأعمال", en: "Business Directory" } as BiText,
    news: { ar: "الأخبار والمركز الإعلامي", en: "News & Media" } as BiText,
    library: { ar: "المكتبة الرقمية", en: "Digital Library" } as BiText,
    contact: { ar: "تواصل معنا", en: "Contact Us" } as BiText,
    contribute: { ar: "المساهمة والاشتراكات", en: "Contribute & Store" } as BiText,
  },
  common: {
    readMore: { ar: "اقرأ المزيد", en: "Read more" } as BiText,
    viewAll: { ar: "عرض الكل", en: "View all" } as BiText,
    details: { ar: "التفاصيل", en: "Details" } as BiText,
    download: { ar: "تحميل اللائحة (PDF)", en: "Download Bylaws (PDF)" } as BiText,
    placeholder: { ar: "قيد التحديث", en: "To be updated" } as BiText,
    submit: { ar: "إرسال الرسالة", en: "Send Message" } as BiText,
    name: { ar: "الاسم الكامل", en: "Full Name" } as BiText,
    email: { ar: "البريد الإلكتروني", en: "Email Address" } as BiText,
    message: { ar: "نص الرسالة أو الاستفسار", en: "Message or Inquiry" } as BiText,
    date: { ar: "التاريخ", en: "Date" } as BiText,
    share: { ar: "مشاركة الصفحة", en: "Share Page" } as BiText,
    back: { ar: "رجوع", en: "Back" } as BiText,
    ncnpBadge: { ar: "مرخص من NCNP برقم 1200758400", en: "Licensed by NCNP #1200758400" } as BiText,
  },
  status: {
    upcoming: { ar: "قادمة", en: "Upcoming" } as BiText,
    ongoing: { ar: "جارية", en: "Ongoing" } as BiText,
    completed: { ar: "منجزة", en: "Completed" } as BiText,
  },
} as const;
