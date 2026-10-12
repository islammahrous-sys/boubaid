import { useEffect, useMemo, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { SEO_EDITABLE_PAGES, type SeoPageOverride, type SeoSettings } from "@/lib/seo-overrides";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

/**
 * Search-engine and share-card text for every public page. Anything left empty
 * keeps the title/description written in code, so nothing here is required.
 * The values are applied by `installSeoOverrides` (lib/seo-overrides.ts).
 */
export function SeoManager({
  settings,
  onSaveSetting,
  isAr,
}: {
  settings: { key: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
  isAr: boolean;
}) {
  const saved = useMemo(
    () => (settings.find((s) => s.key === "site_seo")?.value ?? {}) as SeoSettings,
    [settings],
  );
  const [shareImage, setShareImage] = useState("");
  const [pages, setPages] = useState<Record<string, SeoPageOverride>>({});
  const [openPath, setOpenPath] = useState<string>("/");
  const [saving, setSaving] = useState(false);

  // Hydrate once the (async) settings arrive, and again after a save returns
  // fresh values, without clobbering edits made in between.
  const sig = JSON.stringify(saved);
  useEffect(() => {
    const base: Record<string, SeoPageOverride> = { ...(saved.pages ?? {}) };
    // The home page's title/description predate per-page overrides; they live
    // at the top level of the setting, so surface them as the "/" entry.
    base["/"] = {
      ...(base["/"] ?? {}),
      title: base["/"]?.title || saved.title_ar || "",
      description: base["/"]?.description || saved.desc_ar || "",
    };
    setPages(base);
    setShareImage(saved.image ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const setField = (path: string, field: keyof SeoPageOverride, value: string) =>
    setPages((p) => ({ ...p, [path]: { ...p[path], [field]: value } }));

  const reset = (path: string) =>
    setPages((p) => {
      const n = { ...p };
      delete n[path];
      return n;
    });

  const save = async () => {
    const cleaned: Record<string, SeoPageOverride> = {};
    for (const [path, v] of Object.entries(pages)) {
      if (path === "/") continue; // stored at the top level below
      const out: SeoPageOverride = {};
      if (v.title?.trim()) out.title = v.title.trim();
      if (v.description?.trim()) out.description = v.description.trim();
      if (v.image?.trim()) out.image = v.image.trim();
      if (out.title || out.description || out.image) cleaned[path] = out;
    }
    const home = pages["/"] ?? {};
    const value: SeoSettings = {
      title_ar: home.title?.trim() ?? "",
      desc_ar: home.description?.trim() ?? "",
      ...(home.image?.trim()
        ? { pages: { ...cleaned, "/": { image: home.image.trim() } } }
        : { pages: cleaned }),
      ...(shareImage.trim() ? { image: shareImage.trim() } : {}),
    };
    try {
      setSaving(true);
      await onSaveSetting({
        category: "seo",
        key: "site_seo",
        value: value as Record<string, unknown>,
        is_public: true,
      });
      toast.success(isAr ? "تم حفظ إعدادات SEO" : "SEO settings saved");
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
          ? "اترك أي حقل فارغاً ليبقى النص الافتراضي للصفحة. العنوان والوصف يظهران في نتائج البحث وعند مشاركة الرابط في واتساب وغيره. صفحات الأخبار والمبادرات والصفحات المخصصة تأخذ عنوانها من محتواها."
          : "Leave a field empty to keep the page's built-in text. The title and description appear in search results and when a link is shared. News, initiative and custom pages take theirs from their own content."}
      </p>

      <div className="rounded-xl border border-border p-4">
        <ImageUploadInput
          label={isAr ? "صورة المشاركة الافتراضية لكل الصفحات" : "Default share image (all pages)"}
          helperText={
            isAr
              ? "تظهر عند مشاركة أي رابط من الموقع. المقاس المناسب 1200×630."
              : "Shown when any page is shared. Best size 1200×630."
          }
          value={shareImage}
          onChange={setShareImage}
          allowPdf={false}
        />
      </div>

      <div className="space-y-2">
        {SEO_EDITABLE_PAGES.map((pg) => {
          const v = pages[pg.path] ?? {};
          const open = openPath === pg.path;
          const edited = !!(v.title || v.description || v.image);
          return (
            <div key={pg.path} className="rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setOpenPath(open ? "" : pg.path)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start"
              >
                <span className="text-sm font-medium text-foreground">
                  {isAr ? pg.ar : pg.en}
                  <code className="ms-2 text-[11px] text-muted-foreground">{pg.path}</code>
                </span>
                {edited && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {isAr ? "معدّل" : "Customised"}
                  </span>
                )}
              </button>
              {open && (
                <div className="space-y-3 border-t border-border p-3">
                  <div className="space-y-1">
                    <Label className="text-[11px]">{isAr ? "العنوان" : "Title"}</Label>
                    <Input
                      dir="rtl"
                      value={v.title ?? ""}
                      maxLength={120}
                      placeholder={isAr ? "الافتراضي من الصفحة" : "Built-in title"}
                      onChange={(e) => setField(pg.path, "title", e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {(v.title ?? "").length}/60{" "}
                      {isAr ? "حرفاً مناسباً" : "characters recommended"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">{isAr ? "الوصف" : "Description"}</Label>
                    <Textarea
                      dir="rtl"
                      rows={3}
                      value={v.description ?? ""}
                      maxLength={320}
                      placeholder={isAr ? "الافتراضي من الصفحة" : "Built-in description"}
                      onChange={(e) => setField(pg.path, "description", e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {(v.description ?? "").length}/160{" "}
                      {isAr ? "حرفاً مناسباً" : "characters recommended"}
                    </p>
                  </div>
                  <ImageUploadInput
                    label={isAr ? "صورة مشاركة خاصة بهذه الصفحة" : "Share image for this page"}
                    value={v.image ?? ""}
                    onChange={(url) => setField(pg.path, "image", url)}
                    allowPdf={false}
                  />
                  {edited && (
                    <button
                      type="button"
                      onClick={() => reset(pg.path)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {isAr ? "استعادة الافتراضي" : "Reset to built-in"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button size="sm" disabled={saving} onClick={save} className="gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          {saving
            ? isAr
              ? "جاري الحفظ..."
              : "Saving..."
            : isAr
              ? "حفظ إعدادات SEO"
              : "Save SEO settings"}
        </Button>
      </div>
    </div>
  );
}
