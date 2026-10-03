import { formatDualDate, formatDualDateTime, formatDualYear } from "@/lib/dates";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Activity,
  Loader2,
  Trash2,
  XCircle,
  Paperclip,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInquiriesPaginated, getRequestAttachmentSignedUrl } from "@/lib/admin-hub.functions";
import { cn } from "@/lib/utils";
import { COMMITTEE_REQUEST_DESTINATIONS } from "@/lib/council-requests";

type RequestAttachment = {
  path: string;
  name?: string;
  type?: string;
  size?: number;
};

type RequestMetadata = {
  reference?: string;
  committee_slug?: string;
  committee_name_ar?: string;
  committee_name_en?: string;
  user_id?: string | null;
  request_type?: string;
  topic?: string;
  request_title_ar?: string;
  request_title_en?: string;
  attachments?: (string | RequestAttachment)[];
  attachments_count?: number;
  [key: string]: any;
};

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  assigned_to?: string | null;
  source: string;
  created_at: string;
  source_table: "inquiries" | "contact_messages";
  request_metadata?: RequestMetadata | null;
};

export type InquiryNoteRow = {
  id: string;
  inquiry_id: string;
  author_id?: string | null;
  note: string;
  created_at: string;
};

export function InquiriesManager({
  notes,
  newCount,
  inProgressCount,
  resolvedCount,
  totalCount,
  onUpdateStatus,
  onAddNote,
  onDelete,
}: {
  notes: InquiryNoteRow[];
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  totalCount: number;
  onUpdateStatus: (
    id: string,
    status:
      | "new"
      | "open"
      | "in_progress"
      | "approved"
      | "rejected"
      | "resolved"
      | "spam"
      | "read"
      | "archived",
    sourceTable: "inquiries" | "contact_messages",
    reviewNote?: string,
  ) => Promise<void>;
  onAddNote: (inquiryId: string, note: string) => Promise<void>;
  onDelete: (id: string, sourceTable: "inquiries" | "contact_messages") => Promise<void>;
}) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [statusFilter, setStatusFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRow | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const [openingAttachment, setOpeningAttachment] = useState<string | null>(null);
  const [decisionMode, setDecisionMode] = useState<"approve" | "reject" | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const getAttachmentSignedUrlFn = useServerFn(getRequestAttachmentSignedUrl);

  const handleOpenAttachment = async (rawPath: string) => {
    // The server resolves the bucket from the stored "<bucket>/<path>" prefix.
    const cleanPath = rawPath.split(" — ")[0].trim();
    setOpeningAttachment(rawPath);
    try {
      const res = await getAttachmentSignedUrlFn({ data: { path: cleanPath } });
      if (res.ok && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(isAr ? "تعذر فتح المرفق أو انتهت صلاحية الرابط" : "Failed to load attachment");
      }
    } catch {
      toast.error(isAr ? "تعذر فتح المرفق" : "Failed to open attachment");
    } finally {
      setOpeningAttachment(null);
    }
  };

  const handleExecuteDecision = async () => {
    if (!selectedInquiry || !decisionMode) return;
    setIsSubmittingDecision(true);
    const targetStatus = decisionMode === "approve" ? "approved" : "rejected";
    try {
      await onUpdateStatus(
        selectedInquiry.id,
        targetStatus,
        selectedInquiry.source_table,
        decisionNote.trim() || undefined,
      );
      setSelectedInquiry((prev) => (prev ? { ...prev, status: targetStatus } : null));
      setDecisionMode(null);
      setDecisionNote("");
      toast.success(
        targetStatus === "approved"
          ? isAr
            ? "تم اعتماد الطلب بنجاح وإرسال إشعار للمستفيد"
            : "Request approved successfully"
          : isAr
            ? "تم تسجيل الاعتذار وإرسال إشعار للمستفيد"
            : "Request declined and notification sent",
      );
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء تحديث حالة الطلب" : "Error updating request status");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const fetchInquiriesPage = useServerFn(getInquiriesPaginated);

  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "inquiries-paginated",
      currentPage,
      pageSize,
      statusFilter,
      committeeFilter,
      searchTerm,
    ],
    queryFn: () =>
      fetchInquiriesPage({
        data: {
          page: currentPage,
          pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          committeeSlug: committeeFilter === "all" ? undefined : committeeFilter,
          search: searchTerm || undefined,
        },
      }),
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });

  const filteredInquiries = (queryData?.data ?? []) as InquiryRow[];

  const getStatusDisplay = (st: string) => {
    switch (st) {
      case "new":
        return (
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {isAr ? "جديدة" : "New"}
          </span>
        );
      case "open":
      case "in_progress":
        return (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {isAr ? "قيد المتابعة" : "In Progress"}
          </span>
        );
      case "read":
        return (
          <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {isAr ? "مقروءة" : "Read"}
          </span>
        );
      case "resolved":
      case "archived":
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isAr ? "تم الرد" : "Resolved"}
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? "معتمد ومقبول" : "Approved"}
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium text-xs">
            <XCircle className="w-3.5 h-3.5" />
            {isAr ? "معتذر عنه / مرفوض" : "Declined"}
          </span>
        );
      case "spam":
        return (
          <span className="flex items-center gap-1.5 text-destructive font-medium text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            {isAr ? "مزعجة" : "Spam"}
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{st}</span>;
    }
  };

  const currentNotes = selectedInquiry
    ? notes.filter((n) => n.inquiry_id === selectedInquiry.id)
    : [];

  const getCommitteeLabel = (inquiry: InquiryRow | null) => {
    const metadata = inquiry?.request_metadata;
    if (!metadata || typeof metadata !== "object") return "";
    const direct = isAr ? metadata.committee_name_ar : metadata.committee_name_en;
    if (direct) return direct;
    const fallback = COMMITTEE_REQUEST_DESTINATIONS.find((c) => c.slug === metadata.committee_slug);
    return fallback ? (isAr ? fallback.name.ar : fallback.name.en) : "";
  };

  const handleAddNoteSubmit = async () => {
    if (!selectedInquiry || !newNote.trim()) return;
    try {
      setSubmittingNote(true);
      await onAddNote(selectedInquiry.id, newNote.trim());
      setNewNote("");
      toast.success(isAr ? "تمت إضافة الملاحظة" : "Note added");
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* 1. Page Context / Welcome Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isAr ? "مركز الاستفسارات والدعم" : "Inquiries & Support Center"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "إدارة رسائل التواصل واستفسارات العائلة"
              : "Manage contact messages and family inquiries"}
          </p>
        </div>
        {newCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">
              {isAr ? `لديك ${newCount} تذاكر جديدة` : `You have ${newCount} new tickets`}
            </span>
          </div>
        )}
      </div>

      {/* 2. Needs Your Attention / Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={cn(
            "p-5 rounded-2xl border bg-card relative overflow-hidden group transition-all",
            newCount > 0 ? "border-blue-500/30 shadow-sm" : "border-border",
          )}
        >
          {newCount > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          )}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  newCount > 0 ? "bg-blue-500 animate-pulse" : "bg-muted-foreground",
                )}
              />
              {isAr ? "تذاكر جديدة (غير مقروءة)" : "New Tickets (Unread)"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {newCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "تذكرة" : "tickets"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("new")}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all w-fit"
            >
              {isAr ? "الرد الآن" : "Reply Now"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              {isAr ? "تذاكر قيد المتابعة" : "Tickets In Progress"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {inProgressCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "تذكرة" : "tickets"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "متابعة العمل" : "Continue Work"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {isAr ? "التذاكر المغلقة" : "Resolved Tickets"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {resolvedCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "تذكرة" : "tickets"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("resolved")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "عرض الأرشيف" : "View Archive"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Work Queue / Filters */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="border-b border-border p-2 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-4 text-sm font-medium overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("all");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "all"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "الكل" : "All"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({totalCount})</span>
              {statusFilter === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("new");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "new"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "جديدة" : "New"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({newCount})</span>
              {statusFilter === "new" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("in_progress");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "in_progress"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "قيد المتابعة" : "In Progress"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({inProgressCount})</span>
              {statusFilter === "in_progress" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("approved");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "approved"
                  ? "text-emerald-600 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "معتمدة ومقبولة" : "Approved"}
              {statusFilter === "approved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("rejected");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "rejected"
                  ? "text-red-600 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "معتذر عنها" : "Declined"}
              {statusFilter === "rejected" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => {
                setCurrentPage(1);
                setStatusFilter("resolved");
              }}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "resolved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "مغلقة / منجزة" : "Resolved"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({resolvedCount})</span>
              {statusFilter === "resolved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[26rem] sm:flex-row">
            <Input
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder={
                isAr ? "بحث بالاسم أو الموضوع أو اللجنة" : "Search name, subject, or committee"
              }
              className="h-9 text-xs"
            />
            <Select
              value={committeeFilter}
              onValueChange={(value) => {
                setCurrentPage(1);
                setCommitteeFilter(value);
              }}
            >
              <SelectTrigger className="h-9 text-xs sm:w-[14rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  {isAr ? "كل اللجان" : "All committees"}
                </SelectItem>
                {COMMITTEE_REQUEST_DESTINATIONS.map((committee) => (
                  <SelectItem key={committee.slug} value={committee.slug} className="text-xs">
                    {isAr ? committee.name.ar : committee.name.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. Streamlined Main Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold">{isAr ? "المرسل" : "Sender"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الموضوع" : "Subject"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "التاريخ" : "Date"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="font-semibold text-end">
                {isAr ? "الإجراء" : "Action"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  جاري تحميل البيانات...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {isAr ? "لا توجد رسائل في هذه القائمة" : "No messages found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inq) => {
                const committeeLabel = getCommitteeLabel(inq);
                return (
                  <TableRow
                    key={inq.id}
                    className="group cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    <TableCell>
                      <div className="font-bold text-foreground">{inq.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        {inq.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="font-medium text-foreground truncate">
                        {inq.subject || (isAr ? "استفسار عام" : "General Inquiry")}
                      </div>
                      {committeeLabel ? (
                        <Badge variant="outline" className="mt-1 max-w-full truncate text-[10px]">
                          {committeeLabel}
                        </Badge>
                      ) : null}
                      <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {inq.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatDualDate(inq.created_at, isAr ? "ar" : "en", "short")}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDualYear(new Date(inq.created_at).getFullYear(), isAr ? "ar" : "en")}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusDisplay(inq.status)}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold transition-all text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inq);
                        }}
                      >
                        {inq.status === "new"
                          ? isAr
                            ? "الرد"
                            : "Reply"
                          : isAr
                            ? "عرض التفاصيل"
                            : "View Details"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 5. Contextual Side Drawer for Details */}
      <Sheet open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <SheetContent
          side={isAr ? "left" : "right"}
          className="w-full sm:max-w-md p-0 flex flex-col border-border gap-0 bg-background"
        >
          {selectedInquiry && (
            <>
              <div className="px-6 py-5 border-b border-border bg-muted/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-lg font-bold">
                      {selectedInquiry.subject || (isAr ? "تذكرة دعم فني" : "Support Ticket")}
                    </SheetTitle>
                    <SheetDescription className="text-xs font-mono mt-1">
                      Ref: {selectedInquiry.id.split("-")[0]}
                    </SheetDescription>
                  </div>
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={async (val: any) => {
                      await onUpdateStatus(selectedInquiry.id, val, selectedInquiry.source_table);
                      setSelectedInquiry((prev) => (prev ? { ...prev, status: val } : null));
                      toast.success(isAr ? "تم تحديث الحالة" : "Status updated");
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-[130px] bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedInquiry.source_table === "contact_messages" ? (
                        <>
                          <SelectItem value="new" className="text-xs">
                            {isAr ? "جديدة" : "New"}
                          </SelectItem>
                          <SelectItem value="read" className="text-xs">
                            {isAr ? "مقروءة" : "Read"}
                          </SelectItem>
                          <SelectItem value="archived" className="text-xs">
                            {isAr ? "مؤرشفة" : "Archived"}
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="new" className="text-xs">
                            {isAr ? "جديدة" : "New"}
                          </SelectItem>
                          <SelectItem value="open" className="text-xs">
                            {isAr ? "مفتوحة" : "Open"}
                          </SelectItem>
                          <SelectItem value="in_progress" className="text-xs">
                            {isAr ? "قيد المتابعة" : "In Progress"}
                          </SelectItem>
                          <SelectItem
                            value="approved"
                            className="text-xs font-semibold text-emerald-600"
                          >
                            {isAr ? "معتمد ومقبول" : "Approved"}
                          </SelectItem>
                          <SelectItem
                            value="rejected"
                            className="text-xs font-semibold text-red-600"
                          >
                            {isAr ? "معتذر عنه / مرفوض" : "Declined"}
                          </SelectItem>
                          <SelectItem value="resolved" className="text-xs">
                            {isAr ? "تم الرد والإنهاء" : "Resolved"}
                          </SelectItem>
                          <SelectItem value="spam" className="text-xs">
                            {isAr ? "مزعجة" : "Spam"}
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Info */}
                <div className="bg-muted/20 p-4 rounded-xl border border-border">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">
                    {isAr ? "المرسل" : "Sender"}
                  </span>
                  <span className="text-base font-bold text-foreground block">
                    {selectedInquiry.name}
                  </span>
                  <div className="mt-3 flex flex-col gap-2">
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" /> {selectedInquiry.email}
                    </a>
                    {selectedInquiry.phone && (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> {selectedInquiry.phone}
                      </a>
                    )}
                  </div>
                </div>

                {getCommitteeLabel(selectedInquiry) ? (
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">
                      {isAr ? "اللجنة المختصة" : "Destination Committee"}
                    </span>
                    <span className="text-sm font-bold text-foreground block">
                      {getCommitteeLabel(selectedInquiry)}
                    </span>
                    {selectedInquiry.request_metadata?.reference ? (
                      <span className="mt-2 block font-mono text-[11px] text-muted-foreground">
                        {selectedInquiry.request_metadata.reference}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {/* Message / request body */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">
                    {selectedInquiry.source_table === "inquiries"
                      ? isAr
                        ? "تفاصيل الطلب"
                        : "Request Details"
                      : isAr
                        ? "نص الرسالة"
                        : "Message Body"}
                  </span>
                  <div className="p-4 bg-card border border-border rounded-xl">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedInquiry.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2 block font-mono">
                    {formatDualDateTime(selectedInquiry.created_at, isAr ? "ar" : "en")}
                  </span>
                </div>

                {/* Official Attachments */}
                {selectedInquiry.request_metadata?.attachments &&
                  Array.isArray(selectedInquiry.request_metadata.attachments) &&
                  selectedInquiry.request_metadata.attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        {isAr ? "المرفقات والوثائق الداعمة للطلب" : "Official Attachments"}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          ({selectedInquiry.request_metadata.attachments.length})
                        </span>
                      </span>
                      <div className="space-y-2">
                        {selectedInquiry.request_metadata.attachments.map((att, idx) => {
                          const rawStr = typeof att === "string" ? att : att.path;
                          const displayName =
                            typeof att === "string"
                              ? att.split(" — ")[1] ||
                                att.split("/").pop() ||
                                (isAr ? `مرفق ${idx + 1}` : `Attachment ${idx + 1}`)
                              : att.name || (isAr ? `مرفق ${idx + 1}` : `Attachment ${idx + 1}`);
                          const isOpening = openingAttachment === rawStr;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/60 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pe-2">
                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                <span className="font-medium text-foreground truncate block">
                                  {displayName}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isOpening}
                                onClick={() => handleOpenAttachment(rawStr)}
                                className="h-7 text-[11px] gap-1 shrink-0 font-bold"
                              >
                                {isOpening ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ExternalLink className="w-3 h-3" />
                                )}
                                {isAr ? "عرض المرفق" : "View"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Decision / Approval Workflow Section */}
                {selectedInquiry.source_table === "inquiries" && (
                  <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        {isAr ? "مسار الاعتماد والقرار" : "Approval Decision Pipeline"}
                      </span>
                      {getStatusDisplay(selectedInquiry.status)}
                    </div>

                    {decisionMode ? (
                      <div className="space-y-3 pt-2">
                        <div
                          className={cn(
                            "p-3 rounded-lg border text-xs leading-relaxed",
                            decisionMode === "approve"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                              : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300",
                          )}
                        >
                          <span className="font-bold block mb-1">
                            {decisionMode === "approve"
                              ? isAr
                                ? "تأكيد اعتماد وقبول الطلب"
                                : "Confirm Request Approval"
                              : isAr
                                ? "تأكيد الاعتذار عن قبول الطلب"
                                : "Confirm Request Decline"}
                          </span>
                          <p className="text-[11px] opacity-90">
                            {decisionMode === "approve"
                              ? isAr
                                ? "سيتم اعتماد الطلب رسمياً وإرسال إشعار بريدي فوري للمستفيد. يمكنك كتابة توجيه أو ملاحظة:"
                                : "The request will be approved and the applicant notified. Optional note:"
                              : isAr
                                ? "سيتم تسجيل الاعتذار وإرسال إشعار بريدي للمستفيد. يرجى توضيح سبب الاعتذار:"
                                : "The request will be declined and the applicant notified. Please state reason:"}
                          </p>
                        </div>

                        <Textarea
                          rows={2}
                          value={decisionNote}
                          onChange={(e) => setDecisionNote(e.target.value)}
                          placeholder={
                            decisionMode === "approve"
                              ? isAr
                                ? "ملاحظة أو توجيه إداري (اختياري)..."
                                : "Optional review note..."
                              : isAr
                                ? "سبب الاعتذار للمستفيد..."
                                : "Reason for decline..."
                          }
                          className="text-xs resize-none bg-background rounded-lg"
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isSubmittingDecision}
                            onClick={handleExecuteDecision}
                            className={cn(
                              "text-xs font-bold flex-1 h-8 text-white",
                              decisionMode === "approve"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-red-600 hover:bg-red-700",
                            )}
                          >
                            {isSubmittingDecision ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
                            ) : decisionMode === "approve" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 me-1.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 me-1.5" />
                            )}
                            {decisionMode === "approve"
                              ? isAr
                                ? "تأكيد الاعتماد والإشعار"
                                : "Confirm Approval"
                              : isAr
                                ? "تأكيد الاعتذار والإشعار"
                                : "Confirm Decline"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isSubmittingDecision}
                            onClick={() => {
                              setDecisionMode(null);
                              setDecisionNote("");
                            }}
                            className="text-xs h-8"
                          >
                            {isAr ? "إلغاء" : "Cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 space-y-2">
                        {selectedInquiry.status !== "approved" &&
                        selectedInquiry.status !== "rejected" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setDecisionMode("approve");
                                setDecisionNote("");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isAr ? "اعتماد الطلب" : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDecisionMode("reject");
                                setDecisionNote("");
                              }}
                              className="border-red-500/30 text-red-600 hover:bg-red-500/10 font-bold text-xs h-9 gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              {isAr ? "اعتذار / رفض" : "Decline"}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background text-xs">
                            <span className="text-muted-foreground text-[11px]">
                              {selectedInquiry.status === "approved"
                                ? isAr
                                  ? "تم اعتماد الطلب رسمياً"
                                  : "Request is officially approved"
                                : isAr
                                  ? "تم الاعتذار عن هذا الطلب"
                                  : "Request has been declined"}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[11px] font-bold text-primary"
                              onClick={() => {
                                setDecisionMode(
                                  selectedInquiry.status === "approved" ? "reject" : "approve",
                                );
                              }}
                            >
                              {selectedInquiry.status === "approved"
                                ? isAr
                                  ? "تغيير للاعتذار"
                                  : "Change to Decline"
                                : isAr
                                  ? "تغيير للاعتماد"
                                  : "Change to Approve"}
                            </Button>
                          </div>
                        )}

                        {selectedInquiry.status === "new" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full text-xs h-8 font-medium gap-1.5"
                            onClick={async () => {
                              await onUpdateStatus(
                                selectedInquiry.id,
                                "in_progress",
                                selectedInquiry.source_table,
                              );
                              setSelectedInquiry((prev) =>
                                prev ? { ...prev, status: "in_progress" } : null,
                              );
                              toast.success(
                                isAr ? "تم نقل الطلب إلى قيد المراجعة" : "Moved to In Progress",
                              );
                            }}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {isAr ? "نقل إلى قيد المراجعة والدراسة" : "Move to In Progress"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Notes Section */}
                {selectedInquiry.source_table === "inquiries" ? (
                  <div className="space-y-3 pt-6 border-t border-border">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {isAr ? "ملاحظات الدعم الفني الداخلية" : "Internal Support Notes"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {isAr
                        ? "هذه الملاحظات خاصة بفريق الإدارة ولا تظهر للمستخدم."
                        : "These notes are internal and invisible to the user."}
                    </p>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {currentNotes.length === 0 ? (
                        <div className="h-16 flex items-center justify-center border border-dashed border-border rounded-xl bg-muted/10">
                          <p className="text-[11px] text-muted-foreground">
                            {isAr ? "لا توجد ملاحظات داخلية" : "No internal notes yet"}
                          </p>
                        </div>
                      ) : (
                        currentNotes.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs relative"
                          >
                            <p className="text-foreground leading-relaxed">{n.note}</p>
                            <span className="text-[9px] text-muted-foreground mt-2 block font-mono">
                              {formatDualDateTime(n.created_at, isAr ? "ar" : "en")}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Textarea
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder={
                          isAr
                            ? "أضف ملاحظة أو تحديث حول هذه التذكرة..."
                            : "Add an internal update..."
                        }
                        className="text-xs resize-none rounded-xl bg-background"
                      />
                      <Button
                        size="sm"
                        disabled={submittingNote || !newNote.trim()}
                        onClick={handleAddNoteSubmit}
                        className="w-full text-xs font-bold rounded-xl h-9"
                      >
                        {submittingNote ? (
                          <Loader2 className="w-3 h-3 animate-spin me-2" />
                        ) : (
                          <Send className="w-3 h-3 me-2" />
                        )}
                        {isAr ? "إضافة ملاحظة" : "Add Note"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-border">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                        {isAr
                          ? "هذه الرسالة قادمة من نموذج التواصل العام في الموقع. الملاحظات الداخلية غير مدعومة لهذا النوع من الرسائل."
                          : "This message is from the public contact form. Internal notes are not supported."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
                    onClick={async () => {
                      if (
                        !(await confirm({
                          title: isAr
                            ? "حذف هذه الرسالة نهائيًا؟"
                            : "Delete this message permanently?",
                          description: isAr
                            ? "سيتم حذف الرسالة وأي ملاحظات داخلية مرتبطة بها ولا يمكن التراجع. للاحتفاظ بها بعيدًا عن الوارد استخدم حالة «مؤرشف» بدلًا من ذلك."
                            : "The message and any internal notes are removed for good. To keep it out of the inbox without deleting, set its status to “archived” instead.",
                          tone: "destructive",
                        }))
                      )
                        return;
                      const target = selectedInquiry;
                      setSelectedInquiry(null);
                      await onDelete(target.id, target.source_table);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isAr ? "حذف الرسالة نهائيًا" : "Delete message permanently"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
