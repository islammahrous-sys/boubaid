import { useState, useMemo, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { DirectionProvider } from "@radix-ui/react-direction";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
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
  Inbox,
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
  consoleRolesFor,
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
  const { user, profile, roles, signOut, isAdmin, isSuperAdmin, canAccessConsole } = useAuth();
  const confirm = useConfirm();

  // Multi-admin Realtime synchronization
  useAdminRealtime(canAccessConsole);

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
  const consoleNavigate = useNavigate();
  const consoleQueryClient = useQueryClient();
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
    const list: AdminRole[] = consoleRolesFor(roles);
    if (list.length === 0) list.push("admin"); // fallback
    return list;
  }, [roles]);

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

  const displayName = isAr
    ? profile?.full_name_ar || profile?.full_name_en || user?.email?.split("@")[0]
    : profile?.full_name_en || profile?.full_name_ar || user?.email?.split("@")[0];
  const initial =
    profile?.full_name_ar?.[0] ||
    profile?.full_name_en?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    "A";
  const roleLabel = isSuperAdmin
    ? isAr
      ? "مشرف عام"
      : "Super Admin"
    : isAdmin
      ? isAr
        ? "مدير نظام"
        : "Admin"
      : isAr
        ? "مسؤول قطاع"
        : "Officer";
  const DomainIconCurrent = currentDomain.icon;
  const pageDescription = isAr ? currentTab.description_ar : currentTab.description_en;

  // Sidebar navigation: one calm list. Each group shows its pages only when
  // open (the active group always is), pages carry no icons of their own —
  // the group icon already says where you are — and pending work is pulled
  // into a single "awaiting you" entry instead of red badges everywhere.
  const renderNavList = (isMobile = false) => {
    const isCollapsed = !isMobile && sidebarCollapsed;
    const closeDrawer = () => {
      if (isMobile) setMobileDrawerOpen(false);
    };

    return (
      <TooltipProvider delayDuration={120}>
        <nav aria-label={isAr ? "أقسام لوحة الإدارة" : "Console sections"} className="space-y-1">
          {totalPendingAlerts > 0 &&
            (isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onSelectTab("dashboard", "overview")}
                    className="console-rail-item relative mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(236_166_84/0.16)] text-gold"
                    aria-label={isAr ? "بانتظار قرارك" : "Awaiting you"}
                  >
                    <Inbox className="h-[18px] w-[18px]" />
                    <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold tabular-nums text-[#2b1a10]">
                      {totalPendingAlerts}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side={isRtl ? "left" : "right"} className="text-xs">
                  {isAr
                    ? `${totalPendingAlerts} عناصر بانتظار قرارك`
                    : `${totalPendingAlerts} items awaiting you`}
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSelectTab("dashboard", "overview");
                  closeDrawer();
                }}
                className="console-rail-item mb-4 flex w-full items-center gap-3 rounded-2xl border border-[rgb(236_166_84/0.32)] bg-[rgb(236_166_84/0.1)] px-3 py-2.5 text-start text-[var(--console-rail-fg)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold text-[#2b1a10]">
                  <Inbox className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    {isAr ? "بانتظار قرارك" : "Awaiting you"}
                  </span>
                  <span className="block truncate text-xs text-[var(--console-rail-muted)]">
                    {isAr ? "طلبات ورسائل ومسودات" : "Requests, messages & drafts"}
                  </span>
                </span>
                <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold tabular-nums text-[#2b1a10]">
                  {totalPendingAlerts}
                </span>
              </button>
            ))}

          {!isCollapsed && (
            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold text-[var(--console-rail-faint)]">
              {isAr ? "الأقسام" : "Sections"}
            </p>
          )}

          {visibleDomains.map((domain) => {
            const DomainIcon = domain.icon;
            const isDomainActive = domain.id === activeDomainId;
            const isSingle = domain.tabs.length === 1;
            const isExpanded = isDomainActive || !!expandedDomains[domain.id];
            const domainBadge = domain.tabs.reduce(
              (sum, tab) => sum + (tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0),
              0,
            );
            const preloadDomain = () => domain.tabs.forEach((t) => preloadAdminManager(t.id));

            if (isCollapsed) {
              return (
                <Tooltip key={domain.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-active={isDomainActive}
                      onClick={() => onSelectTab(domain.id, domain.tabs[0]?.id || "")}
                      onMouseEnter={preloadDomain}
                      onFocus={preloadDomain}
                      aria-label={isAr ? domain.label_ar : domain.label_en}
                      className="console-rail-item relative mx-auto flex h-11 w-11 items-center justify-center rounded-xl"
                    >
                      <DomainIcon className="h-[18px] w-[18px]" />
                      {domainBadge > 0 && (
                        <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-[var(--console-rail)]" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={isRtl ? "left" : "right"} className="max-w-xs p-3 text-xs">
                    <p className="font-semibold">{isAr ? domain.label_ar : domain.label_en}</p>
                    {!isSingle && (
                      <p className="mt-1 opacity-80">
                        {domain.tabs.map((t) => (isAr ? t.label_ar : t.label_en)).join(" · ")}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={domain.id}>
                <button
                  type="button"
                  data-active={isSingle && isDomainActive}
                  aria-expanded={isSingle ? undefined : isExpanded}
                  onClick={() => {
                    if (isSingle) {
                      onSelectTab(domain.id, domain.tabs[0].id);
                      closeDrawer();
                    } else if (!isDomainActive) {
                      toggleDomainExpand(domain.id);
                    }
                  }}
                  onMouseEnter={preloadDomain}
                  onFocus={preloadDomain}
                  className={cn(
                    "console-rail-item flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start text-sm font-semibold",
                    isDomainActive && "text-[var(--console-rail-fg)]",
                    !isSingle && isDomainActive && "cursor-default hover:bg-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isDomainActive
                        ? "bg-[rgb(236_166_84/0.2)] text-gold"
                        : "bg-[rgb(247_236_223/0.06)]",
                    )}
                  >
                    <DomainIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {isAr ? domain.label_ar : domain.label_en}
                  </span>
                  {domainBadge > 0 && !isExpanded && (
                    <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold tabular-nums leading-5 text-[#2b1a10]">
                      {domainBadge}
                    </span>
                  )}
                  {!isSingle && !isDomainActive && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 opacity-50 transition-transform duration-300",
                        isExpanded && "rotate-180",
                      )}
                    />
                  )}
                </button>

                {!isSingle && isExpanded && (
                  <ul className="relative mb-2 mt-0.5 space-y-0.5 ps-[2.6rem]">
                    <span
                      aria-hidden
                      className="absolute inset-y-1 start-[1.55rem] w-px bg-[var(--console-rail-line)]"
                    />
                    {domain.tabs.map((tab) => {
                      const isTabActive = isDomainActive && tab.id === activeTabId;
                      const tabBadge = tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0;
                      return (
                        <li key={tab.id}>
                          <button
                            type="button"
                            data-active={isTabActive}
                            aria-current={isTabActive ? "page" : undefined}
                            onClick={() => {
                              onSelectTab(domain.id, tab.id);
                              closeDrawer();
                            }}
                            onMouseEnter={() => preloadAdminManager(tab.id)}
                            onFocus={() => preloadAdminManager(tab.id)}
                            className="console-rail-item flex w-full items-center justify-between gap-2 rounded-lg px-3 py-[7px] text-start text-[13.5px]"
                          >
                            <span className="truncate">{isAr ? tab.label_ar : tab.label_en}</span>
                            {tabBadge > 0 && (
                              <span className="rounded-full bg-gold px-1.5 text-[11px] font-bold tabular-nums leading-5 text-[#2b1a10]">
                                {tabBadge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </TooltipProvider>
    );
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    // Leave the protected console first so its queries never refetch against
    // a cleared session (401 → generic error page), then end the session.
    await consoleQueryClient.cancelQueries();
    await consoleNavigate({ to: "/", replace: true });
    await signOut();
    consoleQueryClient.clear();
  };

  const userMenu = (
    <DropdownMenuContent align="end" side="top" className="w-64 p-1.5 shadow-xl">
      <DropdownMenuLabel className="p-2 text-xs">
        <span className="block truncate font-bold text-foreground">{displayName}</span>
        <span className="block truncate text-[11px] font-normal text-muted-foreground">
          {user?.email}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/account" className="cursor-pointer text-xs">
          <User className="me-2 h-3.5 w-3.5" />
          {isAr ? "الملف الشخصي والحساب" : "My Profile"}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setHelpModalOpen(true)} className="cursor-pointer text-xs">
        <HelpCircle className="me-2 h-3.5 w-3.5 text-primary" />
        {isAr ? "دليل الاستخدام والمساعدة" : "Help & Documentation"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        disabled={signingOut}
        className="cursor-pointer text-xs text-destructive focus:text-destructive"
      >
        <LogOut className="me-2 h-3.5 w-3.5" />
        {isAr ? "تسجيل الخروج" : "Sign Out"}
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const userAvatar = (size: string) => (
    <Avatar
      className={cn(
        "shrink-0 rounded-full bg-[rgb(236_166_84/0.2)] ring-2 ring-[rgb(236_166_84/0.45)]",
        size,
      )}
    >
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={displayName || ""} className="object-cover" />
      )}
      <AvatarFallback className="bg-[rgb(236_166_84/0.2)] text-sm font-bold text-gold">
        {initial}
      </AvatarFallback>
    </Avatar>
  );

  const brand = (compact: boolean) => (
    <Link
      to="/"
      className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      title={isAr ? "الانتقال إلى الموقع" : "Go to website"}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(247_236_223/0.07)] ring-1 ring-[rgb(236_166_84/0.35)] transition-transform duration-300 group-hover:scale-105">
        <img src="/logo-mark-gold.svg" alt="" className="h-8 w-8 object-contain" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="console-title block truncate text-[17px] text-[var(--console-rail-fg)]">
            {isAr ? "مجلس آل بوعبيد" : "Al Bu Obaid Council"}
          </span>
          <span className="block truncate text-xs text-[var(--console-rail-faint)]">
            {isAr ? "منظومة الإدارة" : "Management console"}
          </span>
        </span>
      )}
    </Link>
  );

  return (
    // Radix primitives default to LTR and stamp dir="ltr" on their roots (Tabs
    // flipped every table inside them); give them the console's real direction.
    <DirectionProvider dir={isRtl ? "rtl" : "ltr"}>
      <div className="console-shell flex min-h-screen flex-col text-foreground md:flex-row">
        {signingOut && (
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              {isAr ? "جاري تسجيل الخروج..." : "Signing out..."}
            </p>
          </div>
        )}

        {/* ==================== 1. RAIL (desktop sidebar) ==================== */}
        <aside
          className={cn(
            "console-rail sticky top-0 z-30 hidden h-screen shrink-0 select-none flex-col transition-[width] duration-300 md:flex",
            sidebarCollapsed ? "w-[84px]" : "w-[284px]",
          )}
        >
          <div
            className={cn(
              "flex h-[76px] items-center border-b border-[var(--console-rail-line)]",
              sidebarCollapsed ? "justify-center px-2" : "justify-between gap-2 px-4",
            )}
          >
            {brand(sidebarCollapsed)}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={handleToggleSidebar}
                className="console-rail-item hidden h-8 w-8 items-center justify-center rounded-lg lg:flex"
                aria-label={isAr ? "طي القائمة" : "Collapse sidebar"}
                title={isAr ? "طي القائمة" : "Collapse sidebar"}
              >
                <PanelLeftClose className="h-4 w-4 rtl:rotate-180" />
              </button>
            )}
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
            {renderNavList(false)}
          </div>

          <div className="space-y-1 border-t border-[var(--console-rail-line)] p-3">
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={handleToggleSidebar}
                className="console-rail-item mx-auto flex h-10 w-10 items-center justify-center rounded-xl"
                aria-label={isAr ? "توسيع القائمة" : "Expand sidebar"}
                title={isAr ? "توسيع القائمة" : "Expand sidebar"}
              >
                <PanelLeftOpen className="h-4 w-4 rtl:rotate-180" />
              </button>
            )}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="console-rail-item flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-[13.5px]"
              >
                <HelpCircle className="h-4 w-4" />
                {isAr ? "دليل الاستخدام" : "User guide"}
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "console-rail-item flex w-full items-center gap-3 rounded-2xl text-start",
                    sidebarCollapsed ? "justify-center p-1.5" : "p-2",
                  )}
                  aria-label={isAr ? "قائمة الحساب" : "Account menu"}
                >
                  {userAvatar("h-10 w-10")}
                  {!sidebarCollapsed && (
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--console-rail-fg)]">
                        {displayName}
                      </span>
                      <span className="block truncate text-xs text-gold">{roleLabel}</span>
                    </span>
                  )}
                  {!sidebarCollapsed && <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
                </button>
              </DropdownMenuTrigger>
              {userMenu}
            </DropdownMenu>
          </div>
        </aside>

        {/* ==================== 2. WORKSPACE ==================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="console-topbar sticky top-0 z-20 flex h-16 select-none items-center gap-2 px-3 md:gap-3 md:px-6">
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="console-icon-btn md:hidden"
                  aria-label={isAr ? "فتح القائمة" : "Open menu"}
                >
                  <MenuIcon className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side={isRtl ? "right" : "left"}
                className="console-portal console-rail flex w-[300px] flex-col border-0 p-0 text-[var(--console-rail-fg)]"
              >
                <SheetTitle className="sr-only">
                  {isAr ? "أقسام الإدارة" : "Console sections"}
                </SheetTitle>
                <div className="flex h-[76px] items-center border-b border-[var(--console-rail-line)] px-4">
                  {brand(false)}
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">{renderNavList(true)}</div>
                <div className="flex items-center gap-3 border-t border-[var(--console-rail-line)] p-4">
                  {userAvatar("h-10 w-10")}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{displayName}</span>
                    <span className="block truncate text-xs text-gold">{roleLabel}</span>
                  </span>
                </div>
              </SheetContent>
            </Sheet>

            {/* One search for everything: pages, members, articles, users. */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="group flex h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[var(--console-hairline)] bg-card px-4 text-start text-sm text-muted-foreground shadow-[var(--console-shadow-sm)] transition-[box-shadow,transform] duration-300 hover:shadow-[var(--console-shadow-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.995] md:max-w-xl"
            >
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">
                {isAr ? "بحث شامل وأوامر سريعة..." : "Search across admin..."}
              </span>
              <kbd className="ms-auto hidden shrink-0 rounded-md border border-[var(--console-hairline)] bg-[var(--console-canvas)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground lg:inline-flex">
                Ctrl K
              </kbd>
            </button>

            <div className="ms-auto flex shrink-0 items-center gap-0.5 md:gap-1">
              <button
                type="button"
                onClick={() => setLang(isAr ? "en" : "ar")}
                className="console-icon-btn hidden text-sm font-semibold sm:inline-flex"
                title={isAr ? "Switch to English" : "التحويل للعربية"}
              >
                {isAr ? "EN" : "ع"}
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="console-icon-btn hidden sm:inline-flex"
                aria-label={isAr ? "تغيير المظهر" : "Toggle theme"}
                title={isAr ? "تغيير المظهر" : "Toggle theme"}
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" />
                )}
              </button>

              {/* Attention & Notifications Center Popover */}
              <Popover open={notifPopoverOpen} onOpenChange={setNotifPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="console-icon-btn relative"
                    aria-label={
                      isAr ? "مركز الإشعارات والمهام المعلقة" : "Notifications & attention center"
                    }
                    title={
                      isAr ? "مركز الإشعارات والمهام المعلقة" : "Notifications & attention center"
                    }
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {totalCombinedBadge > 0 && (
                      <span className="absolute -top-0.5 -end-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#b4532a] px-1 text-[10px] font-bold tabular-nums text-white ring-2 ring-[var(--console-canvas)]">
                        {totalCombinedBadge > 99 ? "99+" : totalCombinedBadge}
                      </span>
                    )}
                  </button>
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
                            onClick={() => {
                              if (!item.is_read && onMarkNotificationRead) {
                                void handleMarkNotificationRead(item.id);
                              }
                              if (item.link) {
                                setNotifPopoverOpen(false);
                                window.location.href = item.link;
                              }
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer hover:bg-muted/60",
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
                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!item.is_read && onMarkNotificationRead && (
                                <button
                                  type="button"
                                  onClick={() => void handleMarkNotificationRead(item.id)}
                                  className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-primary/10"
                                  aria-label={isAr ? "تحديد كمقروء" : "Mark as read"}
                                  title={isAr ? "تحديد كمقروء" : "Mark as read"}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteNotification && (
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteNotification(item.id)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
                                  aria-label={isAr ? "حذف الإشعار" : "Delete notification"}
                                  title={isAr ? "حذف" : "Delete"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
                      {(badgeCounts.pendingVerifications ?? 0) > 0 && (
                        <button
                          onClick={() => {
                            onSelectTab("registration", "requests");
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

              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="console-icon-btn gap-1.5 text-sm"
                title={isAr ? "فتح الموقع في نافذة جديدة" : "Open the website in a new tab"}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden lg:inline">{isAr ? "الموقع" : "Website"}</span>
              </Link>
            </div>
          </header>

          {/* Mobile: sibling pages of the current section */}
          {currentDomain.tabs.length > 1 && (
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-[var(--console-hairline)] bg-card/60 px-3 py-2 md:hidden">
              {currentDomain.tabs.map((tab) => {
                const isTabActive = tab.id === activeTabId;
                const tabBadge = tab.badgeKey ? (badgeCounts[tab.badgeKey] ?? 0) : 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(currentDomain.id, tab.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                      isTabActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span>{isAr ? tab.label_ar : tab.label_en}</span>
                    {tabBadge > 0 && (
                      <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold tabular-nums text-[#2b1a10]">
                        {tabBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <main className="mx-auto w-full max-w-[1360px] flex-1 space-y-6 px-4 py-6 md:px-8 md:py-8">
            {activeDomainId !== "dashboard" && (
              <div
                key={`${activeDomainId}:${activeTabId}`}
                className="console-rise flex items-start gap-4"
              >
                <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--console-shadow-md)] sm:flex">
                  <DomainIconCurrent className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="console-eyebrow">
                    {isAr ? currentDomain.label_ar : currentDomain.label_en}
                  </p>
                  <h1 className="console-title mt-1 text-[26px] text-foreground md:text-[32px]">
                    {isAr ? currentTab.label_ar : currentTab.label_en}
                  </h1>
                  {pageDescription && (
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {pageDescription}
                    </p>
                  )}
                </div>
              </div>
            )}
            {children}
          </main>
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
                  placeholder={
                    isAr ? "اكتب تفاصيل الإشعار هنا..." : "Write notification details..."
                  }
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
                      <SelectItem value="urgent">
                        {isAr ? "تنبيه عاجل" : "Urgent Notice"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "رابط توجيه (اختياري)" : "Action Link (Optional)"}
                  </Label>
                  <Input
                    value={broadcastForm.link_url}
                    onChange={(e) =>
                      setBroadcastForm({ ...broadcastForm, link_url: e.target.value })
                    }
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
                        ? "صندوق الرسائل واستفسارات التواصل، ودليل المنشآت والأعمال."
                        : "Inquiries, messages, and business directory."}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border/50">
                    <span className="font-bold text-foreground block">
                      5. {isAr ? "المبادرات ولوحة الشرف" : "Initiatives & Honour Roll"}
                    </span>
                    <span className="text-muted-foreground">
                      {isAr
                        ? "مبادرات المقر ومشاريع التطوير، ولوحة الشرف."
                        : "HQ initiatives, development projects, and honour roll."}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border/50">
                    <span className="font-bold text-foreground block">
                      6. {isAr ? "الإدارة والنظام" : "Governance"}
                    </span>
                    <span className="text-muted-foreground">
                      {isAr
                        ? "المستخدمون وتوثيق العضوية، مصفوفة الصلاحيات، وسجل الأمان والرقابة."
                        : "User accounts, verification, access control, and audit logs."}
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
    </DirectionProvider>
  );
}
