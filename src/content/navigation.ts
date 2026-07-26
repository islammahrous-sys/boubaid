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
};

/** Top-level routes, shown in the desktop header bar. */
export const primaryNav: NavItem[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, short: { ar: "الرئيسية", en: "Home" } },
  { to: "/about", label: { ar: "النسب والتاريخ", en: "Lineage" } },
  { to: "/branches", label: { ar: "الفروع السبعة", en: "Branches" } },
  {
    to: "/family-tree",
    label: { ar: "المشجرة", en: "Family Tree" },
    short: { ar: "المشجرة", en: "Tree" },
  },
  { to: "/dna", label: { ar: "الدراسة الجينية", en: "Y-DNA Study" } },
];

/** Secondary routes, grouped for the header dropdown and the footer. */
export const navGroups: { title: BiText; items: NavItem[] }[] = [
  {
    title: { ar: "الأسرة", en: "The Family" },
    items: [
      { to: "/about", label: { ar: "النسب والتاريخ", en: "Lineage & History" } },
      { to: "/branches", label: { ar: "الفروع السبعة", en: "The Seven Branches" } },
      { to: "/family-tree", label: { ar: "المشجرة التفاعلية", en: "Interactive Family Tree" } },
      { to: "/dna", label: { ar: "الدراسة الجينية", en: "Y-DNA Study" } },
      {
        to: "/achievers",
        label: { ar: "سجل المتميزين", en: "Roll of Honour" },
        short: { ar: "المتميزون", en: "Honours" },
      },
    ],
  },
  {
    title: { ar: "المنظمة", en: "The Organisation" },
    items: [
      { to: "/foundation", label: { ar: "الحوكمة ومجلس الأمناء", en: "Governance & Trustees" } },
      {
        to: "/initiatives",
        label: { ar: "المبادرات والمشاريع", en: "Initiatives & Projects" },
        short: { ar: "المبادرات", en: "Programmes" },
      },
      {
        to: "/library",
        label: { ar: "الأرشيف والمكتبة", en: "Archive & Library" },
        short: { ar: "الأرشيف", en: "Archive" },
      },
      { to: "/news", label: { ar: "الأخبار والبيانات", en: "News & Notices" } },
    ],
  },
  {
    title: { ar: "المشاركة", en: "Take Part" },
    items: [
      {
        to: "/directory",
        label: { ar: "دليل الأعمال", en: "Business Directory" },
        short: { ar: "الدليل", en: "Directory" },
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
