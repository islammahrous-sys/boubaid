import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("branches", {
  eyebrow: { ar: "البنية العائلية", en: "Family structure" } as BiText,
  title: { ar: "سجل الفروع السبعة", en: "Register of the Seven Branches" } as BiText,
  subtitle: (arCount: string, enCount: string): BiText => ({
    ar: `تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن عبدالله وأخيه صالح بن عبدالله، وهي موثقة في اثنتي عشرة مشجرة معتمدة تضم ${arCount} اسماً. ولكل فرع أفرعه الداخلية ومناطق استقراره وتمثيله في مجلس الأسرة واللجان.`,
    en: `The family is organised into seven principal branches descending from the sons of the patriarch Ahmed bin Abdullah and his brother Salih bin Abdullah, documented across twelve verified charts holding ${enCount} names. Each has its own sub-lineages, areas of settlement, and representation on the family council and its committees.`,
  }),

  metaBranches: { ar: "عدد الفروع", en: "Branches" } as BiText,
  metaMembers: { ar: "الأفراد الموثقون", en: "Documented members" } as BiText,
  metaSeat: { ar: "المرجع", en: "Seat" } as BiText,
  metaSeatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,

  indexTitle: { ar: "فهرس الفروع", en: "Index of branches" } as BiText,
  colBranch: { ar: "الفرع", en: "Branch" } as BiText,
  colAncestor: { ar: "الجد الجامع", en: "Patriarch" } as BiText,
  colSettlement: { ar: "مناطق الاستقرار", en: "Settlement" } as BiText,
  colCount: { ar: "العدد", en: "Members" } as BiText,

  entryLabel: { ar: "الفرع", en: "Branch" } as BiText,
  ancestorLabel: { ar: "الجد الجامع", en: "Patriarch" } as BiText,
  settlementLabel: { ar: "مناطق الاستقرار", en: "Settlement" } as BiText,
  countLabel: { ar: "الأفراد الموثقون", en: "Documented members" } as BiText,
  subLabel: { ar: "الأفرع الداخلية", en: "Sub-lineages" } as BiText,
  figuresLabel: { ar: "من أعلام الفرع", en: "Notable figures" } as BiText,
  posterLabel: { ar: "اللوحة الرسمية لشجرة الفرع", en: "Official branch tree plate" } as BiText,
  posterOpen: { ar: "فتح اللوحة كاملة", en: "Open full plate" } as BiText,

  treeCta: { ar: "المشجرة التفاعلية الكاملة", en: "The full interactive tree" } as BiText,
  treeBody: (arCount: string, enCount: string, arGen: string, enGen: string): BiText => ({
    ar: `يعرض هذا السجل رؤوس الفروع فقط. أما التفريع الكامل لـ${arGen} أجيال و${arCount} اسماً موثقاً فمتاح في المشجرة التفاعلية.`,
    en: `This register lists the heads of the branches only. The full ${enGen}-generation tree of ${enCount} documented names is available in the interactive view.`,
  }),
});
