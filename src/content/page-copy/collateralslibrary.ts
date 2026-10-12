import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("collateralslibrary", {
  title: { ar: "المواد التعريفية", en: "Collaterals" } as BiText,
  intro: {
    ar: "المواد التعريفية الرسمية المرفقة بحزمة الهوية البصرية، ويُحمَّل كل مستند بصيغته الأصلية القابلة للتحرير.",
    en: "The official collateral documents supplied with the visual identity package; every document downloads in its original editable format.",
  } as BiText,
  view: { ar: "عرض", en: "View" } as BiText,
  open: { ar: "فتح المستند", en: "Open document" } as BiText,
  originalNote: {
    ar: "يُفتح المستند بصيغته الأصلية القابلة للتحرير، ويُنزَّل كما هو دون أي تعديل.",
    en: "The document opens in its original editable format and downloads unchanged.",
  } as BiText,
  download: { ar: "تحميل", en: "Download" } as BiText,
  previewTitle: { ar: "معاينة المستند", en: "Document preview" } as BiText,
  previewNote: {
    ar: "المعاينة صورة للصفحة الأولى من المستند؛ ويُنزَّل الملف الأصلي بصيغته القابلة للتحرير.",
    en: "The preview is an image of the document's first page; the original editable file is downloaded.",
  } as BiText,
});
