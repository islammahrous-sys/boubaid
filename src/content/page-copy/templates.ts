import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("templates", {
  eyebrow: { ar: "الهوية والمراسلات", en: "Identity and correspondence" } as BiText,
  title: {
    ar: "الهوية البصرية لمجلس أسرة آل بوعبيد",
    en: "Al Bu Obaid Family Council Visual Identity",
  } as BiText,
  subtitle: {
    ar: "الدليل الرسمي للهوية البصرية واللونية والطباعة والمواد التعريفية، مع الأصول الرسمية وقوالب المناسبات القابلة للتحرير.",
    en: "The official visual identity, colour, typography and introductory-materials system, with official assets and editable occasion templates.",
  } as BiText,
  visualTitle: {
    ar: "نظام الهوية البصرية واللونية والطباعة والمواد التعريفية - مجلس أسرة آل بوعبيد",
    en: "Visual Identity, Colour, Typography and Introductory Materials System",
  } as BiText,
  visualIntro: {
    ar: "المستند الرسمي والأصول الأصلية المرفقة بحزمة الهوية البصرية، مع إمكانية العرض والتحميل لكل ملف.",
    en: "The official document and original assets supplied in the visual identity package, with view and download actions for every file.",
  } as BiText,
  assetsTitle: { ar: "أصول الهوية البصرية", en: "Visual Identity Assets" } as BiText,
  paletteTitle: { ar: "الألوان والطباعة", en: "Colour and Typography" } as BiText,
  committeeChartsTitle: {
    ar: "المخططات التنظيمية للجان - نسخة قابلة للتحرير",
    en: "Editable Committees Organization Charts",
  } as BiText,
  fundChartsTitleAr: "الهيكل التنظيمي لمجلس أمناء الصندوق — النسخة الإنجليزية",
  fundChartsTitleEn: "Organizational Chart of the Fund's Board of Trustees — Editable",
  view: { ar: "عرض الملف", en: "View Document" } as BiText,
  open: { ar: "فتح الملف", en: "Open File" } as BiText,
  download: { ar: "تحميل الملف", en: "Download File" } as BiText,
  preview: { ar: "معاينة", en: "Preview" } as BiText,
  empty: {
    ar: "لم تُنشر مواد هوية بصرية حتى الآن. تُضاف من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "No visual identity materials have been published yet. They are added from the admin console and appear here immediately.",
  } as BiText,
});
