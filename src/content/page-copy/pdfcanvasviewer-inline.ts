import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/components/site/PdfCanvasViewer.tsx — editable from the CMS. */
export const inl = registerCopy("pdfcanvasviewer-inline", {
  t_d42a12c8: { ar: "الصفحة التالية", en: "Next page" } as BiText,
});
