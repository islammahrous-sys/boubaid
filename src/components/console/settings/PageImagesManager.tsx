import { useEffect, useMemo, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { pageImageRegistry } from "@/content/images";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

/** Friendly names for the figure groups declared in content/images.ts. */
const GROUP_LABELS: Record<string, { ar: string; en: string }> = {
  home: { ar: "الرئيسية", en: "Home" },
  about: { ar: "التاريخ والجذور", en: "History & roots" },
  governance: { ar: "الحوكمة", en: "Governance" },
  initiatives: { ar: "المبادرات", en: "Initiatives" },
  achievers: { ar: "لوحة الشرف", en: "Roll of honour" },
  familyTree: { ar: "شجرة العائلة", en: "Family tree" },
  branches: { ar: "الفروع", en: "Branches" },
  dna: { ar: "الدراسات الجينية", en: "Genetic studies" },
  committees: { ar: "اللجان", en: "Committees" },
  fund: { ar: "الصندوق", en: "Fund" },
};

/**
 * Replace the page-level photographs (headers, plates) without a deploy. The
 * choice is stored as the `page_images` site setting: { "<figure id>": "<url>" }
 * and read through `pageImages.*.src` (content/images.ts), so every page that
 * uses a figure picks it up. Leaving a figure untouched keeps the built-in image.
 */
export function PageImagesManager({
  settings,
  onSaveSetting,
  isAr,
}: {
  settings: { key: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
  isAr: boolean;
}) {
  const saved = useMemo(
    () => (settings.find((s) => s.key === "page_images")?.value ?? {}) as Record<string, string>,
    [settings],
  );
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const sig = JSON.stringify(saved);
  useEffect(() => {
    setDraft(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof pageImageRegistry>();
    for (const e of pageImageRegistry) {
      const g = e.id.split(".")[0] ?? "other";
      map.set(g, [...(map.get(g) ?? []), e]);
    }
    return [...map.entries()];
  }, []);

  const save = async () => {
    const clean: Record<string, string> = {};
    for (const [id, url] of Object.entries(draft)) {
      if (url?.trim()) clean[id] = url.trim();
    }
    try {
      setSaving(true);
      await onSaveSetting({ category: "media", key: "page_images", value: clean, is_public: true });
      toast.success(isAr ? "تم حفظ صور الصفحات" : "Page images saved");
    } catch (e: any) {
      toast.error(e?.message || (isAr ? "تعذر الحفظ" : "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-muted-foreground">
        {isAr
          ? "هذه الصور الرئيسية للصفحات. اختر صورة جديدة من المكتبة أو ارفع صورة لاستبدال الصورة الحالية، وستظهر للزوار بعد الحفظ. صور الأخبار والمبادرات والفروع تُدار من سجلاتها."
          : "These are the main photographs on each page. Pick or upload an image to replace the current one; visitors see it after saving. News, initiative and branch images are managed on their own records."}
      </p>

      {groups.map(([group, entries]) => (
        <section key={group} className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            {GROUP_LABELS[group] ? (isAr ? GROUP_LABELS[group].ar : GROUP_LABELS[group].en) : group}
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map((e) => {
              const current = draft[e.id] ?? "";
              return (
                <div key={e.id} className="space-y-2 rounded-lg border border-border p-3">
                  <p className="text-xs leading-relaxed text-foreground">
                    {isAr ? e.caption.ar : e.caption.en}
                  </p>
                  <ImageUploadInput
                    value={current || e.defaultSrc}
                    onChange={(url) => setDraft((d) => ({ ...d, [e.id]: url }))}
                    allowPdf={false}
                  />
                  <div className="flex items-center justify-between">
                    <code className="text-[11px] text-muted-foreground">{e.id}</code>
                    {current && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setDraft((d) => {
                            const n = { ...d };
                            delete n[e.id];
                            return n;
                          })
                        }
                      >
                        <RotateCcw className="h-3 w-3" />
                        {isAr ? "استعادة الأصل" : "Reset to built-in"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <Button size="sm" disabled={saving} onClick={save} className="gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ الصور" : "Save images"}
        </Button>
      </div>
    </div>
  );
}
