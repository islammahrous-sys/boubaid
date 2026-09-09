import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { committees } from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/committees")({
  head: () => ({
    meta: [
      { title: "اللجان | آل بوعبيد" },
      {
        name: "description",
        content:
          "اللجان التنفيذية المنبثقة عن مجلس أمناء صندوق التنمية العائلية (آل بوعبيد) وأعمالها لعامي ١٤٤٤هـ و١٤٤٥هـ.",
      },
      { property: "og:title", content: "اللجان — آل بوعبيد" },
      {
        property: "og:description",
        content: "اللجان التنفيذية وأعمالها لعامي ١٤٤٤هـ و١٤٤٥هـ.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/committees") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/committees") }],
  }),
  component: CommitteesPage,
});

const copy = {
  eyebrow: { ar: "العمل التنفيذي", en: "Executive work" } as BiText,
  title: { ar: "اللجان", en: "Committees" } as BiText,
  subtitle: {
    ar: "تنبثق عن مجلس الأمناء خمس لجان تنفيذية، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Five standing committees issue from the board of trustees, each with a defined remit and a chair answerable to the board.",
  } as BiText,
  chairLabel: { ar: "رئيس اللجنة", en: "Chair" } as BiText,
  listTitle: { ar: "اللجان التنفيذية", en: "The Standing Committees" } as BiText,
};

const years: { id: string; eyebrow: BiText; title: BiText; note: BiText }[] = [
  {
    id: "y1444",
    eyebrow: { ar: "أولاً", en: "Section I" },
    title: { ar: "أعمال اللجان — ١٤٤٤هـ", en: "Committee work — 1444H" },
    note: {
      ar: "يُدرج هنا ملخص أعمال اللجان ولقاءاتها وقراراتها لعام ١٤٤٤هـ.",
      en: "A summary of the committees' work, meetings, and decisions for 1444H is published here.",
    },
  },
  {
    id: "y1445",
    eyebrow: { ar: "ثانياً", en: "Section II" },
    title: { ar: "أعمال اللجان — ١٤٤٥هـ", en: "Committee work — 1445H" },
    note: {
      ar: "يُدرج هنا ملخص أعمال اللجان ولقاءاتها وقراراتها لعام ١٤٤٥هـ.",
      en: "A summary of the committees' work, meetings, and decisions for 1445H is published here.",
    },
  },
];

function CommitteesPage() {
  const { t } = useLang();

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
      />

      <div className="container-page py-14 md:py-16">
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.listTitle)}</Eyebrow>
          <dl className="mt-6 border-t border-border">
            {committees.map((c, i) => (
              <div
                key={c.id}
                className="grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-border py-5 transition-colors hover:bg-secondary/30"
              >
                <span
                  className="nums font-mono text-sm text-bronze/70 dark:text-gold/60"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <dt className="text-[15px] font-semibold text-foreground">{t(c.name)}</dt>
                  <dd className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(c.desc)}
                  </dd>
                  <dd className="mt-2.5 text-[13px]">
                    <span className="label-caps me-2 text-muted-foreground">
                      {t(copy.chairLabel)}
                    </span>
                    <span className="text-foreground">{t(c.lead)}</span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <Ornament className="mt-16" />

        {years.map((y) => (
          <section
            key={y.id}
            id={y.id}
            className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
              <div>
                <Eyebrow>{t(y.eyebrow)}</Eyebrow>
                <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                  {t(y.title)}
                </h2>
              </div>
              <div>
                <p className="measure text-[13px] leading-relaxed text-muted-foreground">
                  {t(y.note)}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
