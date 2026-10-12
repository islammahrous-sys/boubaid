import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("establishmentsdirectory", {
  searchPlaceholder: {
    ar: "ابحث باسم المنشأة، النشاط، الفرع، أو المدينة…",
    en: "Search by business name, sector, branch, or city…",
  } as BiText,
  resultsCount: { ar: "منشأة مطابقة", en: "matching businesses" } as BiText,
  empty: {
    ar: "لا توجد منشآت مطابقة لمعايير البحث الحالية.",
    en: "No businesses match the current filter criteria.",
  } as BiText,
  labelCity: { ar: "المدينة", en: "City" } as BiText,
  labelBranch: { ar: "الفرع", en: "Branch" } as BiText,
  labelContact: { ar: "الهاتف", en: "Telephone" } as BiText,
  visit: { ar: "الموقع الإلكتروني", en: "Visit Website" } as BiText,
  call: { ar: "اتصال", en: "Call" } as BiText,
  whatsapp: { ar: "واتساب", en: "WhatsApp" } as BiText,
  copyContact: { ar: "نسخ البيانات", en: "Copy Info" } as BiText,
  viewDetails: { ar: "تفاصيل المنشأة", en: "Details" } as BiText,
  verifiedBadge: { ar: "منشأة عائلية معتمدة", en: "Verified Family Enterprise" } as BiText,
});
