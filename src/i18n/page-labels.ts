/** Human names for the copy-registry pages (shared by the console and the live editor). */
export const PAGE_LABELS: Record<string, string> = {
  index: "الرئيسية — Home",
  footer: "تذييل الموقع — Footer",
  fund: "الصندوق — Fund",
  site: "بيانات عامة للموقع — Site-wide details",
  "council-address": "كلمة مجلس الأسرة (الرئيسية) — Council address",
  history: "التاريخ والجذور (عن الأسرة) — History & roots (About)",
  "vision-mission": "الرؤية والرسالة والقيم — Vision, mission & values",
  about: "عن الأسرة — About",
  contact: "تواصل — Contact",
  governance: "الحوكمة — Governance",
  achievers: "المتميزون والجائزة — Achievers",
  initiatives: "المبادرات — Initiatives",
  "initiatives-slug": "صفحة مبادرة — Initiative page",
  news: "المركز الإعلامي — Media Center",
  "news-slug": "صفحة خبر — News article",
  library: "المكتبة والأرشيف — Library & Archive",
  "library-museum-slug": "صفحة متحف — Museum item",
  events: "الفعاليات — Events",
  directory: "الدليل — Directory",
  "family-tree": "شجرة الأسرة — Family Tree",
  "official-family-tree": "الشجرة الرسمية — Official Tree",
  branches: "الفروع — Branches",
  committees: "اللجان — Committees",
  dna: "الحمض النووي — DNA",
  requests: "مركز الطلبات — Requests",
  templates: "الهوية البصرية — Visual Identity",
  archivevideoplayer: "مشغّل فيديو الأرشيف — Archive video player",
  collateralslibrary: "مكتبة المطبوعات — Collaterals library",
  councilrequestform: "نموذج طلبات المجلس — Council request form",
  editabletemplateslibrary: "القوالب القابلة للتعديل — Editable templates",
  establishmentsdirectory: "دليل المنشآت — Establishments directory",
  navigation: "قوائم التنقل الافتراضية — Default navigation menus",
  "site-content":
    "محتوى الموقع (الفروع، مجلس الأمناء، اللجان…) — Site content (branches, board, committees…)",
  "fund-documents": "وثائق الصندوق — Fund documents",
  "page-images": "تعليقات الصور — Image captions",
  "cms-home": "أقسام الصفحة الرئيسية (مدير الرئيسية) — Homepage sections",
  "cms-nav": "قوائم التنقل (مدير القوائم) — Navigation menus",
};

/** Labels a registry page; `<page>-inline` holds texts that used to be written
 *  directly in that page's component, so it is shown as "more texts". */
export function pageLabel(key: string): string {
  if (PAGE_LABELS[key]) return PAGE_LABELS[key];
  if (key.endsWith("-inline")) {
    const base = key.slice(0, -"-inline".length);
    return `${PAGE_LABELS[base] ?? base} — نصوص إضافية / more texts`;
  }
  return key;
}
