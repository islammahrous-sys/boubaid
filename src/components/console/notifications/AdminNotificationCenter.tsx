import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Monitor,
  FileText,
  Code2,
  Filter,
  Check,
  XCircle,
  Inbox,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getEmailStats,
  getEmailLogsPaginated,
  getEmailLogById,
  retryEmailAction,
  getTemplatesCatalog,
  previewTemplateAction,
  sendTestEmailAction,
} from "@/lib/email/admin-email.functions";
import type {
  EmailCategory,
  EmailLanguage,
  EmailLogRecord,
  EmailPriority,
  EmailTemplateKey,
} from "@/lib/email/email-types";
import { EMAIL_TEMPLATES_REGISTRY } from "@/lib/email/email-templates";

export function AdminNotificationCenter() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const queryClient = useQueryClient();

  // Active sub-tab in notification center
  const [subTab, setSubTab] = useState<"logs" | "templates" | "test_sender">("logs");

  // Filters for delivery logs
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Template catalog filters
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");

  // Inspection modal state
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewSubTab, setPreviewSubTab] = useState<"visual" | "text" | "payload">("visual");

  // Template preview modal state
  const [previewTemplateKey, setPreviewTemplateKey] = useState<string | null>(null);
  const [previewTemplateLang, setPreviewTemplateLang] = useState<EmailLanguage>("ar");

  // Test sender state
  const [testTemplateKey, setTestTemplateKey] = useState<string>("auth_welcome");
  const [testRecipientEmail, setTestRecipientEmail] = useState("");
  const [testLanguage, setTestLanguage] = useState<EmailLanguage>("ar");

  // Server functions
  const fetchStats = useServerFn(getEmailStats);
  const fetchLogs = useServerFn(getEmailLogsPaginated);
  const fetchLogDetails = useServerFn(getEmailLogById);
  const retryEmail = useServerFn(retryEmailAction);
  const fetchTemplates = useServerFn(getTemplatesCatalog);
  const previewTemplate = useServerFn(previewTemplateAction);
  const sendTestEmail = useServerFn(sendTestEmailAction);

  // Queries
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery<any>({
    queryKey: ["admin-email-stats"],
    queryFn: async () => await fetchStats(),
    refetchInterval: 30000,
  });

  const {
    data: logsData,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery<{
    data: EmailLogRecord[];
    count: number;
    page: number;
    pageSize: number;
  }>({
    queryKey: [
      "admin-email-logs",
      page,
      pageSize,
      search,
      statusFilter,
      priorityFilter,
      categoryFilter,
    ],
    queryFn: async () =>
      (await fetchLogs({
        data: {
          page,
          pageSize,
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          priority: priorityFilter !== "all" ? priorityFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
        },
      })) as any,
  });

  const { data: templatesList, isLoading: templatesLoading } = useQuery<any[]>({
    queryKey: ["admin-email-templates"],
    queryFn: async () => (await fetchTemplates()) as any[],
  });

  const { data: inspectedLog, isLoading: inspectedLogLoading } = useQuery<EmailLogRecord | null>({
    queryKey: ["admin-email-log-detail", selectedLogId],
    queryFn: async () =>
      selectedLogId ? ((await fetchLogDetails({ data: { id: selectedLogId } })) as any) : null,
    enabled: !!selectedLogId,
  });

  const { data: templatePreviewData, isLoading: templatePreviewLoading } = useQuery<{
    subject: string;
    html: string;
    text: string;
    category: EmailCategory;
    priority: EmailPriority;
  } | null>({
    queryKey: ["admin-email-template-preview", previewTemplateKey, previewTemplateLang],
    queryFn: async () =>
      previewTemplateKey
        ? ((await previewTemplate({
            data: {
              templateKey: previewTemplateKey,
              language: previewTemplateLang,
            },
          })) as any)
        : null,
    enabled: !!previewTemplateKey,
  });

  // Mutations
  const retryMutation = useMutation({
    mutationFn: (id: string) => retryEmail({ data: { id } }),
    onSuccess: () => {
      toast.success(
        isAr ? "تمت جدولة إعادة إرسال البريد بنجاح" : "Email retry scheduled successfully",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin-email-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-email-stats"] });
      if (selectedLogId) {
        void queryClient.invalidateQueries({ queryKey: ["admin-email-log-detail", selectedLogId] });
      }
    },
    onError: (err: any) => {
      toast.error(
        isAr ? `فشلت إعادة الإرسال: ${err?.message || "خطأ"}` : `Retry failed: ${err?.message}`,
      );
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: (args: { templateKey: string; recipientEmail: string; language: EmailLanguage }) =>
      sendTestEmail({
        data: {
          templateKey: args.templateKey,
          recipientEmail: args.recipientEmail,
          language: args.language,
        },
      }),
    onSuccess: (res) => {
      toast.success(
        isAr
          ? "تم إرسال البريد التجريبي بنجاح عبر Resend"
          : "Diagnostic test email dispatched successfully via Resend",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin-email-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-email-stats"] });
      if (res.emailLogId) {
        setSelectedLogId(res.emailLogId);
      }
    },
    onError: (err: any) => {
      toast.error(
        isAr ? `تعذر إرسال البريد: ${err?.message || "خطأ"}` : `Send failed: ${err?.message}`,
      );
    },
  });

  const handleRefresh = () => {
    void refetchStats();
    void refetchLogs();
    toast.info(isAr ? "تم تحديث البيانات" : "Refreshed");
  };

  // Helper formatting badges
  const renderStatusBadge = (status: string): React.ReactNode => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {isAr ? "تم التسليم" : "Delivered"}
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1 font-medium">
            <Send className="w-3 h-3" />
            {isAr ? "تم الإرسال" : "Sent"}
          </Badge>
        );
      case "queued":
        return (
          <Badge className="bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1 font-medium">
            <Clock className="w-3 h-3" />
            {isAr ? "في الانتظار" : "Queued"}
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 gap-1 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            {isAr ? "قيد الإرسال" : "Processing"}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-600/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" />
            {isAr ? "تعذر الإرسال" : "Failed"}
          </Badge>
        );
      case "bounced":
        return (
          <Badge className="bg-red-600/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 gap-1 font-medium">
            <XCircle className="w-3 h-3" />
            {isAr ? "مرتد" : "Bounced"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: EmailPriority): React.ReactNode => {
    switch (priority) {
      case "CRITICAL":
        return (
          <Badge variant="destructive" className="font-mono text-[11px] px-1.5 py-0">
            CRITICAL
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-amber-500 text-white font-mono text-[11px] px-1.5 py-0">HIGH</Badge>
        );
      case "NORMAL":
        return (
          <Badge variant="secondary" className="font-mono text-[11px] px-1.5 py-0">
            NORMAL
          </Badge>
        );
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="font-mono text-[11px] px-1.5 py-0 text-muted-foreground"
          >
            LOW
          </Badge>
        );
    }
  };

  // Filter templates list
  const filteredTemplates = (templatesList || Object.values(EMAIL_TEMPLATES_REGISTRY)).filter(
    (t: any) => {
      const matchSearch =
        !templateSearch ||
        t.key.toLowerCase().includes(templateSearch.toLowerCase()) ||
        (t.name_ar && t.name_ar.includes(templateSearch)) ||
        (t.name_en && t.name_en.toLowerCase().includes(templateSearch.toLowerCase()));

      const matchCat = templateCategoryFilter === "all" || t.category === templateCategoryFilter;

      return matchSearch && matchCat;
    },
  );

  const totalPages = Math.ceil((logsData?.count ?? 0) / pageSize) || 1;

  const totalEnqueuedCount = stats?.total ?? stats?.total_emails ?? 0;
  const deliveredPercentage =
    totalEnqueuedCount > 0
      ? Math.round((((stats?.delivered ?? 0) + (stats?.sent ?? 0)) / totalEnqueuedCount) * 100)
      : 100;

  const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleString(isAr ? "ar-SA" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mail className="w-5 h-5 text-[#245B3F] dark:text-[#ECA654]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {isAr ? "مركز البريد والإشعارات المؤسسي" : "Enterprise Notification Center"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isAr
                  ? "إدارة الرسائل البريدية، التحقق من تسليم Resend، ومتابعة قوالب الإشعارات الـ 70 الرسمية"
                  : "Central email dispatch queue, Resend delivery audit, and 70 bilingual templates"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={statsLoading || logsLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${statsLoading || logsLoading ? "animate-spin" : ""}`}
            />
            {isAr ? "تحديث" : "Refresh"}
          </Button>

          <Button
            size="sm"
            onClick={() => setSubTab("test_sender")}
            className="gap-1.5 text-xs bg-[#245B3F] hover:bg-[#1b442f] text-white"
          >
            <Send className="w-3.5 h-3.5" />
            {isAr ? "فحص وإرسال تجريبي" : "Send Test Email"}
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-border/70 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {isAr ? "إجمالي الرسائل المسجلة" : "Total Enqueued"}
              </p>
              <Inbox className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {totalEnqueuedCount.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isAr
                  ? `(عاجل: ${stats?.critical_count ?? 0})`
                  : `(Critical: ${stats?.critical_count ?? 0})`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {isAr ? "تم التسليم بنجاح" : "Delivered / Sent"}
              </p>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {((stats?.delivered ?? 0) + (stats?.sent ?? 0)).toLocaleString()}
              </span>
              <Badge
                variant="outline"
                className="text-[11px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300"
              >
                {deliveredPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {isAr ? "في طابور الإرسال" : "Queued / In Flight"}
              </p>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {((stats?.queued ?? 0) + (stats?.processing ?? 0)).toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {isAr ? "مجردة ومجدولة" : "ready to dispatch"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {isAr ? "أخطاء أو ارتداد" : "Failed / Bounced"}
              </p>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                {((stats?.failed ?? 0) + (stats?.bounced ?? 0)).toLocaleString()}
              </span>
              {(stats?.failed ?? 0) + (stats?.bounced ?? 0) > 0 ? (
                <Badge variant="destructive" className="text-[10px]">
                  {isAr ? "يتطلب مراجعة" : "Requires attention"}
                </Badge>
              ) : (
                <span className="text-[11px] text-emerald-600 font-medium">
                  {isAr ? "سليم تماماً" : "100% healthy"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as any)} className="w-full">
        <div className="border-b border-border/60">
          <TabsList className="bg-muted/40 p-1 rounded-xl">
            <TabsTrigger value="logs" className="gap-2 text-xs sm:text-sm">
              <Mail className="w-4 h-4" />
              {isAr ? "سجل الرسائل والتسليم" : "Delivery Logs"}
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2 text-xs sm:text-sm">
              <FileText className="w-4 h-4" />
              {isAr ? "قوالب البريد الرسمية (70)" : "Templates Catalog (70)"}
            </TabsTrigger>
            <TabsTrigger value="test_sender" className="gap-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4" />
              {isAr ? "أداة الفحص والإرسال التجريبي" : "Diagnostic Test Tool"}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: DELIVERY LOGS
           ───────────────────────────────────────────────────────────── */}
        <TabsContent value="logs" className="space-y-4 pt-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  isAr
                    ? "بحث بالبريد الإلكتروني، الاسم، العنوان، نوع القالب..."
                    : "Search email, recipient, subject, or template key..."
                }
                className="ps-9 h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-9 text-xs">
                  <SelectValue placeholder={isAr ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? "كل الحالات" : "All Statuses"}</SelectItem>
                  <SelectItem value="delivered">{isAr ? "تم التسليم" : "Delivered"}</SelectItem>
                  <SelectItem value="sent">{isAr ? "تم الإرسال" : "Sent"}</SelectItem>
                  <SelectItem value="queued">{isAr ? "في الانتظار" : "Queued"}</SelectItem>
                  <SelectItem value="processing">{isAr ? "قيد الإرسال" : "Processing"}</SelectItem>
                  <SelectItem value="failed">{isAr ? "فشل الإرسال" : "Failed"}</SelectItem>
                  <SelectItem value="bounced">{isAr ? "مرتد" : "Bounced"}</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={priorityFilter}
                onValueChange={(val) => {
                  setPriorityFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[125px] h-9 text-xs">
                  <SelectValue placeholder={isAr ? "الأولوية" : "Priority"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? "كل الأولويات" : "All Priorities"}</SelectItem>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="NORMAL">NORMAL</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[135px] h-9 text-xs">
                  <SelectValue placeholder={isAr ? "التصنيف" : "Category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? "كل التصنيفات" : "All Categories"}</SelectItem>
                  <SelectItem value="auth">
                    {isAr ? "الحساب والأمان" : "Auth & Security"}
                  </SelectItem>
                  <SelectItem value="membership">
                    {isAr ? "توثيق العضوية" : "Membership"}
                  </SelectItem>
                  <SelectItem value="requests">{isAr ? "مركز الطلبات" : "Requests Hub"}</SelectItem>
                  <SelectItem value="council">
                    {isAr ? "المجلس واللجان" : "Council & Committees"}
                  </SelectItem>
                  <SelectItem value="events">{isAr ? "الفعاليات" : "Events"}</SelectItem>
                  <SelectItem value="fund">{isAr ? "صندوق التنمية" : "Family Fund"}</SelectItem>
                  <SelectItem value="news">{isAr ? "الأخبار والإعلام" : "News & Media"}</SelectItem>
                  <SelectItem value="newsletter">
                    {isAr ? "النشرة الدورية" : "Newsletter"}
                  </SelectItem>
                  <SelectItem value="system">
                    {isAr ? "النظام والإدارة" : "System Alerts"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-border/70 rounded-xl overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[120px] text-xs font-semibold">
                    {isAr ? "الحالة" : "Status"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    {isAr ? "المستلم" : "Recipient"}
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    {isAr ? "الموضوع والنوع" : "Subject & Template"}
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold">
                    {isAr ? "الأولوية" : "Priority"}
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold text-center">
                    {isAr ? "المحاولات" : "Tries"}
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold">
                    {isAr ? "تاريخ الإنشاء" : "Created At"}
                  </TableHead>
                  <TableHead className="w-[120px] text-end text-xs font-semibold">
                    {isAr ? "الإجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {isAr ? "جارٍ تحميل السجلات..." : "Loading email logs..."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !logsData?.data || logsData.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="w-8 h-8 text-muted-foreground/60" />
                        <span className="text-sm font-medium">
                          {isAr ? "لا توجد رسائل مطابقة للبحث" : "No matching email records found"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isAr
                            ? "جرب تعديل خيارات التصفية أو البحث أعلاه"
                            : "Try changing your filter settings"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logsData.data.map((log: EmailLogRecord) => (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>{renderStatusBadge(log.status)}</TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground">
                            {log.recipient_name || isAr ? "عضو الأسرة" : "Family Member"}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {log.recipient_email}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[280px]">
                        <div className="flex flex-col truncate">
                          <span
                            className="text-xs font-medium text-foreground truncate"
                            title={log.subject}
                          >
                            {log.subject}
                          </span>
                          <span
                            className="text-[11px] font-mono text-muted-foreground truncate"
                            title={log.email_type}
                          >
                            {log.email_type}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {renderPriorityBadge(log.priority)}
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {log.category}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        <span
                          className={
                            log.attempts > 1
                              ? "text-amber-600 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {log.attempts || 1}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </TableCell>

                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSelectedLogId(log.id)}
                            title={isAr ? "معاينة وتفاصيل" : "Inspect details"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {(log.status === "failed" || log.status === "queued") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => retryMutation.mutate(log.id)}
                              disabled={retryMutation.isPending}
                              title={isAr ? "إعادة المحاولة" : "Retry now"}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination footer */}
            <div className="flex items-center justify-between p-3 border-t border-border/50 text-xs text-muted-foreground bg-muted/20">
              <div>
                {isAr
                  ? `إجمالي السجلات: ${logsData?.count ?? 0}`
                  : `Total logs: ${logsData?.count ?? 0}`}
              </div>

              <div className="flex items-center gap-2">
                <span>
                  {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: TEMPLATES CATALOG (70 TEMPLATES)
           ───────────────────────────────────────────────────────────── */}
        <TabsContent value="templates" className="space-y-4 pt-4">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder={
                  isAr
                    ? "بحث في قوالب الإشعارات الـ 70..."
                    : "Search across 70 notification templates..."
                }
                className="ps-9 h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", labelAr: "الكل (70)", labelEn: "All (70)" },
                { id: "auth", labelAr: "الحساب والأمان (10)", labelEn: "Auth (10)" },
                { id: "membership", labelAr: "توثيق العضوية (11)", labelEn: "Membership (11)" },
                { id: "requests", labelAr: "مركز الطلبات (12)", labelEn: "Requests (12)" },
                { id: "council", labelAr: "المجلس واللجان (7)", labelEn: "Council (7)" },
                { id: "events", labelAr: "الفعاليات (8)", labelEn: "Events (8)" },
                { id: "fund", labelAr: "صندوق التنمية (8)", labelEn: "Fund (8)" },
                { id: "news", labelAr: "الأخبار والإعلام (5)", labelEn: "News (5)" },
                { id: "newsletter", labelAr: "النشرات (4)", labelEn: "Newsletter (4)" },
                { id: "system", labelAr: "النظام والإدارة (5)", labelEn: "System (5)" },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={templateCategoryFilter === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTemplateCategoryFilter(cat.id)}
                  className={`h-7 text-xs rounded-full whitespace-nowrap ${
                    templateCategoryFilter === cat.id
                      ? "bg-[#245B3F] hover:bg-[#1b442f] text-white"
                      : ""
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((t: any) => (
              <Card
                key={t.key}
                className="border border-border/70 hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] text-muted-foreground uppercase"
                    >
                      {t.category}
                    </Badge>
                    {renderPriorityBadge(t.defaultPriority || t.default_priority || "NORMAL")}
                  </div>

                  <CardTitle className="text-sm font-bold text-foreground mt-2 leading-tight">
                    {isAr ? t.nameAr || t.name_ar : t.nameEn || t.name_en}
                  </CardTitle>
                  <CardDescription className="font-mono text-[11px] text-muted-foreground pt-0.5">
                    {t.key}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 border-t border-border/40 mt-2 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 flex-1"
                    onClick={() => {
                      setPreviewTemplateKey(t.key);
                      setPreviewTemplateLang(isAr ? "ar" : "en");
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isAr ? "معاينة حية" : "Preview"}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 text-xs gap-1 flex-1 bg-[#245B3F] hover:bg-[#1b442f] text-white"
                    onClick={() => {
                      setTestTemplateKey(t.key);
                      setSubTab("test_sender");
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isAr ? "إرسال تجريبي" : "Send Test"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: TEST SENDER & DIAGNOSTIC TOOL
           ───────────────────────────────────────────────────────────── */}
        <TabsContent value="test_sender" className="space-y-4 pt-4">
          <Card className="max-w-2xl mx-auto border border-border/70 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ECA654]" />
                <CardTitle className="text-lg">
                  {isAr ? "أداة الفحص والإرسال التجريبي المباشر" : "Live Email Diagnostic Tool"}
                </CardTitle>
              </div>
              <CardDescription>
                {isAr
                  ? "اختر أي قالب من القوالب الـ 70 لإرساله فورياً إلى بريدك للتأكد من تنسيق Resend وظهور الهوية"
                  : "Dispatch any official template directly to your inbox to verify rendering and deliverability"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "اختر قالب الإشعار" : "Select Template"}
                </label>
                <Select value={testTemplateKey} onValueChange={setTestTemplateKey}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.values(EMAIL_TEMPLATES_REGISTRY).map((t: any) => (
                      <SelectItem key={t.key} value={t.key} className="text-xs">
                        <span className="font-semibold">{isAr ? t.nameAr : t.nameEn}</span>{" "}
                        <span className="text-muted-foreground font-mono">({t.key})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "البريد الإلكتروني المستلم" : "Recipient Email"}
                </label>
                <Input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "أدخل بريدك الشخصي لمعاينة كيف تظهر الرسالة في برامج البريد مثل Gmail و Outlook"
                    : "Enter your personal email to verify how it looks in Gmail, Apple Mail, and Outlook"}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isAr ? "لغة الرسالة" : "Language & Layout"}
                </label>
                <Select
                  value={testLanguage}
                  onValueChange={(v) => setTestLanguage(v as EmailLanguage)}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية (Arabic — RTL)</SelectItem>
                    <SelectItem value="en">English (LTR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewTemplateKey(testTemplateKey);
                    setPreviewTemplateLang(testLanguage);
                  }}
                  className="text-xs"
                >
                  <Eye className="w-3.5 h-3.5 me-1" />
                  {isAr ? "معاينة قبل الإرسال" : "Preview First"}
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    if (!testRecipientEmail || !testRecipientEmail.includes("@")) {
                      toast.error(
                        isAr ? "يرجى كتابة عنوان بريد صحيح" : "Please provide a valid email",
                      );
                      return;
                    }
                    sendTestMutation.mutate({
                      templateKey: testTemplateKey,
                      recipientEmail: testRecipientEmail,
                      language: testLanguage,
                    });
                  }}
                  disabled={sendTestMutation.isPending}
                  className="text-xs bg-[#245B3F] hover:bg-[#1b442f] text-white"
                >
                  {sendTestMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin me-1" />
                  ) : (
                    <Send className="w-3.5 h-3.5 me-1" />
                  )}
                  {isAr ? "إرسال الرسالة التجريبية الآن" : "Dispatch Test Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: INSPECT LOG DETAILS & HTML PREVIEW
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  {inspectedLog?.subject || (isAr ? "تفاصيل البريد الإلكتروني" : "Email Details")}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                  ID: {inspectedLog?.id} • Type: {inspectedLog?.email_type}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 pe-6">
                {inspectedLog && renderStatusBadge(inspectedLog.status)}
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 border-b border-border/40 flex items-center justify-between bg-background gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Button
                variant={previewSubTab === "visual" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreviewSubTab("visual")}
              >
                <Eye className="w-3.5 h-3.5 me-1" />
                {isAr ? "المعاينة البصرية" : "Visual Preview"}
              </Button>

              <Button
                variant={previewSubTab === "text" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreviewSubTab("text")}
              >
                <FileText className="w-3.5 h-3.5 me-1" />
                {isAr ? "النص البسيط" : "Plain Text"}
              </Button>

              <Button
                variant={previewSubTab === "payload" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setPreviewSubTab("payload")}
              >
                <Code2 className="w-3.5 h-3.5 me-1" />
                {isAr ? "البيانات والحمولة" : "Metadata / Payload"}
              </Button>
            </div>

            {previewSubTab === "visual" && (
              <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-muted/40">
                <Button
                  variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPreviewDevice("desktop")}
                >
                  <Monitor className="w-3 h-3 me-1" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone className="w-3 h-3 me-1" />
                  Mobile
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
            {inspectedLogLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : inspectedLog ? (
              <>
                {previewSubTab === "visual" && (
                  <div className="flex justify-center">
                    <div
                      className={`transition-all duration-300 border border-border/80 rounded-xl overflow-hidden shadow-md bg-white ${
                        previewDevice === "desktop" ? "w-full max-w-[660px]" : "w-[375px]"
                      }`}
                      style={{ height: "540px" }}
                    >
                      <iframe
                        srcDoc={inspectedLog.html_body || ""}
                        title="Email Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                )}

                {previewSubTab === "text" && (
                  <pre className="p-4 bg-card border border-border/60 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground max-h-[500px] overflow-y-auto">
                    {inspectedLog.text_body || (isAr ? "لا يتوفر نص بسيط" : "No plain text body")}
                  </pre>
                )}

                {previewSubTab === "payload" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-card p-4 rounded-xl border border-border/60 text-xs">
                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "المستلم:" : "Recipient:"}
                        </span>
                        <span className="font-semibold">{inspectedLog.recipient_name}</span>
                        <span className="text-muted-foreground font-mono block">
                          {inspectedLog.recipient_email}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "معرّف Resend:" : "Provider ID:"}
                        </span>
                        <span className="font-mono">{inspectedLog.provider_message_id || "—"}</span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "المحاولات:" : "Attempts:"}
                        </span>
                        <span className="font-semibold">
                          {inspectedLog.attempts} / {inspectedLog.max_attempts}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "وقت الإرسال:" : "Sent At:"}
                        </span>
                        <span>{formatDateTime(inspectedLog.sent_at)}</span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "وقت التسليم:" : "Delivered At:"}
                        </span>
                        <span>{formatDateTime(inspectedLog.delivered_at)}</span>
                      </div>

                      <div>
                        <span className="text-muted-foreground block">
                          {isAr ? "مفتاح المطابقة:" : "Idempotency Key:"}
                        </span>
                        <span className="font-mono text-[11px] truncate block">
                          {inspectedLog.idempotency_key || "—"}
                        </span>
                      </div>
                    </div>

                    {inspectedLog.error_message && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-400 text-xs">
                        <span className="font-bold block mb-1">
                          {isAr ? "رسالة الخطأ:" : "Delivery Error:"}
                        </span>
                        <p className="font-mono text-[11px]">{inspectedLog.error_message}</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground block">
                        {isAr ? "الحمولة المرسلة (Payload JSON):" : "Raw Variables (JSON):"}
                      </span>
                      <pre className="p-3 bg-card border border-border/60 rounded-xl text-xs font-mono overflow-x-auto text-foreground">
                        {JSON.stringify(inspectedLog.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div className="p-3 border-t border-border/50 bg-background flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{inspectedLog?.recipient_email}</span>

            <div className="flex items-center gap-2">
              {inspectedLog &&
                (inspectedLog.status === "failed" || inspectedLog.status === "queued") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryMutation.mutate(inspectedLog.id)}
                    disabled={retryMutation.isPending}
                    className="text-xs text-amber-600 gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isAr ? "إعادة الإرسال الآن" : "Retry Send"}
                  </Button>
                )}

              <Button
                size="sm"
                variant="default"
                onClick={() => setSelectedLogId(null)}
                className="text-xs"
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: LIVE TEMPLATE PREVIEW (ARABIC / ENGLISH TOGGLE)
         ───────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!previewTemplateKey}
        onOpenChange={(open) => !open && setPreviewTemplateKey(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-border/60 bg-muted/30">
            <div className="flex items-center justify-between gap-3 pe-6">
              <div>
                <DialogTitle className="text-base font-bold">
                  {templatePreviewData?.subject || previewTemplateKey}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                  Template: {previewTemplateKey}
                </DialogDescription>
              </div>

              {/* Language Switch */}
              <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5 bg-background">
                <Button
                  variant={previewTemplateLang === "ar" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-2.5 text-xs ${previewTemplateLang === "ar" ? "bg-[#245B3F] text-white" : ""}`}
                  onClick={() => setPreviewTemplateLang("ar")}
                >
                  العربية (RTL)
                </Button>
                <Button
                  variant={previewTemplateLang === "en" ? "default" : "ghost"}
                  size="sm"
                  className={`h-7 px-2.5 text-xs ${previewTemplateLang === "en" ? "bg-[#245B3F] text-white" : ""}`}
                  onClick={() => setPreviewTemplateLang("en")}
                >
                  English (LTR)
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 bg-muted/20 flex justify-center">
            {templatePreviewLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : templatePreviewData ? (
              <div
                className="w-full max-w-[660px] border border-border/80 rounded-xl overflow-hidden shadow-md bg-white"
                style={{ height: "550px" }}
              >
                <iframe
                  srcDoc={templatePreviewData.html}
                  title="Template Live Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : null}
          </div>

          <div className="p-3 border-t border-border/50 bg-background flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (previewTemplateKey) {
                  setTestTemplateKey(previewTemplateKey);
                  setPreviewTemplateKey(null);
                  setSubTab("test_sender");
                }
              }}
              className="text-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isAr ? "إرسال هذا القالب تجريبياً" : "Send Test with this Template"}
            </Button>

            <Button
              size="sm"
              variant="default"
              onClick={() => setPreviewTemplateKey(null)}
              className="text-xs"
            >
              {isAr ? "إغلاق" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
