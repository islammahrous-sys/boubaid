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

/** Top-level routes, shown in the desktop header bar. */
export const primaryNav: NavItem[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, short: { ar: "الرئيسية", en: "Home" } },
  {
    to: "/about",
    label: { ar: "النسب والتاريخ", en: "Lineage & History" },
    children: [
      { to: "/about", label: { ar: "تاريخ الأسرة", en: "Family History" } },
      {
        to: "/family-tree",
        label: { ar: "نسب الأسرة", en: "Family Lineage" },
        short: { ar: "النسب", en: "Lineage" },
      },
      { to: "/dna", label: { ar: "الدراسة الجينية للأسرة", en: "Family Genetic Study" } },
      { to: "/branches", label: { ar: "جذور الأسرة", en: "Family Roots" } },
      { to: "/branches", label: { ar: "فروع الأسرة", en: "Family Branches" } },
      { to: "/library", label: { ar: "كتاب بني تميم", en: "Banu Tamim Book" } },
    ],
  },
  {
    to: "/official-family-tree",
    label: { ar: "شجرة العائلة", en: "Family Tree" },
    short: { ar: "الشجرة", en: "Tree" },
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
        children: [
          { to: "/contribute", label: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } },
        ],
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
  {
    to: "/initiatives",
    label: { ar: "المشاريع", en: "Projects" },
    short: { ar: "المشاريع", en: "Projects" },
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
      { to: "/about", label: { ar: "النسب والتاريخ", en: "Lineage & History" } },
      { to: "/branches", label: { ar: "الفروع", en: "Branches" } },
      { to: "/family-tree", label: { ar: "المشجرة - دقيقة", en: "Detailed Family Tree" } },
      { to: "/dna", label: { ar: "الدراسة الجينية", en: "Genetic Study" } },
      {
        to: "/achievers",
        label: { ar: "سجل المتميزين", en: "Roll of Honour" },
        short: { ar: "المتميزون", en: "Honours" },
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
            children: [
              {
                to: "/contribute",
                label: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" },
              },
            ],
          },
        ],
      },
      {
        to: "/initiatives",
        label: { ar: "المشاريع", en: "Projects" },
        short: { ar: "المشاريع", en: "Projects" },
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
      { to: "/news", label: { ar: "الأخبار والبيانات", en: "News & Notices" } },
      { to: "/events", label: { ar: "الفعاليات واللقاءات", en: "Events & Gatherings" } },
    ],
  },
  {
    title: { ar: "الخدمات والمشاركة", en: "Services & Participation" },
    items: [
      {
        to: "/directory",
        label: {
          ar: "خدمات افراد الأسرة و خدمات المنشأت",
          en: "Family Member & Establishment Services",
        },
        short: { ar: "الخدمات", en: "Services" },
      },
      {
        to: "/requests",
        label: { ar: "مركز الطلبات", en: "Requests Hub" },
        short: { ar: "الطلبات", en: "Requests" },
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
