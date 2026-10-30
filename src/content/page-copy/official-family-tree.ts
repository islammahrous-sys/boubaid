import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("official-family-tree", {
  eyebrow: { ar: "الإصدار الأول — ١٤٤٧هـ", en: "First Edition — 1447H" } as BiText,
  title: {
    ar: "اللوحة الرسمية المصورة لشجرة العائلة",
    en: "Official Illustrated Family Tree",
  } as BiText,
  subtitle: {
    ar: "لوحة جدارية معتمدة من مجلس الأسرة، متوفرة بعدة فريمات ومقاسات لتناسب المجالس والبيوت، مع إمكانية طلب مقاس خاص.",
    en: "A wall plate approved by the Family Council, available in several frames and sizes for majlis and home, with a made-to-order option.",
  } as BiText,
  artworkBody: {
    ar: "أخرجتِ الأسرةُ هذه اللوحة الجدارية بتكلفة استثمارية بلغت 14,948 ريالًا سعوديًّا، وسُجلت حقوق ملكيتها الفكرية رسمياً لتكون مرجعاً بصرياً حصرياً يربط الجيل الناشئ بجذوره التميمية.",
    en: "The family commissioned this wall plate at an investment cost of SAR 14,948, and formally registered its intellectual-property rights to serve as an exclusive visual reference linking the rising generation to its Tamimi roots.",
  } as BiText,
  artworkOpen: { ar: "فتح اللوحة كاملة", en: "Open the full plate" } as BiText,

  noticeTitle: {
    ar: "اختر تصميم ومقاس شجرة العائلة المناسب لك واطلبها الآن",
    en: "Choose the Family Tree design and size that suits you and order yours now.",
  } as BiText,
  noticeBody: {
    ar: "جميع المقاسات تُسلَّم مؤطرة وجاهزة للتعليق. اختر ما يناسبك واستكمل عملية الشراء والدفع عبر متجر الأسرة الرسمي.",
    en: "Every size is delivered framed and ready to hang. Choose what suits you and complete the purchase and payment through the family's official store.",
  } as BiText,

  ctaEyebrow: { ar: "للاقتناء والاطلاع على المقاسات", en: "View sizes and order" } as BiText,
  ctaTitle: {
    ar: "للاقتناء والاطلاع على المقاسات",
    en: "View sizes and order your copy",
  } as BiText,
  ctaHint: {
    ar: "اضغط على الزر أدناه للانتقال إلى متجر الأسرة الرسمي واختيار المقاس والفريم المناسبين.",
    en: "Click the button below to visit the family's official store and choose the right size and frame.",
  } as BiText,
  ctaButton: { ar: "اضغط هنا", en: "Click here" } as BiText,
});
