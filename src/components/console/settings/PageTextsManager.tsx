import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { copyRegistry } from "@/i18n/editable-copy";
import { pageLabel } from "@/i18n/page-labels";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

import * as siteCopy from "@/content/site";
import * as councilCopy from "@/content/council-address";
import * as historyCopy from "@/content/history-source";
import * as navigationCopy from "@/content/navigation";
import * as fundDocumentsCopy from "@/content/fund-documents";
import * as imagesCopy from "@/content/images";

// Load every page's text set so the registry is complete in the admin.
// These modules only matter for the registerCopy() call they run, and the
// package declares `"sideEffects": false` — so bare side-effect imports were
// tree-shaken out of the production build and the editor listed just the 18
// sets the console happened to import for other reasons. Holding on to the
// module namespaces (and reading them below) keeps every one of them.
const pageCopyModules = import.meta.glob("/src/content/page-copy/*.ts", { eager: true });
const COPY_MODULES: unknown[] = [
  ...Object.values(pageCopyModules),
  siteCopy,
  councilCopy,
  historyCopy,
  navigationCopy,
  fundDocumentsCopy,
  imagesCopy,
];

type Bi = { ar?: string; en?: string };

export function PageTextsManager({
  settings,
  onSaveSetting,
  isAr,
}: {
  settings: { key: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
  isAr: boolean;
}) {
  const pages = useMemo(() => (COPY_MODULES.length ? Object.keys(copyRegistry).sort() : []), []);
  const [page, setPage] = useState(pages.includes("index") ? "index" : pages[0]);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, Bi>>({});
  const [saving, setSaving] = useState(false);

  const saved = (settings.find((s) => s.key === "page_texts")?.value ?? {}) as Record<string, Bi>;
  useEffect(() => setDraft(saved), [JSON.stringify(saved)]); // eslint-disable-line react-hooks/exhaustive-deps

  const entries = (copyRegistry[page] ?? []).filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (e.value.ar + " " + e.value.en + " " + e.path).toLowerCase().includes(q);
  });

  const setField = (id: string, lang: "ar" | "en", val: string) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [lang]: val } }));

  const save = async () => {
    // Drop empty or unchanged overrides so defaults keep flowing through.
    const clean: Record<string, Bi> = {};
    for (const [id, v] of Object.entries(draft)) {
      const [pg, ...rest] = id.split(":");
      const def = copyRegistry[pg]?.find((e) => e.path === rest.join(":"))?.value;
      const out: Bi = {};
      if (v.ar?.trim() && v.ar !== def?.ar) out.ar = v.ar;
      if (v.en?.trim() && v.en !== def?.en) out.en = v.en;
      if (out.ar || out.en) clean[id] = out;
    }
    try {
      setSaving(true);
      await onSaveSetting({
        category: "content",
        key: "page_texts",
        value: clean,
        is_public: true,
      });
      toast.success(isAr ? "تم حفظ نصوص الصفحات" : "Page texts saved");
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {pages.map((p) => (
            <option key={p} value={p}>
              {pageLabel(p)}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="ps-8"
            placeholder={isAr ? "ابحث في النصوص…" : "Search texts…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button size="sm" disabled={saving} onClick={save} className="gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          {isAr ? "حفظ النصوص" : "Save texts"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {isAr
          ? "اترك الحقل كما هو لاستخدام النص الأصلي. يظهر التعديل للزوار بعد الحفظ مباشرة."
          : "Leave a field unchanged to keep the original text. Changes appear to visitors right after saving."}
      </p>
      <div className="max-h-[65vh] space-y-3 overflow-y-auto pe-1">
        {entries.map((e) => {
          const id = `${page}:${e.path}`;
          const cur = draft[id] ?? {};
          const long = e.value.ar.length > 70 || e.value.en.length > 90;
          const F = long ? Textarea : Input;
          return (
            <div key={id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <code className="text-[11px] text-muted-foreground">{e.path}</code>
                {(cur.ar || cur.en) && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setDraft((d) => {
                        const n = { ...d };
                        delete n[id];
                        return n;
                      })
                    }
                  >
                    <RotateCcw className="h-3 w-3" />
                    {isAr ? "استعادة الأصل" : "Reset"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">العربية</Label>
                  <F
                    dir="rtl"
                    value={cur.ar ?? e.value.ar}
                    onChange={(ev: any) => setField(id, "ar", ev.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">English</Label>
                  <F
                    dir="ltr"
                    value={cur.en ?? e.value.en}
                    onChange={(ev: any) => setField(id, "en", ev.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
