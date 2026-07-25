import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center rounded-full border border-border p-0.5 text-xs">
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={cn("rounded-full px-3 py-1 transition-colors", lang === "ar" ? "bg-navy text-ivory" : "text-navy/70 hover:text-navy")}
        aria-pressed={lang === "ar"}
      >
        ع
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn("rounded-full px-3 py-1 transition-colors", lang === "en" ? "bg-navy text-ivory" : "text-navy/70 hover:text-navy")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
