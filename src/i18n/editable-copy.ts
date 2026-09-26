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
  !!v && typeof v === "object" && typeof (v as Bi).ar === "string" && typeof (v as Bi).en === "string";

export function registerCopy<T extends object>(page: string, copy: T): T {
  const list: { path: string; value: Bi }[] = [];
  const walk = (v: unknown, path: string) => {
    if (!v || typeof v !== "object") return;
    if (isBi(v)) {
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
