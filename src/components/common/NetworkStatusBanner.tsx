import { useState, useEffect } from "react";
import { WifiOff, Wifi, AlertTriangle } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function NetworkStatusBanner() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") return navigator.onLine;
    return true;
  });
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      dir={dir}
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md rounded-lg p-3 text-xs shadow-2xl transition-all duration-300 backdrop-blur-md flex items-center gap-3 border",
        !isOnline
          ? "bg-destructive/95 text-destructive-foreground border-destructive/50 animate-in slide-in-from-bottom-2"
          : "bg-emerald-700/95 text-white border-emerald-500/50 animate-in fade-in",
      )}
    >
      <div className="shrink-0">
        {!isOnline ? (
          <WifiOff className="h-4 w-4 animate-pulse text-destructive-foreground" />
        ) : (
          <Wifi className="h-4 w-4 text-white" />
        )}
      </div>
      <div className="flex-1 leading-relaxed">
        {!isOnline ? (
          <span>
            {isAr
              ? "انقطع الاتصال بالإنترنت. يرجى التحقق من الشبكة، وستُستأنف المزامنة تلقائياً عند عودة الاتصال."
              : "You are currently offline. Changes will resume syncing when connection is restored."}
          </span>
        ) : (
          <span>
            {isAr
              ? "تمت استعادة الاتصال بالإنترنت بنجاح."
              : "Internet connection restored successfully."}
          </span>
        )}
      </div>
    </div>
  );
}
