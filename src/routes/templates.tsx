import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Eye, Download } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { getPublishedLibrary } from "@/lib/cms.functions";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { ArchiveLightbox } from "@/components/site/ArchiveLightbox";
import { MediaViewerDialog } from "@/components/site/MediaViewerDialog";
import { getCanonicalUrl } from "@/lib/seo";
import { downloadFile } from "@/lib/download";

/**
 * النماذج و القوالب — official family announcement templates plus the
 * reference documents that govern them.
 *
 * Records live in the existing `library_items` CMS table under the
 * `templates` collection. `reference` carries the official template code and
 * `kind` decides the surface: image records render in the visible gallery,
 * document records render in the documents list with an in-browser viewer.
 * Anything an administrator adds in Admin → الأرشيف والمكتبة with the
 * collection set to «النماذج و القوالب» appears here with no code change.
 */
export const Route = createFileRoute("/templates")({
  loader: async () => {
    const rows = await getPublishedLibrary();
    return {
      items: rows
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
          "القوالب الرسمية لإعلانات المناسبات في أسرة آل بوعبيد: المواليد، العزاء، التخرج، الزواج، الإنجاز، الترقية، الوظيفة الجديدة، الشفاء، الإعلانات الرسمية والاجتماعات.",
      },
      { property: "og:title", content: "النماذج و القوالب — مجلس أسرة آل بوعبيد" },
      {
        property: "og:description",
        content: "القوالب المعتمدة لإعلانات المناسبات الأسرية مع فهرس العناوين ونظام القوالب.",
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
    ar: "القوالب الرسمية المعتمدة لإعلانات مناسبات أسرة آل بوعبيد، مع فهرس العناوين التعريفية ونظام القوالب.",
    en: "The official approved templates for Al Bu Obaid family announcements, with the descriptive title index and the template system.",
  } as BiText,
  galleryTitle: { ar: "قوالب الإعلانات الرسمية", en: "Official Announcement Templates" } as BiText,
  galleryNote: {
    ar: "هذه هي القوالب المعتمدة من مجلس الأسرة. اضغط على أي قالب لعرضه بحجم أكبر.",
    en: "These are the templates approved by the Family Council. Select any template to view it at a larger size.",
  } as BiText,
  docsTitle: { ar: "المستندات المرجعية", en: "Reference Documents" } as BiText,
  view: { ar: "عرض الملف", en: "View Document" } as BiText,
  download: { ar: "تحميل الملف", en: "Download File" } as BiText,
  empty: {
    ar: "لم تُنشر نماذج أو قوالب حتى الآن. تُضاف من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "No templates have been published yet. They are added from the admin console and appear here immediately.",
  } as BiText,
};

/** Image records are either flagged IMAGE or point at an image file. */
function isImageRecord(kind: string | null | undefined, href: string | null) {
  if (kind && /image|png|jpg|jpeg|webp/i.test(kind)) return true;
  return Boolean(href && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(href));
}

function TemplatesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const { items } = Route.useLoaderData();

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [doc, setDoc] = useState<{ src: string; title: string } | null>(null);

  const resolved = items.map((item) => ({
    item,
    href: item.file_url || item.external_url || null,
    title: (rtl ? item.title_ar : item.title_en) || item.title_ar,
    description: (rtl ? item.description_ar : item.description_en) || null,
  }));

  const templates = resolved.filter((r) => isImageRecord(r.item.kind, r.href) && r.href);
  const documents = resolved.filter((r) => !isImageRecord(r.item.kind, r.href) && r.href);

  const lightboxItems = templates.map((r) => ({
    id: r.item.id,
    url: r.href as string,
    alt: r.title,
    caption: r.item.reference ? `${r.title} — ${r.item.reference}` : r.title,
    kind: "image" as const,
  }));

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-14 md:py-16">
        {items.length === 0 ? (
          <p className="measure text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.empty)}
          </p>
        ) : null}

        {templates.length > 0 ? (
          <section className="reveal-on-scroll">
            <Eyebrow rule>{t(copy.galleryTitle)}</Eyebrow>
            <p className="measure mt-4 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.galleryNote)}
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((r, i) => (
                <li key={r.item.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    aria-label={`${r.title} — ${r.item.reference ?? ""}`}
                    className="group block w-full overflow-hidden border border-border bg-card transition-colors hover:border-bronze dark:hover:border-gold"
                  >
                    <img
                      src={r.href as string}
                      alt={r.title}
                      loading={i < 6 ? "eager" : "lazy"}
                      className="block h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </button>
                  <h2 className="mt-3 text-[15px] font-semibold leading-snug text-foreground">
                    {r.title}
                  </h2>
                  {r.item.reference ? (
                    <p className="nums mt-1 font-mono text-[12px] tracking-wide text-muted-foreground">
                      {r.item.reference}
                    </p>
                  ) : null}
                  {r.description ? (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void downloadFile(r.href as string, r.title)}
                    aria-label={`${t(copy.download)} — ${r.title}`}
                    className="mt-3 inline-flex items-center gap-2 self-start border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(copy.download)}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {documents.length > 0 ? (
          <section className="reveal-on-scroll mt-16">
            <Eyebrow rule>{t(copy.docsTitle)}</Eyebrow>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {documents.map((r) => (
                <li
                  key={r.item.id}
                  className="flex flex-col rounded-md border border-border bg-card p-5"
                >
                  <FileText className="h-5 w-5 text-bronze dark:text-gold" aria-hidden="true" />
                  <h3 className="mt-3 text-[15px] font-semibold leading-snug text-foreground">
                    {r.title}
                  </h3>
                  {r.description ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <button
                      type="button"
                      onClick={() => setDoc({ src: r.href as string, title: r.title })}
                      className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.view)}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadFile(r.href as string, r.title)}
                      aria-label={`${t(copy.download)} — ${r.title}`}
                      className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.download)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <ArchiveLightbox
        items={lightboxItems}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onNavigate={setLightbox}
      />

      <MediaViewerDialog
        open={doc !== null}
        onClose={() => setDoc(null)}
        src={doc?.src ?? null}
        kind="pdf"
        title={doc?.title}
      />
    </>
  );
}
