import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { inl } from "@/content/page-copy/contentnotfound-inline";

/** Contextual "this item no longer exists" screen for slug-based pages. */
export function ContentNotFound({ kind }: { kind: "news" | "page" }) {
  const { t } = useLang();
  const isNews = kind === "news";
  return (
    <main className="container mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="mb-4 text-3xl font-semibold text-foreground">
        {t(isNews ? inl.t_d52c0478 : inl.t_d1fbd711)}
      </h1>
      <p className="mb-8 text-muted-foreground">{t(inl.t_3377fd40)}</p>
      <Link
        to={isNews ? "/news" : "/"}
        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {t(isNews ? inl.t_ce7f04dc : inl.t_bca93df5)}
      </Link>
    </main>
  );
}
