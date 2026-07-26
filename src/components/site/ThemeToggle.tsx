import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  /** Matches `LanguageSwitcher`'s tone convention — "ink" for placement on
   *  a dark band (the transparent home header, the family-tree toolbar). */
  tone?: "default" | "ink";
}

export function ThemeToggle({ tone = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { lang } = useLang();
  const isInk = tone === "ink";
  const isDark = theme === "dark";

  const label = isDark
    ? lang === "ar"
      ? "التبديل إلى الوضع الفاتح"
      : "Switch to light mode"
    : lang === "ar"
      ? "التبديل إلى الوضع الداكن"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center border transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.95]",
        isInk
          ? "border-ivory/25 bg-ink/60 text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
          : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" aria-hidden="true" />
      )}
    </button>
  );
}
