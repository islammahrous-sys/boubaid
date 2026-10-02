import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

/** Texts that used to be written inline in src/routes/family-tree.tsx — editable from the CMS. */
export const inl = registerCopy("family-tree-inline", {
  t_616c96c2: {
    ar: "وثائق النسب والمشجرة الرسمية",
    en: "Lineage Documents & Official Tree",
  } as BiText,
  t_1817cb82: {
    ar: "اللوحة الرسمية المعتمدة لشجرة أسرة آل بوعبيد (مسجلة الملكية الفكرية)، والتقارير الجينية الموثقة.",
    en: "The official IP-registered pictorial family tree plate and documented genetic reports.",
  } as BiText,
});
