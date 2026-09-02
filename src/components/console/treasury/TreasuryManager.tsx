import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Landmark,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Search,
  Eye,
  Plus,
  Download,
  CreditCard,
  Layers,
  Settings2,
  Copy,
  Check,
  Trash2,
  Edit2,
  ShieldCheck,
  Building,
  HeartHandshake,
  Wallet,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTreasuryContributionsPaginated } from "@/lib/admin-hub.functions";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/useConfirm";
import type { TreasuryContributionReviewInput } from "@/lib/admin-hub.schemas";
import type {
  TreasuryConfig,
  ContributionTier,
  FundPurpose,
  ManualContributionInput,
} from "@/lib/contributions.schemas";

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

const DEFAULT_CONFIG: TreasuryConfig = {
  bank_account: {
    bank_name_ar: "مصرف الإنماء",
    bank_name_en: "Alinma Bank",
    beneficiary_name_ar: "صندوق التنمية العائلية (آل بوعبيد)",
    beneficiary_name_en: "Al-Boabid Family Development Fund",
    account_number: "99887766554433",
    iban: "SA0305000099887766554433",
    notes_ar:
      "الحساب البنكي الرسمي المعتمد لصندوق التنمية العائلية (آل بوعبيد) الخاضع للترخيص والإشراف المالي من المركز الوطني لتنمية القطاع غير الربحي (NCNP).",
    notes_en:
      "The official bank account of Al-Boabid Family Fund subject to NCNP licensing and audit.",
  },
  tiers: [
    {
      id: "tier-adult",
      category_ar: "اشتراك العضو البالغ",
      category_en: "Adult member",
      amount_ar: "١٠٠ ريال",
      amount_en: "SAR 100",
      numeric_amount: 100,
      frequency: "monthly",
      purpose_ar: "التشغيل وبرامج التكافل",
      purpose_en: "Operations and solidarity programmes",
      is_active: true,
      sort_order: 1,
    },
    {
      id: "tier-family",
      category_ar: "اشتراك الأسرة الواحدة",
      category_en: "Household",
      amount_ar: "٢٥٠ ريال",
      amount_en: "SAR 250",
      numeric_amount: 250,
      frequency: "monthly",
      purpose_ar: "التشغيل والبرامج والملتقى السنوي",
      purpose_en: "Operations, programmes, annual assembly",
      is_active: true,
      sort_order: 2,
    },
    {
      id: "tier-hq",
      category_ar: "مساهمة مشروع المقر",
      category_en: "Headquarters contribution",
      amount_ar: "حسب الاستطاعة",
      amount_en: "As able",
      numeric_amount: 0,
      frequency: "one_off",
      purpose_ar: "شراء الأرض والإنشاءات",
      purpose_en: "Land acquisition and construction",
      is_active: true,
      sort_order: 3,
    },
    {
      id: "tier-loan",
      category_ar: "قرض حسن مساهم",
      category_en: "Interest-free loan",
      amount_ar: "بالاتفاق",
      amount_en: "By arrangement",
      numeric_amount: 0,
      frequency: "one_off",
      purpose_ar: "تمويل مرحلة الإنشاء، يُردّ وفق جدول",
      purpose_en: "Construction phase, repaid on schedule",
      is_active: true,
      sort_order: 4,
    },
  ],
  fund_purposes: [
    {
      id: "general_ops",
      name_ar: "التشغيل وبرامج التكافل",
      name_en: "Operations & Solidarity",
      description_ar: "المصاريف التشغيلية والتكافل الاجتماعي للأسر",
      description_en: "Operating costs and social solidarity support",
      is_active: true,
    },
    {
      id: "annual_assembly",
      name_ar: "الملتقى السنوي والأنشطة",
      name_en: "Annual Assembly & Activities",
      description_ar: "تنظيم اللقاءات الدورية وتكريم المتميزين",
      description_en: "Organizing family gatherings and annual events",
      is_active: true,
    },
    {
      id: "hq_project",
      name_ar: "مشروع المقر الدائم (حي الحزام الذهبي)",
      name_en: "Permanent HQ Project (Al-Hizam Al-Dhahabi)",
      description_ar: "شراء الأرض وتجهيز الإنشاءات للمقر الجامع للأسرة",
      description_en: "Land acquisition and construction for family headquarters",
      is_active: true,
    },
    {
      id: "zakat",
      name_ar: "حساب الزكاة والصدقات",
      name_en: "Zakat & Charity Fund",
      description_ar: "حساب شرعي مستقل مخصص للزكاة",
      description_en: "Independent dedicated account for zakat & charity",
      is_active: true,
    },
    {
      id: "academic_awards",
      name_ar: "جائزة التفوق العلمي والمهني",
      name_en: "Academic & Professional Excellence Award",
      description_ar: "رعاية ودعم المبتكرين والطلاب المتفوقين",
      description_en: "Honouring students and high achievers",
      is_active: true,
    },
  ],
  quick_amounts: [100, 250, 500, 1000, 2500],
  salla_store_url: "https://albouabidfamily.com/القسط-الشهري/c1360847582",
  application_of_funds: {
    p1_ar:
      "تُوزَّع الموارد على ثلاثة حسابات مستقلة: حساب الزكاة، وحساب التشغيل والبرامج، وحساب مشروع المقر الدائم. ولا يجوز النقل بين الحسابات إلا بقرار من مجلس الأمناء.",
    p1_en:
      "Resources are allocated across three separate accounts: the zakat account, the operations and programmes account, and the permanent headquarters account. Transfers between them require a resolution of the board of trustees.",
    p2_ar:
      "ويُعرض تقرير مالي مراجَع على الجمعية العمومية سنوياً، ويُتاح ملخصه في الأرشيف الرقمي لأبناء الأسرة.",
    p2_en:
      "An audited financial report is laid before the general assembly each year, and a summary is made available to family members in the digital archive.",
  },
};

export function TreasuryManager({
  verifiedTotal,
  pendingTotal,
  rejectedTotal = 0,
  pendingCount,
  verifiedCount,
  rejectedCount,
  totalCount,
  byPurpose,
  initialConfig,
  onReviewContribution,
  onSaveTreasuryConfig,
  onCreateManualContribution,
}: {
  verifiedTotal: number;
  pendingTotal: number;
  rejectedTotal?: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  totalCount: number;
  byPurpose?: Record<string, { count: number; total: number }>;
  initialConfig?: TreasuryConfig | null;
  onReviewContribution: (data: TreasuryContributionReviewInput) => Promise<void>;
  onSaveTreasuryConfig?: (config: TreasuryConfig) => Promise<void>;
  onCreateManualContribution?: (data: ManualContributionInput) => Promise<void>;
}) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "bank" | "tiers_purposes">("ledger");

  // Ledger state
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContribution, setSelectedContribution] = useState<ContributionItem | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Manual contribution dialog state
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualContributionInput>({
    contributor_name: "",
    amount: 100,
    currency: "SAR",
    method: "bank_transfer",
    purpose: "التشغيل وبرامج التكافل",
    reference: "",
    status: "verified",
    review_note: "تم التوثيق المباشر بواسطة الخزينة",
  });
  const [savingManual, setSavingManual] = useState(false);

  // Treasury settings state
  const [config, setConfig] = useState<TreasuryConfig>(initialConfig || DEFAULT_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  // Tier modal state
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<ContributionTier | null>(null);
  const [tierForm, setTierForm] = useState<ContributionTier>({
    id: `tier-${Date.now()}`,
    category_ar: "",
    category_en: "",
    amount_ar: "",
    amount_en: "",
    numeric_amount: 100,
    frequency: "monthly",
    purpose_ar: "",
    purpose_en: "",
    is_active: true,
    sort_order: 1,
  });

  // Purpose modal state
  const [purposeModalOpen, setPurposeModalOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<FundPurpose | null>(null);
  const [purposeForm, setPurposeForm] = useState<FundPurpose>({
    id: `fund-${Date.now()}`,
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    is_active: true,
  });

  // Keep config in sync if parent passes fresh initialConfig
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const fetchTreasuryPage = useServerFn(getTreasuryContributionsPaginated);

  const {
    data: queryData,
    isLoading,
    isFetching,
    refetch: refetchLedger,
  } = useQuery({
    queryKey: ["treasury-paginated", currentPage, pageSize, statusFilter, debouncedSearch],
    queryFn: () =>
      fetchTreasuryPage({
        data: {
          page: currentPage,
          pageSize,
          search: debouncedSearch ? debouncedSearch : undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      }),
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });

  const contributionsList = (queryData?.data ?? []) as ContributionItem[];

  // Filter in-memory for purpose if selected
  const filtered = purposeFilter === "all"
    ? contributionsList
    : contributionsList.filter((c) => (c.purpose || "").includes(purposeFilter));

  const getStatusDisplay = (st: ContributionItem["status"]) => {
    switch (st) {
      case "verified":
        return (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
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

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return isAr ? "تحويل بنكي" : "Bank Transfer";
      case "cash":
      case "in_person":
        return isAr ? "نقداً / في الملتقى" : "Cash / In Person";
      case "pos":
        return isAr ? "شبكة POS" : "POS Terminal";
      default:
        return isAr ? "قناة أخرى" : method;
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
      await refetchLedger();
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

  const handleCreateManualContribution = async () => {
    if (!manualForm.contributor_name.trim()) {
      toast.error(isAr ? "يرجى كتابة اسم المساهم" : "Please enter contributor name");
      return;
    }
    if (!manualForm.amount || manualForm.amount <= 0) {
      toast.error(isAr ? "يرجى تحديد مبلغ صالح" : "Please enter a valid amount");
      return;
    }

    try {
      setSavingManual(true);
      if (onCreateManualContribution) {
        await onCreateManualContribution(manualForm);
      } else {
        const { createManualContribution } = await import("@/lib/contributions.functions");
        await createManualContribution({ data: manualForm });
      }
      toast.success(isAr ? "تم تسجيل المساهمة بنجاح" : "Contribution recorded successfully");
      setManualModalOpen(false);
      setManualForm({
        contributor_name: "",
        amount: 100,
        currency: "SAR",
        method: "bank_transfer",
        purpose: config.fund_purposes[0]?.name_ar || "التشغيل وبرامج التكافل",
        reference: "",
        status: "verified",
        review_note: "تم التوثيق المباشر بواسطة الخزينة",
      });
      await refetchLedger();
    } catch (err: any) {
      toast.error(err.message || (isAr ? "تعذر حفظ المساهمة" : "Failed to save"));
    } finally {
      setSavingManual(false);
    }
  };

  const handleSaveConfig = async (updatedConfig: TreasuryConfig) => {
    try {
      setSavingConfig(true);
      if (onSaveTreasuryConfig) {
        await onSaveTreasuryConfig(updatedConfig);
      } else {
        const { saveTreasuryConfig } = await import("@/lib/contributions.functions");
        await saveTreasuryConfig({ data: updatedConfig });
      }
      setConfig(updatedConfig);
      toast.success(isAr ? "تم حفظ إعدادات الخزينة بنجاح" : "Treasury settings saved");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "تعذر حفظ الإعدادات" : "Failed to save"));
    } finally {
      setSavingConfig(false);
    }
  };

  const handleExportCsv = () => {
    if (!filtered || filtered.length === 0) {
      toast.info(isAr ? "لا توجد سجلات لتصديرها" : "No records to export");
      return;
    }

    const headers = [
      "رقم المعاملة (ID)",
      "اسم المساهم",
      "المبلغ (ريال)",
      "العملة",
      "طريقة الدفع",
      "الغرض / الحساب",
      "المرجع البنكي",
      "الحالة",
      "ملاحظة المراجعة",
      "تاريخ التسجيل",
    ];

    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${(c.contributor_name || "").replace(/"/g, '""')}"`,
      c.amount,
      `"${c.currency}"`,
      `"${getMethodLabel(c.method)}"`,
      `"${(c.purpose || "").replace(/"/g, '""')}"`,
      `"${(c.reference || "").replace(/"/g, '""')}"`,
      `"${c.status === "verified" ? "معتمدة" : c.status === "pending" ? "قيد المراجعة" : "مرفوضة"}"`,
      `"${(c.review_note || "").replace(/"/g, '""')}"`,
      `"${new Date(c.created_at).toISOString()}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `treasury-contributions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isAr ? "تم تصدير ملف CSV بنجاح" : "CSV exported successfully");
  };

  return (
    <div className="space-y-6 max-w-[1250px] mx-auto pb-16">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-6 h-6 text-gold" />
            {isAr ? "الخزينة وصندوق التنمية العائلية" : "Treasury & Family Fund Management"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isAr
              ? "إدارة العمليات المالية، توثيق المساهمات، وتعديل الحسابات البنكية وفئات الاشتراك"
              : "Audit transactions, verify contributions, and configure bank accounts and subscription tiers"}
          </p>
        </div>

        {/* Global Sub-tabs Navigation */}
        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border">
          <Button
            size="sm"
            variant={activeSubTab === "ledger" ? "default" : "ghost"}
            onClick={() => setActiveSubTab("ledger")}
            className="text-xs font-bold gap-1.5 h-8 rounded-lg"
          >
            <Wallet className="w-3.5 h-3.5" />
            {isAr ? "سجل المساهمات" : "Ledger & Review"}
            {pendingCount > 0 && (
              <Badge variant="destructive" className="h-4 px-1.5 text-[10px] ml-1">
                {pendingCount}
              </Badge>
            )}
          </Button>

          <Button
            size="sm"
            variant={activeSubTab === "bank" ? "default" : "ghost"}
            onClick={() => setActiveSubTab("bank")}
            className="text-xs font-bold gap-1.5 h-8 rounded-lg"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {isAr ? "الحساب البنكي والقنوات" : "Bank & Payment"}
          </Button>

          <Button
            size="sm"
            variant={activeSubTab === "tiers_purposes" ? "default" : "ghost"}
            onClick={() => setActiveSubTab("tiers_purposes")}
            className="text-xs font-bold gap-1.5 h-8 rounded-lg"
          >
            <Layers className="w-3.5 h-3.5" />
            {isAr ? "فئات الاشتراك وأوجه الصرف" : "Tiers & Funds"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LEDGER & REVIEW                                                */}
      {/* ========================================================================= */}
      {activeSubTab === "ledger" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={cn(
                "p-4 rounded-2xl border bg-card relative overflow-hidden transition-all",
                pendingCount > 0 ? "border-amber-500/40 shadow-sm" : "border-border",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      pendingCount > 0 ? "bg-amber-500 animate-pulse" : "bg-muted-foreground",
                    )}
                  />
                  {isAr ? "قيد المراجعة" : "Pending Review"}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {pendingCount}
                </Badge>
              </div>
              <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 block">
                {formatSar(pendingTotal)}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {isAr ? "إجمالي المعتمد" : "Verified Total"}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600">
                  {verifiedCount}
                </Badge>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                {formatSar(verifiedTotal)}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  {isAr ? "المرفوض" : "Rejected"}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-destructive">
                  {rejectedCount}
                </Badge>
              </div>
              <span className="text-2xl font-black font-mono text-destructive block">
                {formatSar(rejectedTotal)}
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  {isAr ? "إجمالي المعاملات" : "Total Operations"}
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {totalCount}
                </Badge>
              </div>
              <span className="text-2xl font-black font-mono text-foreground block">
                {totalCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {isAr ? "معاملة" : "tx"}
                </span>
              </span>
            </div>
          </div>

          {/* Fund Breakdown Chips / Summary */}
          {byPurpose && Object.keys(byPurpose).length > 0 && (
            <Card className="border-border bg-card/60">
              <CardHeader className="py-3 px-4 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-gold" />
                  {isAr ? "توزيع الإيرادات المعتمدة حسب الصناديق والأوجه" : "Verified Revenue by Purpose"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(byPurpose).map(([purposeName, stat]) => (
                    <div
                      key={purposeName}
                      className="px-3 py-1.5 rounded-xl border border-border/80 bg-secondary/30 text-xs flex items-center gap-2"
                    >
                      <span className="font-semibold text-foreground">{purposeName}:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatSar(stat.total)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({stat.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Bar: Search, Filters, Manual Record, CSV Export */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={isAr ? "بحث بالاسم أو المرجع..." : "Search by contributor or ref..."}
                  className="ps-9 h-9 text-xs rounded-xl bg-background"
                />
              </div>

              {/* Purpose Filter */}
              <Select value={purposeFilter} onValueChange={(val) => setPurposeFilter(val)}>
                <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-background">
                  <SelectValue placeholder={isAr ? "كل الأوجه" : "All Purposes"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? "جميع الأوجه والصناديق" : "All Purposes"}</SelectItem>
                  {config.fund_purposes.map((f) => (
                    <SelectItem key={f.id} value={f.name_ar}>
                      {isAr ? f.name_ar : f.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                {isAr ? "تصدير CSV" : "Export CSV"}
              </Button>

              <Button
                size="sm"
                onClick={() => setManualModalOpen(true)}
                className="h-9 text-xs font-bold gap-1.5 rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "تسجيل مساهمة يدوية" : "Record Contribution"}
              </Button>
            </div>
          </div>

          {/* Filter Tabs & Table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
            <div className="border-b border-border p-2 px-4 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label_ar: "الكل", label_en: "All", count: totalCount },
                  { id: "pending", label_ar: "قيد المراجعة", label_en: "Pending", count: pendingCount },
                  { id: "verified", label_ar: "معتمدة", label_en: "Verified", count: verifiedCount },
                  { id: "rejected", label_ar: "مرفوضة", label_en: "Rejected", count: rejectedCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "py-2 px-1 relative whitespace-nowrap transition-colors",
                      statusFilter === tab.id
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isAr ? tab.label_ar : tab.label_en}{" "}
                    <span className="text-[10px] font-mono opacity-70 ml-0.5">({tab.count})</span>
                    {statusFilter === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border text-xs">
                  <TableHead className="font-bold">{isAr ? "المساهم" : "Contributor"}</TableHead>
                  <TableHead className="font-bold text-start">{isAr ? "المبلغ" : "Amount"}</TableHead>
                  <TableHead className="font-bold">{isAr ? "القناة" : "Method"}</TableHead>
                  <TableHead className="font-bold">{isAr ? "الغرض" : "Purpose"}</TableHead>
                  <TableHead className="font-bold">{isAr ? "التاريخ" : "Date"}</TableHead>
                  <TableHead className="font-bold">{isAr ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="font-bold text-end">{isAr ? "الإجراء" : "Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground text-xs">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        {isAr ? "جاري تحميل البيانات المالية..." : "Loading records..."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Landmark className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-bold text-foreground">
                          {isAr ? "لا توجد معاملات مسجلة في هذه الفئة" : "No transactions found"}
                        </p>
                        <p className="text-[11px] opacity-70 mt-1">
                          {isAr
                            ? "المساهمات المرفوعة من الموقع أو المسجلة يدوياً ستظهر هنا."
                            : "New submissions and offline entries will be listed here."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow
                      key={c.id}
                      className="group cursor-pointer hover:bg-muted/30 text-xs"
                      onClick={() => {
                        setSelectedContribution(c);
                        setReviewNote(c.review_note ?? "");
                      }}
                    >
                      <TableCell>
                        <div className="font-bold text-foreground">{c.contributor_name}</div>
                        {c.reference && (
                          <div className="text-[10px] font-mono text-muted-foreground">
                            Ref: {c.reference}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-foreground text-start">
                        {formatSar(c.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{getMethodLabel(c.method)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-[11px] font-medium text-foreground">
                          {c.purpose || (isAr ? "اشتراك عام" : "General")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {new Date(c.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusDisplay(c.status)}</TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContribution(c);
                            setReviewNote(c.review_note ?? "");
                          }}
                        >
                          {c.status === "pending"
                            ? isAr
                              ? "مراجعة"
                              : "Review"
                            : isAr
                              ? "التفاصيل"
                              : "Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: BANK ACCOUNT & PAYMENT SETTINGS                                */}
      {/* ========================================================================= */}
      {activeSubTab === "bank" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bank Card Preview */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-gold/30 bg-card rounded-2xl shadow-sm overflow-hidden">
                <div className="h-2 bg-gold" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gold" />
                      {isAr ? "معاينة بطاقة الحساب المعتمدة" : "Official Account Card Preview"}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600">
                      {isAr ? "معتمد NCNP" : "NCNP Certified"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "هكذا يظهر الحساب للأعضاء الموثقين فقط داخل المنصة"
                      : "Visible exclusively to verified members in portal"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{isAr ? "اسم الحساب:" : "Account:"}</span>
                      <span className="font-bold text-foreground text-end">
                        {isAr
                          ? config.bank_account.beneficiary_name_ar
                          : config.bank_account.beneficiary_name_en}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{isAr ? "البنك:" : "Bank:"}</span>
                      <span className="font-semibold text-foreground">
                        {isAr ? config.bank_account.bank_name_ar : config.bank_account.bank_name_en}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{isAr ? "رقم الحساب:" : "Account No:"}</span>
                      <span className="font-mono font-bold text-foreground">
                        {config.bank_account.account_number}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-1">
                        {isAr ? "رقم الآيبان الدولي (IBAN):" : "IBAN:"}
                      </span>
                      <div className="flex items-center justify-between bg-background p-2 rounded-lg border border-border font-mono text-xs font-bold">
                        <span>{config.bank_account.iban}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6"
                          onClick={() => {
                            navigator.clipboard.writeText(config.bank_account.iban.replace(/\s+/g, ""));
                            setCopiedIban(true);
                            toast.success(isAr ? "تم نسخ الآيبان" : "IBAN copied");
                            setTimeout(() => setCopiedIban(false), 2000);
                          }}
                        >
                          {copiedIban ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {isAr ? config.bank_account.notes_ar : config.bank_account.notes_en}
                  </p>
                </CardContent>
              </Card>

              {/* Salla Storefront Preview Card */}
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {isAr ? "متجر سلة للدفع الإلكتروني" : "Salla Storefront Gateway"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-[11px] text-muted-foreground">
                    {isAr
                      ? "رابط بوابة الدفع الإلكتروني المباشر (مدى، أبل باي، بطاقات ائتمانية)"
                      : "Direct payment gateway link for Mada, Apple Pay, Credit Cards"}
                  </p>
                  <a
                    href={config.salla_store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-bold flex items-center gap-1 hover:underline break-all"
                  >
                    {config.salla_store_url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Bank Form */}
            <div className="lg:col-span-2">
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    {isAr ? "تعديل بيانات الحسابات البنكية والقنوات" : "Configure Bank & Gateway"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "تُحفظ البيانات مباشرة في قاعدة البيانات وتنعكس فورياً على صفحة المساهمات وبوابة الأعضاء."
                      : "Settings save live to database and apply immediately to all contribution modals."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground">
                        {isAr ? "اسم البنك (بالعربية) *" : "Bank Name (AR) *"}
                      </label>
                      <Input
                        value={config.bank_account.bank_name_ar}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: { ...config.bank_account, bank_name_ar: e.target.value },
                          })
                        }
                        placeholder="مثال: مصرف الإنماء"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground">
                        {isAr ? "اسم البنك (بالإنجليزية) *" : "Bank Name (EN) *"}
                      </label>
                      <Input
                        value={config.bank_account.bank_name_en}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: { ...config.bank_account, bank_name_en: e.target.value },
                          })
                        }
                        placeholder="e.g. Alinma Bank"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold text-foreground">
                        {isAr ? "اسم المستفيد / صاحب الحساب (بالعربية) *" : "Beneficiary Name (AR) *"}
                      </label>
                      <Input
                        value={config.bank_account.beneficiary_name_ar}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: {
                              ...config.bank_account,
                              beneficiary_name_ar: e.target.value,
                            },
                          })
                        }
                        placeholder="صندوق التنمية العائلية (آل بوعبيد)"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold text-foreground">
                        {isAr ? "اسم المستفيد (بالإنجليزية) *" : "Beneficiary Name (EN) *"}
                      </label>
                      <Input
                        value={config.bank_account.beneficiary_name_en}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: {
                              ...config.bank_account,
                              beneficiary_name_en: e.target.value,
                            },
                          })
                        }
                        placeholder="Al-Boabid Family Development Fund"
                        className="rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground">
                        {isAr ? "رقم الحساب البنكي *" : "Account Number *"}
                      </label>
                      <Input
                        value={config.bank_account.account_number}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: { ...config.bank_account, account_number: e.target.value },
                          })
                        }
                        placeholder="99887766554433"
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground">
                        {isAr ? "رقم الآيبان الدولي (IBAN) *" : "IBAN *"}
                      </label>
                      <Input
                        value={config.bank_account.iban}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: {
                              ...config.bank_account,
                              iban: e.target.value.toUpperCase().replace(/\s+/g, ""),
                            },
                          })
                        }
                        placeholder="SA0305000099887766554433"
                        className="rounded-xl font-mono text-xs uppercase"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold text-foreground">
                        {isAr ? "رابط متجر سلة الإلكتروني للدفع *" : "Salla Storefront URL *"}
                      </label>
                      <Input
                        value={config.salla_store_url}
                        onChange={(e) => setConfig({ ...config, salla_store_url: e.target.value })}
                        placeholder="https://albouabidfamily.com/..."
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold text-foreground">
                        {isAr ? "ملاحظة الترخيص والإشراف (عربي)" : "Governance / License Note (AR)"}
                      </label>
                      <Textarea
                        rows={2}
                        value={config.bank_account.notes_ar || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            bank_account: { ...config.bank_account, notes_ar: e.target.value },
                          })
                        }
                        placeholder="الحساب البنكي الرسمي المعتمد..."
                        className="rounded-xl text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button
                      onClick={() => handleSaveConfig(config)}
                      disabled={savingConfig}
                      className="h-10 px-6 font-bold rounded-xl text-xs gap-1.5"
                    >
                      {savingConfig ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {isAr ? "حفظ بيانات الحساب البنكي" : "Save Bank Particulars"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TIERS & SPENDING PURPOSES                                      */}
      {/* ========================================================================= */}
      {activeSubTab === "tiers_purposes" && (
        <div className="space-y-8">
          {/* Section 1: Contribution Tiers */}
          <Card className="border-border bg-card rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold" />
                  {isAr ? "فئات الاشتراكات الشهرية والمساهمات" : "Subscription Tiers & Contribution Plans"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? "تظهر هذه الفئات في جدول الاشتراكات الرسمي على صفحة المساهمة"
                    : "These plans are rendered in the schedule on the /contribute page"}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingTier(null);
                  setTierForm({
                    id: `tier-${Date.now()}`,
                    category_ar: "",
                    category_en: "",
                    amount_ar: "١٠٠ ريال",
                    amount_en: "SAR 100",
                    numeric_amount: 100,
                    frequency: "monthly",
                    purpose_ar: "التشغيل وبرامج التكافل",
                    purpose_en: "Operations and solidarity",
                    is_active: true,
                    sort_order: config.tiers.length + 1,
                  });
                  setTierModalOpen(true);
                }}
                className="h-8 text-xs font-bold gap-1.5 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة فئة اشتراك" : "Add Plan"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.tiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between transition-all bg-card/60 relative",
                      tier.is_active ? "border-border shadow-xs" : "border-border/40 opacity-60",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {tier.frequency === "monthly"
                            ? isAr
                              ? "شهرياً"
                              : "Monthly"
                            : tier.frequency === "annual"
                              ? isAr
                                ? "سنوياً"
                                : "Annual"
                              : isAr
                                ? "دفعة واحدة"
                                : "One-off"}
                        </Badge>
                        <Switch
                          checked={tier.is_active}
                          onCheckedChange={(val) => {
                            const updated = config.tiers.map((t) =>
                              t.id === tier.id ? { ...t, is_active: val } : t,
                            );
                            const nextConfig = { ...config, tiers: updated };
                            setConfig(nextConfig);
                            handleSaveConfig(nextConfig);
                          }}
                        />
                      </div>

                      <h4 className="font-bold text-foreground text-sm mb-1">
                        {isAr ? tier.category_ar : tier.category_en}
                      </h4>
                      <p className="font-mono font-black text-primary text-base mb-2">
                        {isAr ? tier.amount_ar : tier.amount_en}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {isAr ? tier.purpose_ar : tier.purpose_en}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        #{tier.sort_order}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingTier(tier);
                            setTierForm({ ...tier });
                            setTierModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            const ok = await confirm({
                              title: isAr ? `حذف فئة ${tier.category_ar}؟` : `Delete tier?`,
                              description: isAr ? "لن يتم حذف المساهمات السابقة المرتبطة بها." : "Past records are kept.",
                              tone: "destructive",
                            });
                            if (ok) {
                              const updated = config.tiers.filter((t) => t.id !== tier.id);
                              const nextConfig = { ...config, tiers: updated };
                              setConfig(nextConfig);
                              handleSaveConfig(nextConfig);
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Fund Purposes / Spending Categories */}
          <Card className="border-border bg-card rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  {isAr ? "أوجه الصرف وصناديق التخصيص" : "Fund Allocation Purposes"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr
                    ? "تظهر هذه الصناديق في القائمة المنسدلة لنموذج المساهمة والتقارير المالية"
                    : "Appears in dropdown choices on contribution form and audit reports"}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPurpose(null);
                  setPurposeForm({
                    id: `fund-${Date.now()}`,
                    name_ar: "",
                    name_en: "",
                    description_ar: "",
                    description_en: "",
                    is_active: true,
                  });
                  setPurposeModalOpen(true);
                }}
                className="h-8 text-xs font-bold gap-1.5 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إضافة وجه صرف / صندوق" : "Add Fund Category"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.fund_purposes.map((fund) => (
                  <div
                    key={fund.id}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col justify-between bg-card/60 transition-all",
                      fund.is_active ? "border-border shadow-xs" : "border-border/40 opacity-60",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {isAr ? fund.name_ar : fund.name_en}
                        </span>
                        <Switch
                          checked={fund.is_active}
                          onCheckedChange={(val) => {
                            const updated = config.fund_purposes.map((f) =>
                              f.id === fund.id ? { ...f, is_active: val } : f,
                            );
                            const nextConfig = { ...config, fund_purposes: updated };
                            setConfig(nextConfig);
                            handleSaveConfig(nextConfig);
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isAr ? fund.description_ar : fund.description_en}
                      </p>
                    </div>

                    <div className="pt-2 mt-3 border-t border-border/60 flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingPurpose(fund);
                          setPurposeForm({ ...fund });
                          setPurposeModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          const ok = await confirm({
                            title: isAr ? `حذف ${fund.name_ar}؟` : `Delete fund purpose?`,
                            description: isAr ? "سيتم إخفاؤه من خيارات المساهمة." : "Will be removed from form options.",
                            tone: "destructive",
                          });
                          if (ok) {
                            const updated = config.fund_purposes.filter((f) => f.id !== fund.id);
                            const nextConfig = { ...config, fund_purposes: updated };
                            setConfig(nextConfig);
                            handleSaveConfig(nextConfig);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Quick Amounts & Application of Funds Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-gold" />
                  {isAr ? "أزرار المبالغ السريعة في النموذج (ريال)" : "Quick Amount Preset Chips"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr ? "مبالغ الاختيار السريع بنقرة واحدة" : "Amounts clickable on contribute form"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {config.quick_amounts.map((amt, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl border border-border bg-secondary/50 font-mono font-bold text-xs flex items-center gap-2"
                    >
                      <span>{amt} ريال</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.quick_amounts.filter((_, i) => i !== idx);
                          const nextConfig = { ...config, quick_amounts: updated };
                          setConfig(nextConfig);
                          handleSaveConfig(nextConfig);
                        }}
                        className="text-muted-foreground hover:text-destructive text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    id="new-quick-amount"
                    type="number"
                    placeholder="مبلغ جديد..."
                    className="h-9 text-xs rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = Number((e.target as HTMLInputElement).value);
                        if (val > 0 && !config.quick_amounts.includes(val)) {
                          const updated = [...config.quick_amounts, val].sort((a, b) => a - b);
                          const nextConfig = { ...config, quick_amounts: updated };
                          setConfig(nextConfig);
                          handleSaveConfig(nextConfig);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 text-xs font-bold rounded-xl"
                    onClick={() => {
                      const input = document.getElementById("new-quick-amount") as HTMLInputElement;
                      const val = Number(input?.value);
                      if (val > 0 && !config.quick_amounts.includes(val)) {
                        const updated = [...config.quick_amounts, val].sort((a, b) => a - b);
                        const nextConfig = { ...config, quick_amounts: updated };
                        setConfig(nextConfig);
                        handleSaveConfig(nextConfig);
                        if (input) input.value = "";
                      }
                    }}
                  >
                    {isAr ? "إضافة" : "Add"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {isAr ? "بيان أين تذهب المساهمات والحوكمة" : "Application of Funds Statement"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAr ? "النصوص التوضيحية للشفافية المالية" : "Financial transparency paragraphs"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={3}
                  value={config.application_of_funds.p1_ar}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      application_of_funds: { ...config.application_of_funds, p1_ar: e.target.value },
                    })
                  }
                  className="rounded-xl text-xs resize-none"
                  placeholder="الفقرة الأولى (عربي)..."
                />
                <Textarea
                  rows={2}
                  value={config.application_of_funds.p2_ar}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      application_of_funds: { ...config.application_of_funds, p2_ar: e.target.value },
                    })
                  }
                  className="rounded-xl text-xs resize-none"
                  placeholder="الفقرة الثانية (عربي)..."
                />
                <Button
                  onClick={() => handleSaveConfig(config)}
                  disabled={savingConfig}
                  size="sm"
                  className="w-full font-bold text-xs rounded-xl"
                >
                  {isAr ? "حفظ نصوص الحوكمة" : "Save Statements"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANUAL CONTRIBUTION ENTRY                                          */}
      {/* ========================================================================= */}
      <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              {isAr ? "تسجيل مساهمة يدوية / نقدية" : "Record Offline Contribution"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isAr
                ? "تسجيل المساهمات المستلمة نقداً في اللقاءات، أو عبر التحويلات المباشرة والشيكات."
                : "Log cash, direct bank deposit, or in-person contributions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">
                {isAr ? "اسم المساهم الكامل *" : "Contributor Name *"}
              </label>
              <Input
                value={manualForm.contributor_name}
                onChange={(e) => setManualForm({ ...manualForm, contributor_name: e.target.value })}
                placeholder="مثال: عبدالله بن فهد آل بوعبيد"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  {isAr ? "المبلغ (بالريال السعودي) *" : "Amount (SAR) *"}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  {isAr ? "وسيلة الدفع *" : "Payment Method *"}
                </label>
                <Select
                  value={manualForm.method}
                  onValueChange={(val: any) => setManualForm({ ...manualForm, method: val })}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">{isAr ? "تحويل بنكي مباشر" : "Bank Transfer"}</SelectItem>
                    <SelectItem value="cash">{isAr ? "نقداً في اللقاء / مجلس الأسرة" : "Cash / Majlis"}</SelectItem>
                    <SelectItem value="pos">{isAr ? "شبكة POS / بطاقة" : "POS Card"}</SelectItem>
                    <SelectItem value="other">{isAr ? "وسيلة أخرى" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">
                {isAr ? "الغرض / الحساب المخصص *" : "Purpose / Allocation Fund *"}
              </label>
              <Select
                value={manualForm.purpose || ""}
                onValueChange={(val) => setManualForm({ ...manualForm, purpose: val })}
              >
                <SelectTrigger className="rounded-xl text-xs">
                  <SelectValue placeholder={isAr ? "اختر الصندوق..." : "Select Fund..."} />
                </SelectTrigger>
                <SelectContent>
                  {config.fund_purposes.map((f) => (
                    <SelectItem key={f.id} value={f.name_ar}>
                      {isAr ? f.name_ar : f.name_en}
                    </SelectItem>
                  ))}
                  <SelectItem value="مشروع المقر الدائم">مشروع المقر الدائم</SelectItem>
                  <SelectItem value="أخرى">أخرى / مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  {isAr ? "رقم المرجع / الإيصال" : "Reference / Receipt No."}
                </label>
                <Input
                  value={manualForm.reference || ""}
                  onChange={(e) => setManualForm({ ...manualForm, reference: e.target.value })}
                  placeholder="TX-12345"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  {isAr ? "حالة المعاملة" : "Status"}
                </label>
                <Select
                  value={manualForm.status}
                  onValueChange={(val: any) => setManualForm({ ...manualForm, status: val })}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">{isAr ? "معتمدة فوراً" : "Verified Immediately"}</SelectItem>
                    <SelectItem value="pending">{isAr ? "قيد المراجعة" : "Pending Review"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">
                {isAr ? "ملاحظة الخزينة والتوثيق" : "Treasury Review Note"}
              </label>
              <Input
                value={manualForm.review_note || ""}
                onChange={(e) => setManualForm({ ...manualForm, review_note: e.target.value })}
                placeholder={isAr ? "ملاحظة تدقيق..." : "Audit note..."}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setManualModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={handleCreateManualContribution}
              disabled={savingManual}
              className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground"
            >
              {savingManual && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isAr ? "حفظ المساهمة في السجل" : "Save Contribution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TIER ADD / EDIT                                                    */}
      {/* ========================================================================= */}
      <Dialog open={tierModalOpen} onOpenChange={setTierModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingTier
                ? isAr
                  ? "تعديل فئة الاشتراك"
                  : "Edit Subscription Plan"
                : isAr
                  ? "إضافة فئة اشتراك جديدة"
                  : "Add New Subscription Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold">{isAr ? "اسم الفئة (عربي) *" : "Tier Title (AR) *"}</label>
              <Input
                value={tierForm.category_ar}
                onChange={(e) => setTierForm({ ...tierForm, category_ar: e.target.value })}
                placeholder="مثال: اشتراك العضو البالغ"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "اسم الفئة (إنجليزي) *" : "Tier Title (EN) *"}</label>
              <Input
                value={tierForm.category_en}
                onChange={(e) => setTierForm({ ...tierForm, category_en: e.target.value })}
                placeholder="e.g. Adult member"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold">{isAr ? "النص المعروض للمبلغ (عربي)" : "Display Amount (AR)"}</label>
                <Input
                  value={tierForm.amount_ar}
                  onChange={(e) => setTierForm({ ...tierForm, amount_ar: e.target.value })}
                  placeholder="١٠٠ ريال"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">{isAr ? "النص المعروض (إنجليزي)" : "Display Amount (EN)"}</label>
                <Input
                  value={tierForm.amount_en}
                  onChange={(e) => setTierForm({ ...tierForm, amount_en: e.target.value })}
                  placeholder="SAR 100"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold">{isAr ? "المبلغ الرقمي (ريال)" : "Numeric Amount (SAR)"}</label>
                <Input
                  type="number"
                  value={tierForm.numeric_amount}
                  onChange={(e) => setTierForm({ ...tierForm, numeric_amount: Number(e.target.value) })}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">{isAr ? "الدورية" : "Frequency"}</label>
                <Select
                  value={tierForm.frequency}
                  onValueChange={(val: any) => setTierForm({ ...tierForm, frequency: val })}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{isAr ? "شهرياً" : "Monthly"}</SelectItem>
                    <SelectItem value="annual">{isAr ? "سنوياً" : "Annual"}</SelectItem>
                    <SelectItem value="one_off">{isAr ? "دفعة واحدة" : "One-off"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "الغرض والهدف (عربي)" : "Purpose (AR)"}</label>
              <Input
                value={tierForm.purpose_ar}
                onChange={(e) => setTierForm({ ...tierForm, purpose_ar: e.target.value })}
                placeholder="التشغيل وبرامج التكافل"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "الغرض (إنجليزي)" : "Purpose (EN)"}</label>
              <Input
                value={tierForm.purpose_en}
                onChange={(e) => setTierForm({ ...tierForm, purpose_en: e.target.value })}
                placeholder="Operations and solidarity"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTierModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!tierForm.category_ar || !tierForm.amount_ar) {
                  toast.error(isAr ? "يرجى استكمال البيانات" : "Please fill required fields");
                  return;
                }
                const exists = config.tiers.some((t) => t.id === tierForm.id);
                const updatedTiers = exists
                  ? config.tiers.map((t) => (t.id === tierForm.id ? tierForm : t))
                  : [...config.tiers, tierForm];
                const nextConfig = { ...config, tiers: updatedTiers };
                setConfig(nextConfig);
                handleSaveConfig(nextConfig);
                setTierModalOpen(false);
              }}
              className="rounded-xl text-xs font-bold"
            >
              {isAr ? "حفظ الفئة" : "Save Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: FUND PURPOSE ADD / EDIT                                            */}
      {/* ========================================================================= */}
      <Dialog open={purposeModalOpen} onOpenChange={setPurposeModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingPurpose
                ? isAr
                  ? "تعديل صندوق أو وجه صرف"
                  : "Edit Fund Category"
                : isAr
                  ? "إضافة صندوق أو وجه صرف جديد"
                  : "Add Fund Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold">{isAr ? "اسم الصندوق / الغرض (عربي) *" : "Fund Name (AR) *"}</label>
              <Input
                value={purposeForm.name_ar}
                onChange={(e) => setPurposeForm({ ...purposeForm, name_ar: e.target.value })}
                placeholder="مثال: حساب الزكاة والصدقات"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "اسم الصندوق (إنجليزي) *" : "Fund Name (EN) *"}</label>
              <Input
                value={purposeForm.name_en}
                onChange={(e) => setPurposeForm({ ...purposeForm, name_en: e.target.value })}
                placeholder="e.g. Zakat & Charity Fund"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "الوصف ومجال الصرف (عربي)" : "Description (AR)"}</label>
              <Textarea
                rows={2}
                value={purposeForm.description_ar || ""}
                onChange={(e) => setPurposeForm({ ...purposeForm, description_ar: e.target.value })}
                placeholder="توجيه الأموال لمستحقيها..."
                className="rounded-xl text-xs resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold">{isAr ? "الوصف (إنجليزي)" : "Description (EN)"}</label>
              <Textarea
                rows={2}
                value={purposeForm.description_en || ""}
                onChange={(e) => setPurposeForm({ ...purposeForm, description_en: e.target.value })}
                placeholder="Dedicated charity account..."
                className="rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPurposeModalOpen(false)}
              className="rounded-xl text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!purposeForm.name_ar) {
                  toast.error(isAr ? "يرجى كتابة الاسم" : "Please enter name");
                  return;
                }
                const exists = config.fund_purposes.some((f) => f.id === purposeForm.id);
                const updatedPurposes = exists
                  ? config.fund_purposes.map((f) => (f.id === purposeForm.id ? purposeForm : f))
                  : [...config.fund_purposes, purposeForm];
                const nextConfig = { ...config, fund_purposes: updatedPurposes };
                setConfig(nextConfig);
                handleSaveConfig(nextConfig);
                setPurposeModalOpen(false);
              }}
              className="rounded-xl text-xs font-bold"
            >
              {isAr ? "حفظ الصندوق" : "Save Fund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* SIDE DRAWER: TRANSACTION REVIEW                                           */}
      {/* ========================================================================= */}
      <Sheet
        open={!!selectedContribution}
        onOpenChange={(open) => !open && setSelectedContribution(null)}
      >
        <SheetContent
          side={isAr ? "left" : "right"}
          className="w-full sm:max-w-md p-0 flex flex-col border-border gap-0"
        >
          {selectedContribution && (
            <>
              <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div>
                  <SheetTitle className="text-base font-bold">
                    {isAr ? "تفاصيل المعاملة المالية" : "Transaction Details"}
                  </SheetTitle>
                  <SheetDescription className="text-[11px] font-mono mt-0.5">
                    Ref: {selectedContribution.reference || selectedContribution.id.split("-")[0]}
                  </SheetDescription>
                </div>
                {getStatusDisplay(selectedContribution.status)}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Contributor Card */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    {isAr ? "المساهم" : "Contributor"}
                  </span>
                  <span className="text-base font-bold text-foreground block">
                    {selectedContribution.contributor_name}
                  </span>
                  {selectedContribution.phone && (
                    <span className="text-xs font-mono text-muted-foreground block">
                      {selectedContribution.phone}
                    </span>
                  )}
                  {selectedContribution.email && (
                    <span className="text-xs text-muted-foreground block">
                      {selectedContribution.email}
                    </span>
                  )}
                </div>

                {/* Amount & Particulars */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                      {isAr ? "المبلغ" : "Amount"}
                    </span>
                    <span className="text-2xl font-black font-mono text-foreground block">
                      {formatSar(selectedContribution.amount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                      {isAr ? "التاريخ" : "Date"}
                    </span>
                    <span className="text-xs font-medium text-foreground block">
                      {new Date(selectedContribution.created_at).toLocaleDateString(
                        isAr ? "ar-SA" : "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                      {isAr ? "وسيلة الدفع" : "Method"}
                    </span>
                    <span className="text-xs font-medium text-foreground block">
                      {getMethodLabel(selectedContribution.method)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">
                      {isAr ? "الغرض / الحساب" : "Purpose"}
                    </span>
                    <span className="text-xs font-medium text-foreground block">
                      {selectedContribution.purpose || (isAr ? "اشتراك عام" : "General")}
                    </span>
                  </div>
                </div>

                {/* Receipt Section */}
                <div className="border border-border rounded-xl p-4 bg-muted/10">
                  <span className="text-xs font-bold text-foreground flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {isAr ? "إشعار التحويل البنكي (المرفق)" : "Attached Transfer Receipt"}
                  </span>
                  {selectedContribution.receipt_path ? (
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 rounded-xl bg-background text-xs font-bold"
                      onClick={() => handleOpenReceipt(selectedContribution.receipt_path!)}
                    >
                      <span>{isAr ? "فتح صورة / مستند الإيصال" : "View Receipt Document"}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  ) : (
                    <div className="h-10 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-background/50">
                      {isAr ? "لا يوجد إشعار تحويل مرفق" : "No receipt attached"}
                    </div>
                  )}
                </div>

                {/* Treasury Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    {isAr ? "ملاحظة التدقيق والاعتماد (اختياري)" : "Treasury Audit Note (Optional)"}
                  </label>
                  <Textarea
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder={
                      isAr
                        ? "اكتب رقم مرجع التحويل أو أي ملاحظة للتوثيق المالي..."
                        : "Add transaction reference or notes..."
                    }
                    className="resize-none rounded-xl bg-background text-xs"
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
                      className="flex-1 h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent font-bold text-xs"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isAr ? "رفض" : "Reject"}
                    </Button>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={() => handleReviewSubmit("verified")}
                      className="flex-[2] h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm"
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isAr ? (
                        "اعتماد وتوثيق المعاملة"
                      ) : (
                        "Verify & Approve"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-xl font-bold text-xs"
                    onClick={() => setSelectedContribution(null)}
                  >
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

