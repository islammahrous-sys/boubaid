import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { inl } from "@/content/page-copy/themetoggle-inline";

export interface ThemeToggleProps {
  /** Matches `LanguageSwitcher`'s tone convention — "ink" for placement on
   *  a dark band (the transparent home header, the family-tree toolbar). */
  tone?: "default" | "ink";
}

export function ThemeToggle({ tone = "default" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { lang, t } = useLang();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInk = tone === "ink";
  const isDark = mounted ? theme === "dark" : false;

  const label = isDark
    ? lang === "ar"
      ? "التبديل إلى الوضع الفاتح"
      : "Switch to light mode"
    : t(inl.t_acf22999);

  return (
    <button
      type="button"
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "tap-target grid h-8 w-8 shrink-0 place-items-center border transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.95] [--tap-size:2.5rem]",
        isInk
          ? "border-ivory/25 bg-ink/60 text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
          : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 animate-in fade-in zoom-in-75 duration-150" aria-hidden="true" />
        )
      ) : (
        <span className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
