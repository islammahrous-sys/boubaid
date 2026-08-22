import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { Landmark, FileText, CheckCircle2, XCircle, Clock, Check, X, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TreasuryContributionReviewInput } from "@/lib/admin-hub.schemas";

export type ContributionItem = {
  id: string;
  user_id?: string | null;
  contributor_name: string;
  email?: string | null;
  phone?: string | null;
  amount: number;
  currency: string;
  method: string;
  purpose?: string | null;
  reference?: string | null;
  receipt_path?: string | null;
  status: "pending" | "verified" | "rejected";
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
};

export function TreasuryManager({
  contributions,
  verifiedTotal,
  pendingTotal,
  onReviewContribution,
}: {
  contributions: ContributionItem[];
  verifiedTotal: number;
  pendingTotal: number;
  onReviewContribution: (data: TreasuryContributionReviewInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContribution, setSelectedContribution] = useState<ContributionItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = contributions.filter((c) => {
    return statusFilter === "all" || c.status === statusFilter;
  });

  const getStatusBadge = (st: ContributionItem["status"]) => {
    switch (st) {
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">{isAr ? "معتمد وموثق" : "Verified"}</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">{isAr ? "قيد المراجعة" : "Pending"}</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-[10px]">{isAr ? "مرفوض" : "Rejected"}</Badge>;
    }
  };

  const formatSar = (amt: number) => {
    return new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleReviewSubmit = async (status: "verified" | "rejected") => {
    if (!selectedContribution) return;
    try {
      setLoading(true);
      await onReviewContribution({
        id: selectedContribution.id,
        status,
        review_note: reviewNote,
      });
      setSelectedContribution(null);
      toast.success(isAr ? `تم تحديث المساهمة إلى: ${status === "verified" ? "معتمد" : "مرفوض"}` : `Contribution updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تحديث المساهمة" : "Failed to update"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = async (path: string) => {
    try {
      const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 300);
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(isAr ? "تعذر فتح ملف الإيصال" : "Could not open receipt");
      }
    } catch (err) {
      toast.error(isAr ? "تعذر فتح ملف الإيصال" : "Could not open receipt");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Overview Cards */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "سجل الخزينة والمساهمات والاشتراكات العائلية" : "Treasury & Contributions Ledger"}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">{isAr ? "إجمالي المساهمات المعتمدة" : "Total Verified"}</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {formatSar(verifiedTotal)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 block">{isAr ? "في حساب الصندوق" : "In fund account"}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">{isAr ? "مبالغ قيد المراجعة" : "Pending Review"}</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">
            {formatSar(pendingTotal)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 block">{isAr ? "تتطلب اعتماد الإيصال" : "Awaiting receipt review"}</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground block">{isAr ? "إجمالي القيود المسجلة" : "Total Entries"}</span>
          <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
            {contributions.length}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1 block">{isAr ? "عملية مساهمة واشتراك" : "operations recorded"}</span>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label_ar: "الكل", label_en: "All", count: contributions.length },
            { id: "pending", label_ar: "قيد المراجعة", label_en: "Pending", count: contributions.filter((c) => c.status === "pending").length, isAlert: true },
            { id: "verified", label_ar: "المعتمدة", label_en: "Verified", count: contributions.filter((c) => c.status === "verified").length },
            { id: "rejected", label_ar: "المرفوضة", label_en: "Rejected", count: contributions.filter((c) => c.status === "rejected").length },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 rounded-lg font-medium",
                statusFilter !== tab.id && tab.isAlert && tab.count > 0 && "border-amber-500/40 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
              )}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{isAr ? tab.label_ar : tab.label_en}</span>
              <Badge
                variant={statusFilter === tab.id ? "secondary" : "outline"}
                className={cn("h-4 px-1.5 text-[9px] font-mono", tab.isAlert && tab.count > 0 && "bg-amber-500 text-white font-bold")}
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          {filtered.length} {isAr ? "عملية مطابقة" : "matches"}
        </span>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "المساهم" : "Contributor"}</TableHead>
              <TableHead>{isAr ? "الغرض" : "Purpose"}</TableHead>
              <TableHead className="text-center">{isAr ? "المبلغ" : "Amount"}</TableHead>
              <TableHead>{isAr ? "التاريخ والطريقة" : "Date & Method"}</TableHead>
              <TableHead className="text-center">{isAr ? "الإيصال" : "Receipt"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد عمليات مساهمة مسجلة في هذا التبويب" : "No contributions found"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="text-xs hover:bg-muted/30">
                  <TableCell>
                    <span className="font-semibold text-foreground block">{c.contributor_name}</span>
                    {c.phone && <span className="text-[10px] text-muted-foreground font-mono">{c.phone}</span>}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{c.purpose || (isAr ? "اشتراك عام" : "General")}</span>
                    {c.reference && <span className="block text-[10px] text-muted-foreground font-mono">Ref: {c.reference}</span>}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-foreground">
                    {formatSar(c.amount)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-muted-foreground block">
                      {new Date(c.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{c.method}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {c.receipt_path ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1 text-primary hover:bg-primary/10"
                        onClick={() => handleOpenReceipt(c.receipt_path!)}
                        title={isAr ? "معاينة ملف الإيصال" : "Preview Receipt"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isAr ? "عرض" : "View"}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          className="h-7 text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30 px-2 font-medium"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              await onReviewContribution({
                                id: c.id,
                                status: "verified",
                                review_note: "تم الاعتماد السريع من كشف الخزينة",
                              });
                              toast.success(isAr ? `تم اعتماد مساهمة: ${c.contributor_name}` : `Verified contribution from ${c.contributor_name}`);
                            } catch (err: any) {
                              toast.error(err.message || (isAr ? "فشل الاعتماد" : "Failed to verify"));
                            } finally {
                              setLoading(false);
                            }
                          }}
                          title={isAr ? "اعتماد مباشر" : "Quick Verify"}
                        >
                          <Check className="w-3 h-3 me-1" />
                          {isAr ? "اعتماد" : "Verify"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => {
                          setSelectedContribution(c);
                          setReviewNote(c.review_note ?? "");
                        }}
                      >
                        {isAr ? "تدقيق" : "Details"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      {selectedContribution && (
        <Dialog open={!!selectedContribution} onOpenChange={() => setSelectedContribution(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                {isAr ? "مراجعة واعتماد إيصال المساهمة" : "Review Contribution Entry"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">{selectedContribution.contributor_name}</span>
                  <span className="text-lg font-bold font-mono text-primary">{formatSar(selectedContribution.amount)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <span>{isAr ? "الغرض:" : "Purpose:"} {selectedContribution.purpose || "اشتراك عام"}</span>
                  <span>{isAr ? "طريقة التحويل:" : "Method:"} {selectedContribution.method}</span>
                </div>
                {selectedContribution.receipt_path && (
                  <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                    <span className="text-muted-foreground text-[11px]">{isAr ? "مستند الإيصال المرفق:" : "Attached Receipt:"}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleOpenReceipt(selectedContribution.receipt_path!)}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {isAr ? "فتح الإيصال في نافذة جديدة" : "Open Receipt"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">{isAr ? "ملاحظة أمانة الخزينة" : "Treasury Note"}</label>
                <Textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={isAr ? "اكتب ملاحظة أو مرجع القيد في الكشف البنكي..." : "Review notes..."}
                />
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => handleReviewSubmit("rejected")}
                className="gap-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
                {isAr ? "رفض الإيصال" : "Reject"}
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedContribution(null)}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleReviewSubmit("verified")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isAr ? "اعتماد الإيداع" : "Verify Contribution"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
