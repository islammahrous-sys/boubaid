import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import {
  news,
  initiatives,
  branches,
  siteMeta,
  dnaInfo,
  achievers,
  hqProject,
} from "@/content/site";
import {
  SectionHeading,
  Rule,
  Ornament,
  Prose,
  Eyebrow,
  Status,
} from "@/components/site/Editorial";
import { newsImage } from "@/content/news-images";
import { pageImages } from "@/content/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "منظمة التنمية العائلية آل بوعبيد — البوابة الرسمية | Al Bu Obaid Family" },
      {
        name: "description",
        content: `البوابة الرسمية لمنظمة التنمية العائلية آل بوعبيد من بني تميم بالأحساء (ترخيص NCNP رقم ${siteMeta.ncnpLicense}).`,
      },
      { property: "og:title", content: "منظمة التنمية العائلية آل بوعبيد — الأحساء" },
      {
        property: "og:description",
        content:
          "كيان عائلي مرخص رسمياً من المركز الوطني لتنمية القطاع غير الربحي يجمع الفروع السبعة ومشاريع التكافل الاجتماعي والتطوير العقاري.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const copy = {
  standfirst: {
    ar: "أسرة من فرع العبادل من بني تميم، استقرت بمدينة المبرز في واحة الأحساء، وتدير اليوم شؤونها الأهلية والوقفية عبر كيان مرخص.",
    en: "A family of the ʿAbadil branch of Banu Tamim, settled at Al-Mubarraz in the Al-Ahsa oasis, and today administering its civic and endowment affairs through a licensed organisation.",
  } as BiText,
  seat: { ar: "المقر", en: "Seat" } as BiText,
  seatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
  registered: { ar: "سنة الإشهار", en: "Registered" } as BiText,
  branchCount: { ar: "الفروع الموثقة", en: "Documented branches" } as BiText,
  licence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,

  openingEyebrow: { ar: "افتتاحية", en: "Introduction" } as BiText,
  openingTitle: {
    ar: "نسب موثق، وأرشيف يُحفظ، وأوقاف تُدار",
    en: "A documented lineage, a kept archive, an administered endowment",
  } as BiText,
  openingP1: {
    ar: "تنحدر أسرة آل بوعبيد من فرع العبادل، أبناء عبد الله بن دارم، أحد بطون قبيلة بني تميم. ويمتد عمود نسبها صعوداً عبر بني حنظلة بن مالك إلى تميم بن مر، فإلياس بن مضر، حتى عدنان.",
    en: "The Al Bu Obaid descend from the ʿAbadil — the sons of ʿAbd Allāh ibn Dārim — one of the constituent houses of Banu Tamim. The chain of descent ascends through Banū Ḥanẓalah to Tamīm ibn Murr, then Ilyās ibn Muḍar, to ʿAdnān.",
  } as BiText,
  openingP2: {
    ar: "استقرت الأسرة في مدينة المبرز بواحة الأحساء، وتشهد وثائق المحاكم الشرعية المؤرخة سنة 1102 هـ على حضور أعيانها شهوداً وأوصياء على الوقفيات. ومن المبرز امتد أبناؤها إلى المنطقة الشرقية والرياض ودول الخليج.",
    en: "The family settled at Al-Mubarraz in the Al-Ahsa oasis. Sharia court records dated 1102 AH attest to its elders standing as witnesses and trustees over local endowments. From Al-Mubarraz its members extended into the Eastern Province, Riyadh, and the Gulf states.",
  } as BiText,
  openingLink: { ar: "تفصيل النسب والمصادر", en: "Full lineage and sources" } as BiText,

  branchesEyebrow: { ar: "البنية العائلية", en: "Family structure" } as BiText,
  branchesTitle: { ar: "الفروع السبعة", en: "The Seven Branches" } as BiText,
  branchesSub: {
    ar: "تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن صالح، ولكل فرع أفرعه الداخلية وممثلوه في مجلس الأسرة.",
    en: "The family is organised into seven principal branches descending from the sons of the patriarch Ahmed bin Salih, each with its own sub-lineages and representation on the family council.",
  } as BiText,
  members: { ar: "فرداً موثقاً", en: "documented" } as BiText,
  allBranches: { ar: "استعراض الفروع بالتفصيل", en: "All branches in detail" } as BiText,

  hqEyebrow: { ar: "المشروع القائم", en: "Project in progress" } as BiText,
  hqCaption: {
    ar: "تصور معماري للمقر الدائم بحي الحزام الذهبي، المبرز.",
    en: "Architectural rendering of the permanent headquarters, Al-Hizam Al-Dhahabi, Al-Mubarraz.",
  } as BiText,
  hqProgress: { ar: "نسبة الإنجاز", en: "Completion" } as BiText,
  hqDetails: { ar: "تفاصيل المشروع", en: "Project details" } as BiText,
  hqFacilities: { ar: "المرافق المخططة", en: "Planned facilities" } as BiText,

  honoursEyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  honoursTitle: { ar: "من كفاءات الأسرة", en: "Among the family's achievers" } as BiText,
  allHonours: { ar: "السجل كاملاً", en: "The full roll" } as BiText,

  newsEyebrow: { ar: "المستجدات", en: "Latest" } as BiText,
  newsTitle: { ar: "الأخبار والبيانات الرسمية", en: "News & official notices" } as BiText,
  allNews: { ar: "كل الأخبار", en: "All news" } as BiText,

  dnaEyebrow: { ar: "دراسة علمية", en: "Scientific study" } as BiText,
  dnaLink: { ar: "نتائج الدراسة الكاملة", en: "Full study results" } as BiText,
  parentClade: { ar: "السلسلة التحورية", en: "Parent clade" } as BiText,

  programmesEyebrow: { ar: "البرامج", en: "Programmes" } as BiText,
  programmesTitle: { ar: "المبادرات الجارية", en: "Current initiatives" } as BiText,
  allProgrammes: { ar: "كل المبادرات", en: "All initiatives" } as BiText,

  joinTitle: {
    ar: "المشاركة في أعمال المنظمة",
    en: "Take part in the organisation's work",
  } as BiText,
  joinBody: {
    ar: "الاشتراك الشهري يموّل الأوقاف وبرامج التكافل ومشروع المقر. ويسع أبناء الأسرة كذلك المشاركة في اللجان أو تحديث بياناتهم في السجل.",
    en: "Monthly subscription funds the endowments, the solidarity programmes, and the headquarters project. Family members may also join a committee or update their record in the register.",
  } as BiText,
  joinCta: { ar: "الاشتراك والمساهمة", en: "Subscribe & contribute" } as BiText,
  contactCta: { ar: "تواصل مع الأمانة العامة", en: "Contact the secretariat" } as BiText,
};

/** Arabic abjad-style ordinals for the branch index. */
const ordinals = ["١", "٢", "٣", "٤", "٥", "٦", "٧"];

export function HomePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const [lead, ...rest] = news;

  return (
    <>
      {/* ── Frontispiece ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        {/* High-visibility, vibrant heritage background image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/ahsa_oasis.png"
            alt=""
            className="h-full w-full object-cover opacity-50 filter contrast-110 shadow-inner"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/65 to-ink/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15)_0%,transparent_75%)]" />
        </div>

        <div className="container-page relative z-10 py-16 text-center md:py-24">
          {/* Calligraphic Emblem with Radiant Halo Ring */}
          <div className="relative mx-auto w-max animate-in fade-in zoom-in-95 duration-700">
            <div
              className="absolute -inset-4 rounded-full bg-gold/15 blur-xl animate-pulse"
              aria-hidden="true"
            />
            <div className="relative grid h-32 w-32 place-items-center rounded-full border border-gold/40 bg-ink/80 shadow-[0_0_50px_rgba(212,175,55,0.2)] md:h-40 md:w-40">
              <img
                src="/logo-gold.png"
                alt=""
                className="h-24 w-24 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-transform duration-500 hover:scale-105 md:h-30 md:w-30"
                aria-hidden="true"
              />
            </div>
          </div>

          <p className="label-caps mt-8 text-gold/90 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
            {t(siteMeta.ncnpAuthority)}
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-balance font-naskh text-3xl font-bold leading-[1.3] text-transparent bg-gradient-to-b from-ivory via-ivory to-gold-soft bg-clip-text drop-shadow-md transition-colors animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200 md:text-5xl lg:text-6xl">
            {t(siteMeta.officialName)}
          </h1>

          <div className="mx-auto mt-7 flex max-w-xs items-center gap-4 text-gold/70 animate-in fade-in duration-700 delay-300">
            <span
              className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              aria-hidden="true"
            />
            <span
              className="ornament-star text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              aria-hidden="true"
            />
            <span
              className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              aria-hidden="true"
            />
          </div>

          <p className="measure mx-auto mt-7 text-base leading-relaxed text-balance text-ivory/85 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500 md:text-lg">
            {t(copy.standfirst)}
          </p>

          {/* Hero Quick Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
            <Link
              to="/family-tree"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden border border-gold bg-gradient-to-r from-gold via-gold/90 to-gold-soft px-6 py-3 text-sm font-bold text-ink shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-102 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              <span>{lang === "ar" ? "تصفح مشجرة النسب" : "Explore Family Tree"}</span>
              <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>

            <Link
              to="/branches"
              className="inline-flex items-center gap-2 border border-ivory/30 bg-ivory/5 px-6 py-3 text-sm font-medium text-ivory backdrop-blur-sm transition-all duration-300 hover:border-gold/60 hover:bg-ivory/10 hover:text-gold"
            >
              <span>{lang === "ar" ? "دليل الفروع السبعة" : "Seven Branches Guide"}</span>
            </Link>
          </div>
        </div>

        {/* Colophon strip — interactive stats that define the entity. */}
        <div className="relative z-10 border-t border-gold/20 bg-ink/80 backdrop-blur-md">
          <dl className="container-page grid grid-cols-2 divide-y divide-ivory/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse">
            {[
              { label: copy.licence, value: siteMeta.ncnpLicense, mono: true, link: null },
              {
                label: copy.registered,
                value: `${siteMeta.foundedHijri} هـ`,
                mono: false,
                link: null,
              },
              {
                label: copy.branchCount,
                value: rtl ? "سبعة فروع" : "Seven Branches",
                mono: false,
                link: "/branches",
              },
              { label: copy.seat, value: t(copy.seatValue), mono: false, link: "/contact" },
            ].map((item, i) => {
              const content = (
                <div className="flex h-full flex-col justify-center px-4 py-6 transition-all duration-300 group-hover:bg-ivory/[0.06] sm:px-6 sm:text-center sm:first:ps-0 sm:last:pe-0">
                  <dt className="label-caps flex items-center justify-center gap-1.5 text-ivory/50 transition-colors group-hover:text-gold">
                    {t(item.label)}
                    {item.link && (
                      <Arrow
                        className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 rtl:group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </dt>
                  <dd
                    className={cn(
                      "mt-2 text-sm font-semibold text-ivory transition-colors group-hover:text-gold sm:text-base",
                      item.mono && "nums font-mono text-gold group-hover:text-gold-soft",
                    )}
                  >
                    {item.value}
                  </dd>
                </div>
              );

              return (
                <div key={i} className="group relative transition-all duration-300">
                  {item.link ? (
                    <Link to={item.link} className="block h-full w-full">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* ── Opening statement ────────────────────────────────── */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.openingEyebrow)}</Eyebrow>
            <h2 className="mt-4 text-2xl leading-tight text-foreground md:text-[1.75rem]">
              {t(copy.openingTitle)}
            </h2>
          </div>

          <div>
            <Prose dropCap>
              <p>{t(copy.openingP1)}</p>
              <p>{t(copy.openingP2)}</p>
            </Prose>

            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.openingLink)}
              <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── The seven branches, as an index ──────────────────── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-16 md:py-20">
          <SectionHeading
            eyebrow={t(copy.branchesEyebrow)}
            title={t(copy.branchesTitle)}
            subtitle={t(copy.branchesSub)}
          />

          <ol className="mt-10 border-t border-border">
            {branches.map((b, i) => (
              <li key={b.id}>
                <Link
                  to="/branches"
                  hash={b.id}
                  className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 border-b border-border py-4 transition-colors hover:bg-background/60 sm:grid-cols-[2.5rem_minmax(0,16rem)_1fr_auto] sm:gap-x-6"
                >
                  <span
                    className="nums font-naskh text-lg text-bronze/60 dark:text-gold/50"
                    aria-hidden="true"
                  >
                    {rtl ? ordinals[i] : i + 1}
                  </span>

                  <span className="text-[15px] font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                    {t(b.name)}
                  </span>

                  <span className="col-start-2 text-[13px] text-muted-foreground sm:col-start-3">
                    {t(b.settlement)}
                  </span>

                  <span className="nums col-start-3 justify-self-end text-[13px] text-muted-foreground sm:col-start-4">
                    {b.count} <span className="text-xs">{t(copy.members)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <Link
            to="/branches"
            className="mt-7 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.allBranches)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Headquarters project ─────────────────────────────── */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <figure>
            <img
              src={pageImages.home.project.src}
              alt={t(hqProject.title)}
              className="w-full object-cover"
              loading="lazy"
            />
            <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
              <span>{t(pageImages.home.project.caption)}</span>
            </figcaption>
          </figure>

          <div>
            <Eyebrow>{t(copy.hqEyebrow)}</Eyebrow>
            <h2 className="mt-4 text-2xl leading-tight text-foreground md:text-[1.75rem]">
              {t(hqProject.title)}
            </h2>
            <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
              {t(hqProject.fundingModel)}
            </p>

            {/* Progress, stated as a figure first and a bar second. */}
            <div className="mt-7 border-t border-border pt-5">
              <div className="flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">{t(copy.hqProgress)}</span>
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
                aria-label={t(copy.hqProgress)}
              >
                <div
                  className="h-full bg-bronze dark:bg-gold"
                  style={{ width: `${hqProject.progress}%` }}
                />
              </div>
            </div>

            <dl className="mt-6 divide-y divide-border border-y border-border">
              {[
                { term: copy.seat, value: t(hqProject.location) },
                { term: { ar: "المساحة", en: "Area" } as BiText, value: hqProject.area },
                { term: { ar: "المرحلة", en: "Stage" } as BiText, value: t(hqProject.status) },
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-5"
                >
                  <dt className="label-caps pt-0.5 text-muted-foreground">{t(row.term)}</dt>
                  <dd className="nums text-sm text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              <p className="label-caps mb-2.5 text-muted-foreground">{t(copy.hqFacilities)}</p>
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

            <Link
              to="/initiatives"
              className="mt-7 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.hqDetails)}
              <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page">
        <Ornament />
      </div>

      {/* ── News ─────────────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t(copy.newsEyebrow)} title={t(copy.newsTitle)} />
          <Link
            to="/news"
            className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.allNews)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          {/* Lead story */}
          <article>
            <Link to="/news/$slug" params={{ slug: lead.slug }} className="group block">
              <img
                src={newsImage(lead.slug)}
                alt=""
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
              <p className="nums label-caps mt-4 text-bronze dark:text-gold">
                {lead.dateGregorian}
              </p>
              <h3 className="mt-2 text-xl leading-snug text-foreground transition-colors group-hover:text-bronze md:text-2xl dark:group-hover:text-gold">
                {t(lead.title)}
              </h3>
              <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(lead.excerpt)}
              </p>
            </Link>
          </article>

          {/* Remaining stories as a list */}
          <ol className="border-t border-border">
            {rest.map((n) => (
              <li key={n.slug}>
                <Link
                  to="/news/$slug"
                  params={{ slug: n.slug }}
                  className="group block border-b border-border py-5"
                >
                  <p className="nums label-caps text-muted-foreground">{n.dateGregorian}</p>
                  <h3 className="mt-1.5 text-[15px] leading-snug font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                    {t(n.title)}
                  </h3>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Roll of honour ───────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <SectionHeading eyebrow={t(copy.honoursEyebrow)} title={t(copy.honoursTitle)} />
            <Link
              to="/achievers"
              className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.allHonours)}
              <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <ul className="mt-10 grid gap-x-14 gap-y-0 border-t border-border md:grid-cols-2">
            {achievers.slice(0, 6).map((person, i) => (
              <li key={i} className="border-b border-border py-4">
                <p className="text-[15px] font-semibold text-foreground">{t(person.name)}</p>
                <p className="mt-1 text-[13px] text-bronze dark:text-gold">{t(person.field)}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {t(person.achievement)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Initiatives ──────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeading eyebrow={t(copy.programmesEyebrow)} title={t(copy.programmesTitle)} />
          <Link
            to="/initiatives"
            className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.allProgrammes)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-x-14 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.slice(0, 6).map((init) => (
            <article key={init.slug} className="border-b border-border py-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[15px] leading-snug font-semibold text-foreground">
                  <Link
                    to="/initiatives/$slug"
                    params={{ slug: init.slug }}
                    className="transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {t(init.title)}
                  </Link>
                </h3>
                <Status tone={init.status === "ongoing" ? "active" : "pending"}>
                  {init.status === "ongoing"
                    ? rtl
                      ? "جارية"
                      : "Active"
                    : rtl
                      ? "قادمة"
                      : "Planned"}
                </Status>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {t(init.summary)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Genetic study ────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-page py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.dnaEyebrow)}</Eyebrow>
              <p className="nums mt-4 font-mono text-3xl text-foreground">{dnaInfo.haplogroup}</p>
            </div>

            <div>
              <h2 className="text-2xl leading-tight text-foreground md:text-[1.75rem]">
                {t(dnaInfo.title)}
              </h2>
              <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(dnaInfo.overview)}
              </p>

              <div className="mt-6 border-y border-border py-3">
                <p className="label-caps text-muted-foreground">{t(copy.parentClade)}</p>
                <p
                  className="nums mt-1.5 font-mono text-[13px] break-all text-foreground"
                  dir="ltr"
                >
                  {dnaInfo.parentClade}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
                <Link
                  to="/dna"
                  className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {t(copy.dnaLink)}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {dnaInfo.databases.map((db) => (
                  <a
                    key={db.name}
                    href={db.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {db.name}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Take part ────────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <h2 className="text-2xl leading-tight text-foreground md:text-[1.75rem]">
              {t(copy.joinTitle)}
            </h2>
            <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
              {t(copy.joinBody)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/contribute"
              className="inline-flex items-center border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
            >
              {t(copy.joinCta)}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t(copy.contactCta)}
            </Link>
          </div>
        </div>
      </section>

      <Rule variant="hair" className="container-page" />
    </>
  );
}
