import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("achievers", {
  eyebrow: { ar: "سجل التميز", en: "Award" } as BiText,
  title: {
    ar: "جائزة آل بوعبيد للتفوق العلمي والتميز",
    en: "Al Bu Obaid Award for Academic Excellence and Distinction",
  } as BiText,
  subtitle: {
    ar: "جائزة تمنح للمميزين من أفراد الأسرة ذكوراً وإناثًا بمختلف مراحلهم الدراسية أو من هم على رأس العمل، في المجالات التالية:",
    en: "An award granted to distinguished family members, male and female, at every stage of study or in employment, in the following fields:",
  } as BiText,

  metaEntries: { ar: "عدد المقيدين", en: "Entries" } as BiText,
  metaFields: { ar: "الأعوام", en: "Years" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Last updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٨ هـ", en: "1448 AH" } as BiText,

  empty: {
    ar: "لا توجد سجلات مضافة في هذا القسم حالياً.",
    en: "No records have been added to this section yet.",
  } as BiText,

  colName: { ar: "الاسم", en: "Name" } as BiText,
  colAchievement: { ar: "التميز", en: "Distinction" } as BiText,
  competencies: { ar: "كفاءات افراد الاسرة", en: "Family Members’ Competencies" } as BiText,
  excellence: { ar: "جائزة التميز", en: "Excellence Award" } as BiText,

  nominateTitle: { ar: "الترشح لجائزة التميز", en: "Excellence Award Application" } as BiText,
  nominateBody: {
    ar: "يُفتح باب الترشح لجائزة التفوق العلمي والتميز المهني لأبناء وبنات الأسرة. ويجري القيد بعد اعتماد أمانة المجلس واللجان المختصة.",
    en: "Nominations for academic and professional distinction are open to family members. Additions are confirmed following approval by the Secretariat and relevant committees.",
  } as BiText,
  nominateCta: { ar: "تقديم ترشيح جديد", en: "Submit a nomination" } as BiText,
});
