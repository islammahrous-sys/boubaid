import { useState, useMemo, type KeyboardEvent } from "react";
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
  ArrowRight,
  Plus,
  Layers,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Database,
  Megaphone,
  UserCheck,
  Clock,
} from "lucide-react";

export type DashboardOverviewProps = {
  overviewData: {
    /** Documented individuals in the genealogy (`family_members`). */
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    /** Website accounts (`profiles`). */
    totalUsers: number;
    /** Website accounts with an approved membership (`member` role). */
    approvedMembers: number;
    pendingInquiries: number;
    totalArticles: number;
    draftArticles: number;
    totalEvents: number;
    pendingReceipts: number;
    pendingVerifications: number;
    totalBusinesses: number;
    totalInitiatives: number;
    totalAchievers: number;
    treasuryVerified: number;
    pendingMembersWithoutRoles?: number;
    healthScore?: number;
    recentActivity: Array<{
      id: string;
      action: string;
      entity_type: string;
      created_at: string;
      actor_user_id?: string | null;
    }>;
  };
  onNavigateTab: (domainId: string, tabId: string) => void;
  onQuickAction: (actionId: string) => void;
};

export function AdminDashboardOverview({
  overviewData,
  onNavigateTab,
  onQuickAction,
}: DashboardOverviewProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [activityCategory, setActivityCategory] = useState<string>("all");

  const totalNeedsAttention =
    overviewData.pendingReceipts +
    overviewData.pendingVerifications +
    overviewData.pendingInquiries +
    overviewData.draftArticles;

  /** The KPI/entity tiles navigate on click but are plain <div>s, so without
   *  this they are unreachable by keyboard and announced as static text rather
   *  than as controls. Spread onto every clickable tile. */
  const tileActivation = (onActivate: () => void, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  });

  const filteredActivity = useMemo(() => {
    if (activityCategory === "all") return overviewData.recentActivity;
    return overviewData.recentActivity.filter((act) => {
      const type = act.entity_type.toLowerCase();
      if (activityCategory === "family")
        return type.includes("member") || type.includes("branch") || type.includes("tree");
      if (activityCategory === "treasury")
        return (
          type.includes("treasury") || type.includes("contribution") || type.includes("initiative")
        );
      if (activityCategory === "content")
        return (
          type.includes("article") ||
          type.includes("event") ||
          type.includes("page") ||
          type.includes("announcement")
        );
      if (activityCategory === "system")
        return type.includes("user") || type.includes("role") || type.includes("setting");
      return true;
    });
  }, [overviewData.recentActivity, activityCategory]);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return isAr ? "الآن" : "just now";
    if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  const treasuryTarget = 500000;
  const treasuryPercentage = Math.min(
    100,
    Math.round((overviewData.treasuryVerified / treasuryTarget) * 100),
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP GREETING & COMMAND HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-card via-card to-primary/5 border border-border p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              {isAr ? "مرحباً بك في مركز الإدارة" : "Welcome to the Administration Hub"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "هذه نظرة عامة تشغيلية على ما يجري وما يحتاج انتباهك اليوم."
                : "Here is your operational overview of what's happening and what needs your attention today."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-card/90 backdrop-blur-xs px-3 py-1 rounded-xl border border-border shadow-2xs">
              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                {overviewData.healthScore ?? 94}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {isAr ? "اكتمال الحوكمة الإدارية" : "Operational Health"}
              </span>
            </div>

            {totalNeedsAttention > 0 ? (
              <Badge
                variant="destructive"
                className="gap-1 font-bold px-3 py-1 rounded-xl animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {totalNeedsAttention} {isAr ? "عنصر يحتاج مراجعة" : "items need attention"}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1 font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isAr ? "كل شيء تحت السيطرة" : "All caught up"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          {isAr ? "إجراءات سريعة" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <Button
            onClick={() => {
              onNavigateTab("family", "members");
              onQuickAction("add_member");
            }}
            className="h-12 bg-primary/10 hover:bg-primary/20 text-primary border-0 shadow-none font-bold justify-start gap-3 rounded-xl transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm">{isAr ? "إضافة عضو" : "Add Member"}</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("content", "announcements")}
            className="h-12 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0 shadow-none font-bold justify-start gap-3 rounded-xl transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            {/* Opens the announcements tab -- the push-notification broadcaster
                lives in the header's notification centre, not here. */}
            <span className="text-sm">{isAr ? "الإعلانات" : "Announcements"}</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("system", "users")}
            className="h-12 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-0 shadow-none font-bold justify-start gap-3 rounded-xl transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-sm">{isAr ? "مراجعة الطلبات" : "Review Requests"}</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("treasury", "treasury_ledger")}
            className="h-12 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0 shadow-none font-bold justify-start gap-3 rounded-xl transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="text-sm">{isAr ? "سجل الخزينة" : "Treasury Ledger"}</span>
          </Button>

          <Button
            onClick={() => onNavigateTab("community", "inquiries")}
            className="h-12 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-0 shadow-none font-bold justify-start gap-3 rounded-xl transition-all hidden lg:flex"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-sm">{isAr ? "صندوق الوارد" : "Inbox"}</span>
          </Button>
        </div>
      </div>

      {/* 3. NEEDS ATTENTION TRIAGE PANEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">
              {isAr ? "بحاجة إلى انتباهك" : "Needs Your Attention"}
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
              {isAr
                ? "ممتاز! لا توجد عناصر معلّقة بحاجة إلى مراجعة."
                : "All caught up! No pending items require review."}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
              {isAr
                ? "تم الرد على جميع الاستفسارات، واعتماد مساهمات الخزينة، ومراجعة طلبات العضوية."
                : "All inquiries are resolved, treasury contributions verified, and membership applications reviewed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Pending Receipts */}
            {overviewData.pendingReceipts > 0 && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-600 border-amber-500/40"
                  >
                    {isAr ? "الخزينة" : "Treasury"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-amber-600">
                    {overviewData.pendingReceipts}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "إيصالات معلّقة" : "Pending Receipts"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "بحاجة لمطابقة بنكية" : "Requires bank match"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("treasury", "treasury_ledger")}
                  className="w-full text-xs h-8 justify-between border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                >
                  <span>{isAr ? "مراجعة" : "Review"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 2. Pending Membership Requests */}
            {overviewData.pendingVerifications > 0 && (
              <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/40">
                    {isAr ? "التحقق" : "Verification"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-blue-600">
                    {overviewData.pendingVerifications}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "طلبات جديدة" : "New Applications"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "بانتظار تأكيد الهوية" : "Awaiting identity confirmation"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("system", "users")}
                  className="w-full text-xs h-8 justify-between border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/10"
                >
                  <span>{isAr ? "مراجعة الطلبات" : "Review"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 3. New Inquiries */}
            {overviewData.pendingInquiries > 0 && (
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-indigo-600 border-indigo-500/40"
                  >
                    {isAr ? "الاستفسارات" : "Inquiries"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-indigo-600">
                    {overviewData.pendingInquiries}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "رسائل غير مقروءة" : "Unread Messages"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "من نموذج التواصل العام" : "From public form"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("community", "inquiries")}
                  className="w-full text-xs h-8 justify-between border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <span>{isAr ? "فتح صندوق الوارد" : "Open Inbox"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 4. Draft Articles */}
            {overviewData.draftArticles > 0 && (
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-purple-600 border-purple-500/40"
                  >
                    {isAr ? "المحتوى" : "Content"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-purple-600">
                    {overviewData.draftArticles}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "مقالات مسودة" : "Draft Articles"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr ? "جاهزة للنشر" : "Ready to publish"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("content", "articles")}
                  className="w-full text-xs h-8 justify-between border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                >
                  <span>{isAr ? "إدارة المقالات" : "Manage"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}

            {/* 5. Members Without Roles */}
            {(overviewData.pendingMembersWithoutRoles ?? 0) > 0 && (
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/40">
                    {isAr ? "الحوكمة" : "Governance"}
                  </Badge>
                  <span className="text-xs font-bold font-mono text-rose-600">
                    {overviewData.pendingMembersWithoutRoles}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {isAr ? "أعضاء بدون أدوار تشغيلية" : "Members Without Roles"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {isAr
                      ? "عضويات موثقة بانتظار تحديد الصلاحيات"
                      : "Approved members awaiting roles"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigateTab("system", "users")}
                  className="w-full text-xs h-8 justify-between border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                >
                  <span>{isAr ? "إسناد الصلاحيات" : "Assign Roles"}</span>
                  <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. OVERVIEW STATISTICS (EXECUTIVE KPI CARDS) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          {isAr ? "نظرة عامة على المنصة" : "Platform Overview"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
          {/* Documented family members (genealogy) */}
          <div
            {...tileActivation(
              () => onNavigateTab("family", "members"),
              isAr ? "عرض أفراد الأسرة الموثقين" : "View documented family members",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">
                {isAr ? "أفراد الأسرة الموثقون" : "Documented Members"}
              </span>
              <Users className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalMembers}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {isAr ? "في المشجرة الرسمية" : "in the official tree"}
            </div>
          </div>

          {/* Registered website accounts */}
          <div
            {...tileActivation(
              () => onNavigateTab("system", "users"),
              isAr ? "عرض المستخدمين والحسابات" : "View user accounts",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">
                {isAr ? "المستخدمون المسجلون" : "Registered Users"}
              </span>
              <UserCheck className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalUsers}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
              {overviewData.approvedMembers} {isAr ? "عضو معتمد" : "approved members"}
            </div>
          </div>

          {/* Treasury SAR */}
          <div
            {...tileActivation(
              () => onNavigateTab("treasury", "treasury_ledger"),
              isAr ? "عرض سجل الخزينة" : "View treasury ledger",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">
                {isAr ? "أموال الخزينة" : "Treasury Funds"}
              </span>
              <Landmark className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", { maximumFractionDigits: 0 }).format(
                overviewData.treasuryVerified,
              )}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-1">
              {isAr ? "ريال سعودي معتمد" : "SAR verified"}
            </div>
          </div>

          {/* Business Directory */}
          <div
            {...tileActivation(
              () => onNavigateTab("community", "directory"),
              isAr ? "عرض دليل المنشآت" : "View business directory",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">{isAr ? "المنشآت" : "Businesses"}</span>
              <Building2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalBusinesses}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
              {isAr ? "منشأة مسجّلة" : "listings"}
            </div>
          </div>

          {/* Initiatives */}
          <div
            {...tileActivation(
              () => onNavigateTab("treasury", "initiatives"),
              isAr ? "عرض المبادرات" : "View initiatives",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">{isAr ? "المبادرات" : "Initiatives"}</span>
              <Rocket className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalInitiatives}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              {isAr ? "مشروع نشط" : "active projects"}
            </div>
          </div>

          {/* Achievers */}
          <div
            {...tileActivation(
              () => onNavigateTab("treasury", "achievers"),
              isAr ? "عرض لوحة الشرف" : "View roll of honour",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">{isAr ? "المتميزون" : "Achievers"}</span>
              <Award className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalAchievers}
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
              {isAr ? "متميز مكرّم" : "honorees"}
            </div>
          </div>

          {/* Articles */}
          <div
            {...tileActivation(
              () => onNavigateTab("content", "articles"),
              isAr ? "عرض المقالات" : "View articles",
            )}
            className="p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">{isAr ? "المقالات" : "Articles"}</span>
              <FileText className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {overviewData.totalArticles}
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
              {isAr ? "منشور" : "published"}
            </div>
          </div>
        </div>
      </div>

      {/* 5. FINANCIAL TARGET & INFRASTRUCTURE HEALTH ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Financial Campaign Tracker */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-foreground">
                {isAr ? "التقدم السنوي لصندوق التنمية" : "Annual Fund Progress"}
              </h3>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-emerald-500/30 text-emerald-600"
            >
              {treasuryPercentage}%
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">{isAr ? "المحصّل:" : "Collected:"}</span>
              <span className="font-bold text-foreground">
                {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US").format(
                  overviewData.treasuryVerified,
                )}{" "}
                SAR
              </span>
            </div>
            <Progress value={treasuryPercentage} className="h-2" />
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>0 SAR</span>
              <span>
                {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US").format(treasuryTarget)} SAR{" "}
                {isAr ? "الهدف" : "Target"}
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
                {isAr ? "كيانات قاعدة البيانات" : "Database Entities"}
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isAr ? "سليمة" : "Healthy"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div
              {...tileActivation(
                () => onNavigateTab("family", "members"),
                isAr ? "عرض أفراد الأسرة" : "View family members",
              )}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Users className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
              <span className="font-bold font-mono text-sm block">{overviewData.totalMembers}</span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {isAr ? "أفراد موثقون" : "Documented"}
              </span>
            </div>
            <div
              {...tileActivation(
                () => onNavigateTab("content", "articles"),
                isAr ? "عرض المقالات" : "View articles",
              )}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <FileText className="w-3.5 h-3.5 mx-auto text-indigo-500 mb-1" />
              <span className="font-bold font-mono text-sm block">
                {overviewData.totalArticles}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {isAr ? "المقالات" : "Articles"}
              </span>
            </div>
            <div
              {...tileActivation(
                () => onNavigateTab("content", "events"),
                isAr ? "عرض الفعاليات" : "View events",
              )}
              className="p-2.5 rounded-xl border border-border/50 hover:border-primary/40 bg-muted/20 cursor-pointer transition-colors text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Calendar className="w-3.5 h-3.5 mx-auto text-purple-500 mb-1" />
              <span className="font-bold font-mono text-sm block">{overviewData.totalEvents}</span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {isAr ? "الفعاليات" : "Events"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. FILTERABLE RECENT ACTIVITY STREAM */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">
              {isAr ? "النشاط الأخير" : "Recent Activity"}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label_ar: "الكل", label_en: "All" },
              { id: "family", label_ar: "الأسرة", label_en: "Family" },
              { id: "treasury", label_ar: "الخزينة", label_en: "Treasury" },
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
          </div>
        </div>

        <div className="divide-y divide-border/40 max-h-80 overflow-y-auto pr-2">
          {filteredActivity.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              {isAr
                ? "لا يوجد نشاط حديث لهذه الفئة."
                : "No recent activity found for this category."}
            </p>
          ) : (
            filteredActivity.map((act) => (
              <div key={act.id} className="py-3 flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/40 shrink-0" />
                <div className="flex-1 space-y-0.5 min-w-0">
                  <p className="text-xs text-foreground font-medium truncate">
                    {act.action}{" "}
                    <span className="text-muted-foreground font-normal">({act.entity_type})</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(act.created_at)}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
