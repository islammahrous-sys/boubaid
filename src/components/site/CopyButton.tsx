import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/**
 * Copy affordance for the details people actually need to transfer by hand —
 * IBAN, email, phone. Confirmation is shown in place and reverts, so the
 * feedback belongs to the field rather than to a toast that has already gone.
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const copyLabel = label ?? t({ ar: "نسخ", en: "Copy" });

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t({ ar: "تم النسخ", en: "Copied" }) : copyLabel}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 border border-border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
        copied
          ? "border-bronze text-bronze dark:border-gold dark:text-gold"
          : "text-muted-foreground hover:border-foreground hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? t({ ar: "تم النسخ", en: "Copied" }) : copyLabel}</span>
    </button>
  );
}
