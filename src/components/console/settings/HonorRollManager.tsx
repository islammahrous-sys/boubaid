import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  HONOR_TIERS,
  parseHonorRoll,
  type HonorRollEntry,
  type HonorTierId,
} from "@/components/site/WallOfHonor";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

/**
 * Wall of Honor donor roll (site setting `hq_honor_roll`). Only names whose
 * contribution is confirmed and who agreed to be listed belong here; amounts
 * are never stored or shown.
 */
export function HonorRollManager({
  settings,
  onSaveSetting,
  isAr,
}: {
  settings: { key: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
  isAr: boolean;
}) {
  const saved = settings.find((s) => s.key === "hq_honor_roll")?.value;
  const [rows, setRows] = useState<HonorRollEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows(parseHonorRoll(saved));
  }, [JSON.stringify(saved)]); // eslint-disable-line react-hooks/exhaustive-deps

  const upd = (i: number, patch: Partial<HonorRollEntry>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async () => {
    const entries = rows.map((r) => ({ name: r.name.trim(), tier: r.tier })).filter((r) => r.name);
    try {
      setSaving(true);
      await onSaveSetting({
        category: "content",
        key: "hq_honor_roll",
        value: { entries },
        is_public: true,
      });
      toast.success(isAr ? "تم حفظ لوحة الشرف" : "Wall of Honor saved");
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {isAr
          ? "أضف فقط المساهمين الذين تأكدت مساهماتهم ووافقوا كتابيًا على نشر أسمائهم (حقل الموافقة في طلب المساهمة). لا تُنشر المبالغ."
          : "Add only contributors whose contribution is confirmed and who agreed to be named (the consent field on their contribution request). Amounts are never published."}
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {isAr ? "لا توجد أسماء بعد." : "No names yet."}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <Input
                className="min-w-[220px] flex-1"
                value={r.name}
                placeholder={isAr ? "اسم المساهم" : "Contributor name"}
                aria-label={isAr ? "اسم المساهم" : "Contributor name"}
                onChange={(e) => upd(i, { name: e.target.value })}
              />
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={r.tier}
                aria-label={isAr ? "الفئة" : "Tier"}
                onChange={(e) => upd(i, { tier: e.target.value as HonorTierId })}
              >
                {HONOR_TIERS.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {isAr ? tier.name.ar : tier.name.en}
                  </option>
                ))}
              </select>
              <Button
                size="icon"
                variant="ghost"
                aria-label={isAr ? "حذف" : "Remove"}
                onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={() => setRows((rs) => [...rs, { name: "", tier: "silver" }])}
        >
          <Plus className="h-3.5 w-3.5" />
          {isAr ? "إضافة مساهم" : "Add contributor"}
        </Button>
        <Button size="sm" disabled={saving} onClick={save} className="ms-auto gap-1.5 text-xs">
          <Save className="h-3.5 w-3.5" />
          {isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </div>
  );
}
