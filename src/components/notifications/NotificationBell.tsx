import { useState, useTransition } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Landmark,
  ShieldCheck,
  GitBranch,
  MessageSquare,
  Sparkles,
  Loader2,
  ExternalLink,
  Settings,
  BellOff,
} from "lucide-react";
import { formatDualDate } from "@/lib/dates";
import { useLang } from "@/i18n/LanguageProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategoryForType, type NotificationCategory } from "@/lib/notifications.types";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
  align?: "start" | "end" | "center";
}

function safeNotifLink(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

export function NotificationBell({ className, align = "end" }: NotificationBellProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [isPending, startTransition] = useTransition();

  const {
    notifications,
    unreadCount,
    isLoading,
    categorized,
    markAsReadAsync,
    markAllAsReadAsync,
    deleteNotificationAsync,
    isMarkingAllRead,
  } = useNotifications();

  const items = categorized[activeTab] ?? [];

  const handleNavigate = async (
    e: React.MouseEvent,
    item: { id: string; link: string | null; is_read: boolean },
  ) => {
    e.preventDefault();
    if (!item.is_read) {
      await markAsReadAsync(item.id).catch(() => undefined);
    }
    setOpen(false);

    const safeUrl = safeNotifLink(item.link);
    if (safeUrl) {
      startTransition(() => {
        try {
          void navigate({ to: safeUrl as any });
        } catch {
          window.location.href = safeUrl;
        }
      });
    }
  };

  const getIconForType = (type: string) => {
    const cat = getCategoryForType(type);
    switch (cat) {
      case "events":
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case "contributions":
        return <Landmark className="w-4 h-4 text-emerald-500" />;
      case "heritage":
        return type === "lineage" || type === "family_tree" ? (
          <GitBranch className="w-4 h-4 text-bronze dark:text-gold" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary" />
        );
      case "system":
      default:
        if (type === "membership" || type === "role_change") {
          return <ShieldCheck className="w-4 h-4 text-blue-500" />;
        }
        if (type === "inquiry" || type === "contact_message") {
          return <MessageSquare className="w-4 h-4 text-indigo-500" />;
        }
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = Date.now();
      const date = new Date(dateStr).getTime();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return isAr ? "الآن" : "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return isAr ? `منذ ${diffMin} د` : `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return isAr ? `منذ ${diffHour} س` : `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return isAr ? `منذ ${diffDay} ي` : `${diffDay}d ago`;
      // Older than a week: both calendars, via the site-wide date utility.
      return formatDualDate(dateStr, isAr ? "ar" : "en", "short");
    } catch {
      return "";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={isAr ? "الإشعارات والتنبيهات" : "Notifications"}
          className={cn(
            "relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-md border border-border bg-secondary/30 text-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            unreadCount > 0 && "border-gold/50 bg-gold/5 dark:bg-gold/10",
            className,
          )}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-gold dark:text-gold animate-in fade-in" />
          ) : (
            <Bell className="h-4 w-4 text-muted-foreground" />
          )}

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -end-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground shadow-xs animate-in zoom-in-75",
                unreadCount > 0 && "ring-2 ring-background",
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-[430px] p-0 shadow-2xl border-border bg-popover text-popover-foreground rounded-xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">
              {isAr ? "مركز الإشعارات والتنبيهات" : "Notification Center"}
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
                {unreadCount} {isAr ? "جديد" : "new"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isMarkingAllRead}
                onClick={() => void markAllAsReadAsync()}
                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1 rounded-md"
                title={isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{isAr ? "قراءة الكل" : "Mark all read"}</span>
              </Button>
            )}

            <Link
              to="/account"
              search={{ tab: "notifications" } as any}
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title={isAr ? "تفضيلات الإشعارات" : "Notification Preferences"}
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Categorized Tabs */}
        <div className="border-b border-border/80 bg-background/50 px-2 py-1.5">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as NotificationCategory)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 h-8 bg-muted/60 p-0.5 rounded-lg text-[10px] sm:text-[11px]">
              <TabsTrigger value="all" className="px-1 py-1 rounded-md">
                {isAr ? "الكل" : "All"}
              </TabsTrigger>
              <TabsTrigger value="unread" className="px-1 py-1 rounded-md relative">
                {isAr ? "جديد" : "Unread"}
                {categorized.counts.unread > 0 && (
                  <span className="ms-0.5 font-mono text-[9px] text-destructive font-bold">
                    ({categorized.counts.unread})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="system" className="px-1 py-1 rounded-md">
                {isAr ? "النظام" : "System"}
              </TabsTrigger>
              <TabsTrigger value="events" className="px-1 py-1 rounded-md">
                {isAr ? "الفعاليات" : "Events"}
              </TabsTrigger>
              <TabsTrigger value="heritage" className="px-1 py-1 rounded-md">
                {isAr ? "التراث" : "Heritage"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center py-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-3/4 bg-muted rounded" />
                    <div className="h-2.5 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <BellOff className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-medium text-muted-foreground">
                {activeTab === "unread"
                  ? isAr
                    ? "لا توجد إشعارات غير مقروءة حالياً"
                    : "No unread notifications"
                  : isAr
                    ? "لا توجد إشعارات في هذا القسم"
                    : "No notifications in this category"}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const title = isAr ? item.title_ar : item.title_en || item.title_ar;
              const message = isAr ? item.message_ar : item.message_en || item.message_ar;
              const isUnread = !item.is_read;

              return (
                <div
                  key={item.id}
                  onClick={(e) => void handleNavigate(e, item)}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 cursor-pointer text-start",
                    isUnread && "bg-primary/5 dark:bg-primary/10",
                  )}
                >
                  {/* Icon badge */}
                  <div
                    className={cn(
                      "mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-border bg-card shrink-0 shadow-2xs",
                      isUnread && "border-primary/30 shadow-xs",
                    )}
                  >
                    {getIconForType(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs truncate",
                          isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80",
                        )}
                      >
                        {title}
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Actions (Mark read, Delete) */}
                  <div
                    className="flex items-center gap-1 shrink-0 ms-1 opacity-80 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void markAsReadAsync(item.id)}
                        className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary"
                        title={isAr ? "تمييز كمقروء" : "Mark as read"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void deleteNotificationAsync(item.id)}
                      className="h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title={isAr ? "حذف الإشعار" : "Delete notification"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 p-2 flex items-center justify-between text-[11px]">
          <Link
            to="/account"
            search={{ tab: "notifications" } as any}
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            <Settings className="w-3 h-3" />
            <span>{isAr ? "تفضيلات الإشعارات" : "Preferences"}</span>
          </Link>

          <Link
            to="/account"
            search={{ tab: "notifications" } as any}
            onClick={() => setOpen(false)}
            className="font-medium text-primary hover:underline flex items-center gap-1 px-2 py-1"
          >
            <span>{isAr ? "عرض الكل في حسابي" : "View all"}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
