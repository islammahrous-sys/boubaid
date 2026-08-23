import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { Landmark, FileText, CheckCircle2, XCircle, ExternalLink, Loader2, ArrowLeft, ArrowRight, AlertCircle, TrendingUp, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTreasuryContributionsPaginated } from "@/lib/admin-hub.functions";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";
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
  verifiedTotal,
  pendingTotal,
  pendingCount,
  verifiedCount,
  rejectedCount,
  totalCount,
  onReviewContribution,
}: {
  verifiedTotal: number;
  pendingTotal: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  totalCount: number;
  onReviewContribution: (data: TreasuryContributionReviewInput) => Promise<void>;
}) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContribution, setSelectedContribution] = useState<ContributionItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  
  const fetchTreasuryPage = useServerFn(getTreasuryContributionsPaginated);
  
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["treasury-paginated", currentPage, pageSize, statusFilter],
    queryFn: () => fetchTreasuryPage({
      data: {
        page: currentPage,
        pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
      }
    }),
    staleTime: 1000 * 60,
  });

  const filtered = queryData?.data ?? [];


  const getStatusDisplay = (st: ContributionItem["status"]) => {
    switch (st) {
      case "verified":
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isAr ? "معتمدة" : "Verified"}
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {isAr ? "قيد المراجعة" : "Pending"}
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 text-destructive font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            {isAr ? "مرفوضة" : "Rejected"}
          </span>
        );
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

    if (status === "rejected") {
      const ok = await confirm({
        title: isAr
          ? `رفض مساهمة ${selectedContribution.contributor_name}؟`
          : `Reject contribution from ${selectedContribution.contributor_name}?`,
        description: isAr
          ? "سيتم تسجيل المعاملة كمرفوضة، ويمكن للمساهم إعادة تقديمها لاحقاً."
          : "The transaction will be rejected, and the contributor can resubmit later.",
        tone: "destructive",
      });
      if (!ok) return;
    }

    try {
      setLoading(true);
      await onReviewContribution({
        id: selectedContribution.id,
        status,
        review_note: reviewNote,
      });
      setSelectedContribution(null);
      toast.success(isAr ? `تم تحديث المعاملة بنجاح` : `Transaction updated successfully`);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ أثناء الحفظ" : "Failed to update"));
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
        toast.error(isAr ? "تعذر فتح الإيصال" : "Could not open receipt");
      }
    } catch (err) {
      toast.error(isAr ? "تعذر فتح الإيصال" : "Could not open receipt");
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* 1. Page Context / Welcome Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isAr ? "سجل الخزينة والمساهمات" : "Treasury & Contributions Ledger"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? "مراجعة وإدارة المساهمات والمعاملات المالية" : "Review and manage financial contributions and transactions"}
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">
              {isAr ? `لديك ${pendingCount} عناصر تتطلب انتباهك` : `You have ${pendingCount} items requiring attention`}
            </span>
          </div>
        )}
      </div>

      {/* 2. Needs Your Attention / Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cn(
          "p-5 rounded-2xl border bg-card relative overflow-hidden group transition-all",
          pendingCount > 0 ? "border-amber-500/30 shadow-sm" : "border-border"
        )}>
          {pendingCount > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", pendingCount > 0 ? "bg-amber-500 animate-pulse" : "bg-muted-foreground")} />
              {isAr ? "تحتاج إلى انتباهك (قيد المراجعة)" : "Needs Attention (Pending)"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">{pendingCount} <span className="text-sm font-normal text-muted-foreground">{isAr ? "معاملة" : "transactions"}</span></span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-1 block">{formatSar(pendingTotal)}</span>
            </div>
            <button 
              onClick={() => setStatusFilter("pending")}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all w-fit"
            >
              {isAr ? "مراجعة الآن" : "Review Now"} {dir === "rtl" ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {isAr ? "المعاملات المعتمدة" : "Verified Transactions"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">{verifiedCount} <span className="text-sm font-normal text-muted-foreground">{isAr ? "معاملة" : "transactions"}</span></span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">{formatSar(verifiedTotal)}</span>
            </div>
            <button 
              onClick={() => setStatusFilter("verified")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "عرض المعاملات" : "View Transactions"} {dir === "rtl" ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {isAr ? "إجمالي العمليات المسجلة" : "Total Operations"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">{totalCount} <span className="text-sm font-normal text-muted-foreground">{isAr ? "عملية" : "operations"}</span></span>
            </div>
            <button 
              onClick={() => setStatusFilter("all")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "عرض الكل" : "View All"} {dir === "rtl" ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Work Queue / Filters */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="border-b border-border p-2 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-4 text-sm font-medium overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setStatusFilter("all")}
              className={cn("py-2.5 px-1 relative whitespace-nowrap transition-colors", statusFilter === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {isAr ? "الكل" : "All"} <span className="text-[10px] font-mono opacity-60 ml-1">({totalCount})</span>
              {statusFilter === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setStatusFilter("pending")}
              className={cn("py-2.5 px-1 relative whitespace-nowrap transition-colors", statusFilter === "pending" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground")}
            >
              {isAr ? "قيد المراجعة" : "Pending"} <span className="text-[10px] font-mono opacity-60 ml-1">({pendingCount})</span>
              {statusFilter === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setStatusFilter("verified")}
              className={cn("py-2.5 px-1 relative whitespace-nowrap transition-colors", statusFilter === "verified" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {isAr ? "معتمدة" : "Verified"} <span className="text-[10px] font-mono opacity-60 ml-1">({verifiedCount})</span>
              {statusFilter === "verified" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setStatusFilter("rejected")}
              className={cn("py-2.5 px-1 relative whitespace-nowrap transition-colors", statusFilter === "rejected" ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {isAr ? "مرفوضة" : "Rejected"} <span className="text-[10px] font-mono opacity-60 ml-1">({rejectedCount})</span>
              {statusFilter === "rejected" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          </div>
        </div>

        {/* 4. Streamlined Main Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold">{isAr ? "المعاملة" : "Transaction"}</TableHead>
              <TableHead className="font-semibold text-start">{isAr ? "المبلغ" : "Amount"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "التاريخ" : "Date"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="font-semibold text-end">{isAr ? "الإجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  جاري تحميل البيانات...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Landmark className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">{isAr ? "لا توجد معاملات في هذه القائمة" : "No transactions found"}</p>
                    <p className="text-xs opacity-70 mt-1">{isAr ? "ستظهر المعاملات الجديدة هنا فور تسجيلها." : "New transactions will appear here."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="group cursor-pointer hover:bg-muted/30" onClick={() => { setSelectedContribution(c); setReviewNote(c.review_note ?? ""); }}>
                  <TableCell>
                    <div className="font-bold text-foreground">{c.contributor_name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{c.purpose || (isAr ? "اشتراك عام" : "General")}</div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-foreground text-start">
                    {formatSar(c.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{new Date(c.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(c.created_at).getFullYear()}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusDisplay(c.status)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs font-bold transition-all text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContribution(c);
                        setReviewNote(c.review_note ?? "");
                      }}
                    >
                      {c.status === "pending" ? (isAr ? "مراجعة" : "Review") : (isAr ? "عرض التفاصيل" : "View Details")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 5. Contextual Side Drawer for Details */}
      <Sheet open={!!selectedContribution} onOpenChange={(open) => !open && setSelectedContribution(null)}>
        <SheetContent side={isAr ? "left" : "right"} className="w-full sm:max-w-md p-0 flex flex-col border-border gap-0">
          {selectedContribution && (
            <>
              <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div>
                  <SheetTitle className="text-lg font-bold">{isAr ? "تفاصيل المعاملة" : "Transaction Details"}</SheetTitle>
                  <SheetDescription className="text-xs font-mono mt-1">Ref: {selectedContribution.reference || selectedContribution.id.split("-")[0]}</SheetDescription>
                </div>
                {getStatusDisplay(selectedContribution.status)}
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="col-span-2 bg-muted/20 p-4 rounded-xl border border-border">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">{isAr ? "المساهم" : "Contributor"}</span>
                    <span className="text-base font-bold text-foreground block">{selectedContribution.contributor_name}</span>
                    {selectedContribution.phone && <span className="text-xs font-mono text-muted-foreground mt-1 block">{selectedContribution.phone}</span>}
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">{isAr ? "المبلغ" : "Amount"}</span>
                    <span className="text-2xl font-black font-mono text-foreground block">{formatSar(selectedContribution.amount)}</span>
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">{isAr ? "التاريخ" : "Date"}</span>
                    <span className="text-sm font-medium text-foreground block">
                      {new Date(selectedContribution.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">{isAr ? "وسيلة الدفع" : "Method"}</span>
                    <span className="text-sm font-medium text-foreground block">{selectedContribution.method}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">{isAr ? "الغرض" : "Purpose"}</span>
                    <span className="text-sm font-medium text-foreground block">{selectedContribution.purpose || (isAr ? "اشتراك عام" : "General")}</span>
                  </div>
                </div>

                {/* Receipt Section */}
                <div className="border border-border rounded-xl p-4 bg-muted/10">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {isAr ? "المستند المرفق (الإيصال)" : "Attached Receipt"}
                  </span>
                  {selectedContribution.receipt_path ? (
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 rounded-lg bg-background"
                      onClick={() => handleOpenReceipt(selectedContribution.receipt_path!)}
                    >
                      <span className="text-xs">{isAr ? "عرض صورة الإيصال" : "View Receipt Image"}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  ) : (
                    <div className="h-12 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg bg-background/50">
                      {isAr ? "لا يوجد إيصال مرفق" : "No receipt attached"}
                    </div>
                  )}
                </div>

                {/* Treasury Note */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">{isAr ? "ملاحظة الخزينة (اختياري)" : "Treasury Note (Optional)"}</label>
                  <Textarea
                    rows={4}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder={isAr ? "اكتب مرجع التحويل أو أي ملاحظات للتوثيق..." : "Add reference or notes..."}
                    className="resize-none rounded-xl bg-background"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
                {selectedContribution.status !== "verified" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleReviewSubmit("rejected")}
                      className="flex-1 h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent hover:border-destructive/20 font-bold"
                    >
                      {isAr ? "رفض" : "Reject"}
                    </Button>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={() => handleReviewSubmit("verified")}
                      className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isAr ? "اعتماد المعاملة" : "Approve"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" className="w-full h-11 rounded-xl font-bold" onClick={() => setSelectedContribution(null)}>
                    {isAr ? "إغلاق" : "Close"}
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
