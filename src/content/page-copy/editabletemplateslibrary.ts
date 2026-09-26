import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("editabletemplateslibrary", {
  title: {
    ar: "قوالب المناسبات القابلة للتحرير يدويًا",
    en: "Occasions Manual Editable Templates",
  } as BiText,
  intro: {
    ar: "المكتبة المخصصة للأصول القابلة للتحرير: ملف عرض تقديمي مستقل لكل قالب من القوالب الأربعة عشر المعتمدة، مع المستندات المرجعية الرسمية.",
    en: "The dedicated library of editable master assets: an individual PowerPoint file for each of the fourteen approved templates, together with the official reference file.",
  } as BiText,
  editable: { ar: "قالب قابل للتحرير", en: "Editable Template" } as BiText,
  view: { ar: "عرض الملف", en: "View Document" } as BiText,
  download: { ar: "تحميل", en: "Download" } as BiText,
  previewNote: {
    ar: "المعاينة صورة للقالب فقط؛ ويُنزَّل الملف الأصلي بصيغة عرض تقديمي قابلة للتحرير.",
    en: "The preview is an image of the template only; the editable file is downloaded as PowerPoint.",
  } as BiText,
  previewTitle: { ar: "معاينة القالب", en: "Template preview" } as BiText,
  referenceTitle: { ar: "الملف المرجعي", en: "Reference File" } as BiText,
  readOnSite: {
    ar: "نص الملف المرجعي كما ورد",
    en: "The reference file's text, as supplied",
  } as BiText,
});
