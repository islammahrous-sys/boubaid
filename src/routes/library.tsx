import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Play } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Record } from "@/components/site/Editorial";
import { libraryItems, siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "الأرشيف والمكتبة الرقمية | منظمة التنمية العائلية آل بوعبيد" },
      {
        name: "description",
        content:
          "الأرشيف الرقمي المعتمد آل بوعبيد: اللوائح الرسمية، الدراسات التاريخية والجينية، ومجموعات الصور والتسجيلات.",
      },
      { property: "og:title", content: "الأرشيف والمكتبة الرقمية — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: LibraryPage,
});

type TabKey = "documents" | "photographs" | "recordings";

const copy = {
  eyebrow: { ar: "الأرشيف", en: "Archive" } as BiText,
  title: {
    ar: "المكتبة الرقمية وأرشيف الوثائق",
    en: "Digital Library & Document Archive",
  } as BiText,
  subtitle: {
    ar: "اللوائح المعتمدة، والدراسات النسبية والجينية، ومجموعات الصور والتسجيلات — مفهرسة ومتاحة لأبناء الأسرة والباحثين.",
    en: "Approved bylaws, genealogical and genetic studies, and collections of photographs and recordings — catalogued and available to family members and researchers.",
  } as BiText,

  metaHolder: { ar: "الجهة الحافظة", en: "Held by" } as BiText,
  metaRef: { ar: "مرجع المجموعة", en: "Collection ref." } as BiText,
  metaAccess: { ar: "الإتاحة", en: "Access" } as BiText,
  metaAccessValue: { ar: "أبناء الأسرة والباحثون", en: "Family members & researchers" } as BiText,

  tabs: {
    documents: { ar: "الوثائق واللوائح", en: "Documents & Bylaws" } as BiText,
    photographs: { ar: "المجموعة المصورة", en: "Photographs" } as BiText,
    recordings: { ar: "التسجيلات المرئية", en: "Recordings" } as BiText,
  },

  colRef: { ar: "المرجع", en: "Ref." } as BiText,
  colTitle: { ar: "العنوان", en: "Title" } as BiText,
  colYear: { ar: "السنة", en: "Year" } as BiText,
  colFormat: { ar: "الصيغة", en: "Format" } as BiText,
  colDuration: { ar: "المدة", en: "Duration" } as BiText,
  colAction: { ar: "الإجراء", en: "" } as BiText,

  download: { ar: "تحميل", en: "Download" } as BiText,
  play: { ar: "تشغيل", en: "Play" } as BiText,
  plate: { ar: "صورة", en: "Plate" } as BiText,

  docsNote: {
    ar: "الوثائق أدناه صادرة عن المنظمة أو معتمدة منها. ويُرجع في النصوص الرسمية إلى النسخة الموقعة المودعة لدى الأمانة العامة.",
    en: "The documents below are issued or approved by the organisation. For official purposes, reference is made to the signed copy deposited with the secretariat.",
  } as BiText,
  photosNote: {
    ar: "مجموعة مصورة موثقة لمناسبات الأسرة واجتماعاتها الرسمية.",
    en: "A documented photographic collection of family occasions and official assemblies.",
  } as BiText,
  videosNote: {
    ar: "تسجيلات الكلمات والعروض والأفلام الوثائقية.",
    en: "Recordings of addresses, presentations, and documentary films.",
  } as BiText,

  pending: {
    ar: "الملف قيد الرفع على الأرشيف الرقمي — يرجى مراجعة الأمانة العامة.",
    en: "This file is still being uploaded to the digital archive — please contact the secretariat.",
  } as BiText,
};

const sheet = pageImages.library.contactSheet;

type LibraryDocument = (typeof libraryItems.documents)[number];

/** Shared between the table cell and the mobile record — a real download
 * where the archive holds the file, an honest "not yet uploaded" notice
 * otherwise, rather than pretending every row is downloadable. */
function DownloadControl({
  doc,
  onUnavailable,
  label,
}: {
  doc: LibraryDocument;
  onUnavailable: () => void;
  label: string;
}) {
  const className =
    "inline-flex shrink-0 items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary";
  return doc.href ? (
    <a href={doc.href} target="_blank" rel="noopener noreferrer" className={className}>
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </a>
  ) : (
    <button type="button" onClick={onUnavailable} className={className}>
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export function LibraryPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<TabKey>("documents");
  const rtl = lang === "ar";

  const notify = () => toast(t(copy.pending));

  const tabDefs: { key: TabKey; label: BiText; count: number }[] = [
    { key: "documents", label: copy.tabs.documents, count: libraryItems.documents.length },
    { key: "photographs", label: copy.tabs.photographs, count: libraryItems.photos.length },
    { key: "recordings", label: copy.tabs.recordings, count: libraryItems.videos.length },
  ];

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaHolder), value: t(siteMeta.shortName) },
          { label: t(copy.metaRef), value: `NCNP/${siteMeta.ncnpLicense}`, mono: true },
          { label: t(copy.metaAccess), value: t(copy.metaAccessValue) },
        ]}
      />

      <div className="container-page pb-20">
        {/* Finding aid — plain text tabs with a rule, not pills. */}
        <div className="border-b border-ink/25 dark:border-ivory/20">
          <div
            role="tablist"
            aria-label={t(copy.eyebrow)}
            className="-mb-px flex gap-8 overflow-x-auto no-scrollbar"
          >
            {tabDefs.map((d) => (
              <button
                key={d.key}
                role="tab"
                type="button"
                aria-selected={tab === d.key}
                onClick={() => setTab(d.key)}
                className={cn(
                  "flex shrink-0 items-baseline gap-2 border-b-2 py-4 text-sm transition-colors",
                  tab === d.key
                    ? "border-ink font-semibold text-foreground dark:border-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t(d.label)}
                <span className="nums text-xs text-muted-foreground">({d.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Documents ──────────────────────────────────────── */}
        {tab === "documents" ? (
          <section className="pt-10">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.docsNote)}
            </p>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[40rem] border-collapse">
                <thead>
                  <tr className="border-b border-ink/25 dark:border-ivory/20">
                    <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                      {t(copy.colRef)}
                    </th>
                    <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                      {t(copy.colTitle)}
                    </th>
                    <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                      {t(copy.colYear)}
                    </th>
                    <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                      {t(copy.colFormat)}
                    </th>
                    <th scope="col" className="py-2.5">
                      <span className="sr-only">{t(copy.download)}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {libraryItems.documents.map((d, i) => (
                    <tr key={i} className="border-b border-border align-baseline">
                      <td className="nums py-4 pe-6 font-mono text-xs whitespace-nowrap text-bronze dark:text-gold">
                        {d.ncnpRef}
                      </td>
                      <td className="py-4 pe-6 font-naskh text-base font-bold text-foreground transition-colors hover:text-gold-foil">
                        {t(d.title)}
                      </td>
                      <td className="nums py-4 pe-6 text-[13px] whitespace-nowrap text-muted-foreground">
                        {d.year} هـ
                      </td>
                      <td className="py-4 pe-6 text-[13px] text-muted-foreground">{d.kind}</td>
                      <td className="py-4 text-end">
                        <DownloadControl doc={d} onUnavailable={notify} label={t(copy.download)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-ink/25 md:hidden dark:border-ivory/20">
              {libraryItems.documents.map((d, i) => (
                <Record key={i} title={t(d.title)}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[13px] text-muted-foreground">
                      <span className="nums font-mono text-bronze dark:text-gold">{d.ncnpRef}</span>
                      <span className="mx-1.5">·</span>
                      <span className="nums">{d.year} هـ</span>
                      <span className="mx-1.5">·</span>
                      {d.kind}
                    </p>
                    <DownloadControl doc={d} onUnavailable={notify} label={t(copy.download)} />
                  </div>
                </Record>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Photographs — contact sheet ─────────────────────── */}
        {tab === "photographs" ? (
          <section className="pt-10">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.photosNote)}
            </p>

            <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {libraryItems.photos.map((p, i) => (
                <li key={i}>
                  <figure>
                    <img
                      src={sheet[i % sheet.length]}
                      alt={t(p.title)}
                      className="aspect-[4/3] w-full border border-border object-cover"
                      loading="lazy"
                    />
                    <figcaption className="mt-2.5 border-t border-border pt-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="nums label-caps text-bronze dark:text-gold">
                          {t(copy.plate)} {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="nums text-xs text-muted-foreground">{p.year} هـ</span>
                      </div>
                      <p className="mt-1.5 font-naskh text-base font-bold text-foreground transition-colors hover:text-gold-foil">
                        {t(p.title)}
                      </p>
                      <p className="label-caps mt-1 text-muted-foreground">{p.category}</p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ── Recordings — schedule listing ───────────────────── */}
        {tab === "recordings" ? (
          <section className="pt-10">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.videosNote)}
            </p>

            <ol className="border-t border-ink/25 dark:border-ivory/20">
              {libraryItems.videos.map((v, i) => (
                <li key={i} className="border-b border-border">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5">
                    <button
                      type="button"
                      onClick={notify}
                      aria-label={`${t(copy.play)} — ${t(v.title)}`}
                      className="grid h-11 w-11 shrink-0 place-items-center border border-ink text-ink transition-colors hover:bg-ink hover:text-ivory dark:border-gold dark:text-gold dark:hover:bg-gold dark:hover:text-ink"
                    >
                      <Play
                        className={cn("h-4 w-4 fill-current", rtl && "-scale-x-100")}
                        aria-hidden="true"
                      />
                    </button>

                    <div className="min-w-0">
                      <p className="font-naskh text-base font-bold text-foreground transition-colors hover:text-gold-foil">
                        {t(v.title)}
                      </p>
                      <p className="nums label-caps mt-1 text-muted-foreground">{v.year} هـ</p>
                    </div>

                    <span
                      className="nums shrink-0 font-mono text-sm text-muted-foreground"
                      dir="ltr"
                    >
                      {v.duration}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </>
  );
}
