import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";

/** Contextual "this item no longer exists" screen for slug-based pages. */
export function ContentNotFound({ kind }: { kind: "news" | "page" }) {
  const { t } = useLang();
  const isNews = kind === "news";
  return (
    <main className="container mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 text-3xl font-semibold text-foreground">
        {t(
          isNews
            ? { ar: "هذا الخبر غير متاح", en: "This article is no longer available" }
            : { ar: "هذه الصفحة غير متاحة", en: "This page is no longer available" },
        )}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {t({
          ar: "ربما نُقل أو أُزيل. يمكنك تصفح المحتوى المتاح من الرابط أدناه.",
          en: "It may have been moved or removed. You can browse the available content below.",
        })}
      </p>
      <Link
        to={isNews ? "/news" : "/"}
        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {t(
          isNews
            ? { ar: "العودة إلى المركز الإعلامي", en: "Back to the Media Center" }
            : { ar: "العودة إلى الرئيسية", en: "Back to home" },
        )}
      </Link>
    </main>
  );
}
