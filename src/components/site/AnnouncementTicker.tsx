import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicAnnouncements } from "@/lib/cms.functions";
import { useLang } from "@/i18n/LanguageProvider";
import {
  AlertCircle,
  Bell,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

export function AnnouncementTicker() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: announcements = [] } = useQuery({
    queryKey: ["public_announcements"],
    queryFn: () => getPublicAnnouncements(),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (dismissed || !announcements || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex] || announcements[0];
  if (!current) return null;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          bg: "bg-rose-950/85 border-rose-800/60 text-rose-100",
          badge: "bg-rose-600 text-white",
          label: isAr ? "تنبيه عاجل" : "Urgent Alert",
          icon: AlertCircle,
        };
      case "congratulations":
      case "wedding":
        return {
          bg: "bg-emerald-950/85 border-emerald-800/60 text-emerald-100",
          badge: "bg-emerald-600 text-white",
          label: isAr ? "تهنئة ومباركة" : "Congratulations",
          icon: Sparkles,
        };
      case "condolences":
        return {
          bg: "bg-slate-900/90 border-slate-700/60 text-slate-200",
          badge: "bg-slate-700 text-white",
          label: isAr ? "تعزية ومواساة" : "Condolences",
          icon: Heart,
        };
      default:
        return {
          bg: "bg-amber-950/85 border-amber-800/50 text-amber-100",
          badge: "bg-primary text-primary-foreground",
          label: isAr ? "إعلان هام" : "Announcement",
          icon: Bell,
        };
    }
  };

  const style = getPriorityStyle(current.priority || "normal");
  const Icon = style.icon;
  const title = isAr ? current.title_ar : current.title_en || current.title_ar;
  const message = isAr ? current.message_ar : current.message_en || current.message_ar;

  return (
    <aside
      aria-label={isAr ? "شريط الإعلانات العاجلة" : "Urgent Announcements Ticker"}
      className={`relative z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${style.bg}`}
    >
      <div className="container-header flex items-center justify-between py-2 text-xs gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Badge
            className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full ${style.badge}`}
          >
            <Icon className="w-3 h-3 me-1 inline-block shrink-0" />
            <span>{style.label}</span>
          </Badge>

          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="font-bold truncate text-white text-[12px]">{title}</span>
            {message && (
              <span className="hidden sm:inline text-white/80 truncate text-[11px]">
                — {message}
              </span>
            )}
          </div>

          {current.link_url && (
            <Link
              to={current.link_url}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-white underline underline-offset-2 hover:text-white/80 transition-opacity ms-1"
            >
              <span>
                {isAr ? current.link_label_ar || "تفاصيل" : current.link_label_en || "Details"}
              </span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-white/80">
          {announcements.length > 1 && (
            <div className="flex items-center gap-1 me-2 font-mono text-[10px] text-white/80">
              <span>{currentIndex + 1}</span>
              <span>/</span>
              <span>{announcements.length}</span>
              <button
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + announcements.length) % announcements.length,
                  )
                }
                className="p-0.5 text-white/80 hover:text-white rounded transition-colors"
                aria-label="Previous announcement"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                className="p-0.5 text-white/80 hover:text-white rounded transition-colors"
                aria-label="Next announcement"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isAr ? "إغلاق شريط الإعلانات" : "Dismiss announcement"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
