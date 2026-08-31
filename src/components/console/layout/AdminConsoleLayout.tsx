import { useState, useMemo, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu as MenuIcon,
  Search,
  ExternalLink,
  Globe,
  Sun,
  Moon,
  LogOut,
  Loader2,
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
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Keyboard,
  Compass,
  Layers,
  Users,
  Settings,
  X,
} from "lucide-react";
import {
  ADMIN_DOMAINS,
  preloadAdminManager,
  type AdminDomainGroup,
  type AdminSubTab,
  type AdminRole,
} from "./AdminNavigation";
import { AdminCommandPalette, type SearchableItem } from "./AdminCommandPalette";
import { useConfirm } from "@/hooks/useConfirm";

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
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";
  const isRtl = dir === "rtl";
  const { theme, setTheme } = useTheme();
  const { user, profile, roles, signOut, isAdmin, isSuperAdmin } = useAuth();
  const confirm = useConfirm();

  // 1. Sidebar Collapsed State (Persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("albuobaid_admin_sidebar_collapsed") === "true";
    }
    return false;
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("albuobaid_admin_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // 2. Expandable Domains Accordion State (Persisted)
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("albuobaid_admin_nav_expanded");
        if (stored) {
          return { ...JSON.parse(stored), [activeDomainId]: true };
        }
      } catch {
        // fallback
      }
    }
    return { [activeDomainId]: true };
  });

  // Ensure active domain is always expanded when tab changes
  useEffect(() => {
    setExpandedDomains((prev) => {
      if (prev[activeDomainId]) return prev;
      const updated = { ...prev, [activeDomainId]: true };
      if (typeof window !== "undefined") {
        localStorage.setItem("albuobaid_admin_nav_expanded", JSON.stringify(updated));
      }
      return updated;
    });
  }, [activeDomainId]);

  const toggleDomainExpand = (domainId: string) => {
    setExpandedDomains((prev) => {
      const updated = { ...prev, [domainId]: !prev[domainId] };
      if (typeof window !== "undefined") {
        localStorage.setItem("albuobaid_admin_nav_expanded", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // 3. UI Modals
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  // Sign-out has nothing to show for itself otherwise: the click closes the
  // dropdown, then the console keeps rendering exactly as-is (fully signed
  // in) until the async signOut() network call resolves and the auth
  // listener elsewhere eventually redirects -- a silent pause that reads as
  // the app having frozen. This drives an immediate full-screen overlay
  // instead, so the sign-out click gets feedback the instant it happens.
  const [signingOut, setSigningOut] = useState(false);
  const [notifActiveTab, setNotifActiveTab] = useState<"alerts" | "tasks">("alerts");
  const [broadcastForm, setBroadcastForm] = useState({
    title_ar: "",
    title_en: "",
    body_ar: "",
    body_en: "",
    type: "info",
    link_url: "",
  });

  // 4. Role Evaluation for Gated Navigation
  const userRoles = useMemo(() => {
    const list: AdminRole[] = [];
    if (isSuperAdmin) list.push("super_admin");
    if (isAdmin) list.push("admin");
    if (roles?.includes("treasurer")) list.push("treasurer");
    if (roles?.includes("editor") || roles?.includes("content_manager")) list.push("editor");
    if (list.length === 0) list.push("admin"); // fallback
    return list;
  }, [isSuperAdmin, isAdmin, roles]);

  // Resolve user avatar image URL
  const avatarUrl = useMemo(() => {
    if (profile?.avatar_path) {
      if (
        profile.avatar_path.startsWith("http://") ||
        profile.avatar_path.startsWith("https://") ||
        profile.avatar_path.startsWith("data:") ||
        profile.avatar_path.startsWith("/")
      ) {
        return profile.avatar_path;
      }
      return supabase.storage.from("avatars").getPublicUrl(profile.avatar_path).data.publicUrl;
    }
    if (user && (user.user_metadata as any)?.avatar_url) {
      return (user.user_metadata as any).avatar_url;
    }
    return null;
  }, [profile?.avatar_path, user]);

  const visibleDomains = useMemo(() => {
    if (isSuperAdmin) return ADMIN_DOMAINS;
    return ADMIN_DOMAINS.filter((dom) => {
      if (!dom.roles) return true;
      return dom.roles.some((r) => userRoles.includes(r));
    }).map((dom) => ({
      ...dom,
      tabs: dom.tabs.filter((tab) => {
        if (!tab.roles) return true;
        return tab.roles.some((r) => userRoles.includes(r));
      }),
    }));
  }, [userRoles, isSuperAdmin]);

  // Current domain and tab objects
  const currentDomain = useMemo(() => {
    return (
      visibleDomains.find((d) => d.id === activeDomainId) || visibleDomains[0] || ADMIN_DOMAINS[0]
    );
  }, [visibleDomains, activeDomainId]);

  const currentTab = useMemo(() => {
    return (
      currentDomain.tabs.find((t) => t.id === activeTabId) ||
      currentDomain.tabs[0] ||
      ADMIN_DOMAINS[0].tabs[0]
    );
  }, [currentDomain, activeTabId]);

  // Meaningful Actionable Attention Count (No vanity numbers)
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

    const confirmed = await confirm({
      title: isAr
        ? "بث هذا الإشعار لجميع المستخدمين؟"
        : "Broadcast this notification to all users?",
      description: isAr
        ? "سيصل هذا الإشعار فوراً إلى جميع أعضاء المنصة والمشرفين، ولا يمكن سحبه بعد الإرسال."
        : "This will be delivered immediately to every member and admin on the platform, and can't be recalled once sent.",
      confirmLabel: isAr ? "إرسال البث" : "Send Broadcast",
    });
    if (!confirmed) return;

    try {
      setSubmittingBroadcast(true);
      await onBroadcastNotification(broadcastForm);
      toast.success(
        isAr ? "تم بث الإشعار بنجاح لجميع المستخدمين" : "Broadcast sent successfully to all users",
      );
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
      toast.error(err.message || (isAr ? "فشل إرسال البث" : "Failed to broadcast notification"));
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  /* Every notification callback resolves to a server mutation that rethrows on
   * failure (see runMutation in routes/_authenticated/admin.tsx). Calling them
   * straight from onClick left the rejection unhandled and gave no confirmation
   * on success, so each one is routed through a handler that awaits, reports,
   * and -- for the destructive delete -- confirms first. */
  const handleMarkNotificationRead = async (id: string) => {
    if (!onMarkNotificationRead) return;
    try {
      await onMarkNotificationRead(id);
    } catch {
      // runMutation already surfaced the failure as a toast.
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!onMarkAllNotificationsRead) return;
    try {
      await onMarkAllNotificationsRead();
      toast.success(isAr ? "تم تحديد الكل كمقروء" : "All marked as read");
    } catch {
      // runMutation already surfaced the failure as a toast.
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!onDeleteNotification) return;
    const confirmed = await confirm({
      title: isAr ? "حذف هذا الإشعار؟" : "Delete this notification?",
      description: isAr
        ? "سيُحذف الإشعار من مركز التنبيهات نهائيًا ولا يمكن استرجاعه."
        : "The notification will be permanently removed from your inbox and can't be restored.",
      tone: "destructive",
    });
    if (!confirmed) return;
    try {
      await onDeleteNotification(id);
      toast.success(isAr ? "تم حذف الإشعار" : "Notification deleted");
    } catch {
      // runMutation already surfaced the failure as a toast.
    }
  };

  // Render navigation group items
  const renderNavList = (isMobile = false) => {
    const isCollapsed = !isMobile && sidebarCollapsed;

    return (
      <TooltipProvider delayDuration={150}>
        <div className="space-y-1">
          {/* Quick "Needs Attention" / "تحتاج إلى انتباهك" Tile */}
          {totalPendingAlerts > 0 && (
            <div className="mb-3 px-1">
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onSelectTab("dashboard", "overview");
                        setNotifPopoverOpen(true);
                      }}
                      className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all relative group"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="absolute -top-1 -end-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-bold font-mono flex items-center justify-center">
                        {totalPendingAlerts}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={isRtl ? "left" : "right"} className="text-xs font-medium">
                    <p className="font-bold">{isAr ? "تحتاج إلى انتباهك" : "Needs Attention"}</p>
                    <p className="text-[11px] opacity-80">
                      {isAr
                        ? `${totalPendingAlerts} مهام تتطلب تدخلك`
                        : `${totalPendingAlerts} actionable items`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={() => {
                    onSelectTab("dashboard", "overview");
                    if (isMobile) setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 transition-all text-start group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block truncate">
                        {isAr ? "تحتاج إلى انتباهك" : "Needs Attention"}
                      </span>
                      <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium block">
                        {isAr ? "مهام واعتمادات معلقة" : "Pending reviews & actions"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-amber-500 text-white border-amber-600 font-mono font-bold text-[10px] h-5 px-1.5 shrink-0"
                  >
                    {totalPendingAlerts}
                  </Badge>
                </button>
              )}
            </div>
          )}

          {/* Business-Oriented Primary Groups */}
          {visibleDomains.map((domain) => {
            const DomainIcon = domain.icon;
            const isDomainActive = domain.id === activeDomainId;
            const isExpanded = isMobile
              ? (expandedDomains[domain.id] ?? true)
              : !!expandedDomains[domain.id];

            // Aggregate domain badge count
            const domainBadge = domain.tabs.reduce((sum, tab) => {
              return sum + (tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0);
            }, 0);

            // Collapsed rail mode item with Tooltip
            if (isCollapsed) {
              return (
                <Tooltip key={domain.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onSelectTab(domain.id, domain.tabs[0]?.id || "");
                      }}
                      onMouseEnter={() => {
                        domain.tabs.forEach((t) => preloadAdminManager(t.id));
                      }}
                      onFocus={() => {
                        domain.tabs.forEach((t) => preloadAdminManager(t.id));
                      }}
                      className={cn(
                        "w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all relative group",
                        isDomainActive
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                    >
                      <DomainIcon className="w-4 h-4" />
                      {domainBadge > 0 && (
                        <span className="absolute -top-1 -end-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold font-mono flex items-center justify-center">
                          {domainBadge}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side={isRtl ? "left" : "right"}
                    className="text-xs p-2.5 max-w-xs"
                  >
                    <p className="font-bold text-xs">{isAr ? domain.label_ar : domain.label_en}</p>
                    {domain.description_ar && (
                      <p className="text-[10px] opacity-80 mt-0.5">
                        {isAr ? domain.description_ar : domain.description_en}
                      </p>
                    )}
                    {domain.tabs.length > 1 && (
                      <div className="mt-2 pt-1.5 border-t border-primary-foreground/20 space-y-1">
                        {domain.tabs.map((t) => (
                          <div
                            key={t.id}
                            className="text-[11px] flex items-center gap-1.5 opacity-90"
                          >
                            <span className="w-1 h-1 rounded-full bg-current" />
                            <span>{isAr ? t.label_ar : t.label_en}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            // Expanded Mode: Collapsible Accordion Header
            return (
              <div key={domain.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (domain.tabs.length === 1) {
                      onSelectTab(domain.id, domain.tabs[0].id);
                      if (isMobile) setMobileDrawerOpen(false);
                    } else {
                      toggleDomainExpand(domain.id);
                    }
                  }}
                  onMouseEnter={() => {
                    domain.tabs.forEach((t) => preloadAdminManager(t.id));
                  }}
                  onFocus={() => {
                    domain.tabs.forEach((t) => preloadAdminManager(t.id));
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-start group cursor-pointer",
                    isDomainActive && domain.tabs.length === 1
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : isDomainActive
                        ? "text-primary font-bold bg-primary/5 hover:bg-primary/10"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <DomainIcon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isDomainActive && domain.tabs.length === 1
                          ? "text-primary-foreground"
                          : isDomainActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate">{isAr ? domain.label_ar : domain.label_en}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ms-2">
                    {domainBadge > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-4 px-1.5 text-[9px] font-bold font-mono"
                      >
                        {domainBadge}
                      </Badge>
                    )}
                    {domain.tabs.length > 1 && (
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground/70 group-hover:text-foreground",
                          isExpanded ? "transform rotate-180" : "",
                        )}
                      />
                    )}
                  </div>
                </button>

                {/* Sub-tabs List */}
                {isExpanded && domain.tabs.length > 1 && (
                  <div
                    className={cn(
                      "py-1 space-y-0.5",
                      isRtl
                        ? "pe-1 ps-3 border-r border-border/60 mr-3.5"
                        : "ps-3 pe-1 border-l border-border/60 ml-3.5",
                    )}
                  >
                    {domain.tabs.map((tab) => {
                      const TabIcon = tab.icon;
                      const isTabActive = isDomainActive && tab.id === activeTabId;
                      const tabBadge = tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(domain.id, tab.id);
                            if (isMobile) setMobileDrawerOpen(false);
                          }}
                          onMouseEnter={() => preloadAdminManager(tab.id)}
                          onFocus={() => preloadAdminManager(tab.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-start relative group cursor-pointer",
                            isTabActive
                              ? cn(
                                  "bg-primary/10 text-primary font-bold dark:bg-primary/20",
                                  isRtl
                                    ? "border-r-2 border-primary -mr-[13px] pr-3"
                                    : "border-l-2 border-primary -ml-[13px] pl-3",
                                )
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <TabIcon
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isTabActive ? "text-primary" : "opacity-70 group-hover:opacity-100",
                              )}
                            />
                            <span className="truncate">{isAr ? tab.label_ar : tab.label_en}</span>
                          </div>
                          {tabBadge > 0 && (
                            <Badge
                              variant={isTabActive ? "default" : "destructive"}
                              className="h-4 px-1 text-[9px] font-bold font-mono shrink-0"
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
      </TooltipProvider>
    );
  };

  const handleSignOut = () => {
    if (signingOut) return;
    setSigningOut(true);
    void signOut();
    // No `finally` resetting this: a successful sign-out unmounts this
    // component via the auth-state redirect (see routes/_authenticated/route.tsx),
    // and a failed one already falls back to a local session clear inside
    // signOut() itself, which redirects the same way -- there's no path
    // back to an authenticated view left to un-block.
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {signingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-medium text-muted-foreground">
            {isAr ? "جاري تسجيل الخروج..." : "Signing out..."}
          </p>
        </div>
      )}
      {/* =========================================================================
       * 1. DESKTOP SIDEBAR
       * ========================================================================= */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-e border-border/70 bg-card/70 backdrop-blur-xl shrink-0 transition-all duration-300 z-30 sticky top-0 h-screen select-none",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-border/70">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/30 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <img
                  src="/logo-mark-gold.svg"
                  alt={isAr ? "شعار مجلس أسرة آل بوعبيد" : "Al Bu Obaid Logo"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-foreground block truncate">
                  {isAr ? "أمانة آل بوعبيد" : "Al Bu Obaid Hub"}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block truncate">
                  {isAr ? "المنظومة الإدارية الموحدة" : "Unified Management"}
                </span>
              </div>
            </Link>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gold/10 border border-gold/30 p-1 flex items-center justify-center shadow-2xs">
              <img
                src="/logo-mark-gold.svg"
                alt={isAr ? "شعار مجلس أسرة آل بوعبيد" : "Al Bu Obaid Logo"}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSidebar}
            className="w-7 h-7 text-muted-foreground hover:text-foreground hidden lg:flex rounded-lg"
            title={
              sidebarCollapsed
                ? isAr
                  ? "توسيع القائمة (Ctrl+\\)"
                  : "Expand Sidebar"
                : isAr
                  ? "طي القائمة"
                  : "Collapse Sidebar"
            }
          >
            {sidebarCollapsed ? (
              isRtl ? (
                <PanelLeftOpen className="w-4 h-4 transform rotate-180" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )
            ) : isRtl ? (
              <PanelLeftClose className="w-4 h-4 transform rotate-180" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Global Search Shortcut in Sidebar */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/70 hover:border-border text-xs text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isAr ? "بحث سريع..." : "Quick Search..."}</span>
              </div>
              <kbd className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-border font-mono shrink-0 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation Groups (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">{renderNavList(false)}</div>

        {/* Bottom Utility & User Profile Strip */}
        <div className="p-2 border-t border-border/70 bg-card/40 space-y-1">
          {/* Quick Help Button */}
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-1 py-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHelpModalOpen(true)}
                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "دليل المشرف" : "User Guide"}</span>
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLang(isAr ? "en" : "ar")}
                  className="w-7 h-7 text-xs font-mono text-muted-foreground hover:text-foreground"
                  title={isAr ? "Switch to English" : "التحويل للعربية"}
                >
                  {isAr ? "EN" : "ع"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-7 h-7 text-muted-foreground hover:text-foreground"
                  title={isAr ? "تغيير المظهر" : "Toggle Theme"}
                >
                  {theme === "dark" ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Moon className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setHelpModalOpen(true)}
                    className="w-10 h-10 mx-auto text-muted-foreground hover:text-foreground rounded-xl"
                  >
                    <HelpCircle className="w-4 h-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={isRtl ? "left" : "right"}>
                  {isAr ? "دليل المشرف والمساعدة" : "User Guide & Help"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* User Profile Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 p-1.5 rounded-xl text-start hover:bg-muted/60 transition-colors cursor-pointer",
                  sidebarCollapsed && "justify-center p-1",
                )}
              >
                <Avatar className="w-8 h-8 rounded-full border border-primary/30 shadow-2xs shrink-0 bg-primary/10">
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt={profile?.full_name_ar || profile?.full_name_en || "User Avatar"}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                    {profile?.full_name_ar?.[0] ||
                      profile?.full_name_en?.[0] ||
                      user?.email?.[0]?.toUpperCase() ||
                      "A"}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-foreground block truncate">
                      {profile?.full_name_ar || profile?.full_name_en || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">
                      {isSuperAdmin
                        ? isAr
                          ? "مشرف عام"
                          : "Super Admin"
                        : isAdmin
                          ? isAr
                            ? "مدير نظام"
                            : "Admin"
                          : isAr
                            ? "مسؤول قطاع"
                            : "Officer"}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 shadow-xl border-border p-1.5">
              <DropdownMenuLabel className="text-xs p-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-9 h-9 rounded-full border border-primary/30 shadow-2xs shrink-0 bg-primary/10">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt={profile?.full_name_ar || profile?.full_name_en || "User Avatar"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                      {profile?.full_name_ar?.[0] ||
                        profile?.full_name_en?.[0] ||
                        user?.email?.[0]?.toUpperCase() ||
                        "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="block font-bold text-foreground truncate">
                      {profile?.full_name_ar || profile?.full_name_en || "مشرف المنظومة"}
                    </span>
                    <span className="block text-[11px] font-normal text-muted-foreground font-mono truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="text-xs cursor-pointer">
                  <User className="w-3.5 h-3.5 me-2" />
                  {isAr ? "الملف الشخصي والحساب" : "My Profile"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setHelpModalOpen(true)}
                className="text-xs cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 me-2 text-primary" />
                {isAr ? "دليل الاستخدام والمساعدة" : "Help & Documentation"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-xs cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5 me-2 text-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 me-2 text-primary" />
                )}
                {isAr
                  ? theme === "dark"
                    ? "المظهر الفاتح"
                    : "المظهر الداكن"
                  : theme === "dark"
                    ? "Light Mode"
                    : "Dark Mode"}
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
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-xs text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 me-2" />
                {isAr ? "تسجيل الخروج" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* =========================================================================
       * 2. MAIN CONTENT AREA & HEADER
       * ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation Bar */}
        <header className="h-16 border-b border-border/70 bg-card/60 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-20 gap-4 select-none">
          {/* Left: Mobile Sheet Trigger & Global Search */}
          <div className="flex items-center gap-3 lg:w-[320px]">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden w-8 h-8 text-muted-foreground shrink-0 rounded-lg"
                >
                  <MenuIcon className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRtl ? "right" : "left"} className="w-72 p-0 flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <SheetTitle className="text-xs font-bold text-foreground flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/30 p-0.5 flex items-center justify-center shrink-0">
                      <img
                        src="/logo-mark-gold.svg"
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span>{isAr ? "أمانة مجلس آل بوعبيد" : "Al Bu Obaid Hub"}</span>
                  </SheetTitle>
                </div>
                <div className="flex-1 overflow-y-auto p-3">{renderNavList(true)}</div>
                <div className="p-3 border-t border-border/70 bg-card/60 flex items-center gap-2.5">
                  <Avatar className="w-8 h-8 rounded-full border border-primary/30 shadow-2xs shrink-0 bg-primary/10">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt={profile?.full_name_ar || profile?.full_name_en || "User Avatar"}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                      {profile?.full_name_ar?.[0] ||
                        profile?.full_name_en?.[0] ||
                        user?.email?.[0]?.toUpperCase() ||
                        "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-foreground block truncate">
                      {profile?.full_name_ar || profile?.full_name_en || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono block truncate">
                      {isSuperAdmin
                        ? isAr
                          ? "مشرف عام"
                          : "Super Admin"
                        : isAdmin
                          ? isAr
                            ? "مدير نظام"
                            : "Admin"
                          : isAr
                            ? "مسؤول قطاع"
                            : "Officer"}
                    </span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Global Search Header Input */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex flex-1 text-xs text-muted-foreground hover:text-foreground justify-between h-9 rounded-xl bg-background/50 border-border/60 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isAr ? "بحث شامل وأوامر سريعة..." : "Search across admin..."}
                </span>
              </div>
              <kbd className="text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border font-mono hidden lg:inline-flex">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* Center: Business Context & Breadcrumb Switcher */}
          <div className="flex items-center justify-start lg:justify-center flex-1 min-w-0 overflow-x-auto no-scrollbar">
            <nav
              aria-label="Admin Breadcrumbs"
              className="flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <button
                type="button"
                onClick={() => onSelectTab("dashboard", "overview")}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50 font-medium cursor-pointer"
                title={isAr ? "الرئيسية (لوحة التحكم)" : "Dashboard"}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{isAr ? "الرئيسية" : "Dashboard"}</span>
              </button>

              {activeDomainId !== "dashboard" && (
                <>
                  {isRtl ? (
                    <ChevronLeft className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  )}

                  {/* Domain Dropdown Switcher */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 font-bold text-foreground/80 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/60 cursor-pointer"
                      >
                        <span>{isAr ? currentDomain.label_ar : currentDomain.label_en}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align={isRtl ? "end" : "start"}
                      className="w-60 p-1.5 shadow-xl border-border"
                    >
                      <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold">
                        {isAr ? "الانتقال المباشر إلى قطاع آخر" : "Switch Management Domain"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {visibleDomains.map((dom) => {
                        const DomIcon = dom.icon;
                        const isCurrent = dom.id === activeDomainId;
                        return (
                          <DropdownMenuItem
                            key={dom.id}
                            onClick={() => onSelectTab(dom.id, dom.tabs[0]?.id || "")}
                            className={cn(
                              "text-xs cursor-pointer flex items-center justify-between py-2 rounded-lg",
                              isCurrent && "font-bold text-primary bg-primary/10",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <DomIcon className="w-3.5 h-3.5 text-primary" />
                              <span>{isAr ? dom.label_ar : dom.label_en}</span>
                            </div>
                            {isCurrent && <Check className="w-3 h-3 text-primary" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isRtl ? (
                    <ChevronLeft className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  )}

                  {/* Active Sub-Tab Dropdown / Badge */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span>{isAr ? currentTab.label_ar : currentTab.label_en}</span>
                        {currentDomain.tabs.length > 1 && (
                          <ChevronDown className="w-3 h-3 text-primary/70" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    {currentDomain.tabs.length > 1 && (
                      <DropdownMenuContent
                        align={isRtl ? "end" : "start"}
                        className="w-56 p-1.5 shadow-xl border-border"
                      >
                        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold">
                          {isAr
                            ? `صفحات ${currentDomain.label_ar}`
                            : `${currentDomain.label_en} Sections`}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {currentDomain.tabs.map((tab) => {
                          const TabIcon = tab.icon;
                          const isCurrent = tab.id === activeTabId;
                          return (
                            <DropdownMenuItem
                              key={tab.id}
                              onClick={() => onSelectTab(currentDomain.id, tab.id)}
                              className={cn(
                                "text-xs cursor-pointer flex items-center justify-between py-1.5 rounded-lg",
                                isCurrent && "font-bold text-primary bg-primary/10",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <TabIcon className="w-3.5 h-3.5 text-primary" />
                                <span>{isAr ? tab.label_ar : tab.label_en}</span>
                              </div>
                              {isCurrent && <Check className="w-3 h-3 text-primary" />}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </>
              )}
            </nav>
          </div>

          {/* Right: Actions, Live Status, & Notifications */}
          <div className="flex items-center justify-end gap-2 shrink-0 lg:w-[320px]">
            {/* Live System Sync Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isAr ? "المنظومة متصلة" : "System Live"}</span>
            </div>

            {/* Attention & Notifications Center Popover */}
            <Popover open={notifPopoverOpen} onOpenChange={setNotifPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 relative text-muted-foreground hover:text-foreground rounded-lg"
                  title={
                    isAr ? "مركز الإشعارات والمهام المعلقة" : "Notifications & Attention Center"
                  }
                >
                  <BellRing className="w-4 h-4" />
                  {totalCombinedBadge > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                      {totalCombinedBadge}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[calc(100vw-2rem)] sm:w-96 max-w-sm p-0 shadow-2xl border-border bg-card"
              >
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
                        className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10 gap-1 rounded-md"
                        title={
                          isAr ? "إرسال إشعار فوري لجميع المستخدمين" : "Broadcast notification"
                        }
                      >
                        <Megaphone className="w-3 h-3" />
                        <span>{isAr ? "بث إشعار" : "Broadcast"}</span>
                      </Button>
                    )}

                    {onMarkAllNotificationsRead && (notificationsData?.unreadCount ?? 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleMarkAllNotificationsRead()}
                        className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground gap-1 rounded-md"
                        title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
                      >
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? "قراءة الكل" : "Read all"}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabs: Alerts vs Action Tasks */}
                <Tabs value={notifActiveTab} onValueChange={(v: any) => setNotifActiveTab(v)}>
                  <TabsList className="grid grid-cols-2 p-1 m-2 bg-muted/60 rounded-xl">
                    <TabsTrigger value="alerts" className="text-xs py-1">
                      {isAr ? "التنبيهات الحية" : "Live Alerts"}{" "}
                      {unreadLiveCount > 0 && (
                        <span className="ms-1 font-mono text-[10px]">({unreadLiveCount})</span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="text-xs py-1">
                      {isAr ? "المهام المعلقة" : "Action Queue"}{" "}
                      {totalPendingAlerts > 0 && (
                        <span className="ms-1 font-mono text-[10px]">({totalPendingAlerts})</span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Live Notifications */}
                  <TabsContent
                    value="alerts"
                    className="max-h-72 overflow-y-auto p-2 space-y-1 mt-0"
                  >
                    {!notificationsData?.notifications ||
                    notificationsData.notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
                        <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/60" />
                        <p>{isAr ? "لا توجد تنبيهات غير مقروءة" : "No new notifications"}</p>
                      </div>
                    ) : (
                      notificationsData.notifications.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all",
                            item.is_read
                              ? "bg-card border-border/40 text-muted-foreground opacity-75"
                              : "bg-primary/5 border-primary/20 text-foreground font-medium",
                          )}
                        >
                          <div className="mt-0.5 shrink-0">{getNotifIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-foreground truncate block">
                                {isAr ? item.title_ar : item.title_en || item.title_ar}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                {formatNotifTime(item.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                              {isAr ? item.message_ar : item.message_en || item.message_ar}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!item.is_read && onMarkNotificationRead && (
                              <button
                                type="button"
                                onClick={() => void handleMarkNotificationRead(item.id)}
                                className="text-muted-foreground hover:text-primary p-1"
                                aria-label={isAr ? "تحديد كمقروء" : "Mark as read"}
                                title={isAr ? "تحديد كمقروء" : "Mark as read"}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            {onDeleteNotification && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteNotification(item.id)}
                                className="text-muted-foreground hover:text-destructive p-1"
                                aria-label={isAr ? "حذف الإشعار" : "Delete notification"}
                                title={isAr ? "حذف" : "Delete"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Tab 2: Action Tasks Queue */}
                  <TabsContent
                    value="tasks"
                    className="max-h-72 overflow-y-auto p-2 space-y-1.5 mt-0"
                  >
                    {(badgeCounts.pendingReceipts ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          onSelectTab("treasury", "treasury_ledger");
                          setNotifPopoverOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-xs text-start transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-amber-500" />
                          <div>
                            <span className="font-bold block text-foreground">
                              {isAr
                                ? "إيصالات مساهمة مالية بانتظار الاعتماد"
                                : "Pending Treasury Receipts"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {isAr
                                ? "تحتاج لمراجعة المستند وتأكيد التحويل البنكي"
                                : "Review bank slips"}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-amber-500 text-white font-mono font-bold text-[10px]">
                          {badgeCounts.pendingReceipts}
                        </Badge>
                      </button>
                    )}

                    {(badgeCounts.pendingVerifications ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          onSelectTab("community", "verification");
                          setNotifPopoverOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-xs text-start transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-500" />
                          <div>
                            <span className="font-bold block text-foreground">
                              {isAr
                                ? "طلبات توثيق حسابات عائلية جديدة"
                                : "Membership Verifications"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {isAr ? "تحقق من صلة القرابة والفرع" : "Verify tribal lineage"}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-blue-500 text-white font-mono font-bold text-[10px]">
                          {badgeCounts.pendingVerifications}
                        </Badge>
                      </button>
                    )}

                    {(badgeCounts.pendingInquiries ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          onSelectTab("community", "inquiries");
                          setNotifPopoverOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs text-start transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-500" />
                          <div>
                            <span className="font-bold block text-foreground">
                              {isAr ? "استفسارات ورسائل تواصل واردة" : "New Inquiries Inbox"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {isAr ? "استفسارات الأعضاء تتطلب رداً" : "Awaiting response"}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-indigo-500 text-white font-mono font-bold text-[10px]">
                          {badgeCounts.pendingInquiries}
                        </Badge>
                      </button>
                    )}

                    {(badgeCounts.draftArticles ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          onSelectTab("content", "articles");
                          setNotifPopoverOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 text-xs text-start transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Newspaper className="w-4 h-4 text-primary" />
                          <div>
                            <span className="font-bold block text-foreground">
                              {isAr ? "مقالات وأخبار قيد الإعداد (مسودات)" : "Draft Articles"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {isAr ? "بانتظار المراجعة والاعتماد للنشر" : "Ready for review"}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono font-bold text-[10px]">
                          {badgeCounts.draftArticles}
                        </Badge>
                      </button>
                    )}

                    {totalPendingAlerts === 0 && (
                      <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
                        <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/60" />
                        <p>
                          {isAr
                            ? "لا توجد مهام معلقة، كل العمليات مكتملة!"
                            : "All tasks are resolved!"}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>

            {/* Quick View Website Button */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 border border-border/60 shadow-2xs transition-colors"
              title={isAr ? "فتح الموقع الخارجي" : "View Live Site"}
            >
              <span>{isAr ? "واجهة المنصة" : "Live Site"}</span>
              <ExternalLink className="w-3 h-3 text-primary" />
            </Link>
          </div>
        </header>

        {/* Mobile Sub-Tab Navigation Ribbon */}
        {currentDomain.tabs.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-3 border-b border-border/60 bg-card/40 md:hidden">
            {currentDomain.tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isTabActive = tab.id === activeTabId;
              const tabBadge = tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(currentDomain.id, tab.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    isTabActive
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? tab.label_ar : tab.label_en}</span>
                  {tabBadge > 0 && (
                    <span className="ms-0.5 px-1 py-0.2 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold font-mono">
                      {tabBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body Area */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>

      {/* =========================================================================
       * 3. GLOBAL COMMAND PALETTE (CTRL+K)
       * ========================================================================= */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        items={searchItems}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
      />

      {/* =========================================================================
       * 4. BROADCAST NOTIFICATION MODAL
       * ========================================================================= */}
      <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              {isAr ? "بث إشعار عام لجميع المستخدمين" : "Broadcast Notification"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "سيظهر هذا الإشعار في مركز التنبيهات لجميع أعضاء المنصة والمشرفين."
                : "This notification will be delivered to all platform members and administrators."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBroadcastSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr ? "عنوان الإشعار (بالعربية)" : "Title (Arabic)"}
              </Label>
              <Input
                required
                value={broadcastForm.title_ar}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title_ar: e.target.value })}
                placeholder={
                  isAr
                    ? "مثال: تحديث شجرة الأنساب أو موعد اللقاء القادم"
                    : "e.g. Family gathering notice"
                }
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr ? "نص الرسالة (بالعربية)" : "Message Body (Arabic)"}
              </Label>
              <Textarea
                required
                rows={3}
                value={broadcastForm.body_ar}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, body_ar: e.target.value })}
                placeholder={isAr ? "اكتب تفاصيل الإشعار هنا..." : "Write notification details..."}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "نوع التنبيه" : "Alert Type"}
                </Label>
                <Select
                  value={broadcastForm.type}
                  onValueChange={(val) => setBroadcastForm({ ...broadcastForm, type: val })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{isAr ? "معلوماتي عادي" : "Information"}</SelectItem>
                    <SelectItem value="announcement">
                      {isAr ? "إعلان رسمي" : "Official Announcement"}
                    </SelectItem>
                    <SelectItem value="event">{isAr ? "مناسبة وفعالية" : "Event"}</SelectItem>
                    <SelectItem value="urgent">{isAr ? "تنبيه عاجل" : "Urgent Notice"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "رابط توجيه (اختياري)" : "Action Link (Optional)"}
                </Label>
                <Input
                  value={broadcastForm.link_url}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, link_url: e.target.value })}
                  placeholder="/events أو /articles"
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="ghost"
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
                className="gap-2 text-xs bg-primary text-primary-foreground font-bold"
              >
                {submittingBroadcast ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Megaphone className="w-3.5 h-3.5" />
                )}
                {isAr ? "إرسال الإشعار الآن" : "Send Broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
       * 5. ADMINISTRATOR USER GUIDE & HELP MODAL
       * ========================================================================= */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {isAr ? "دليل المشرف الإداري السريع" : "Administrator Quick Guide"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "إرشادات سريعة لمساعدتك في إدارة منظومة مجلس آل بوعبيد بكل يسر وسهولة."
                : "Quick reference guide for navigating and operating the Al Bu Obaid management platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Business Structure Map */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Compass className="w-4 h-4 text-primary" />
                {isAr ? "الأقسام والقطاعات الإدارية الستة:" : "The 6 Core Business Modules:"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    1. {isAr ? "الرئيسية والمتابعة" : "Dashboard"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "المؤشرات العامة وقائمة المهام التي تتطلب تدخلك."
                      : "Key metrics and pending action items."}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    2. {isAr ? "الأسرة والأنساب" : "Family & Tree"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "سجل الأفراد، الشجرة التفاعلية، الفروع والنسب."
                      : "Genealogy, interactive tree, and branches."}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    3. {isAr ? "المحتوى والنشر" : "Content & Media"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "المقالات، الفعاليات، الإعلانات، ومكتبة الوسائط."
                      : "Articles, events, notices, and media library."}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    4. {isAr ? "التواصل والمجتمع" : "Community"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "صندوق الرسائل، دليل الأعمال، وتوثيق العضويات."
                      : "Inquiries, directory, and verification."}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    5. {isAr ? "الخزينة والمشاريع" : "Treasury"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "المساهمات المالية، مبادرات المقر، ولوحة الشرف."
                      : "Contributions, HQ campaign, and honor roll."}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border/50">
                  <span className="font-bold text-foreground block">
                    6. {isAr ? "الإدارة والنظام" : "Governance"}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr
                      ? "المستخدمون، الصلاحيات، وسجل الأمان والرقابة."
                      : "Access control, audit trail, and settings."}
                  </span>
                </div>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="p-3 rounded-xl border border-border bg-card space-y-2">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <Keyboard className="w-4 h-4 text-primary" />
                {isAr ? "اختصارات لوحة المفاتيح:" : "Keyboard Shortcuts:"}
              </h4>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 font-mono text-[11px]">
                <span>
                  {isAr ? "البحث الشامل والأوامر السريعة" : "Global Search & Command Palette"}
                </span>
                <kbd className="bg-background px-2 py-0.5 rounded border border-border font-bold">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border">
            <Button
              size="sm"
              onClick={() => setHelpModalOpen(false)}
              className="text-xs bg-primary font-bold"
            >
              {isAr ? "فهمت ذلك، إغلاق" : "Got it"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
