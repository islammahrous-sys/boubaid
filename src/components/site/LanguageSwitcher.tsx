import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export interface LanguageSwitcherProps {
  tone?: "default" | "ink";
}

export function LanguageSwitcher({ tone = "default" }: LanguageSwitcherProps) {
  const { lang, setLang } = useLang();
  const isInk = tone === "ink";

  return (
    <div
      className={cn(
        "inline-flex items-center border text-[13px] transition-colors",
        isInk ? "border-ivory/25 bg-ink/60" : "border-border",
      )}
    >
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className={cn(
          "tap-target-y px-2.5 py-1.5 leading-none transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] [--tap-size:2.5rem]",
          lang === "ar"
            ? isInk
              ? "bg-gold font-semibold text-ink shadow-sm"
              : "bg-ink font-semibold text-ivory dark:bg-gold dark:text-ink"
            : isInk
              ? "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
              : "text-muted-foreground hover:text-foreground",
        )}
      >
        ع
      </button>
      <span className={cn("h-4 w-px", isInk ? "bg-ivory/25" : "bg-border")} aria-hidden="true" />
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          "tap-target-y px-2.5 py-1.5 leading-none transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] [--tap-size:2.5rem]",
          lang === "en"
            ? isInk
              ? "bg-gold font-semibold text-ink shadow-sm"
              : "bg-ink font-semibold text-ivory dark:bg-gold dark:text-ink"
            : isInk
              ? "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
              : "text-muted-foreground hover:text-foreground",
        )}
      >
        EN
      </button>
    </div>
  );
}
