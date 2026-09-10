import type { BiText } from "@/i18n/LanguageProvider";

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
    title: { ar: "تجديد التفويض 2026", en: "تجديد التفويض 2026" },
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
  { id: "governance", title: { ar: "الحوكمة ومجلس الأمناء", en: "Governance & Board of Trustees" } },
  { id: "banking", title: { ar: "التفويضات البنكية", en: "Banking authorisations" } },
];
