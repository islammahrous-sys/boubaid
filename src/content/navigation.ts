import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Single source of truth for site navigation.
 *
 * Header, Footer, and MobileNav previously each kept their own list, and
 * they had drifted apart — different labels for the same route, and routes
 * present in one menu but missing from another. Everything reads from here.
 */

export type NavItem = {
  id?: string;
  to: string;
  label: BiText;
  /** Shown in the mobile tab bar only, where icons do navigational work. */
  short?: BiText;
  /** Optional nested child items for dropdown navigation. */
  children?: NavItem[];
};

/** Retired standalone destination that must never be restored from CMS navigation. */
export function withoutRetiredNavigation<T extends NavItem>(items: T[]): T[] {
  return items
    .filter((item) => {
      const english = item.label.en.trim().toLowerCase();
      const arabic = item.label.ar.replace(/\s+/g, "");
      return (
        item.to.split(/[?#]/)[0] !== "/competitions" &&
        english !== "competitions & awards" &&
        english !== "competitions and awards" &&
        arabic !== "المسابقاتوالجوائز"
      );
    })
    .map((item) => ({
      ...item,
      ...(item.children ? { children: withoutRetiredNavigation(item.children) } : {}),
    }));
}

/** Top-level routes, shown in the desktop header bar. */
export const primaryNav: NavItem[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, short: { ar: "الرئيسية", en: "Home" } },
  // Direct destination — the consolidated historical content lives on /about,
  // so this item deliberately has no dropdown.
  {
    to: "/about",
    label: { ar: "التاريخ والجذور", en: "History and Roots" },
    short: { ar: "التاريخ", en: "History" },
  },
  {
    to: "/official-family-tree",
    label: { ar: "شجرة العائلة", en: "Family Tree" },
    short: { ar: "الشجرة", en: "Tree" },
    children: [
      {
        to: "/family-tree",
        label: { ar: "مشجرة العائلة", en: "Family Lineage" },
        short: { ar: "المشجرة", en: "Lineage" },
      },
      { to: "/branches", label: { ar: "فروع العائلة", en: "Family Branches" } },
      { to: "/dna", label: { ar: "الدراسات الجينية", en: "Genetic Studies" } },
    ],
  },

  {
    to: "/fund",
    label: { ar: "صندوق التنمية العائلية", en: "Family Development Fund" },
    short: { ar: "الصندوق", en: "Fund" },
    children: [
      {
        to: "/governance",
        label: { ar: "الحوكمة و مجلس الامناء", en: "Governance & Board of Trustees" },
      },
      {
        to: "/fund-certificates",
        label: { ar: "الشهادات و الاثباتات", en: "Certificates & Attestations" },
      },
      {
        to: "/fund-financials",
        label: {
          ar: "القوائم المالية والموازنة والحسابات",
          en: "Financial Statements, Budget & Accounts",
        },
      },
    ],
  },
  // Standalone top-level item, immediately after the Fund — not a dropdown.
  {
    to: "/committees",
    label: { ar: "اللجان", en: "Committees" },
    short: { ar: "اللجان", en: "Committees" },
  },
  {
    to: "/directory",
    label: { ar: "الخدمات", en: "Services" },
    short: { ar: "الخدمات", en: "Services" },
  },
  // "Archive" (/library) lives in the "More" menu below — four inline items is
  // the most the header fits alongside the action cluster at the `xl` width in
  // English. `secondaryNav` picks it up automatically from `navGroups`.
];

/** Secondary routes, grouped for the header dropdown and the footer. */
export const navGroups: { title: BiText; items: NavItem[] }[] = [
  {
    title: { ar: "النسب والتوثيق", en: "Lineage & Heritage" },
    items: [
      { to: "/about", label: { ar: "التاريخ والجذور", en: "History and Roots" } },
      {
        to: "/achievers",
        label: {
          ar: "جائزة آل بوعبيد للتفوق العلمي والتميز",
          en: "Al Bu Obaid Award for Academic Excellence and Distinction",
        },
        short: { ar: "الجائزة", en: "Award" },
      },
    ],
  },
  {
    title: { ar: "الصندوق والمشاريع", en: "Fund & Projects" },
    items: [
      {
        to: "/fund",
        label: { ar: "صندوق التنمية العائلية", en: "Family Development Fund" },
        short: { ar: "الصندوق", en: "Fund" },
        children: [
          {
            to: "/governance",
            label: { ar: "الحوكمة و مجلس الامناء", en: "Governance & Board of Trustees" },
          },
          {
            to: "/fund-certificates",
            label: { ar: "الشهادات و الاثباتات", en: "Certificates & Attestations" },
          },
          {
            to: "/fund-financials",
            label: {
              ar: "القوائم المالية والموازنة والحسابات",
              en: "Financial Statements, Budget & Accounts",
            },
          },
        ],
      },
      {
        to: "/library",
        label: { ar: "الأرشيف والمكتبة الرقمية", en: "Archive & Digital Library" },
        short: { ar: "الأرشيف", en: "Archive" },
      },
      {
        to: "/library?tab=museum",
        label: { ar: "مجموعات المتحف المصورة", en: "Museum Photo Collections" },
        short: { ar: "المتحف", en: "Museum" },
      },
      { to: "/news", label: { ar: "المركز الإعلامي", en: "Media Centre" } },
      {
        to: "/ahsa-family-councils",
        label: { ar: "مجالس أسر الأحساء", en: "Al-Ahsa Family Councils" },
      },
      { to: "/events", label: { ar: "الفعاليات واللقاءات", en: "Events & Gatherings" } },
    ],
  },
  {
    title: { ar: "الخدمات والمشاركة", en: "Services & Participation" },
    items: [
      {
        to: "/directory",
        label: {
          ar: "خدمات افراد الأسرة و خدمات المنشأت – اسرتي تنتج",
          en: "Family Member & Establishment Services – My Family Produces",
        },
        short: { ar: "الخدمات", en: "Services" },
      },
      {
        to: "/requests",
        label: { ar: "مركز الطلبات", en: "Requests Hub" },
        short: { ar: "الطلبات", en: "Requests" },
      },
      {
        to: "/templates",
        label: { ar: "الهوية البصرية", en: "Visual Identity" },
        short: { ar: "الهوية", en: "Identity" },
      },
      { to: "/contact", label: { ar: "تواصل معنا", en: "Contact" } },
    ],
  },
];

/** Flat list of every secondary item, for the header's "more" menu. */
export const secondaryNav: NavItem[] = navGroups
  .flatMap((g) => g.items)
  .filter((item) => !primaryNav.some((p) => p.to === item.to));

/* ------------------------------------------------------------------------
 * Footer index — derived, never hand-maintained.
 *
 * The footer used to keep its own copy of `navGroups`, so every navigation
 * change (Committees, Governance, renamed Services…) had to be mirrored by
 * hand and the footer silently drifted out of date. `buildFooterColumns`
 * derives the columns from whatever navigation tree it is handed — the live
 * CMS "header" menu in production, the static lists as fallback — so any
 * future navigation edit shows up in the footer automatically.
 *
 * Shape: sections that have children become their own column (title = the
 * parent label, links = all descendants); everything without children is
 * collected into a leading "Site sections" column.
 * ---------------------------------------------------------------------- */

export type FooterNavItem = { to: string; label: BiText; children?: FooterNavItem[] };
export type FooterColumn = { key: string; title: BiText; items: { to: string; label: BiText }[] };

const SITE_SECTIONS_TITLE: BiText = { ar: "أقسام الموقع", en: "Site Sections" };

function flattenNav(items: FooterNavItem[]): { to: string; label: BiText }[] {
  const out: { to: string; label: BiText }[] = [];
  const walk = (list: FooterNavItem[]) => {
    for (const item of list) {
      if (!out.some((o) => o.to === item.to && o.label.ar === item.label.ar)) {
        out.push({ to: item.to, label: item.label });
      }
      if (item.children?.length) walk(item.children);
    }
  };
  walk(items);
  return out;
}

export function buildFooterColumns(items: FooterNavItem[]): FooterColumn[] {
  const columns: FooterColumn[] = [];
  const flat: { to: string; label: BiText }[] = [];

  for (const item of items) {
    if (item.children?.length) {
      columns.push({
        key: `${item.to}-${item.label.en || item.label.ar}`,
        title: item.label,
        items: flattenNav(item.children),
      });
    } else if (item.to !== "/") {
      // "Home" is already the logo link; keep the index lean.
      if (!flat.some((f) => f.to === item.to)) flat.push({ to: item.to, label: item.label });
    }
  }

  return flat.length
    ? [{ key: "site-sections", title: SITE_SECTIONS_TITLE, items: flat }, ...columns]
    : columns;
}

/** Split a nav URL such as "/committees#board" into Link props. */
export function navLinkProps(to: string): { to: string; hash?: string } {
  const [path, hash] = to.split("#");
  return hash ? { to: path || "/", hash } : { to: path || "/" };
}

export function isRouteActive(pathname: string, rawTo: string): boolean {
  const to = rawTo.split("#")[0] || "/";
  return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

/** Check if any child route in a nav item is active */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (isRouteActive(pathname, item.to)) return true;
  if (item.children?.some((child) => isNavItemActive(pathname, child))) return true;
  return false;
}
