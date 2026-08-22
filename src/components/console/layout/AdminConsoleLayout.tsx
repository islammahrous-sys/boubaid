import { useState, useMemo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/ThemeProvider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  Search,
  ExternalLink,
  Globe,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  BellRing,
  CheckCircle2,
  Landmark,
  UserCheck,
  MessageSquare,
  Newspaper,
  Radio,
  Check,
  CheckCheck,
  Trash2,
  Megaphone,
  Bell,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ADMIN_DOMAINS, type AdminDomainGroup, type AdminSubTab } from "./AdminNavigation";
import { AdminCommandPalette, type SearchableItem } from "./AdminCommandPalette";

export type AdminNotificationItem = {
  id: string;
  user_id: string;
  title_ar: string;
  title_en?: string | null;
  message_ar: string;
  message_en?: string | null;
  type: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

export function AdminConsoleLayout({
  activeDomainId,
  activeTabId,
  onSelectTab,
  badgeCounts = {},
  notificationsData,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onBroadcastNotification,
  searchItems = [],
  onQuickAction,
  children,
}: {
  activeDomainId: string;
  activeTabId: string;
  onSelectTab: (domainId: string, tabId: string) => void;
  badgeCounts?: Record<string, number>;
  notificationsData?: {
    notifications: AdminNotificationItem[];
    unreadCount: number;
  };
  onMarkNotificationRead?: (id: string) => Promise<void>;
  onMarkAllNotificationsRead?: () => Promise<void>;
  onDeleteNotification?: (id: string) => Promise<void>;
  onBroadcastNotification?: (data: any) => Promise<void>;
  searchItems?: SearchableItem[];
  onQuickAction?: (actionId: string) => void;
  children: ReactNode;
}) {
  const { lang, setLang } = useLang();
  const isAr = lang === "ar";
  const { theme, setTheme } = useTheme();
  const { user, profile, roles, signOut, isAdmin, isSuperAdmin } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    [activeDomainId]: true,
  });

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [notifActiveTab, setNotifActiveTab] = useState<"alerts" | "tasks">("alerts");
  const [broadcastForm, setBroadcastForm] = useState({
    title_ar: "",
    title_en: "",
    body_ar: "",
    body_en: "",
    type: "info",
    link_url: "",
  });

  const totalPendingAlerts = useMemo(() => {
    return (
      (badgeCounts.pendingReceipts ?? 0) +
      (badgeCounts.pendingVerifications ?? 0) +
      (badgeCounts.pendingInquiries ?? 0) +
      (badgeCounts.draftArticles ?? 0)
    );
  }, [badgeCounts]);

  const unreadLiveCount = notificationsData?.unreadCount ?? 0;
  const totalCombinedBadge = unreadLiveCount + totalPendingAlerts;

  const formatNotifTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return isAr ? "الآن" : "just now";
    if (diffMins < 60) return isAr ? `قبل ${diffMins} د` : `${diffMins}m ago`;
    if (diffHours < 24) return isAr ? `قبل ${diffHours} س` : `${diffHours}h ago`;
    return isAr ? `قبل ${diffDays} ي` : `${diffDays}d ago`;
  };

  const getNotifIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("inquiry") || t.includes("contact") || t.includes("message")) {
      return <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />;
    }
    if (t.includes("treasury") || t.includes("receipt") || t.includes("contribution")) {
      return <Landmark className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (t.includes("verification") || t.includes("member") || t.includes("request")) {
      return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (t.includes("broadcast") || t.includes("announcement")) {
      return <Megaphone className="w-3.5 h-3.5 text-rose-500" />;
    }
    return <Bell className="w-3.5 h-3.5 text-primary" />;
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title_ar.trim() || !broadcastForm.body_ar.trim()) return;
    if (!onBroadcastNotification) return;

    try {
      setSubmittingBroadcast(true);
      await onBroadcastNotification(broadcastForm);
      toast.success(isAr ? "تم بث الإشعار بنجاح لجميع المستخدمين" : "Broadcast sent successfully to all users");
      setBroadcastModalOpen(false);
      setBroadcastForm({
        title_ar: "",
        title_en: "",
        body_ar: "",
        body_en: "",
        type: "info",
        link_url: "",
      });
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل بث الإشعار" : "Failed to broadcast notification"));
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const currentDomain = useMemo(
    () => ADMIN_DOMAINS.find((d) => d.id === activeDomainId) || ADMIN_DOMAINS[0],
    [activeDomainId]
  );

  const currentTab = useMemo(
    () => currentDomain.tabs.find((t) => t.id === activeTabId) || currentDomain.tabs[0],
    [currentDomain, activeTabId]
  );

  const renderNavList = (isMobile = false) => (
    <div className="space-y-1.5 py-2">
      {ADMIN_DOMAINS.map((domain) => {
        const DomainIcon = domain.icon;
        const isDomainActive = domain.id === activeDomainId;
        const isExpanded = expandedDomains[domain.id] ?? isDomainActive;
        const domainBadge = domain.badgeKey ? badgeCounts[domain.badgeKey] ?? 0 : 0;

        return (
          <div key={domain.id} className="space-y-0.5">
            {/* Domain Header Button */}
            <button
              onClick={() => {
                toggleDomain(domain.id);
                if (domain.tabs.length > 0) {
                  onSelectTab(domain.id, domain.tabs[0].id);
                  if (isMobile) setMobileDrawerOpen(false);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-start group",
                isDomainActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <DomainIcon className={cn("w-4 h-4 shrink-0", isDomainActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!sidebarCollapsed && (
                  <span className="truncate">{isAr ? domain.label_ar : domain.label_en}</span>
                )}
              </div>

              {!sidebarCollapsed && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {domainBadge > 0 && (
                    <Badge variant="destructive" className="h-4 px-1.5 text-[9px] font-bold font-mono">
                      {domainBadge}
                    </Badge>
                  )}
                  {domain.tabs.length > 1 && (
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground",
                        isExpanded ? "transform rotate-180" : ""
                      )}
                    />
                  )}
                </div>
              )}
            </button>

            {/* Sub-tabs List */}
            {!sidebarCollapsed && isExpanded && domain.tabs.length > 1 && (
              <div className="ps-4 pe-1 py-1 space-y-0.5 border-s border-border/40 ms-4 mt-0.5">
                {domain.tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = isDomainActive && tab.id === activeTabId;
                  const tabBadge = tab.badgeKey ? badgeCounts[tab.badgeKey] ?? 0 : 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(domain.id, tab.id);
                        if (isMobile) setMobileDrawerOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-start",
                        isTabActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <TabIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isAr ? tab.label_ar : tab.label_en}</span>
                      </div>
                      {tabBadge > 0 && (
                        <Badge
                          variant={isTabActive ? "secondary" : "destructive"}
                          className="h-4 px-1.5 text-[9px] font-bold font-mono"
                        >
                          {tabBadge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-e border-border bg-card/60 backdrop-blur-xl shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                عب
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-foreground block truncate">
                  {isAr ? "أمانة مجلس آل بوعبيد" : "Al Bu Obaid Secretariat"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {isAr ? "المنظومة الإدارية والـ CMS" : "Admin Hub & CMS"}
                </span>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              عب
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-7 h-7 text-muted-foreground hover:text-foreground hidden lg:flex"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Search Button */}
        <div className="p-3 border-b border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className={cn(
              "w-full text-xs text-muted-foreground hover:text-foreground justify-between h-9 rounded-xl bg-background/50",
              sidebarCollapsed && "px-0 justify-center"
            )}
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>{isAr ? "بحث شامل وأوامر..." : "Quick Search..."}</span>}
            </div>
            {!sidebarCollapsed && (
              <kbd className="text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono">
                ⌘K
              </kbd>
            )}
          </Button>
        </div>

        {/* Navigation Groups (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {renderNavList(false)}
        </div>

        {/* Bottom User Profile Strip */}
        <div className="p-3 border-t border-border bg-card/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 p-2 rounded-xl text-start hover:bg-muted/50 transition-colors",
                  sidebarCollapsed && "justify-center p-1"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {profile?.full_name_ar?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-foreground block truncate">
                      {profile?.full_name_ar || profile?.full_name_en || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">
                      {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Officer"}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">
                <span className="block font-bold">{profile?.full_name_ar || "مشرف المجلس"}</span>
                <span className="block text-[11px] font-normal text-muted-foreground font-mono truncate">
                  {user?.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="text-xs cursor-pointer">
                  <User className="w-3.5 h-3.5 me-2" />
                  {isAr ? "الملف الشخصي والحساب" : "My Profile"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-xs cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 me-2 text-amber-500" /> : <Moon className="w-3.5 h-3.5 me-2 text-primary" />}
                {isAr ? (theme === "dark" ? "المظهر الفاتح" : "المظهر الداكن") : (theme === "dark" ? "Light Mode" : "Dark Mode")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLang(isAr ? "en" : "ar")}
                className="text-xs cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 me-2" />
                {isAr ? "English" : "العربية"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-xs text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 me-2" />
                {isAr ? "تسجيل الخروج" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden w-8 h-8 text-muted-foreground">
                  <MenuIcon className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? "right" : "left"} className="w-72 p-0 flex flex-col">
                <div className="p-4 border-b border-border">
                  <SheetTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    {isAr ? "أمانة مجلس آل بوعبيد" : "Al Bu Obaid Secretariat"}
                  </SheetTitle>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  {renderNavList(true)}
                </div>
              </SheetContent>
            </Sheet>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-muted-foreground hidden sm:inline">
                {isAr ? currentDomain.label_ar : currentDomain.label_en}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rtl:rotate-180 hidden sm:inline" />
              <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 rounded-md">
                {isAr ? currentTab.label_ar : currentTab.label_en}
              </Badge>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div className="flex items-center gap-2">
            {/* Live System Sync Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? "المنظومة متصلة" : "System Live"}</span>
            </div>

            {/* Attention & Notifications Center Popover */}
            <Popover open={notifPopoverOpen} onOpenChange={setNotifPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 relative text-muted-foreground hover:text-foreground"
                  title={isAr ? "مركز الإشعارات والمهام المعلقة" : "Notifications & Attention Center"}
                >
                  <BellRing className="w-4 h-4" />
                  {totalCombinedBadge > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                      {totalCombinedBadge}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-88 sm:w-96 p-0 shadow-2xl border-border bg-card">
                {/* Popover Header */}
                <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      {isAr ? "مركز الإشعارات والمهام" : "Notifications & Triage"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onBroadcastNotification && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNotifPopoverOpen(false);
                          setBroadcastModalOpen(true);
                        }}
                        className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1"
                        title={isAr ? "إرسال إشعار فوري لجميع المستخدمين" : "Broadcast notification"}
                      >
                        <Megaphone className="w-3 h-3" />
                        <span>{isAr ? "بث إشعار" : "Broadcast"}</span>
                      </Button>
                    )}

                    {onMarkAllNotificationsRead && (notificationsData?.unreadCount ?? 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await onMarkAllNotificationsRead();
                          toast.success(isAr ? "تم تحديد الكل كمقروء" : "All marked as read");
                        }}
                        className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground gap-1"
                        title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
                      >
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? "قراءة الكل" : "Read all"}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Popover Tabs Switcher */}
                <Tabs value={notifActiveTab} onValueChange={(v) => setNotifActiveTab(v as any)} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 rounded-none border-b border-border bg-muted/20 h-9 p-0">
                    <TabsTrigger value="alerts" className="text-xs rounded-none data-[state=active]:bg-background gap-1.5 font-bold">
                      <Radio className="w-3 h-3 text-primary" />
                      <span>{isAr ? "تنبيهات فورية" : "Live Alerts"}</span>
                      {unreadLiveCount > 0 && (
                        <Badge variant="destructive" className="h-4 px-1 text-[9px] font-mono">
                          {unreadLiveCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="text-xs rounded-none data-[state=active]:bg-background gap-1.5 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-amber-500" />
                      <span>{isAr ? "مهام المتابعة" : "Action Tasks"}</span>
                      {totalPendingAlerts > 0 && (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px] font-mono bg-amber-500/20 text-amber-600">
                          {totalPendingAlerts}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: Live Notifications List */}
                  <TabsContent value="alerts" className="m-0 p-0 max-h-80 overflow-y-auto divide-y divide-border/40 focus-visible:ring-0">
                    {(notificationsData?.notifications ?? []).length === 0 ? (
                      <div className="py-10 px-4 text-center space-y-1.5">
                        <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500/80" />
                        <p className="text-xs font-bold text-foreground">
                          {isAr ? "لا توجد تنبيهات جديدة" : "No new notifications"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isAr ? "ستظهر هنا التنبيهات الفورية وبلاغات النظام عند وصولها" : "Real-time alerts and updates will appear here"}
                        </p>
                      </div>
                    ) : (
                      (notificationsData?.notifications ?? []).map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-3 text-xs flex items-start gap-2.5 transition-colors group relative",
                            notif.is_read ? "bg-card hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
                          )}
                        >
                          <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-card border border-border shadow-2xs">
                            {getNotifIcon(notif.type)}
                          </div>

                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={async () => {
                              if (!notif.is_read && onMarkNotificationRead) {
                                await onMarkNotificationRead(notif.id);
                              }
                              setNotifPopoverOpen(false);
                              if (notif.link) {
                                // If internal admin route, handle gracefully
                                if (notif.link.includes("inquiries")) onSelectTab("community", "inquiries");
                                else if (notif.link.includes("treasury")) onSelectTab("treasury", "treasury_ledger");
                                else if (notif.link.includes("verification")) onSelectTab("community", "verification");
                                else if (notif.link.includes("articles")) onSelectTab("content", "articles");
                              }
                            }}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={cn("font-bold truncate text-[11px]", notif.is_read ? "text-foreground" : "text-primary font-black")}>
                                {isAr ? notif.title_ar : (notif.title_en || notif.title_ar)}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                                {formatNotifTime(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {isAr ? notif.message_ar : (notif.message_en || notif.message_ar)}
                            </p>
                          </div>

                          {/* Quick Actions (Mark Read / Delete) */}
                          <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && onMarkNotificationRead && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await onMarkNotificationRead(notif.id);
                                }}
                                className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-emerald-500"
                                title={isAr ? "تحديد كمقروء" : "Mark read"}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            {onDeleteNotification && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await onDeleteNotification(notif.id);
                                }}
                                className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive"
                                title={isAr ? "حذف" : "Delete"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {!notif.is_read && (
                            <span className="absolute top-2 end-2 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* TAB 2: Operational Triage Tasks */}
                  <TabsContent value="tasks" className="m-0 p-2 space-y-1.5 max-h-80 overflow-y-auto focus-visible:ring-0">
                    {/* Pending Receipts */}
                    <button
                      onClick={() => {
                        setNotifPopoverOpen(false);
                        onSelectTab("treasury", "treasury_ledger");
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-start border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-foreground text-xs">
                            {isAr ? "إيصالات الخزينة المعلقة" : "Pending Receipts"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isAr ? "مساهمات تتطلب التدقيق والاعتماد" : "Contributions awaiting approval"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={(badgeCounts.pendingReceipts ?? 0) > 0 ? "destructive" : "secondary"} className="h-5 text-[10px] font-mono font-bold">
                        {badgeCounts.pendingReceipts ?? 0}
                      </Badge>
                    </button>

                    {/* Membership Verifications */}
                    <button
                      onClick={() => {
                        setNotifPopoverOpen(false);
                        onSelectTab("community", "verification");
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-start border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-600">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-foreground text-xs">
                            {isAr ? "طلبات توثيق العضوية" : "Membership Requests"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isAr ? "طلبات انضمام تتطلب التحقق من النسب" : "Verification requests"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={(badgeCounts.pendingVerifications ?? 0) > 0 ? "destructive" : "secondary"} className="h-5 text-[10px] font-mono font-bold">
                        {badgeCounts.pendingVerifications ?? 0}
                      </Badge>
                    </button>

                    {/* Unread Inquiries */}
                    <button
                      onClick={() => {
                        setNotifPopoverOpen(false);
                        onSelectTab("community", "inquiries");
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-start border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-600">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-foreground text-xs">
                            {isAr ? "رسائل واستفسارات واردة" : "New Inquiries"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isAr ? "رسائل جديدة من أفراد الأسرة" : "Unanswered messages"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={(badgeCounts.pendingInquiries ?? 0) > 0 ? "destructive" : "secondary"} className="h-5 text-[10px] font-mono font-bold">
                        {badgeCounts.pendingInquiries ?? 0}
                      </Badge>
                    </button>

                    {/* Draft Articles */}
                    <button
                      onClick={() => {
                        setNotifPopoverOpen(false);
                        onSelectTab("content", "articles");
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-start border border-border/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                          <Newspaper className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold block text-foreground text-xs">
                            {isAr ? "مسودات المقالات والأخبار" : "Draft Articles"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {isAr ? "مقالات بانتظار المراجعة والنشر" : "Unpublished articles"}
                          </span>
                        </div>
                      </div>
                      <Badge variant={(badgeCounts.draftArticles ?? 0) > 0 ? "outline" : "secondary"} className="h-5 text-[10px] font-mono font-bold">
                        {badgeCounts.draftArticles ?? 0}
                      </Badge>
                    </button>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>

            {/* Dark / Light Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              title={isAr ? (theme === "dark" ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الداكن") : "Toggle Theme"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-primary transition-transform hover:-rotate-12" />
              )}
            </Button>

            {/* Public Site Link */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs gap-1.5 hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <Link to="/" target="_blank">
                <ExternalLink className="w-3 h-3" />
                <span>{isAr ? "الموقع العام" : "Public Site"}</span>
              </Link>
            </Button>

            {/* Language Switch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="w-8 h-8 text-muted-foreground hover:text-foreground text-xs font-bold"
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
            >
              {isAr ? "EN" : "ع"}
            </Button>
          </div>
        </header>

        {/* Main Render Page Body */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Command Palette Dialog */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        items={searchItems}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
      />

      {/* Broadcast Live Notification Dialog */}
      <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Megaphone className="w-4 h-4" />
              {isAr ? "نظام البث الإشعاري الفوري" : "Instant Broadcast Engine"}
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {isAr ? "إرسال إشعار فوري لجميع أفراد الأسرة والمستخدمين" : "Broadcast Push Notification"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "سيصل هذا الإشعار إلى جميع الحسابات المسجلة فوراً ويظهر في جرس التنبيهات المباشر."
                : "This notification will be dispatched instantly to all registered user accounts."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4 mt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "عنوان الإشعار (بالعربية) *" : "Notification Title (Arabic) *"}</Label>
              <Input
                required
                value={broadcastForm.title_ar}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title_ar: e.target.value })}
                placeholder={isAr ? "مثال: موعد انعقاد الجمعية العمومية السنوية" : "Arabic title..."}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "عنوان الإشعار (بالإنجليزية)" : "Notification Title (English)"}</Label>
              <Input
                value={broadcastForm.title_en}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title_en: e.target.value })}
                placeholder="e.g. Annual General Assembly Meeting"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{isAr ? "نوع التنبيه" : "Notification Type"}</Label>
                <Select
                  value={broadcastForm.type}
                  onValueChange={(val) => setBroadcastForm({ ...broadcastForm, type: val })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{isAr ? "إشعار عام (General)" : "General Info"}</SelectItem>
                    <SelectItem value="important">{isAr ? "هام وعاجل (Important)" : "Important"}</SelectItem>
                    <SelectItem value="announcement">{isAr ? "إعلان مجلس (Announcement)" : "Announcement"}</SelectItem>
                    <SelectItem value="treasury">{isAr ? "مالي وخزينة (Treasury)" : "Treasury"}</SelectItem>
                    <SelectItem value="event">{isAr ? "مناسبة ولقاء (Event)" : "Event"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{isAr ? "رابط التوجيه (اختياري)" : "Target Link URL (optional)"}</Label>
                <Input
                  value={broadcastForm.link_url}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, link_url: e.target.value })}
                  placeholder="/initiatives أو /news"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isAr ? "نص رسالة الإشعار *" : "Notification Message *"}</Label>
              <Textarea
                rows={3}
                required
                value={broadcastForm.body_ar}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, body_ar: e.target.value })}
                placeholder={isAr ? "اكتب تفاصيل التنبيه الموجه لأبناء الأسرة..." : "Enter message content..."}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBroadcastModalOpen(false)}
                className="text-xs"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingBroadcast}
                className="text-xs font-bold gap-1.5"
              >
                <Megaphone className="w-3.5 h-3.5" />
                {submittingBroadcast
                  ? (isAr ? "جاري البث..." : "Broadcasting...")
                  : (isAr ? "إرسال الإشعار الآن" : "Broadcast Now")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
