import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { initiatives, hqProject } from "@/content/site";
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Status, Prose } from "@/components/site/Editorial";

export const Route = createFileRoute("/initiatives")({
  head: () => ({
    meta: [
      { title: "المبادرات والمشاريع | صندوق التنمية العائلية (آل بوعبيد)" },
      {
        name: "description",
        content:
          "المبادرات التنموية والاجتماعية لصندوق التنمية العائلية (آل بوعبيد) ومشروع المقر الدائم بحي الحزام الذهبي.",
      },
      { property: "og:title", content: "مبادرات آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: InitiativesPage,
});

const copy = {
  eyebrow: { ar: "البرامج والمشاريع", en: "Programmes & projects" } as BiText,
  title: { ar: "المبادرات القائمة والمخططة", en: "Current & Planned Initiatives" } as BiText,
  subtitle: {
    ar: "برامج تنموية واجتماعية تنفذها اللجان التنفيذية، إلى جانب مشروع المقر الدائم الذي يمثل أكبر التزام رأسمالي للصندوق.",
    en: "Development and social programmes delivered by the standing committees, alongside the permanent headquarters — the organisation's largest capital commitment.",
  } as BiText,

  metaActive: { ar: "برامج جارية", en: "Active" } as BiText,
  metaPlanned: { ar: "برامج مخططة", en: "Planned" } as BiText,
  metaCapital: { ar: "المشروع الرأسمالي", en: "Capital project" } as BiText,
  metaCapitalValue: { ar: "المقر الدائم", en: "Permanent HQ" } as BiText,

  flagshipEyebrow: { ar: "المشروع الرئيسي", en: "Flagship project" } as BiText,
  specTitle: { ar: "بيانات المشروع", en: "Project particulars" } as BiText,
  specLocation: { ar: "الموقع", en: "Location" } as BiText,
  specArea: { ar: "المساحة", en: "Area" } as BiText,
  specStage: { ar: "المرحلة", en: "Stage" } as BiText,
  specProgress: { ar: "نسبة الإنجاز", en: "Completion" } as BiText,
  specFacilities: { ar: "المرافق المخططة", en: "Planned facilities" } as BiText,
  specFunding: { ar: "التمويل", en: "Funding" } as BiText,
  caption: {
    ar: "تصور معماري للمقر الدائم — حي الحزام الذهبي، المبرز.",
    en: "Architectural rendering of the permanent headquarters — Al-Hizam Al-Dhahabi, Al-Mubarraz.",
  } as BiText,

  scheduleEyebrow: { ar: "جدول البرامج", en: "Programme schedule" } as BiText,
  scheduleTitle: { ar: "المبادرات حسب الحالة", en: "Initiatives by status" } as BiText,
  colProgramme: { ar: "البرنامج", en: "Programme" } as BiText,
  colStatus: { ar: "الحالة", en: "Status" } as BiText,
  active: { ar: "جارية", en: "Active" } as BiText,
  planned: { ar: "مخططة", en: "Planned" } as BiText,
  details: { ar: "التفاصيل", en: "Details" } as BiText,

  supportTitle: { ar: "دعم البرامج", en: "Supporting the programmes" } as BiText,
  supportBody: {
    ar: "تموَّل البرامج من الاشتراكات الشهرية ومن القروض الحسنة المساهمة في مشروع المقر.",
    en: "The programmes are funded from monthly subscriptions and from interest-free contributory loans towards the headquarters project.",
  } as BiText,
  supportCta: { ar: "الاشتراك والمساهمة", en: "Subscribe & contribute" } as BiText,
};

export function InitiativesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const activeCount = initiatives.filter((i) => i.status === "ongoing").length;
  const plannedCount = initiatives.length - activeCount;

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaActive), value: activeCount.toString(), mono: true },
          { label: t(copy.metaPlanned), value: plannedCount.toString(), mono: true },
          { label: t(copy.metaCapital), value: t(copy.metaCapitalValue) },
        ]}
      />

      {/* ── Flagship: the headquarters, given a spec sheet ──── */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-page py-14 md:py-16">
          <Eyebrow>{t(copy.flagshipEyebrow)}</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-2xl leading-tight text-foreground md:text-3xl">
            {t(hqProject.title)}
          </h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <figure>
              <img
                src={pageImages.initiatives.flagship.src}
                alt={t(hqProject.title)}
                className="photo-plate aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                <span>{t(pageImages.initiatives.flagship.caption)}</span>
              </figcaption>
            </figure>

            <div>
              <p className="label-caps border-b border-ink/25 pb-2.5 text-muted-foreground dark:border-ivory/20">
                {t(copy.specTitle)}
              </p>

              <dl>
                {[
                  { term: copy.specLocation, value: t(hqProject.location) },
                  { term: copy.specArea, value: hqProject.area, mono: true },
                  { term: copy.specStage, value: t(hqProject.status) },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-1 border-b border-border py-3 sm:grid-cols-[8rem_1fr] sm:gap-5"
                  >
                    <dt className="label-caps pt-0.5 text-muted-foreground">{t(row.term)}</dt>
                    <dd className={`text-sm text-foreground ${row.mono ? "nums font-mono" : ""}`}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="label-caps text-muted-foreground">{t(copy.specProgress)}</span>
                  <span className="nums font-mono text-2xl text-foreground">
                    {hqProject.progress}%
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 w-full bg-border"
                  role="progressbar"
                  aria-valuenow={hqProject.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t(copy.specProgress)}
                >
                  <div
                    className="h-full bg-bronze dark:bg-gold"
                    style={{ width: `${hqProject.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-7 border-t border-border pt-5">
                <p className="label-caps mb-2.5 text-muted-foreground">{t(copy.specFacilities)}</p>
                <ul className="space-y-1.5">
                  {hqProject.facilities.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 bg-bronze dark:bg-gold"
                        aria-hidden="true"
                      />
                      {t(f)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="label-caps mb-2 text-muted-foreground">{t(copy.specFunding)}</p>
                <Prose className="text-[13px]">
                  <p>{t(hqProject.fundingModel)}</p>
                </Prose>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programme schedule ──────────────────────────────── */}
      <section className="container-page py-14 md:py-16">
        <Eyebrow>{t(copy.scheduleEyebrow)}</Eyebrow>
        <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
          {t(copy.scheduleTitle)}
        </h2>

        <ol className="mt-8 border-t border-ink/25 dark:border-ivory/20">
          {initiatives.map((init, i) => (
            <li key={init.slug} className="border-b border-border">
              <Link
                to="/initiatives/$slug"
                params={{ slug: init.slug }}
                className="group grid gap-x-6 gap-y-2 py-6 transition-[color,background-color,transform] duration-200 ease-out hover:bg-secondary/40 active:scale-[0.98] md:grid-cols-[2.5rem_minmax(0,18rem)_1fr_auto] md:items-baseline"
              >
                <span
                  className="nums font-mono text-sm text-bronze/70 dark:text-gold/60"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-[15px] leading-snug font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                  {t(init.title)}
                </h3>

                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {t(init.summary)}
                </p>

                <span className="justify-self-start md:justify-self-end">
                  <Status tone={init.status === "ongoing" ? "active" : "pending"}>
                    {init.status === "ongoing" ? t(copy.active) : t(copy.planned)}
                  </Status>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Support ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="text-xl text-foreground">{t(copy.supportTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.supportBody)}
            </p>
          </div>
          <Link
            to="/contribute"
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            {t(copy.supportCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
