/**
 * Editable page copy. Every page's static `copy` object is registered here so
 * admins can override any bilingual {ar,en} text from the CMS (site_settings
 * key `page_texts`, a map of "page:path" -> { ar, en }). `t()` in the
 * LanguageProvider looks the object up and applies the override.
 */
type Bi = { ar: string; en: string };
const ids = new WeakMap<object, string>();
export const copyRegistry: Record<string, { path: string; value: Bi }[]> = {};

const isBi = (v: unknown): v is Bi =>
  !!v &&
  typeof v === "object" &&
  typeof (v as Bi).ar === "string" &&
  typeof (v as Bi).en === "string";

export function registerCopy<T extends object>(page: string, copy: T): T {
  const list: { path: string; value: Bi }[] = [];
  const walk = (v: unknown, path: string) => {
    if (!v || typeof v !== "object") return;
    if (isBi(v)) {
      // An entry shared with a set registered earlier keeps that id, so the
      // overrides already published under it keep applying.
      if (ids.has(v)) return;
      ids.set(v, `${page}:${path}`);
      list.push({ path, value: { ar: v.ar, en: v.en } });
      return;
    }
    for (const [k, child] of Object.entries(v)) walk(child, path ? `${path}.${k}` : k);
  };
  walk(copy, "");
  copyRegistry[page] = list;
  return copy;
}

export function copyId(entry: object): string | undefined {
  return ids.get(entry);
}

/**
 * CMS-managed texts (homepage sections, navigation items) live in the database,
 * not in code. Tagging their {ar,en} object with a `cms-<kind>:<key>` id lets
 * `t()` treat them like registered copy — the live editor can then find, preview
 * and publish them — while `cmsTexts` keeps the latest stored value per id.
 */
export const cmsTexts = new Map<string, Bi>();

export function tagCmsText<T extends Bi>(entry: T, id: string): T {
  ids.set(entry, id);
  cmsTexts.set(id, { ar: entry.ar, en: entry.en });
  return entry;
}

export function isCmsTextId(id: string): boolean {
  return id.startsWith("cms-");
}
