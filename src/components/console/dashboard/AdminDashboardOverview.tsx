import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building2,
  Landmark,
  Rocket,
  Award,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  Layers,
  Calendar,
  FileText,
  ShieldAlert,
  FolderArchive,
  Eye,
  TrendingUp,
  Activity,
  Database,
  Filter,
  Check,
  Shield,
  Megaphone,
} from "lucide-react";

export type DashboardOverviewProps = {
  overviewData: {
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    pendingInquiries: number;
    publishedArticles: number;
    draftArticles: number;
    upcomingEvents: number;
    recentActivity: Array<{
      id: string;
      action: string;
      entity_type: string;
      created_at: string;
      actor_user_id?: string | null;
    }>;
  };
  treasuryData?: {
    verifiedTotal: number;
    pendingTotal: number;
    contributions: any[];
  };
  directoryData?: {
    businesses: any[];
    membershipRequests: any[];
  };
  articlesData?: {
    articles: any[];
  };
  eventsData?: {
    events: any[];
  };
  initiativesData?: any[];
  achieversData?: any[];
  onNavigateTab: (domainId: string, tabId: string) => void;
  onQuickAction: (actionId: string) => void;
};

export function AdminDashboardOverview({
  overviewData,
  treasuryData,
  directoryData,
  articlesData,
  eventsData,
  initiativesData,
  achieversData,
  onNavigateTab,
  onQuickAction,
}: DashboardOverviewProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [activityCategory, setActivityCategory] = useState<string>("all");

  // Attention Items calculation
  const pendingReceiptsCount = useMemo(
    () => (treasuryData?.contributions ?? []).filter((c) => c.status === "pending").length,
    [treasuryData]
  );

  const pendingMembershipCount = useMemo(
    () => (directoryData?.membershipRequests ?? []).filter((r) => r.status === "pending").length,
    [directoryData]
  );

  const draftArticlesCount = useMemo(
    () => (articlesData?.articles ?? []).filter((a) => a.status === "draft").length,
    [articlesData]
  );

  const pendingInquiriesCount = overviewData.pendingInquiries;

  const totalNeedsAttention =
    pendingReceiptsCount + pendingMembershipCount + draftArticlesCount + pendingInquiriesCount;

  // Filtered recent activity
  const filteredActivity = useMemo(() => {
    if (activityCategory === "all") return overviewData.recentActivity;
    return overviewData.recentActivity.filter((act) => {
      const type = act.entity_type.toLowerCase();
      if (activityCategory === "family") return type.includes("member") || type.includes("branch") || type.includes("tree");
      if (activityCategory === "treasury") return type.includes("treasury") || type.includes("contribution") || type.includes("initiative");
      if (activityCategory === "content") return type.includes("article") || type.includes("event") || type.includes("page") || type.includes("announcement");
      if (activityCategory === "system") return type.includes("user") || type.includes("role") || type.includes("setting");
      return true;
    });
  }, [overviewData.recentActivity, activityCategory]);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return isAr ? "الآن" : "just now";
    if (diffMins < 60) return isAr ? `قبل ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isAr ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
    return isAr ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  };

  const treasuryTarget = 500000; // Target in SAR
  const treasuryVerified = treasuryData?.verifiedTotal ?? 0;
  const treasuryPercentage = Math.min(100, Math.round((treasuryVerified / treasuryTarget) * 100));

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETING & COMMAND HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-card via-card to-primary/5 border border-border p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold tracking-wider uppercase border-primary/30 text-primary">
                {isAr ? "مركز القيادة الموحد" : "Executive Command Center"}
              </Badge>
              {totalNeedsAttention > 0 ? (
                <Badge variant="destructive" className="text-[10px] gap-1 font-mono animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {totalNeedsAttention} {isAr ? "مهام تتطلب المتابعة" : "items need attention"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {isAr ? "كافة الأنظمة مستقرة ومحدثة" : "All systems operational"}
                </Badge>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              {isAr ? "لوحة أمانة المجلس العام — أسرة آل بوعبيد" : "Al Bu Obaid Council Administration"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "مرحباً بك في المنظومة الإدارية المتكاملة لإدارة شجرة الأنساب، الخزينة، دليل المنشآت، المحتوى، والرقابة."
                : "Welcome to the unified operations hub managing genealogy, treasury, business directory, CMS, and governance."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={() => {
                onNavigateTab("family", "members");
                onQuickAction("add_member");
              }}
              className="h-9 text-xs gap-2 font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة فرد جديد" : "Add Member"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("content", "homepage")}
              className="h-9 text-xs gap-2 text-foreground hover:bg-muted"
            >
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>{isAr ? "إدارة الرئيسية" : "Homepage CMS"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Family Members */}
        <div
          onClick={() => onNavigateTab("family", "members")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "أفراد الأسرة" : "Family Members"}</span>
            <Users className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {overviewData.totalMembers}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {overviewData.livingMembers} {isAr ? "أحياء" : "living"}
          </div>
        </div>

        {/* Treasury SAR */}
        <div
          onClick={() => onNavigateTab("treasury", "treasury_ledger")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "أموال الخزينة" : "Treasury Funds"}</span>
            <Landmark className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(treasuryData?.verifiedTotal ?? 0)}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium mt-1">
            {isAr ? "ريال سعودي معتمد" : "SAR verified"}
          </div>
        </div>

        {/* Business Directory */}
        <div
          onClick={() => onNavigateTab("community", "directory")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "دليل المنشآت" : "Businesses"}</span>
            <Building2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {directoryData?.businesses.length ?? 0}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
            {isAr ? "منشأة تجارية ومهنية" : "listings"}
          </div>
        </div>

        {/* Initiatives */}
        <div
          onClick={() => onNavigateTab("treasury", "initiatives")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "المشاريع والمبادرات" : "Initiatives"}</span>
            <Rocket className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {initiativesData?.length ?? 0}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            {isAr ? "مشاريع قيد التنفيذ" : "active projects"}
          </div>
        </div>

        {/* Achievers */}
        <div
          onClick={() => onNavigateTab("treasury", "achievers")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "لوحة الشرف" : "Achievers"}</span>
            <Award className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {achieversData?.length ?? 0}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
            {isAr ? "متميز ومتميزة" : "honorees"}
          </div>
        </div>

        {/* Messages */}
        <div
          onClick={() => onNavigateTab("community", "inquiries")}
          className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">{isAr ? "الرسائل الواردة" : "Inquiries"}</span>
            <MessageSquare className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {overviewData.pendingInquiries}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            {isAr ? "رسائل غير مقروءة" : "new messages"}
          </div>
        </div>
      </div>

      {/* 3. NEEDS ATTENTION TRIAGE PANEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">
              {isAr ? "عناصر تتطلب انتباه الأمانة والمتابعة" : "Needs Attention & Operational Triage"}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {totalNeedsAttention} {isAr ? "عنصر" : "items"}
          </span>
        </div>

        {totalNeedsAttention === 0 ? (
          <div className="p-6 rounded-2xl border border-border bg-card/60 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-foreground">
              {isAr ? "رائع! لا توجد مهام أو إيصالات أو طلبات معلقة حالياً" : "All caught up! No pending items require review."}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
              {isAr
                ? "كافة رسائل التواصل تم الرد عليها، والاشتراكات معتمدة، وطلبات العضوية مدققة."
                : "All inquiries are resolved, treasury contributions verified, and membership applications reviewed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Pending Receipts */}
            {pendingReceiptsCount > 0 && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/40">
                    {isAr ? "الخزينة والمساهمات" : "Treasury"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-amber-600">{pendingReceiptsCount}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "إيصالات تحويل بنكي قيد المراجعة" : "Pending Transfer Receipts"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "تتطلب التحقق من الحساب البنكي والاعتماد" : "Requires bank transaction match and approval"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("treasury", "treasury_ledger")}
                  className="w-full text-xs h-8 justify-between border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                >
                  <span>{isAr ? "مراجعة الإيصالات" : "Review Receipts"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 2. Pending Membership Requests */}
            {pendingMembershipCount > 0 && (
              <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/40">
                    {isAr ? "العضوية والتوثيق" : "Verification"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-blue-600">{pendingMembershipCount}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "طلبات توثيق نسب وعضوية" : "Membership Applications"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "أفراد من الأسرة بانتظار اعتماد ملفاتهم" : "Family members awaiting identity confirmation"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("community", "verification")}
                  className="w-full text-xs h-8 justify-between border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                >
                  <span>{isAr ? "تدقيق الطلبات" : "Review Requests"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 3. New Inquiries */}
            {pendingInquiriesCount > 0 && (
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-500/40">
                    {isAr ? "صندوق التواصل" : "Inquiries"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-indigo-600">{pendingInquiriesCount}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "رسائل جديدة واستفسارات" : "Unread Inquiries"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "رسائل واردة من النموذج العام للتواصل" : "New messages from the public contact form"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("community", "inquiries")}
                  className="w-full text-xs h-8 justify-between border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <span>{isAr ? "فتح صندوق الرسائل" : "Open Inbox"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 4. Draft Articles */}
            {draftArticlesCount > 0 && (
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/40">
                    {isAr ? "المحتوى والأخبار" : "Articles"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-purple-600">{draftArticlesCount}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "مقالات وأخبار مسودة" : "Draft Articles"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "بانتظار المراجعة والاعتماد للنشر" : "Awaiting review and publishing"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("content", "articles")}
                  className="w-full text-xs h-8 justify-between border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                >
                  <span>{isAr ? "إدارة المقالات" : "Manage Articles"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. FINANCIAL TARGET & INFRASTRUCTURE HEALTH ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Financial Campaign Tracker */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground">
                {isAr ? "مؤشر صندوق التنمية السنوي" : "Annual Fund Progress"}
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-600">
              {treasuryPercentage}%
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">{isAr ? "المحصل المعتمد:" : "Collected:"}</span>
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US").format(treasuryVerified)} SAR
              </span>
            </div>
            <Progress value={treasuryPercentage} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>0 SAR</span>
              <span>{new Intl.NumberFormat(isAr ? "ar-SA" : "en-US").format(treasuryTarget)} SAR {isAr ? "المستهدف" : "Target"}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-muted/40">
              <span className="text-[10px] text-muted-foreground block">{isAr ? "العمليات المعتمدة" : "Verified Ops"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {(treasuryData?.contributions ?? []).filter((c) => c.status === "verified").length}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-muted/40">
              <span className="text-[10px] text-muted-foreground block">{isAr ? "قيد المراجعة" : "Pending Ops"}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                {pendingReceiptsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Database Core Health Summary */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-foreground">
                {isAr ? "حالة قواعد البيانات والبيانات" : "Database Entities Health"}
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isAr ? "سليم ومحدث" : "Healthy"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              onClick={() => onNavigateTab("family", "members")}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center"
            >
              <Users className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
              <span className="font-bold font-mono text-sm block">{overviewData.totalMembers}</span>
              <span className="text-[10px] text-muted-foreground block truncate">{isAr ? "أفراد الأسرة" : "Members"}</span>
            </div>
            <div
              onClick={() => onNavigateTab("content", "articles")}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center"
            >
              <FileText className="w-3.5 h-3.5 mx-auto text-indigo-500 mb-1" />
              <span className="font-bold font-mono text-sm block">{articlesData?.articles.length ?? 0}</span>
              <span className="text-[10px] text-muted-foreground block truncate">{isAr ? "المقالات" : "Articles"}</span>
            </div>
            <div
              onClick={() => onNavigateTab("content", "events")}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center"
            >
              <Calendar className="w-3.5 h-3.5 mx-auto text-purple-500 mb-1" />
              <span className="font-bold font-mono text-sm block">{eventsData?.events.length ?? 0}</span>
              <span className="text-[10px] text-muted-foreground block truncate">{isAr ? "الفعاليات" : "Events"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>{isAr ? "مستوى التشفير والأمان:" : "Security Layer:"}</span>
            <span className="font-mono font-bold text-foreground">RLS + RBAC Active</span>
          </div>
        </div>

        {/* Quick Operational Shortcuts */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {isAr ? "إجراءات سريعة ومباشرة" : "Quick Operations"}
          </h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between text-xs h-9 rounded-xl"
              onClick={() => onNavigateTab("family", "tree")}
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                {isAr ? "استعراض شجرة العائلة التفاعلية" : "Open Interactive Family Tree"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between text-xs h-9 rounded-xl"
              onClick={() => onNavigateTab("content", "announcements")}
            >
              <span className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                {isAr ? "بث إعلان عاجل وشريط الأخبار" : "Broadcast Announcement"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between text-xs h-9 rounded-xl"
              onClick={() => onNavigateTab("system", "roles_matrix")}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                {isAr ? "مصفوفة الصلاحيات والأدوار (RBAC)" : "Permissions & Access Control"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* 5. FILTERABLE RECENT ACTIVITY STREAM */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">
              {isAr ? "سجل العمليات والرقابة الفورية المباشرة" : "Live Security & Operational Activity Stream"}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label_ar: "الكل", label_en: "All" },
              { id: "family", label_ar: "الأسرة", label_en: "Family" },
              { id: "treasury", label_ar: "المالية", label_en: "Treasury" },
              { id: "content", label_ar: "المحتوى", label_en: "Content" },
              { id: "system", label_ar: "النظام", label_en: "System" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={activityCategory === cat.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5 rounded-lg"
                onClick={() => setActivityCategory(cat.id)}
              >
                {isAr ? cat.label_ar : cat.label_en}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-7 ms-2"
              onClick={() => onNavigateTab("system", "audit_logs")}
            >
              {isAr ? "السجل الكامل" : "Full Log"}
              <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180" />
            </Button>
          </div>
        </div>

        <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
          {filteredActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              {isAr ? "لا توجد عمليات مسجلة بهذا التصنيف" : "No activity recorded for this filter"}
            </p>
          ) : (
            filteredActivity.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-muted/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Badge variant="outline" className="text-[9px] uppercase font-mono font-bold">
                    {act.action}
                  </Badge>
                  <span className="font-semibold text-foreground truncate">{act.entity_type}</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                  {formatTimeAgo(act.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
