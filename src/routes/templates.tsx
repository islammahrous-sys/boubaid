import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { getPublishedLibrary } from "@/lib/cms.functions";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

/**
 * النماذج و القوالب — family announcement templates and other reusable
 * council templates.
 *
 * Records live in the existing `library_items` CMS table under the
 * `templates` collection, so anything an administrator adds in
 * Admin → الأرشيف والمكتبة with the collection set to «النماذج و القوالب»
 * appears here with no code change.
 */
export const Route = createFileRoute("/templates")({
  loader: async () => {
    const rows = await getPublishedLibrary();
    return {
      templates: rows
        .filter((r) => r.collection === "templates" && r.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
    };
  },
  head: () => ({
    meta: [
      { title: "النماذج و القوالب | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "النماذج و القوالب المعتمدة في مجلس أسرة آل بوعبيد: قوالب إعلانات المناسبات الأسرية والنماذج الرسمية الجاهزة للاستخدام.",
      },
      { property: "og:title", content: "النماذج و القوالب — مجلس أسرة آل بوعبيد" },
      {
        property: "og:description",
        content: "قوالب إعلانات المناسبات الأسرية والنماذج الرسمية المعتمدة من مجلس الأسرة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/templates") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/templates") }],
  }),
  component: TemplatesPage,
});

const copy = {
  eyebrow: { ar: "الهوية والمراسلات", en: "Identity and correspondence" } as BiText,
  title: { ar: "النماذج و القوالب", en: "Forms & Templates" } as BiText,
  subtitle: {
    ar: "قوالب إعلانات المناسبات الأسرية والنماذج الرسمية المعتمدة، جاهزة للتحميل والاستخدام من أبناء الأسرة.",
    en: "Approved family announcement templates and official forms, ready for family members to download and use.",
  } as BiText,
  listTitle: { ar: "النماذج المتاحة", en: "Available Templates" } as BiText,
  empty: {
    ar: "لم تُنشر نماذج أو قوالب حتى الآن. تُضاف من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "No templates have been published yet. They are added from the admin console and appear here immediately.",
  } as BiText,
  open: { ar: "عرض النموذج", en: "Open template" } as BiText,
};

function TemplatesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const { templates } = Route.useLoaderData();

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-14 md:py-16">
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.listTitle)}</Eyebrow>

          {templates.length === 0 ? (
            <p className="measure mt-5 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.empty)}
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((item) => {
                const href = item.file_url || item.external_url || null;
                const title = (rtl ? item.title_ar : item.title_en) || item.title_ar;
                const description = rtl ? item.description_ar : item.description_en;
                return (
                  <li
                    key={item.id}
                    className="flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-bronze dark:hover:border-gold"
                  >
                    <FileText
                      className="h-5 w-5 text-bronze dark:text-gold"
                      aria-hidden="true"
                    />
                    <h2 className="mt-3 text-[15px] font-semibold leading-snug text-foreground">
                      {title}
                    </h2>
                    {description ? (
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    ) : null}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 self-start border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        {t(copy.open)}
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
