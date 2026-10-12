import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/dna.tsx — editable from the CMS. */
export const inl = registerCopy("dna-inline", {
  t_32fcb0f7: { ar: "الخلاصة", en: "Overview" } as BiText,
  t_be70c578: { ar: "السلالة", en: "Haplogroup" } as BiText,
  t_3d705611: { ar: "التسلسل الزمني", en: "Timeline" } as BiText,
  t_8cb1b3f3: { ar: "الانتشار", en: "Distribution" } as BiText,
  t_2a0ae3e6: { ar: "المنهجية", en: "Method" } as BiText,
  t_7183b0f2: { ar: "المصادر", en: "Sources" } as BiText,
  t_2665274d: { ar: "الوثائق والأرشيف الجيني", en: "Genomic & Lineage Archives" } as BiText,
  t_2f3524b2: {
    ar: "الوثائق العلمية والتقارير الجينية المعتمدة، بما في ذلك لوحات الشجرة الجينية المصورة وثيقة النسب.",
    en: "Approved scientific documents and genetic reports, including illustrated haplogroup charts and lineage documentation.",
  } as BiText,
});
