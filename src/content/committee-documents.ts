import type { BiText } from "@/i18n/LanguageProvider";
import type { LibraryRow } from "@/lib/cms.functions";
import { isHidden, replacedId, rowHref } from "@/content/library-overrides";

import letter1 from "@/assets/docs/الخطاب_1.pdf.asset.json";
import letter2 from "@/assets/docs/الخطاب_2.pdf.asset.json";
import letter3 from "@/assets/docs/الخطاب_3.pdf.asset.json";
import planMedia1444 from "@/assets/docs/خطة_اللجنة_الاعلامية_والتقنية.pdf.asset.json";
import planFinance1444 from "@/assets/docs/خطة_اللجنة_المالية_والاستثمارية.pdf.asset.json";
import planActivities1444 from "@/assets/docs/خطة_لجنة_الأنشطة_والمبادرات.pdf.asset.json";
import planCommunication1444 from "@/assets/docs/خطة_لجنة_التواصل_الأسري.pdf.asset.json";
import planHq1444 from "@/assets/docs/خطة_لجنة_شؤون_مقر_مجلس_الأسرة.pdf.asset.json";
import letter4 from "@/assets/docs/1445_الخطاب_4.pdf.asset.json";
import letter5 from "@/assets/docs/1445_الخطاب_5.pdf.asset.json";
import planMedia1445 from "@/assets/docs/1445_خطة_اللجنة_الإعلامية_والتقنية.pdf.asset.json";
import planFinance1445 from "@/assets/docs/1445_خطة_اللجنة_المالية_والاستثمارية-2.pdf.asset.json";
import planActivities1445 from "@/assets/docs/1445_خطة_لجنة_الأنشطة_والمبادرات-2.pdf.asset.json";
import planCommunication1445 from "@/assets/docs/1445_خطة_لجنة_التواصل_الأسري-2.pdf.asset.json";
import planHq1445 from "@/assets/docs/1445_خطة_لجنة_شؤون_مقر_مجلس_الأسرة-2.pdf.asset.json";

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
 * Each year lists the official letters first, then the committee plans.
 */
export const committeeDocuments: CommitteeDocument[] = [
  // ── عام ١٤٤٤هـ — الخطابات ثم خطط اللجان ─────────────────
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
  {
    id: "plan-media-committee-1444",
    year: 1444,
    title: { ar: "خطة اللجنة الإعلامية والتقنية", en: "Media & Technology Committee Plan" },
    kind: "PDF",
    href: planMedia1444.url,
  },
  {
    id: "plan-finance-committee-1444",
    year: 1444,
    title: { ar: "خطة اللجنة المالية والاستثمارية", en: "Finance & Investment Committee Plan" },
    kind: "PDF",
    href: planFinance1444.url,
  },
  {
    id: "plan-activities-committee-1444",
    year: 1444,
    title: { ar: "خطة لجنة الأنشطة والمبادرات", en: "Activities & Initiatives Committee Plan" },
    kind: "PDF",
    href: planActivities1444.url,
  },
  {
    id: "plan-communication-committee-1444",
    year: 1444,
    title: { ar: "خطة لجنة التواصل الأسري", en: "Family Communication Committee Plan" },
    kind: "PDF",
    href: planCommunication1444.url,
  },
  {
    id: "plan-hq-committee-1444",
    year: 1444,
    title: {
      ar: "خطة لجنة شؤون مقر مجلس الأسرة",
      en: "Family Council Headquarters Affairs Committee Plan",
    },
    kind: "PDF",
    href: planHq1444.url,
  },

  // ── عام ١٤٤٥هـ — الخطابات ثم خطط اللجان ─────────────────
  {
    id: "letter-4-1445",
    year: 1445,
    title: { ar: "الخطاب (4)", en: "Official Letter (4)" },
    kind: "PDF",
    href: letter4.url,
  },
  {
    id: "letter-5-1445",
    year: 1445,
    title: { ar: "الخطاب (5)", en: "Official Letter (5)" },
    kind: "PDF",
    href: letter5.url,
  },
  {
    id: "plan-media-committee-1445",
    year: 1445,
    title: { ar: "خطة اللجنة الإعلامية والتقنية", en: "Media & Technology Committee Plan" },
    kind: "PDF",
    href: planMedia1445.url,
  },
  {
    id: "plan-finance-committee-1445",
    year: 1445,
    title: { ar: "خطة اللجنة المالية والاستثمارية", en: "Finance & Investment Committee Plan" },
    kind: "PDF",
    href: planFinance1445.url,
  },
  {
    id: "plan-activities-committee-1445",
    year: 1445,
    title: { ar: "خطة لجنة الأنشطة والمبادرات", en: "Activities & Initiatives Committee Plan" },
    kind: "PDF",
    href: planActivities1445.url,
  },
  {
    id: "plan-communication-committee-1445",
    year: 1445,
    title: { ar: "خطة لجنة التواصل الأسري", en: "Family Communication Committee Plan" },
    kind: "PDF",
    href: planCommunication1445.url,
  },
  {
    id: "plan-hq-committee-1445",
    year: 1445,
    title: {
      ar: "خطة لجنة شؤون مقر مجلس الأسرة",
      en: "Family Council Headquarters Affairs Committee Plan",
    },
    kind: "PDF",
    href: planHq1445.url,
  },
];

/** A document ready to render: built-in or CMS-managed. */
export interface ResolvedCommitteeDocument {
  id: string;
  year: number;
  title: BiText;
  kind: string;
  /** Address the viewer opens. */
  src: string;
}

/**
 * Built-in committee documents merged with the library collection
 * `committee_documents` (Admin → Archive & library). New records appear under
 * their Hijri work year; a record can replace or withdraw a built-in one (see
 * content/library-overrides.ts).
 */
export function resolveCommitteeDocuments(
  rows: LibraryRow[] | undefined,
): ResolvedCommitteeDocument[] {
  const cms = (rows ?? []).filter((r) => r.collection === "committee_documents" && r.is_published);
  const replaced = new Map<string, LibraryRow>();
  for (const r of cms) {
    const id = replacedId(r);
    if (id) replaced.set(id, r);
  }

  const out: ResolvedCommitteeDocument[] = [];
  for (const d of committeeDocuments) {
    const override = replaced.get(d.id);
    if (override) {
      if (isHidden(override)) continue;
      const href = rowHref(override);
      out.push({
        id: d.id,
        year: override.year ?? d.year,
        title: { ar: override.title_ar, en: override.title_en || override.title_ar },
        kind: d.kind,
        src: href ?? `/api/public/committee-doc?id=${d.id}`,
      });
      continue;
    }
    out.push({
      id: d.id,
      year: d.year,
      title: d.title,
      kind: d.kind,
      src: `/api/public/committee-doc?id=${d.id}`,
    });
  }

  for (const r of [...cms].sort((a, b) => a.sort_order - b.sort_order)) {
    if (replacedId(r) || isHidden(r) || !r.year) continue;
    const href = rowHref(r);
    if (!href) continue;
    out.push({
      id: r.id,
      year: r.year,
      title: { ar: r.title_ar, en: r.title_en || r.title_ar },
      kind: "PDF",
      src: href,
    });
  }
  return out;
}
