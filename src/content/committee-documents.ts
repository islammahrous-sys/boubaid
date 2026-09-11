import type { BiText } from "@/i18n/LanguageProvider";

import letter1 from "@/assets/docs/الخطاب_1.pdf.asset.json";
import letter2 from "@/assets/docs/الخطاب_2.pdf.asset.json";
import letter3 from "@/assets/docs/الخطاب_3.pdf.asset.json";
import planMedia from "@/assets/docs/خطة_اللجنة_الاعلامية_والتقنية.pdf.asset.json";
import planFinance from "@/assets/docs/خطة_اللجنة_المالية_والاستثمارية.pdf.asset.json";
import planActivities from "@/assets/docs/خطة_لجنة_الأنشطة_والمبادرات.pdf.asset.json";
import planCommunication from "@/assets/docs/خطة_لجنة_التواصل_الأسري.pdf.asset.json";
import planHq from "@/assets/docs/خطة_لجنة_شؤون_مقر_مجلس_الأسرة.pdf.asset.json";

export interface CommitteeDocument {
  id: string;
  /** Hijri work year the document belongs to (e.g. 1444). */
  year: number;
  title: BiText;
  kind: string;
  href: string;
}

/**
 * Plans and official letters of the fund's standing committees, published on
 * the Committees page grouped by work year. Served inline through
 * /api/public/committee-doc so storage URLs are never rendered in the UI.
 */
export const committeeDocuments: CommitteeDocument[] = [
  {
    id: "plan-media-committee-1444",
    year: 1444,
    title: { ar: "خطة اللجنة الإعلامية والتقنية", en: "Media & Technology Committee Plan" },
    kind: "PDF",
    href: planMedia.url,
  },
  {
    id: "plan-finance-committee-1444",
    year: 1444,
    title: { ar: "خطة اللجنة المالية والاستثمارية", en: "Finance & Investment Committee Plan" },
    kind: "PDF",
    href: planFinance.url,
  },
  {
    id: "plan-activities-committee-1444",
    year: 1444,
    title: { ar: "خطة لجنة الأنشطة والمبادرات", en: "Activities & Initiatives Committee Plan" },
    kind: "PDF",
    href: planActivities.url,
  },
  {
    id: "plan-communication-committee-1444",
    year: 1444,
    title: { ar: "خطة لجنة التواصل الأسري", en: "Family Communication Committee Plan" },
    kind: "PDF",
    href: planCommunication.url,
  },
  {
    id: "plan-hq-committee-1444",
    year: 1444,
    title: {
      ar: "خطة لجنة شؤون مقر مجلس الأسرة",
      en: "Family Council Headquarters Affairs Committee Plan",
    },
    kind: "PDF",
    href: planHq.url,
  },
  {
    id: "letter-1-1444",
    year: 1444,
    title: { ar: "الخطاب (1)", en: "Official Letter (1)" },
    kind: "PDF",
    href: letter1.url,
  },
  {
    id: "letter-2-1444",
    year: 1444,
    title: { ar: "الخطاب (2)", en: "Official Letter (2)" },
    kind: "PDF",
    href: letter2.url,
  },
  {
    id: "letter-3-1444",
    year: 1444,
    title: { ar: "الخطاب (3)", en: "Official Letter (3)" },
    kind: "PDF",
    href: letter3.url,
  },
];
