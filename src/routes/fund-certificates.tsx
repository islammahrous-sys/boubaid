import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Eye } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { MediaViewerDialog } from "@/components/site/MediaViewerDialog";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { fundDocumentGroups, resolveFundDocuments } from "@/content/fund-documents";
import { getMemberLibrary } from "@/lib/cms.functions";
import { formatDualHijriYear } from "@/lib/dates";
import { inl } from "@/content/page-copy/fund-certificates-inline";
import { GatedPage, resolvePageAccess } from "@/components/access/AccessGate";

export const Route = createFileRoute("/fund-certificates")({
  // Registered family members only (Pages Access). Client-rendered so nothing
  // reaches server HTML or search indexes; access is decided before data loads.
  ssr: false,
  beforeLoad: async () => ({ access: await resolvePageAccess("members") }),
  loader: async ({ context }) =>
    context.access.allowed
      ? { documents: resolveFundDocuments(await getMemberLibrary()) }
      : { documents: resolveFundDocuments([]) },
  head: () => ({
    meta: [
      { title: "الشهادات والإثباتات | صندوق التنمية العائلية" },
      {
        name: "description",
        content:
          "الشهادات والإثباتات النظامية لصندوق التنمية العائلية (آل بوعبيد): قرار التسجيل، شهادة الترخيص، اللائحة الأساسية، العنوان الوطني، وخطابات المجلس والتفويض البنكي.",
      },
      { property: "og:title", content: "الشهادات والإثباتات — صندوق التنمية العائلية" },
      {
        property: "og:description",
        content: "الترخيص الرسمي والإثباتات النظامية المعتمدة لصندوق التنمية العائلية (آل بوعبيد).",
      },
      { property: "og:type", content: "article" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: () => (
    <GatedPage title={{ ar: "صندوق التنمية العائلية", en: "Family Development Fund" }}>
      <FundCertificatesPage />
    </GatedPage>
  ),
});

function FundCertificatesPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { documents } = Route.useLoaderData();
  const [viewing, setViewing] = useState<{ src: string; title: string } | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow={t(inl.t_48860493)}
        title={t(inl.t_27ea86d5)}
        subtitle={t(inl.t_638f6140)}
        meta={[
          { label: t(inl.t_d7a60932), value: siteMeta.ncnpLicense, mono: true },
          { label: t(inl.t_72e06534), value: t(siteMeta.ncnpAuthority) },
          {
            label: t(inl.t_076a4f5a),
            value: `${t(siteMeta.foundedHijriLabel)} · ${t(siteMeta.foundedGregorianLabel)}`,
            mono: true,
          },
        ]}
      />

      <section className="container-page py-12">
        {fundDocumentGroups.map((group) => {
          const docs = documents.filter((d) => d.group === group.id);
          if (docs.length === 0) return null;

          return (
            <div key={group.id} className="mt-10 first:mt-0">
              <Eyebrow rule>{t(group.title)}</Eyebrow>

              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex gap-4 border border-border bg-card p-4 transition-colors hover:border-bronze dark:hover:border-gold"
                  >
                    {doc.preview ? (
                      <img
                        src={doc.preview}
                        alt=""
                        loading="lazy"
                        className="h-20 w-16 shrink-0 border border-border object-cover"
                      />
                    ) : (
                      <span className="flex h-20 w-16 shrink-0 items-center justify-center border border-border bg-secondary/50">
                        <FileText
                          className="h-5 w-5 text-bronze dark:text-gold"
                          aria-hidden="true"
                        />
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{t(doc.title)}</h3>
                        {doc.isNew ? (
                          <span className="label-caps border border-bronze/40 px-1.5 py-0.5 text-[10px] text-bronze dark:border-gold/40 dark:text-gold">
                            {t(inl.t_ae58750b)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {t(doc.note)}
                      </p>
                      <p className="nums label-caps mt-2 text-muted-foreground">
                        {formatDualHijriYear(doc.year, lang)} · {doc.kind}
                      </p>

                      <button
                        type="button"
                        onClick={() => setViewing({ src: doc.src, title: t(doc.title) })}
                        className="mt-3 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        {t(inl.t_5e7c8b48)}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <Prose className="mt-10 text-sm text-muted-foreground">
          {isAr ? (
            <>
              حُجبت أرقام الهوية في الخطابات الرسمية. ولطلب صورة مصدقة من أي وثيقة، يمكنكم{" "}
              <Link to="/contact" className="underline hover:text-bronze dark:hover:text-gold">
                التواصل مع أمانة المجلس
              </Link>
              .
            </>
          ) : (
            <>
              ID numbers are redacted in the official letters. To request a certified copy of any
              document, please{" "}
              <Link to="/contact" className="underline hover:text-bronze dark:hover:text-gold">
                contact the Council secretariat
              </Link>
              .
            </>
          )}
        </Prose>
      </section>

      <MediaViewerDialog
        open={!!viewing}
        onClose={() => setViewing(null)}
        kind="pdf"
        src={viewing ? viewing.src : null}
        title={viewing?.title}
      />
    </div>
  );
}
