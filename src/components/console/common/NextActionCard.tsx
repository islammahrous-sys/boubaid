import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

interface NextActionCardProps {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  badge_ar?: string;
  badge_en?: string;
  tone?: "primary" | "warning" | "success" | "info";
  primaryAction: {
    label_ar: string;
    label_en: string;
    onClick: () => void;
    icon?: LucideIcon;
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryAction?: {
    label_ar: string;
    label_en: string;
    onClick: () => void;
  };
  className?: string;
}

export function NextActionCard({
  title_ar,
  title_en,
  description_ar,
  description_en,
  badge_ar,
  badge_en,
  tone = "primary",
  primaryAction,
  secondaryAction,
  className,
}: NextActionCardProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrimaryIcon = primaryAction.icon || ArrowIcon;

  const toneStyles = {
    primary: {
      card: "border-primary/30 bg-primary/5",
      badge: "border-primary/40 bg-primary/10 text-primary",
      iconBg: "bg-primary/20 text-primary",
      button: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    warning: {
      card: "border-amber-500/30 bg-amber-500/5",
      badge: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
      button: "bg-amber-600 text-white hover:bg-amber-700",
    },
    success: {
      card: "border-emerald-500/30 bg-emerald-500/5",
      badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      button: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    info: {
      card: "border-blue-500/30 bg-blue-500/5",
      badge: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 text-white hover:bg-blue-700",
    },
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200",
        toneStyles.card,
        className,
      )}
    >
      <div className="flex items-start gap-3.5 flex-1">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
            toneStyles.iconBg,
          )}
        >
          {tone === "warning" ? (
            <AlertCircle className="w-5 h-5" />
          ) : tone === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-foreground">{isAr ? title_ar : title_en}</h4>
            {(badge_ar || badge_en) && (
              <Badge
                variant="outline"
                className={cn("text-[10px] px-2 py-0.5 font-medium", toneStyles.badge)}
              >
                {isAr ? badge_ar : badge_en}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isAr ? description_ar : description_en}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {secondaryAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={secondaryAction.onClick}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            {isAr ? secondaryAction.label_ar : secondaryAction.label_en}
          </Button>
        )}

        <Button
          size="sm"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className={cn(
            "text-xs font-semibold h-8.5 gap-1.5 rounded-xl shadow-xs",
            toneStyles.button,
          )}
        >
          <span>{isAr ? primaryAction.label_ar : primaryAction.label_en}</span>
          <PrimaryIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
