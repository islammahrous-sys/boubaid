import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Who may open which page — the council's "Pages Access" decision. Anything
 * not listed here is public.
 *
 *   members     approved family members (the `member` role, or any council
 *               staff role, which is only granted to approved people)
 *   leadership  the council chair and committee chairs: admins / super admins,
 *               plus the accounts named in the console under
 *               Registration → Page access (site_settings `page_access`)
 */
export type AccessLevel = "public" | "members" | "leadership";

export type PageAccessRule = { path: string; label: BiText; level: AccessLevel };

export const PAGE_ACCESS: PageAccessRule[] = [
  { path: "/", label: { ar: "الرئيسية", en: "Home" }, level: "public" },
  { path: "/about", label: { ar: "التاريخ والجذور", en: "History and Roots" }, level: "public" },
  { path: "/templates", label: { ar: "الهوية البصرية", en: "Visual Identity" }, level: "leadership" },
  { path: "/requests", label: { ar: "مركز الطلبات", en: "Requests Hub" }, level: "public" },
  { path: "/news", label: { ar: "المركز الإعلامي", en: "Media Center" }, level: "public" },
  { path: "/achievers", label: { ar: "جائزة آل بوعبيد للتفوق العلمي والتميز", en: "Al Bu Obaid Award for Academic Excellence" }, level: "public" },
  { path: "/library", label: { ar: "الأرشيف", en: "Archive" }, level: "members" },
  { path: "/programs", label: { ar: "الخدمات", en: "Services" }, level: "public" },
  { path: "/committees", label: { ar: "اللجان", en: "Committees" }, level: "public" },
  { path: "/fund", label: { ar: "صندوق التنمية العائلية", en: "Family Development Fund" }, level: "members" },
  { path: "/fund-financials", label: { ar: "القوائم المالية للصندوق", en: "Fund financial statements" }, level: "members" },
  { path: "/fund-certificates", label: { ar: "شهادات وتراخيص الصندوق", en: "Fund certificates" }, level: "members" },
  { path: "/family-tree", label: { ar: "شجرة العائلة", en: "Family Tree" }, level: "public" },
  { path: "/ahsa-family-councils", label: { ar: "مجالس الأسر بالأحساء", en: "Al-Ahsa Family Councils" }, level: "public" },
];

/**
 * Paths that must stay out of sitemaps and search indexes. Keep vercel.json's
 * X-Robots-Tag rules and scripts/generate-sitemap.mjs in step with this list.
 */
export const PRIVATE_PATHS = PAGE_ACCESS.filter((r) => r.level !== "public").map((r) => r.path);

/** Roles granted only after the secretariat approves someone. */
export const MEMBER_ROLES = [
  "member",
  "admin",
  "super_admin",
  "editor",
  "content_manager",
  "family_manager",
  "treasurer",
] as const;

export const LEADERSHIP_ROLES = ["admin", "super_admin"] as const;

export const PAGE_ACCESS_SETTING_KEY = "page_access";

export type PageAccessSetting = {
  /** Emails of the council chair and committee chairs (Visual Identity). */
  leadership_emails: string[];
};

export function normaliseEmails(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return [
    ...new Set(
      list
        .map((e) => String(e ?? "").trim().toLowerCase())
        .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)),
    ),
  ];
}
