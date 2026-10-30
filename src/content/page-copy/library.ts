import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("library", {
  eyebrow: { ar: "التراث والتوثيق", en: "Heritage & Archives" } as BiText,
  title: { ar: "الأرشيف التراثي المصور", en: "Heritage Photo Archive" } as BiText,
  subtitle: {
    ar: "أرشيف مصور موثّق لمناسبات الأسرة وأنشطتها الاجتماعية ومسابقاتها، وصور كبارنا وأبناء العم، إلى جانب مجموعات المتحف.",
    en: "A documented photographic archive of family occasions, social activities and competitions, portraits of our elders and cousins, alongside the museum collections.",
  } as BiText,

  metaEra: { ar: "فترة التوثيق", en: "Documented Era" } as BiText,
  metaEraValue: { ar: "منذ عام ١١٠٢ هـ حتى اليوم", en: "From 1102 AH to the present" } as BiText,
  metaScope: { ar: "نطاق المجموعة", en: "Archive Scope" } as BiText,
  metaScopeValue: { ar: "الأحساء والخليج العربي", en: "Al-Ahsa & the Arabian Gulf" } as BiText,
  metaAccess: { ar: "الإتاحة الرقمية", en: "Public Access" } as BiText,
  metaAccessValue: { ar: "متاحة رقمياً للجميع", en: "Open digital access" } as BiText,

  museumTab: { ar: "مجموعات المتحف المصورة", en: "Museum Photo Collections" } as BiText,
  museumNote: {
    ar: "أرشيف مصور من تاريخ متحف آل بوعبيد — الافتتاح، الزيارات، المقتنيات، والمناسبات، موثّقة ضمن مجموعات مستقلة.",
    en: "A photographic record of the Al Boabid Museum's history — its opening, visits, artifacts, and occasions, organized into standalone collections.",
  } as BiText,
  museumEmpty: {
    ar: "لا توجد مجموعات منشورة حاليًا. يرجى العودة لاحقًا.",
    en: "No collections are published yet. Please check back soon.",
  } as BiText,
  noResults: { ar: "لا توجد نتائج مطابقة لبحثك.", en: "Nothing matches your search." } as BiText,
  folderEmpty: {
    ar: "لم تُضف صور إلى هذا القسم بعد. تُرفع الصور من لوحة الإدارة وتظهر هنا مباشرة.",
    en: "No photographs have been added to this section yet. They are uploaded from the admin console and appear here immediately.",
  } as BiText,
  videosTab: { ar: "الفيديوهات", en: "Videos" } as BiText,
  videosNote: {
    ar: "مقاطع مرئية موثّقة من مناسبات الأسرة وأنشطتها، معروضة مباشرة على الصفحة.",
    en: "Documented video clips from family occasions and activities, played directly on this page.",
  } as BiText,
  videosEmpty: {
    ar: "لا توجد مقاطع منشورة حاليًا. تُضاف المقاطع من لوحة الإدارة وتظهر هنا مباشرة.",
    en: "No clips are published yet. They are added from the admin console and appear here immediately.",
  } as BiText,
  imageCount: { ar: "صورة", en: "images" } as BiText,
  imageCountOne: { ar: "صورة", en: "image" } as BiText,
  searchPlaceholder: { ar: "ابحث في الأرشيف...", en: "Search the archive..." } as BiText,
  clearSearch: { ar: "مسح البحث", en: "Clear search" } as BiText,
  openFolder: { ar: "استعراض الصور", en: "Browse photographs" } as BiText,
  depositTitle: {
    ar: "إيداع صورة أو وثيقة تاريخية",
    en: "Submit a Historical Photograph or Document",
  } as BiText,
  depositBody: {
    ar: "إذا كانت لديك صور تذكارية قديمة أو وثائق عائلية ترغب في حفظها وفهرستها ضمن الأرشيف الرقمي الموحد، نرحب بتواصلك.",
    en: "If you possess historical family photographs or documents you wish to preserve in the digital archive, we welcome your contribution.",
  } as BiText,
  depositCta: { ar: "تقديم صورة للأرشيف", en: "Submit a photograph" } as BiText,
  photosLoading: { ar: "جارٍ تحميل الصور…", en: "Loading photographs…" } as BiText,
  loadMore: { ar: "عرض المزيد من الصور", en: "Load more images" } as BiText,
});
