import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading, Prose, Eyebrow, Ornament, Pullquote } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { lineageChain, references, siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "النسب والتاريخ | أسرة آل بوعبيد — الأحساء" },
      {
        name: "description",
        content:
          "التاريخ والنسب الموثق لأسرة آل بوعبيد، هجرتهم واستقرارهم بالمبرز بالأحساء، وتفرعهم من بني تميم.",
      },
      { property: "og:title", content: "النسب والتاريخ — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: AboutPage,
});

const copy = {
  eyebrow: { ar: "النسب والتاريخ", en: "Lineage & History" } as BiText,
  title: {
    ar: "عمود النسب، ومواطن الاستقرار، ومصادر التوثيق",
    en: "The chain of descent, the places of settlement, and the sources",
  } as BiText,
  subtitle: {
    ar: "تسلسل نسب آل بوعبيد من فرع العبادل من بني تميم، واستقرارهم التاريخي بمدينة المبرز بواحة الأحساء.",
    en: "The descent of Al Bu Obaid from the ʿAbadil of Banu Tamim, and their historic settlement at Al-Mubarraz in the Al-Ahsa oasis.",
  } as BiText,
  imageCaption: {
    ar: "واحة الأحساء — أكبر واحة نخيل في العالم، وموطن استقرار الأسرة منذ قرون.",
    en: "The Al-Ahsa oasis — the largest palm oasis in the world, and the family's home for centuries.",
  } as BiText,

  metaOrigin: { ar: "الأصل", en: "Origin" } as BiText,
  metaOriginValue: { ar: "بنو تميم — العبادل", en: "Banu Tamim — the ʿAbadil" } as BiText,
  metaSeat: { ar: "الموطن", en: "Settlement" } as BiText,
  metaSeatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
  metaEarliest: { ar: "أقدم وثيقة", en: "Earliest deed" } as BiText,
  metaEarliestValue: { ar: "١١٠٢ هـ", en: "1102 AH" } as BiText,

  narrativeEyebrow: { ar: "أولاً", en: "I" } as BiText,
  narrativeTitle: { ar: "الأصل والانحدار", en: "Origin and descent" } as BiText,
  narrativeP1: {
    ar: "تتجذر الأصول النسبية لأسرة آل بوعبيد في فرع «العبادل» المعروف كذلك بـ«آل العداقل»، وهم أبناء عبد الله بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم بن مر. وتُعد تميم إحدى أضخم بطون العرب العدنانية وأصلبها، استقرت في نجد وإقليم البحرين التاريخي والأحساء.",
    en: "The Al Bu Obaid trace their descent to the ʿAbadil — also known as Āl al-ʿAdāqil — the sons of ʿAbd Allāh ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Mālik ibn Zayd Manāt ibn Tamīm ibn Murr. Banu Tamim is among the largest and most durable of the Adnani Arab confederations, settled across Najd, the historic Baḥrayn region, and Al-Ahsa.",
  } as BiText,
  narrativeP2: {
    ar: "ويمتد تسلسل نسب الأسرة صعوداً عبر الآباء والأجداد حتى يلتقي بالجد الجامع عدنان، من ولد نبي الله إسماعيل بن إبراهيم الخليل عليهما السلام. وتلتقي السلالة التميمية بالنسب النبوي الشريف عند الجد المشترك إلياس بن مضر.",
    en: "The chain ascends through the fathers and grandfathers to the common ancestor ʿAdnān, of the progeny of the Prophet Ishmael, son of Abraham. The Tamimi line converges with the Prophetic lineage at the shared ancestor Ilyās ibn Muḍar.",
  } as BiText,

  migrationEyebrow: { ar: "ثانياً", en: "II" } as BiText,
  migrationTitle: {
    ar: "الهجرة والاستقرار بالمبرز",
    en: "Migration and settlement at Al-Mubarraz",
  } as BiText,
  migrationP1: {
    ar: "انتقلت الأسرة عبر محطات تاريخية متتالية من إقليم نجد والحوطة لتستقر في واحة الأحساء الخصبة، وتحديداً في مدينة المبرز، حيث أسهم أبناؤها في الحركة العلمية والتجارية وإقامة الأوقاف الخيرية الموثقة.",
    en: "The family moved through successive stages from Najd and Al-Hawtah to settle in the fertile Al-Ahsa oasis, and specifically at Al-Mubarraz, where its members took part in scholarly and commercial life and established documented charitable endowments.",
  } as BiText,
  migrationP2: {
    ar: "ومن المبرز امتد أبناء الأسرة إلى الدمام والخبر والظهران والرياض وجدة، وإلى قطر والبحرين والكويت، مع بقاء المبرز مرجعاً ومقراً للأسرة ولمنظمتها الأهلية.",
    en: "From Al-Mubarraz the family extended to Dammam, Khobar, Dhahran, Riyadh and Jeddah, and onward to Qatar, Bahrain and Kuwait — while Al-Mubarraz has remained the family's point of reference and the seat of its organisation.",
  } as BiText,

  sourcesEyebrow: { ar: "ثالثاً", en: "III" } as BiText,
  sourcesTitle: { ar: "الشواهد والمصادر", en: "Evidence and sources" } as BiText,
  sourcesP1: {
    ar: "تناول مؤرخون وجغرافيون كلاسيكيون كالهمداني وياقوت الحموي فروع بني تميم والعبادل في شرق الجزيرة العربية. وتشهد الوثائق الشرعية المسجلة سنة ١١٠٢ هـ على حضور كبار الأسرة شهوداً وأوصياء على وقفيات المبرز والأحساء.",
    en: "Classical historians and geographers — al-Hamdānī and Yāqūt al-Ḥamawī among them — recorded the branches of Banu Tamim and the ʿAbadil in eastern Arabia. Sharia court records dated 1102 AH attest to the family's elders standing as witnesses and trustees over endowments at Al-Mubarraz and Al-Ahsa.",
  } as BiText,

  conflictsEyebrow: { ar: "رابعاً", en: "IV" } as BiText,
  conflictsTitle: {
    ar: "الصراعات القبلية والنفوذ في صدر الإسلام",
    en: "Tribal conflicts and early Islamic influence",
  } as BiText,
  conflictsP1: {
    ar: "شهد ما قبل الإسلام معارك حاسمة أعادت تشكيل الخريطة الديموغرافية لشرق الجزيرة، أبرزها «يوم رحرحان الأول» بين بني دارم وبني عامر بن صعصعة، و«يوم رحرحان الثاني» الذي جمع تميماً بأكملها ضد عامر. وأدت التحولات السياسية اللاحقة إلى هجرات داخلية، إذ دخل «العبادل» (ذرية عبدالله بن دارم) في تحالفات قبلية جديدة، فاستقروا في منطقة «الحوطة» (حوطة بني تميم) وأصبح لسلالتهم إمارة على تلك الحاضرة، لتكون نقطة انطلاق لهجرات متعاقبة نحو الشرق.",
    en: "The pre-Islamic era saw decisive battles that reshaped the demographic map of eastern Arabia — chief among them the first and second Yawm Raḥraḥān, which pitted Banu Dārim, and later all of Tamim, against Banu ʿĀmir ibn Ṣaʿṣaʿah. Subsequent political shifts drove internal migrations: the ʿAbadil (descendants of ʿAbd Allāh ibn Dārim) entered new tribal alliances and settled at Al-Ḥawṭah (Ḥawṭat Banu Tamim), where their line held the emirate of that town — a launching point for successive migrations eastward.",
  } as BiText,
  conflictsP2: {
    ar: "وفي فجر الإسلام، برز المنذر بن ساوى بن عبدالله بن زيد بن عبدالله بن دارم — سليل عبدالله بن دارم الجد الجامع للعبادل مباشرة — إذ تلقى رسالة النبي ﷺ يدعوه فيها إلى الإسلام، فأسلم طواعية وأدخل إقليم الأحساء بأكمله في الإسلام دون إراقة دماء. ويدل ارتباط نسب آل بوعبيد بهذه الجغرافية المحددة، وتحت قيادة أبناء عمومتهم المباشرين من بني دارم، على استمرارية بيولوجية وتاريخية وسياسية تمتد لأكثر من أربعة عشر قرناً متصلة في إقليم الأحساء.",
    en: "At the dawn of Islam, Al-Mundhir ibn Sāwā ibn ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim — a direct descendant of ʿAbd Allāh ibn Dārim, the shared patriarch of the ʿAbadil — received the Prophet's ﷺ letter calling him to Islam. He accepted willingly and brought the whole of Al-Ahsa into Islam without bloodshed. That Al Bu Obaid's lineage traces to this same specific line, under the direct cousins of Banu Dārim, points to a biological, historical, and political continuity spanning more than fourteen unbroken centuries in Al-Ahsa.",
  } as BiText,
  conflictsQuote: {
    ar: "استمرارية بيولوجية وتاريخية وسياسية تمتد لأكثر من أربعة عشر قرناً متصلة في إقليم الأحساء.",
    en: "A biological, historical, and political continuity spanning more than fourteen unbroken centuries in Al-Ahsa.",
  } as BiText,

  economyEyebrow: { ar: "خامساً", en: "V" } as BiText,
  economyTitle: {
    ar: "التوطن الحضري والنسيج الاقتصادي بالمبرز",
    en: "Urban settlement and the economic fabric of Al-Mubarraz",
  } as BiText,
  economyP1: {
    ar: "من أبرز الأدلة المادية الموثقة على هذا التجذر الحضري المبكر وثيقة وقف تاريخية نادرة تعود لعام ١١٠٢ هـ (الموافق تقريباً ١٦٩٠ م)، تتعلق بإثبات وقف خيري باسم رشيد بن مثيني الجحاحفة في مدينة المبرز بالأحساء. وتتضمن قائمة الشهود الموقعين على هذه الوثيقة أسماء صريحة من عائلة «العبدال»، منها: سيف بن سنان بن عبدال، عقيل بن عبدالعزيز بن عبدال، مبارك بن صغير بن عبدال، صقر بن مبارك بن صقر بن عبدال، ومسلم بن درع بن عبدال — إلى جانب المطوع إبراهيم التميمي. ويعكس تكرار اسم «عبدال» في السجلات العدلية لمدينة المبرز في أواخر القرن الحادي عشر الهجري المكانة الاجتماعية والاقتصادية المرموقة التي حظيت بها الأسرة، إذ كان يُشترط في شهود المحاكم الشرعية القديمة العدالة المطلقة والوجاهة والاستقرار الحضري الدائم.",
    en: "Among the most striking physical evidence of this early urban rootedness is a rare historical endowment deed dated 1102 AH (c. 1690 CE), attesting to a charitable waqf in the name of Rashīd ibn Muthannā Al-Jaḥāḥfah in the town of Al-Mubarraz, Al-Ahsa. The list of witnesses signing this deed includes explicit names from the 'ʿAbdāl' family: Sayf ibn Sinān ibn ʿAbdāl, ʿUqayl ibn ʿAbd al-ʿAzīz ibn ʿAbdāl, Mubārak ibn Ṣaghīr ibn ʿAbdāl, Ṣaqr ibn Mubārak ibn Ṣaqr ibn ʿAbdāl, and Muslim ibn Dirʿ ibn ʿAbdāl — alongside Muṭawwiʿ Ibrāhīm Al-Tamīmī. The recurrence of the name 'ʿAbdāl' in Al-Mubarraz's sharia court registers in the late 11th century AH reflects the family's prominent social and economic standing, since witnesses before the old sharia courts were required to hold absolute probity, public standing, and permanent urban residence.",
  } as BiText,
  economyP2: {
    ar: "وقد انخرطت الأسرة مبكراً في اقتصاد واحة الأحساء النابض، من الحرف اليدوية والنسيج إلى التجارة الإقليمية العابرة للحدود، إذ عمل أبناؤها في تجارة الأقمشة المجلوبة عبر قوافل من أسواق الكويت والبصرة في العراق. كما وظّفت الأسرة مؤسسة الزواج الداخلي والخارجي (Endogamy/Exogamy) أداة لتعزيز الاندماج الاجتماعي والتحالفات الاقتصادية، فارتبطت بمصاهرات مع عائلات وازنة في المجتمع الأحسائي كآل الحاج وآل فطيح وآل الموسى والقفيطي والسيد هاشم المكي، في نسيج من العلاقات المؤثرة يعكس صورة أسرة شديدة التماسك.",
    en: "The family engaged early with the vibrant economy of the Al-Ahsa oasis — from handicrafts and weaving to cross-border regional trade, its members dealing in cloth brought by caravan from the markets of Kuwait and Basra in Iraq. The family also used the institution of endogamy and exogamy as a tool for social integration and economic alliance, marrying into prominent families of Al-Ahsa society such as Al-Hajj, Al-Khalif, Al-Musa, Al-Qatifi, and Sayyid Hashim Al-Makki — a network of relationships reflecting a remarkably cohesive family.",
  } as BiText,

  marginNote: {
    ar: "المصادر النسبية المعتمدة في هذه الصفحة مثبتة في قائمة المراجع أسفلها، ومقروءة مع نتائج الدراسة الجينية.",
    en: "The genealogical sources relied on here are listed in the bibliography below, and are to be read alongside the results of the genetic study.",
  } as BiText,
  marginNoteLabel: { ar: "ملاحظة", en: "Note" } as BiText,

  chainEyebrow: { ar: "عمود النسب", en: "The chain of descent" } as BiText,
  chainTitle: { ar: "من آل بوعبيد إلى عدنان", en: "From Al Bu Obaid to ʿAdnān" } as BiText,
  chainSub: {
    ar: "يُقرأ العمود من أعلى إلى أسفل، من الأسرة في موطنها اليوم صعوداً إلى الجد الجامع.",
    en: "Read from top to bottom — from the family in its present home ascending to the common ancestor.",
  } as BiText,

  dnaCta: { ar: "نتائج الدراسة الجينية", en: "The genetic study" } as BiText,
  branchesCta: { ar: "الفروع السبعة", en: "The seven branches" } as BiText,

  platesEyebrow: { ar: "لوحات", en: "Plates" } as BiText,
  platesTitle: { ar: "من الأرشيف المصور", en: "From the pictorial archive" } as BiText,

  biblioTitle: { ar: "المراجع", en: "Bibliography" } as BiText,
};

export function AboutPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader
        variant="plate"
        image={pageImages.about.header.src}
        imageCaption={t(pageImages.about.header.caption)}
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaOrigin), value: t(copy.metaOriginValue) },
          { label: t(copy.metaSeat), value: t(copy.metaSeatValue) },
          { label: t(copy.metaEarliest), value: t(copy.metaEarliestValue), mono: true },
        ]}
      />

      {/* ── Manuscript spread: narrative with a margin column ── */}
      <section className="container-page py-16 md:py-20 reveal-on-scroll">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_minmax(0,15rem)]">
          <div className="space-y-12">
            <article>
              <SectionHeading
                index={rtl ? "١" : "I"}
                eyebrow={t(copy.narrativeEyebrow)}
                title={t(copy.narrativeTitle)}
              />
              <Prose dropCap className="mt-5">
                <p>{t(copy.narrativeP1)}</p>
                <p>{t(copy.narrativeP2)}</p>
              </Prose>
            </article>

            <article>
              <SectionHeading
                index={rtl ? "٢" : "II"}
                eyebrow={t(copy.migrationEyebrow)}
                title={t(copy.migrationTitle)}
              />
              <Prose className="mt-5">
                <p>{t(copy.migrationP1)}</p>
                <p>{t(copy.migrationP2)}</p>
              </Prose>
            </article>

            <article>
              <SectionHeading
                index={rtl ? "٣" : "III"}
                eyebrow={t(copy.sourcesEyebrow)}
                title={t(copy.sourcesTitle)}
              />
              <Prose className="mt-5">
                <p>{t(copy.sourcesP1)}</p>
              </Prose>
            </article>

            <article>
              <SectionHeading
                index={rtl ? "٤" : "IV"}
                eyebrow={t(copy.conflictsEyebrow)}
                title={t(copy.conflictsTitle)}
              />
              <Prose className="mt-5">
                <p>{t(copy.conflictsP1)}</p>
                <p>{t(copy.conflictsP2)}</p>
              </Prose>

              <Pullquote
                className="mt-6"
                cite={
                  rtl
                    ? "من التسلسل التاريخي، الفصل الرابع"
                    : "From the historical chronology, section IV"
                }
              >
                {t(copy.conflictsQuote)}
              </Pullquote>
            </article>

            <article>
              <SectionHeading
                index={rtl ? "٥" : "V"}
                eyebrow={t(copy.economyEyebrow)}
                title={t(copy.economyTitle)}
              />
              <Prose className="mt-5">
                <p>{t(copy.economyP1)}</p>
                <p>{t(copy.economyP2)}</p>
              </Prose>
            </article>
          </div>

          {/* Margin apparatus — the scholarly note and the registration. */}
          <aside className="space-y-8 lg:pt-2">
            <div className="border-s-2 border-bronze/40 ps-4 dark:border-gold/40">
              <p className="label-caps mb-2 text-bronze dark:text-gold">
                {t(copy.marginNoteLabel)}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.marginNote)}
              </p>
            </div>

            <dl className="border-t border-border pt-5 text-[13px]">
              <dt className="label-caps text-muted-foreground">
                {rtl ? "الكيان الرسمي" : "Registered entity"}
              </dt>
              <dd className="mt-1.5 leading-relaxed text-foreground">{t(siteMeta.officialName)}</dd>
              <dd className="nums mt-1 font-mono text-bronze dark:text-gold">
                {siteMeta.ncnpLicense}
              </dd>
            </dl>

            <div className="flex flex-col gap-2.5 border-t border-border pt-5">
              <Link
                to="/dna"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory"
              >
                {t(copy.dnaCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/branches"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory"
              >
                {t(copy.branchesCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── The nasab column — this page's signature ─────────── */}
      <section className="border-y border-border bg-secondary/40 reveal-on-scroll">
        <div className="container-page py-16 md:py-20">
          <SectionHeading
            align="center"
            eyebrow={t(copy.chainEyebrow)}
            title={t(copy.chainTitle)}
            subtitle={t(copy.chainSub)}
          />

          <ol className="mx-auto mt-12 max-w-xl">
            {lineageChain.map((node, i) => (
              <li key={i} className="relative text-center">
                {/* Connecting rule between generations */}
                {i > 0 ? (
                  <span className="mx-auto block h-7 w-px bg-border" aria-hidden="true" />
                ) : null}

                <div
                  className={
                    i === 0
                      ? "inline-block border border-bronze/50 bg-background px-6 py-3 dark:border-gold/50"
                      : i === lineageChain.length - 1
                        ? "inline-block border border-ink/30 bg-background px-6 py-3 dark:border-ivory/25"
                        : "inline-block px-4 py-2"
                  }
                >
                  <span className="nums label-caps me-3 text-muted-foreground" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span
                    className={
                      i === 0 || i === lineageChain.length - 1
                        ? "font-naskh text-lg font-bold text-foreground rtl:text-xl"
                        : "font-naskh text-base text-foreground/85 rtl:text-lg"
                    }
                  >
                    {t(node)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Plates ───────────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20 reveal-on-scroll">
        <SectionHeading eyebrow={t(copy.platesEyebrow)} title={t(copy.platesTitle)} />

        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {pageImages.about.plates.map((plate, i) => (
            <figure key={i}>
              <img
                src={plate.src}
                alt=""
                className="photo-plate plate-frame aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 flex gap-3 border-t border-border pt-3">
                <span className="nums label-caps shrink-0 text-bronze dark:text-gold">
                  {rtl ? `لوحة ${i + 1}` : `Plate ${i + 1}`}
                </span>
                <span className="text-[13px] leading-relaxed text-muted-foreground">
                  {t(plate.caption)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="container-page">
        <Ornament />
      </div>

      {/* ── Institutional Documentation ─────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20 reveal-on-scroll">
        <Eyebrow>
          {t({
            ar: "الوثائق المؤسسية والأرشيف المعتمد",
            en: "Institutional & Historical Archives",
          })}
        </Eyebrow>
        <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {t({
            ar: "الشهادات واللوائح المعتمدة التي توثق التأسيس الرسمي والاعتماد النظامي لصندوق التنمية العائلية ومراحل الحفظ التاريخي.",
            en: "Approved certificates and governance bylaws documenting the official institutional foundation and historical preservation milestones.",
          })}
        </p>
        <DocumentShowcase
          refs={["Lic. 1200758400", "Audit Certificate", "IP-Registered"]}
          variant="grid"
          className="mt-6"
        />
      </section>

      {/* ── Bibliography ─────────────────────────────────────── */}
      <section className="container-page py-16 md:py-20 reveal-on-scroll">
        <Eyebrow>{t(copy.biblioTitle)}</Eyebrow>

        <ol className="mt-6 max-w-3xl border-t border-border">
          {references.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[2rem_1fr] gap-4 border-b border-border py-4 text-[13px]"
            >
              <span className="nums text-muted-foreground" aria-hidden="true">
                {i + 1}.
              </span>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-start gap-2 leading-relaxed text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
              >
                <span>{r.label}</span>
                <ExternalLink
                  className="mt-1 h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
