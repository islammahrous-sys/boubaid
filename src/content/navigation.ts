import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Single source of truth for site navigation.
 *
 * Header, Footer, and MobileNav previously each kept their own list, and
 * they had drifted apart — different labels for the same route, and routes
 * present in one menu but missing from another. Everything reads from here.
 */

export type NavItem = {
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
      { to: "/branches", label: { ar: "الفروع", en: "Branches" } },
      {
        to: "/family-tree",
        label: { ar: "المشجرة - دقيقة", en: "Family Tree (Detailed)" },
        short: { ar: "المشجرة", en: "Tree" },
      },
      { to: "/dna", label: { ar: "الدراسة الجينية", en: "Genetic Study" } },
      { to: "/about", label: { ar: "عمود النسب والتاريخ", en: "Lineage Overview" } },
    ],
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
  {
    to: "/library",
    label: { ar: "الأرشيف", en: "Archive" },
    short: { ar: "الأرشيف", en: "Archive" },
  },
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
      { to: "/foundation", label: { ar: "الحوكمة ومجلس الأمناء", en: "Governance & Trustees" } },
      {
        to: "/initiatives",
        label: { ar: "المشاريع", en: "Projects" },
        short: { ar: "المشاريع", en: "Projects" },
      },
      {
        to: "/library",
        label: { ar: "الأرشيف", en: "Archive" },
        short: { ar: "الأرشيف", en: "Archive" },
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
        label: { ar: "الخدمات والدليل", en: "Services & Directory" },
        short: { ar: "الخدمات", en: "Services" },
      },
      { to: "/contribute", label: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } },
      { to: "/contact", label: { ar: "تواصل معنا", en: "Contact" } },
    ],
  },
];

/** Flat list of every secondary item, for the header's "more" menu. */
export const secondaryNav: NavItem[] = navGroups
  .flatMap((g) => g.items)
  .filter((item) => !primaryNav.some((p) => p.to === item.to));

export function isRouteActive(pathname: string, to: string): boolean {
  return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

/** Check if any child route in a nav item is active */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (isRouteActive(pathname, item.to)) return true;
  if (item.children?.some((child) => isRouteActive(pathname, child.to))) return true;
  return false;
}
