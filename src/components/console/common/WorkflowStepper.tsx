import { Check, Clock, Lock, XCircle } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export type StepStatus = "completed" | "current" | "upcoming" | "blocked" | "rejected";

export type WorkflowStepItem = {
  id: string;
  label_ar: string;
  label_en: string;
  description_ar?: string;
  description_en?: string;
  status: StepStatus;
  blockedReason_ar?: string;
  blockedReason_en?: string;
};

interface WorkflowStepperProps {
  steps: WorkflowStepItem[];
  currentStepId?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function WorkflowStepper({
  steps,
  currentStepId,
  onStepClick,
  className,
}: WorkflowStepperProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "current":
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case "blocked":
        return <Lock className="w-3.5 h-3.5 text-muted-foreground" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />;
    }
  };

  const getStepStyle = (status: StepStatus, isCurrent: boolean) => {
    if (status === "rejected") {
      return "border-destructive/40 bg-destructive/10 text-destructive";
    }
    if (status === "completed") {
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    }
    if (isCurrent || status === "current") {
      return "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20";
    }
    if (status === "blocked") {
      return "border-border/60 bg-muted/30 text-muted-foreground opacity-70 cursor-not-allowed";
    }
    return "border-border bg-card text-muted-foreground hover:bg-muted/40";
  };

  return (
    <div className={cn("w-full overflow-x-auto py-2", className)}>
      <nav aria-label={isAr ? "مراحل مسار العمل" : "Workflow Steps"}>
        <ol className="flex items-center min-w-max gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const isCurrent = currentStepId ? step.id === currentStepId : step.status === "current";
            const isClickable = Boolean(onStepClick && step.status !== "blocked");

            return (
              <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all duration-200 text-start",
                    getStepStyle(step.status, isCurrent),
                    isClickable && "cursor-pointer hover:shadow-xs",
                    !isClickable && "cursor-default",
                  )}
                  title={
                    step.status === "blocked"
                      ? isAr
                        ? step.blockedReason_ar ||
                          "هذه الخطوة مقفلة بانتظار إتمام المتطلبات السابقة"
                        : step.blockedReason_en ||
                          "This step is blocked until prerequisites are met"
                      : isAr
                        ? step.description_ar
                        : step.description_en
                  }
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-current/20",
                      step.status === "completed" && "bg-emerald-500/20",
                      step.status === "current" && "bg-primary/20",
                      step.status === "blocked" && "bg-muted/50",
                    )}
                  >
                    {getStepIcon(step.status)}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold leading-tight">
                      {isAr ? step.label_ar : step.label_en}
                    </span>
                    {(step.description_ar || step.description_en) && (
                      <span className="text-[10px] opacity-75 font-normal line-clamp-1">
                        {isAr ? step.description_ar : step.description_en}
                      </span>
                    )}
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-4 sm:w-6 transition-colors",
                      step.status === "completed" ? "bg-emerald-500/50" : "bg-border/60",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
