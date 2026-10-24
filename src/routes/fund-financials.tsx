import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, Clock, MessageCircle, Eye, Download } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { getPublishedLibrary } from "@/lib/cms.functions";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { downloadFile } from "@/lib/download";
import { formatDualYear, formatDualYearRange } from "@/lib/dates";
import { inl } from "@/content/page-copy/fund-financials-inline";
import { GatedPage, resolvePageAccess } from "@/components/access/AccessGate";

export const Route = createFileRoute("/fund-financials")({
  // Registered family members only (Pages Access). Client-rendered so nothing
  // reaches server HTML or search indexes; access is decided before data loads.
  ssr: false,
  beforeLoad: async () => ({ access: await resolvePageAccess("members") }),
  loader: async ({ context }) => {
    if (!context.access.allowed) return { statements: [] };
    const library = await getPublishedLibrary();
    return {
      statements: library
        .filter((row) => row.collection === "financials" && row.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
    };
  },
  head: () => ({
    meta: [
      { title: "القوائم المالية والموازنة والحسابات | صندوق التنمية العائلية" },
      {
        name: "description",
        content:
          "القوائم المالية لصندوق التنمية العائلية (آل بوعبيد) بداية من عام 2026، وكشوف الحسابات من 1998 إلى 2025، وطلب الاستعلام المالي.",
      },
      { property: "og:title", content: "القوائم المالية والموازنة والحسابات — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "القوائم المالية والموازنة وكشوف حسابات صندوق التنمية العائلية، وطلب استعلام مالي.",
      },
      { property: "og:type", content: "article" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: () => (
    <GatedPage title={{ ar: "صندوق التنمية العائلية", en: "Family Development Fund" }}>
      <FundFinancialsPage />
    </GatedPage>
  ),
});

/** Financial inquiries are reviewed and approved by the President of the Family
 *  Council, Dr. Khaled Bu Obaid, over the Council's official WhatsApp line. */
const COUNCIL_WHATSAPP = "966558888010";

/**
 * Reporting period label for a published statement. Both calendars always show
 * together, and the Hijri half is derived centrally from the Gregorian years —
 * never hardcoded per record. The years come from the record's own title (a
 * span such as "1998 إلى 2022") or, failing that, its `year` column.
 */
function periodLabel(title: string, year: number | null, lang: "ar" | "en"): string {
  const years = (title.match(/\d{4}/g) ?? []).map(Number);
  if (years.length >= 2) return formatDualYearRange(years[0]!, years[years.length - 1]!, lang);
  if (years.length === 1) return formatDualYear(years[0]!, lang);
  return year ? formatDualYear(year, lang) : "";
}

function FundFinancialsPage() {
  const { lang, t } = useLang();
  const { statements } = Route.useLoaderData();
  const isAr = lang === "ar";

  const inquiryMessage = isAr
    ? "السلام عليكم، أرغب في تقديم طلب استعلام مالي لصندوق التنمية العائلية (آل بوعبيد) — لعناية رئيس مجلس الأسرة د. خالد بوعبيد.\nالاسم:\nالفرع:\nموضوع الاستعلام:"
    : "Hello, I would like to submit a financial inquiry request for the Al Bu Obaid Family Development Fund, for the attention of the Family Council President, Dr. Khaled Bu Obaid.\nName:\nBranch:\nSubject:";
  const whatsappHref = `https://wa.me/${COUNCIL_WHATSAPP}?text=${encodeURIComponent(inquiryMessage)}`;

  /** Not yet issued: kept as an announced, file-less entry. */
  const upcoming = inl.t_2f0f9843;

  return (
    <div>
      <PageHeader
        eyebrow={isAr ? "صندوق التنمية العائلية" : "Family Development Fund"}
        title={
          isAr ? "القوائم المالية والموازنة والحسابات" : "Financial Statements, Budget & Accounts"
        }
        subtitle={
          isAr
            ? "سجل الصندوق المالي المعتمد. تُنشر الملفات هنا عقب اعتمادها من مجلس الأسرة، ويمكن لأفراد الأسرة تقديم طلب استعلام مالي رسمي."
            : "The fund's approved financial record. Files are published after Family Council approval; members may submit an official financial inquiry."
        }
      />

      <section className="container-page py-12">
        <Eyebrow rule>{isAr ? "السجلات المالية" : "Financial records"}</Eyebrow>

        <ul className="mt-6 divide-y divide-border border border-border bg-card">
          <li className="flex flex-wrap items-center gap-3 p-4">
            <FileSpreadsheet
              className="h-4 w-4 shrink-0 text-bronze dark:text-gold"
              aria-hidden="true"
            />
            <span className="text-sm text-foreground">{isAr ? upcoming.ar : upcoming.en}</span>
            <span className="ms-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {isAr ? "يُتاح عند الاعتماد" : "Available on approval"}
            </span>
          </li>

          {statements.map((doc) => {
            const title = isAr ? doc.title_ar : doc.title_en || doc.title_ar;
            const note = isAr ? doc.description_ar : doc.description_en || doc.description_ar;
            const fileUrl = doc.file_url || doc.file_path || doc.external_url;
            const period = periodLabel(doc.title_ar, doc.year, isAr ? "ar" : "en");

            return (
              <li key={doc.id} className="p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <FileSpreadsheet
                    className="mt-0.5 h-4 w-4 shrink-0 text-bronze dark:text-gold"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm leading-snug font-semibold break-words text-foreground">
                      {title}
                    </h2>
                    {period ? (
                      <p className="nums mt-1 text-[11px] text-muted-foreground">{period}</p>
                    ) : null}
                    {note ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{note}</p>
                    ) : null}
                  </div>
                  {doc.kind ? (
                    <span className="label-caps shrink-0 text-[11px] text-muted-foreground">
                      {doc.kind}
                    </span>
                  ) : null}
                </div>

                {fileUrl ? (
                  <div className="mt-3 flex flex-wrap gap-2 ps-7">
                    <button
                      type="button"
                      onClick={() =>
                        openMediaViewer({ src: fileUrl, kind: "pdf", title: title ?? "" })
                      }
                      aria-label={isAr ? `عرض الملف: ${title}` : `View document: ${title}`}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-bronze hover:text-bronze dark:hover:border-gold dark:hover:text-gold"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {isAr ? "عرض الملف" : "View document"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadFile(fileUrl, title ?? "document")}
                      aria-label={isAr ? `تحميل الملف: ${title}` : `Download document: ${title}`}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-bronze hover:text-bronze dark:hover:border-gold dark:hover:text-gold"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {isAr ? "تحميل" : "Download"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 inline-flex items-center gap-1.5 ps-7 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {isAr ? "يُتاح عند الاعتماد" : "Available on approval"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-bronze bg-bronze px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-transparent hover:text-bronze dark:border-gold dark:bg-gold dark:text-ink dark:hover:text-gold"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {isAr ? "طلب استعلام مالي" : "Financial Inquiry Request"}
          </a>
        </div>

        <Prose className="mt-6 text-xs text-muted-foreground">{t(inl.t_6c22913c)}</Prose>
      </section>
    </div>
  );
}
