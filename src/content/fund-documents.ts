import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";
import type { LibraryRow } from "@/lib/cms.functions";
import { isHidden, replacedId, rowHref } from "@/content/library-overrides";

import nationalAddress from "@/assets/docs/national-address.pdf.asset.json";
import bylaws from "@/assets/docs/bylaws-current.pdf.asset.json";
import authorisationRenewal2026 from "@/assets/docs/authorisation-renewal-2026.pdf.asset.json";
import bankAuthorization from "@/assets/docs/bank-authorization.pdf.asset.json";
import councilFormation from "@/assets/docs/council-formation.pdf.asset.json";
import registrationDecision from "@/assets/docs/registration-decision.pdf.asset.json";
import licenceCertificate from "@/assets/docs/licence-certificate.pdf.asset.json";

export type FundDocumentGroup = "statutory" | "governance" | "banking";

export interface FundDocument {
  id: string;
  group: FundDocumentGroup;
  title: BiText;
  note: BiText;
  year: number;
  kind: string;
  href: string;
  /** Optional preview image already published in /public/images. */
  preview?: string;
  isNew?: boolean;
}

/**
 * Single source of truth for the fund's statutory certificates and official
 * documents. Everything published under
 * "صندوق التنمية العائلية → الشهادات والإثباتات" is read from here.
 */
export const fundDocuments: FundDocument[] = [
  {
    id: "registration-decision",
    group: "statutory",
    title: { ar: "قرار التسجيل والإشهار", en: "Registration & Publication Decision" },
    note: {
      ar: "قرار تسجيل صندوق التنمية العائلية (آل بوعبيد) الصادر عن الجهة المشرفة.",
      en: "Decision registering the Al Bu Obaid Family Development Fund, issued by the supervising authority.",
    },
    year: 1447,
    kind: "PDF",
    href: registrationDecision.url,
    isNew: true,
  },
  {
    id: "licence-certificate",
    group: "statutory",
    title: { ar: "معلومات شهادة الترخيص", en: "Licence Certificate Details" },
    note: {
      ar: "بيانات شهادة ترخيص المنشأة غير الربحية ورقم الترخيص وجهة الإصدار.",
      en: "Details of the non-profit licence certificate, licence number and issuing authority.",
    },
    year: 1447,
    kind: "PDF",
    href: licenceCertificate.url,
    preview: "/images/ncnp_license_certificate.jpg",
  },
  {
    id: "bylaws",
    group: "statutory",
    title: { ar: "اللائحة الأساسية الحالية", en: "Current Basic Bylaws" },
    note: {
      ar: "اللائحة الأساسية المعتمدة والمنظمة لأعمال الصندوق وأجهزته.",
      en: "The approved basic bylaws governing the fund and its bodies.",
    },
    year: 1447,
    kind: "PDF",
    href: bylaws.url,
  },
  {
    id: "national-address",
    group: "statutory",
    title: { ar: "العنوان الوطني الرسمي", en: "Official National Address" },
    note: {
      ar: "إثبات العنوان الوطني المسجل للصندوق.",
      en: "Registered national address attestation for the fund.",
    },
    year: 1447,
    kind: "PDF",
    href: nationalAddress.url,
    preview: "/images/national_address_proof.jpg",
  },
  {
    id: "council-formation",
    group: "governance",
    title: { ar: "خطاب تشكيل المجلس", en: "Council Formation Letter" },
    note: {
      ar: "خطاب تشكيل مجلس الأمناء (مُحجوبة أرقام الهوية).",
      en: "Board of Trustees formation letter (ID numbers redacted).",
    },
    year: 1447,
    kind: "PDF",
    href: councilFormation.url,
    preview: "/images/board_formation_letter.jpg",
  },
  {
    id: "bank-authorization",
    group: "banking",
    title: { ar: "تفويض إدارة الحسابات البنكية", en: "Bank Accounts Signatory Authorisation" },
    note: {
      ar: "خطاب تفويض إدارة الحسابات البنكية المعتمدة (مُحجوبة أرقام الهوية).",
      en: "Authorisation letter for managing the approved bank accounts (ID numbers redacted).",
    },
    year: 1447,
    kind: "PDF",
    href: bankAuthorization.url,
    preview: "/images/bank_authorization_letter.jpg",
  },
  {
    id: "authorisation-renewal-2026",
    group: "banking",
    title: { ar: "تجديد التفويض 2026", en: "Banking Authorisation Renewal 2026" },
    note: {
      ar: "خطاب تجديد التفويض بإدارة الحسابات البنكية لعام 2026 (مُحجوبة أرقام الهوية).",
      en: "Renewal of the bank accounts management authorisation for 2026 (ID numbers redacted).",
    },
    year: 1447,
    kind: "PDF",
    href: authorisationRenewal2026.url,
    isNew: true,
  },
];

export const fundDocumentGroups: { id: FundDocumentGroup; title: BiText }[] = [
  { id: "statutory", title: { ar: "التوثيق النظامي والترخيص", en: "Statutory & licensing" } },
  {
    id: "governance",
    title: { ar: "الحوكمة ومجلس الأمناء", en: "Governance & Board of Trustees" },
  },
  { id: "banking", title: { ar: "التفويضات البنكية", en: "Banking authorisations" } },
];

// Built-in document titles and notes are editable copy (CMS replacements are
// edited on their library record instead).
registerCopy("fund-documents", { fundDocuments, fundDocumentGroups });

/** A fund document ready to render: built-in or CMS-managed. */
export interface ResolvedFundDocument {
  id: string;
  group: FundDocumentGroup;
  title: BiText;
  note: BiText;
  year: number;
  kind: string;
  preview?: string;
  isNew?: boolean;
  /** Address the viewer opens. */
  src: string;
}

const FUND_GROUPS = new Set<string>(["statutory", "governance", "banking"]);

/**
 * Built-in documents merged with the library collection `fund_documents`
 * (Admin → Archive & library). For a new record, Kind selects the group
 * (statutory / governance / banking) and Year is the Hijri year; a record can
 * also replace or withdraw a built-in document (see content/library-overrides.ts).
 */
export function resolveFundDocuments(rows: LibraryRow[] | undefined): ResolvedFundDocument[] {
  const cms = (rows ?? []).filter((r) => r.collection === "fund_documents" && r.is_published);
  const replaced = new Map<string, LibraryRow>();
  for (const r of cms) {
    const id = replacedId(r);
    if (id) replaced.set(id, r);
  }

  const out: ResolvedFundDocument[] = [];
  for (const d of fundDocuments) {
    const builtInSrc = `/api/public/fund-doc?id=${encodeURIComponent(d.id)}`;
    const override = replaced.get(d.id);
    if (override) {
      if (isHidden(override)) continue;
      out.push({
        id: d.id,
        group: d.group,
        title: { ar: override.title_ar, en: override.title_en || override.title_ar },
        note:
          override.description_ar || override.description_en
            ? {
                ar: override.description_ar || override.description_en || "",
                en: override.description_en || override.description_ar || "",
              }
            : d.note,
        year: override.year ?? d.year,
        kind: d.kind,
        preview: d.preview,
        isNew: d.isNew,
        src: rowHref(override) ?? builtInSrc,
      });
      continue;
    }
    out.push({ ...d, src: builtInSrc });
  }

  for (const r of [...cms].sort((a, b) => a.sort_order - b.sort_order)) {
    if (replacedId(r) || isHidden(r)) continue;
    const href = rowHref(r);
    const group = (r.kind ?? "").trim().toLowerCase();
    if (!href || !FUND_GROUPS.has(group) || !r.year) continue;
    out.push({
      id: r.id,
      group: group as FundDocumentGroup,
      title: { ar: r.title_ar, en: r.title_en || r.title_ar },
      note: {
        ar: r.description_ar || "",
        en: r.description_en || r.description_ar || "",
      },
      year: r.year,
      kind: "PDF",
      src: href,
    });
  }
  return out;
}
