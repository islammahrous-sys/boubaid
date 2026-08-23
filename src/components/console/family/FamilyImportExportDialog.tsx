import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "@/i18n/LanguageProvider";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FamilyMemberInput } from "@/lib/admin-hub.schemas";

export function FamilyImportExportDialog({
  open,
  onOpenChange,
  initialStats,
  onImportMembers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStats?: { total: number; living: number; deceased: number };
  onImportMembers: (data: FamilyMemberInput[]) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [csvText, setCsvText] = useState("");
  const [parsedMembers, setParsedMembers] = useState<FamilyMemberInput[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const { data: members, error } = await supabase
        .from("family_members")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!members || members.length === 0) {
        toast.info(isAr ? "لا توجد سجلات للتصدير" : "No records to export");
        return;
      }

      const headers = [
        "first_name_ar",
        "middle_name_ar",
        "last_name_ar",
        "first_name_en",
        "middle_name_en",
        "last_name_en",
        "slug",
        "gender",
        "date_of_birth",
        "date_of_death",
        "is_living",
        "biography_ar",
        "occupation_ar",
        "education_ar",
        "generation",
        "visibility",
        "status",
      ];

      const rows = members.map((m) =>
        [
          `"${m.first_name_ar || ""}"`,
          `"${m.middle_name_ar || ""}"`,
          `"${m.last_name_ar || ""}"`,
          `"${m.first_name_en || ""}"`,
          `"${m.middle_name_en || ""}"`,
          `"${m.last_name_en || ""}"`,
          `"${m.slug || ""}"`,
          `"${m.gender || "male"}"`,
          `"${m.date_of_birth || ""}"`,
          `"${m.date_of_death || ""}"`,
          m.is_living ? "true" : "false",
          `"${(m.biography_ar || "").replace(/"/g, '""')}"`,
          `"${m.occupation_ar || ""}"`,
          `"${m.education_ar || ""}"`,
          m.generation || 1,
          `"${m.visibility || "public"}"`,
          `"${m.status || "published"}"`,
        ].join(",")
      );

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `alaboubaid-family-members-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(isAr ? "تم تصدير ملف CSV بنجاح" : "CSV exported successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تصدير البيانات" : "Failed to export data"));
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setExporting(true);
      const { data: members, error } = await supabase
        .from("family_members")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!members || members.length === 0) {
        toast.info(isAr ? "لا توجد سجلات للتصدير" : "No records to export");
        return;
      }

      const jsonContent = JSON.stringify(members, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `alaboubaid-family-members-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(isAr ? "تم تصدير ملف JSON بنجاح" : "JSON exported successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تصدير البيانات" : "Failed to export data"));
    } finally {
      setExporting(false);
    }
  };

  const handleParseCsv = () => {
    setParseError(null);
    setParsedMembers([]);

    try {
      const lines = csvText.trim().split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setParseError(isAr ? "الملف فارغ أو لا يحتوي على صفوف بيانات" : "CSV is empty or missing data rows");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const items: FamilyMemberInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (!cols[0]) continue;

        const row: Record<string, any> = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] ?? "";
        });

        items.push({
          first_name_ar: row["first_name_ar"] || "عضو",
          middle_name_ar: row["middle_name_ar"] || null,
          last_name_ar: row["last_name_ar"] || "آل بوعبيد",
          first_name_en: row["first_name_en"] || null,
          last_name_en: row["last_name_en"] || "Al Bu Obaid",
          slug: row["slug"] || `imported-${Date.now().toString(36)}-${i}`,
          gender: (row["gender"] === "female" ? "female" : "male") as any,
          date_of_birth: row["date_of_birth"] || null,
          date_of_death: row["date_of_death"] || null,
          is_living: row["is_living"] !== "false",
          biography_ar: row["biography_ar"] || null,
          occupation_ar: row["occupation_ar"] || null,
          education_ar: row["education_ar"] || null,
          generation: parseInt(row["generation"]) || 1,
          sort_order: parseInt(row["sort_order"]) || 0,
          visibility: (row["visibility"] || "public") as any,
          status: (row["status"] || "published") as any,
        });
      }

      setParsedMembers(items);
      toast.success(isAr ? `تم التعرف على ${items.length} سجل بنجاح` : `Parsed ${items.length} records`);
    } catch (err: any) {
      setParseError(err.message || (isAr ? "فشل تحليل صيغة CSV" : "Failed to parse CSV"));
    }
  };

  const handleExecuteImport = async () => {
    if (parsedMembers.length === 0) return;
    try {
      setLoading(true);
      await onImportMembers(parsedMembers);
      toast.success(isAr ? `تم استيراد ${parsedMembers.length} فرد بنجاح` : `Successfully imported ${parsedMembers.length} members`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ أثناء الاستيراد" : "Import failed"));
    } finally {
      setLoading(false);
    }
  };

  const totalCount = initialStats?.total ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {isAr ? "استيراد وتصدير بيانات شجرة الأسرة" : "Import / Export Family Records"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="export" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              {isAr ? "تصدير البيانات" : "Export Records"}
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" />
              {isAr ? "استيراد من CSV" : "Import CSV"}
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="p-4 border border-border rounded-xl bg-muted/20 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">
                {isAr ? "تصدير كامل سجلات أفراد الأسرة" : "Export Full Family Records"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `يمكنك تحميل كافة بيانات الأفراد الحالية المسجلة (${totalCount} فرد) بصيغة CSV أو JSON للاستخدام المكتبي أو الأرشفة.`
                  : `Download current database of ${totalCount} members in standard CSV or JSON formats.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={handleExportCsv} 
                disabled={exporting}
                className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isAr ? "تحميل ملف CSV (Excel متوافق)" : "Download CSV (Excel format)"}
              </Button>
              <Button 
                onClick={handleExportJson} 
                variant="outline" 
                disabled={exporting}
                className="gap-2 text-xs"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isAr ? "تحميل ملف JSON" : "Download JSON"}
              </Button>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                {isAr ? "الصق نص CSV هنا (مع عناوين الأعمدة)" : "Paste CSV text with column headers"}
              </Label>
              <Textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="first_name_ar,last_name_ar,gender,is_living,generation\nمحمد,آل بوعبيد,male,true,1"
                className="font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={handleParseCsv} className="text-xs">
                {isAr ? "تحليل والتحقق من البيانات" : "Validate & Preview"}
              </Button>
            </div>

            {parseError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedMembers.length > 0 && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? `جاهز للاستيراد: تم التحقق من ${parsedMembers.length} فرد` : `Ready to import ${parsedMembers.length} valid records`}</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {isAr
                    ? "انقر على زر تأكيد الاستيراد لإدراج هذه السجلات في قاعدة البيانات."
                    : "Click Confirm Import to insert records into the database."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-border flex items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          {parsedMembers.length > 0 && (
            <Button
              size="sm"
              onClick={handleExecuteImport}
              disabled={loading}
              className="gap-2 text-xs bg-primary text-primary-foreground"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {isAr ? `تأكيد استيراد (${parsedMembers.length})` : `Confirm Import (${parsedMembers.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
