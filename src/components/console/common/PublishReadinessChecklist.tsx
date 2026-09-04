import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, ArrowRight, Upload, Sparkles, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export type ReadinessCheckItem = {
  id: string;
  label_ar: string;
  label_en: string;
  passed: boolean;
  required: boolean;
  hint_ar?: string;
  hint_en?: string;
  onFix?: () => void;
};

interface PublishReadinessChecklistProps {
  checks: ReadinessCheckItem[];
  onPublish?: () => void;
  isPublishing?: boolean;
  publishLabel_ar?: string;
  publishLabel_en?: string;
  className?: string;
}

export function PublishReadinessChecklist({
  checks,
  onPublish,
  isPublishing = false,
  publishLabel_ar = "اعتماد ونشر المقال",
  publishLabel_en = "Approve & Publish Article",
  className,
}: PublishReadinessChecklistProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const requiredChecks = checks.filter((c) => c.required);
  const passedRequired = requiredChecks.filter((c) => c.passed);
  const allRequiredPassed = requiredChecks.length > 0 && passedRequired.length === requiredChecks.length;
  const missingCount = requiredChecks.length - passedRequired.length;

  return (
    <div className={cn("p-4 rounded-2xl border border-border bg-card space-y-4", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-foreground">
              {isAr ? "جاهزية المحتوى للنشر" : "Publish Readiness Checklist"}
            </h4>
            <Badge
              variant={allRequiredPassed ? "default" : "outline"}
              className={cn(
                "text-[10px] px-2 py-0.5 font-mono",
                allRequiredPassed
                  ? "bg-emerald-600 text-white"
                  : "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
              )}
            >
              {passedRequired.length} / {requiredChecks.length} {isAr ? "مكتمل" : "Ready"}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {allRequiredPassed
              ? isAr
                ? "جميع المتطلبات الإلزامية مكتملة. يمكنك النشر الآن."
                : "All required criteria are satisfied. Ready to publish."
              : isAr
              ? `يوجد ${missingCount} متطلب إلزامي بحاجة للاكتمال قبل إتاحة النشر.`
              : `${missingCount} required item(s) must be resolved before publishing.`}
          </p>
        </div>

        {onPublish && (
          <Button
            size="sm"
            onClick={onPublish}
            disabled={!allRequiredPassed || isPublishing}
            className={cn(
              "h-8 text-xs font-bold gap-1.5 rounded-xl transition-all shadow-xs",
              allRequiredPassed
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? publishLabel_ar : publishLabel_en}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {checks.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors",
              item.passed
                ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                : item.required
                ? "border-destructive/30 bg-destructive/5 text-foreground"
                : "border-border/60 bg-muted/20 text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : item.required ? (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold truncate">
                    {isAr ? item.label_ar : item.label_en}
                  </span>
                  {item.required && !item.passed && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-destructive/20 text-destructive shrink-0">
                      {isAr ? "إلزامي" : "Required"}
                    </span>
                  )}
                </div>
                {(item.hint_ar || item.hint_en) && (
                  <p className="text-[10px] text-muted-foreground truncate">
                    {isAr ? item.hint_ar : item.hint_en}
                  </p>
                )}
              </div>
            </div>

            {!item.passed && item.onFix && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={item.onFix}
                className="h-6.5 text-[11px] px-2 text-primary hover:bg-primary/10 font-bold shrink-0 ms-2 gap-1 rounded-lg"
              >
                <span>{isAr ? "إصلاح" : "Fix"}</span>
                <ArrowIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
