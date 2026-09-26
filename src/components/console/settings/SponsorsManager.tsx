import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SPONSOR_ROWS, type SponsorRow } from "@/content/award-sponsors";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

/** Editable rows use "Arabic | English" per line for multi-line cells. */
type EditRow = {
  year: string;
  participants: string;
  honoured: string;
  branches: string;
  prize_ar: string;
  prize_en: string;
  fields: string;
  sponsor: string;
};
const toLines = (l: { ar: string; en: string }[]) => l.map((b) => `${b.ar} | ${b.en}`).join("\n");
const fromLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [ar, en] = l.split("|").map((x) => x.trim());
      return { ar: ar ?? "", en: en || ar || "" };
    });
const toEdit = (r: SponsorRow): EditRow => ({
  year: r.year,
  participants: String(r.participants),
  honoured: String(r.honoured),
  branches: toLines(r.branches),
  prize_ar: r.prize.ar,
  prize_en: r.prize.en,
  fields: toLines(r.fields),
  sponsor: r.sponsor,
});

export function SponsorsManager({
  settings,
  onSaveSetting,
  isAr,
}: {
  settings: { key: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
  isAr: boolean;
}) {
  const saved = settings.find((s) => s.key === "award_sponsors")?.value;
  const [rows, setRows] = useState<EditRow[]>([]);
  const [totalAr, setTotalAr] = useState("");
  const [totalEn, setTotalEn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const src: SponsorRow[] = Array.isArray(saved?.rows) && saved.rows.length ? saved.rows : SPONSOR_ROWS;
    setRows(src.map(toEdit));
    setTotalAr(saved?.total_ar ?? "26000 ريال");
    setTotalEn(saved?.total_en ?? "SAR 26,000");
  }, [JSON.stringify(saved)]); // eslint-disable-line react-hooks/exhaustive-deps

  const upd = (i: number, k: keyof EditRow, v: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const save = async () => {
    const out: SponsorRow[] = rows.map((r) => ({
      year: r.year.trim(),
      participants: Number(r.participants) || 0,
      honoured: Number(r.honoured) || 0,
      branches: fromLines(r.branches),
      prize: { ar: r.prize_ar, en: r.prize_en || r.prize_ar },
      fields: fromLines(r.fields),
      sponsor: r.sponsor,
    }));
    try {
      setSaving(true);
      await onSaveSetting({
        category: "content",
        key: "award_sponsors",
        value: { rows: out, total_ar: totalAr, total_en: totalEn },
        is_public: true,
      });
      toast.success(isAr ? "تم حفظ جدول الرعاة" : "Sponsors table saved");
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const cell = "min-w-[110px]";
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {isAr
          ? "في خانات الفروع والمجالات: سطر لكل بند بصيغة «عربي | English». المجموع للمشاركين والمكرمين يُحسب تلقائياً."
          : "Branches and fields: one item per line as “Arabic | English”. Participant and honoured totals are calculated automatically."}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-xs">
          <thead>
            <tr className="text-start text-muted-foreground">
              {["العام", "المشاركون", "المكرمون", "فروع المسابقة", "الجوائز (ع)", "Prize (EN)", "فروع الفائزين", "الراعي", ""].map(
                (h) => (
                  <th key={h} className="px-1 pb-2 text-start font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top">
                <td className="p-1"><Input className="w-20" value={r.year} onChange={(e) => upd(i, "year", e.target.value)} /></td>
                <td className="p-1"><Input className="w-20" type="number" value={r.participants} onChange={(e) => upd(i, "participants", e.target.value)} /></td>
                <td className="p-1"><Input className="w-20" type="number" value={r.honoured} onChange={(e) => upd(i, "honoured", e.target.value)} /></td>
                <td className="p-1"><textarea className={`${cell} h-20 w-full rounded-md border border-input bg-background p-2`} value={r.branches} onChange={(e) => upd(i, "branches", e.target.value)} /></td>
                <td className="p-1"><Input className={cell} dir="rtl" value={r.prize_ar} onChange={(e) => upd(i, "prize_ar", e.target.value)} /></td>
                <td className="p-1"><Input className={cell} dir="ltr" value={r.prize_en} onChange={(e) => upd(i, "prize_en", e.target.value)} /></td>
                <td className="p-1"><textarea className={`${cell} h-20 w-full rounded-md border border-input bg-background p-2`} value={r.fields} onChange={(e) => upd(i, "fields", e.target.value)} /></td>
                <td className="p-1"><Input className="min-w-[180px]" value={r.sponsor} onChange={(e) => upd(i, "sponsor", e.target.value)} /></td>
                <td className="p-1">
                  <Button size="icon" variant="ghost" aria-label="delete row" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={() =>
            setRows((rs) => [...rs, { year: "", participants: "0", honoured: "0", branches: "", prize_ar: "", prize_en: "", fields: "", sponsor: "" }])
          }
        >
          <Plus className="h-3.5 w-3.5" />
          {isAr ? "إضافة سنة" : "Add year"}
        </Button>
        <div className="space-y-1">
          <span className="text-[11px]">{isAr ? "إجمالي الجوائز (ع)" : "Total prizes (AR)"}</span>
          <Input dir="rtl" value={totalAr} onChange={(e) => setTotalAr(e.target.value)} />
        </div>
        <div className="space-y-1">
          <span className="text-[11px]">Total prizes (EN)</span>
          <Input dir="ltr" value={totalEn} onChange={(e) => setTotalEn(e.target.value)} />
        </div>
        <Button size="sm" disabled={saving} onClick={save} className="ms-auto gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          {isAr ? "حفظ الجدول" : "Save table"}
        </Button>
      </div>
    </div>
  );
}
