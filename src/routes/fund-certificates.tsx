import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Eye } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { MediaViewerDialog } from "@/components/site/MediaViewerDialog";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { fundDocuments, fundDocumentGroups } from "@/content/fund-documents";
import { getCanonicalUrl } from "@/lib/seo";
import { formatHijri } from "@/lib/text";

export const Route = createFileRoute("/fund-certificates")({
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
      { property: "og:url", content: getCanonicalUrl("/fund-certificates") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/fund-certificates") }],
  }),
  component: FundCertificatesPage,
});

function FundCertificatesPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [viewing, setViewing] = useState<{ id: string; title: string } | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow={isAr ? "صندوق التنمية العائلية" : "Family Development Fund"}
        title={isAr ? "الشهادات و الاثباتات" : "Certificates & Attestations"}
        subtitle={
          isAr
            ? "المرجع الرسمي الواحد لجميع شهادات الصندوق ووثائقه النظامية المعتمدة من مجلس الأسرة."
            : "The single official reference for all the fund's certificates and statutory documents approved by the Family Council."
        }
        meta={[
          { label: isAr ? "رقم الترخيص" : "Licence no.", value: siteMeta.ncnpLicense, mono: true },
          { label: isAr ? "جهة الإصدار" : "Issued by", value: t(siteMeta.ncnpAuthority) },
          {
            label: isAr ? "تاريخ الإشهار" : "Registered",
            value: `${t(siteMeta.foundedHijriLabel)} · ${t(siteMeta.foundedGregorianLabel)}`,
            mono: true,
          },
        ]}
      />

      <section className="container-page py-12">
        {fundDocumentGroups.map((group) => {
          const docs = fundDocuments.filter((d) => d.group === group.id);
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
                            {isAr ? "جديد" : "New"}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {t(doc.note)}
                      </p>
                      <p className="nums label-caps mt-2 text-muted-foreground">
                        {formatHijri(doc.year, lang)} · {doc.kind}
                      </p>

                      <button
                        type="button"
                        onClick={() => setViewing({ id: doc.id, title: t(doc.title) })}
                        className="mt-3 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        {isAr ? "عرض الوثيقة" : "View document"}
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
        src={viewing ? `/api/public/fund-doc?id=${encodeURIComponent(viewing.id)}` : null}
        title={viewing?.title}
      />
    </div>
  );
}
