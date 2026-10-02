/**
 * Admin-managed SEO. Every public route declares its own `head()` (title,
 * description, share card) in code. To let the console change those without a
 * deploy, `installSeoOverrides` wraps each static route's `head` once, at
 * router creation, and layers the saved `site_seo` setting on top of whatever
 * the route returned. Routes that build their title from a record (news and
 * initiative articles, CMS pages) are left alone: their content already comes
 * from the CMS.
 *
 * `site_seo` value shape:
 *   {
 *     title_ar?, desc_ar?,         // home page title / description
 *     image?,                      // default share image for every page
 *     pages?: { [path]: { title?, description?, image? } }
 *   }
 */

export type SeoPageOverride = { title?: string; description?: string; image?: string };
export type SeoSettings = {
  title_ar?: string;
  desc_ar?: string;
  image?: string;
  pages?: Record<string, SeoPageOverride>;
};

/** Public pages whose SEO the console can edit (path -> label). */
export const SEO_EDITABLE_PAGES: { path: string; ar: string; en: string }[] = [
  { path: "/", ar: "الرئيسية", en: "Home" },
  { path: "/about", ar: "التاريخ والجذور", en: "History & roots" },
  { path: "/family-tree", ar: "مشجرة العائلة", en: "Family tree" },
  { path: "/official-family-tree", ar: "المشجرة الرسمية", en: "Official family tree" },
  { path: "/branches", ar: "فروع العائلة", en: "Branches" },
  { path: "/dna", ar: "الدراسات الجينية", en: "Genetic studies" },
  { path: "/fund", ar: "صندوق التنمية العائلية", en: "Family Development Fund" },
  { path: "/governance", ar: "الحوكمة ومجلس الأمناء", en: "Governance" },
  { path: "/fund-certificates", ar: "الشهادات والإثباتات", en: "Certificates" },
  { path: "/fund-financials", ar: "القوائم المالية", en: "Financial statements" },
  { path: "/contribute", ar: "الاشتراك والمساهمة", en: "Contribute" },
  { path: "/committees", ar: "اللجان", en: "Committees" },
  { path: "/directory", ar: "دليل الأسر المنتجة", en: "Directory" },
  { path: "/library", ar: "الأرشيف والمكتبة", en: "Archive & library" },
  { path: "/news", ar: "المركز الإعلامي", en: "Media center" },
  { path: "/events", ar: "الفعاليات", en: "Events" },
  { path: "/initiatives", ar: "المبادرات", en: "Initiatives" },
  { path: "/achievers", ar: "لوحة الشرف", en: "Roll of honour" },
  { path: "/requests", ar: "مركز الطلبات", en: "Requests" },
  { path: "/templates", ar: "الهوية البصرية", en: "Visual identity" },
  { path: "/contact", ar: "تواصل معنا", en: "Contact" },
  { path: "/ahsa-family-councils", ar: "مجالس أسر الأحساء", en: "Ahsa family councils" },
];

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

type Meta = Record<string, unknown>;

/** Replace the tag matching `match`, or append `entry` when the route had none. */
function upsertMeta(meta: Meta[], match: (m: Meta) => boolean, entry: Meta) {
  const i = meta.findIndex(match);
  if (i >= 0) meta[i] = entry;
  else meta.push(entry);
}

function absoluteImage(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  // Lazy import-free resolution: the site origin is the same one used for canonicals.
  const base =
    (typeof process !== "undefined" && (process.env?.VITE_SITE_URL || process.env?.SITE_URL)) ||
    (import.meta.env?.VITE_SITE_URL as string | undefined) ||
    "https://www.boubaid.com";
  return `${String(base).replace(/\/+$/, "")}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Layer the saved SEO values over a route's own `head()` result. */
export function applySeoToHead(head: any, path: string, seo: SeoSettings | undefined | null): any {
  if (!seo) return head;
  const page = seo.pages?.[path];
  const isHome = path === "/";
  const title = clean(page?.title) || (isHome ? clean(seo.title_ar) : "");
  const description = clean(page?.description) || (isHome ? clean(seo.desc_ar) : "");
  const image = clean(page?.image) || clean(seo.image);
  if (!title && !description && !image) return head;

  const meta: Meta[] = [...((head?.meta as Meta[] | undefined) ?? [])];
  if (title) {
    upsertMeta(meta, (m) => "title" in m, { title });
    upsertMeta(meta, (m) => m.property === "og:title", { property: "og:title", content: title });
    upsertMeta(meta, (m) => m.name === "twitter:title", { name: "twitter:title", content: title });
  }
  if (description) {
    upsertMeta(meta, (m) => m.name === "description", {
      name: "description",
      content: description,
    });
    upsertMeta(meta, (m) => m.property === "og:description", {
      property: "og:description",
      content: description,
    });
    upsertMeta(meta, (m) => m.name === "twitter:description", {
      name: "twitter:description",
      content: description,
    });
  }
  if (image) {
    const url = absoluteImage(image);
    upsertMeta(meta, (m) => m.property === "og:image", { property: "og:image", content: url });
    upsertMeta(meta, (m) => m.name === "twitter:image", { name: "twitter:image", content: url });
  }
  return { ...(head ?? {}), meta };
}

/**
 * Wrap every static route's `head` so the saved SEO settings (read from the
 * root loader, which every match can see) are applied. Call once, right after
 * the router is created.
 */
export function installSeoOverrides(router: { routesById: Record<string, any> }) {
  for (const route of Object.values(router.routesById)) {
    const options = route?.options;
    const original = options?.head;
    if (typeof original !== "function") continue;
    const fullPath: string = route.fullPath ?? route.path ?? "";
    // Record-driven pages build their own SEO from CMS data.
    if (fullPath.includes("$")) continue;
    // Console routes are noindex and never shared.
    if (/^\/(admin|content|treasury|account)/.test(fullPath)) continue;
    const isRoot = route.id === "__root__";

    options.head = async (ctx: any) => {
      const head = await original(ctx);
      try {
        const rootMatch = ctx?.matches?.find((m: any) => m.routeId === "__root__");
        const seo = (rootMatch?.loaderData as Record<string, any> | undefined)?.site_seo as
          SeoSettings | undefined;
        if (!seo) return head;
        // The root contributes only the site-wide share image; pages own the rest.
        if (isRoot) return applySeoToHead(head, "*", { image: seo.image });
        const normalized = fullPath === "" ? "/" : fullPath.replace(/\/+$/, "") || "/";
        return applySeoToHead(head, normalized, seo);
      } catch {
        return head;
      }
    };
  }
}
