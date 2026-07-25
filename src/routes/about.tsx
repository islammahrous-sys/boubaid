import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { lineageChain, dnaDistribution, references, siteMeta } from "@/content/site";
import heroManuscript from "@/assets/hero-manuscript.jpg";
import archiveAhsa from "@/assets/archive-ahsa.jpg";
import heroGathering from "@/assets/hero-gathering.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن الأسرة | About — Al Bu Obaid" },
      { name: "description", content: "تاريخ أسرة آل بوعبيد، جذورها في فرع العبادل من بني تميم، وموطنها في الأحساء، ودراسة الحمض النووي (J-Z20777)." },
      { property: "og:title", content: "عن أسرة آل بوعبيد" },
      { property: "og:description", content: "الجذور، النسب، والدراسة الجينية." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useLang();

  return (
    <>
      <PageHero
        image={heroManuscript}
        eyebrow={lang === "ar" ? "عن الأسرة" : "About the family"}
        title={lang === "ar" ? "جذور موغلة في القدم، ونسيج يتجدّد" : "Ancient roots, a fabric renewed"}
        subtitle={lang === "ar" ? "من فرع العبادل من بني تميم، إلى الأحساء وامتداد الخليج." : "From the ʿAbadil branch of Banī Tamīm, to Al-Ahsa and the wider Gulf."}
      />

      {/* Lineage narrative */}
      <section className="container-page py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div>
            <SectionHeading
              eyebrow={lang === "ar" ? "الأصل والنسب" : "Origin & lineage"}
              title={lang === "ar" ? "من العبادل إلى عدنان" : "From the ʿAbadil to ʿAdnān"}
            />
            <div className="mt-8 space-y-5 text-base leading-loose text-navy/85 md:text-lg">
              <p>
                {lang === "ar"
                  ? "تتجذر الأصول النسبية لأسرة آل بوعبيد في فرع «العبادل»، وهم أبناء عبد الله بن دارم، أحد بطون قبيلة بني تميم العريقة. يمتد التسلسل النسبي الموثق للأسرة صعوداً إلى عبد الله بن زيد بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم بن مر."
                  : "The Al Bu Obaid family descends from the ʿAbadil branch — the sons of ʿAbd Allāh ibn Dārim, one of the great houses of the Banī Tamīm tribe. Its documented chain rises through ʿAbd Allāh ibn Zayd ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Mālik ibn Zayd Manāt ibn Tamīm ibn Murr."}
              </p>
              <p>
                {lang === "ar"
                  ? "ويستمر هذا الاتصال النسبي حتى يلتقي مع الجدّ الأكبر عدنان، من ذرية نبي الله إسماعيل بن إبراهيم الخليل عليهما السلام. وتلتقي هذه السلالة الدارمية التميمية بنسب النبي محمد ﷺ عند الجدّ المشترك «إلياس بن مضر»."
                  : "That chain continues to the great ancestor ʿAdnān, of the line of the Prophet Ismāʿīl ibn Ibrāhīm (peace be upon them). This Dārimī-Tamīmī lineage meets the line of the Prophet Muḥammad ﷺ at their shared ancestor Ilyās ibn Muḍar."}
              </p>
              <p>
                {lang === "ar"
                  ? "تشير التحليلات التاريخية إلى أن فرع «العبادل» تبلور ككيان مستقل قبل الهجرة النبوية بنحو مائتي سنة، وكان الجدّ الجامع عبد الله بن دارم معاصراً لقصي بن كلاب. عُرف بنو دارم بسعتهم الديموغرافية وانتشارهم من أواسط نجد حتى السواحل الشرقية."
                  : "Historical analysis places the crystallisation of the ʿAbadil branch as an autonomous entity roughly two centuries before the Hijra. ʿAbd Allāh ibn Dārim was a contemporary of Quṣayy ibn Kilāb. Banī Dārim were known for their demographic breadth, spreading from central Najd to the eastern coast."}
              </p>
            </div>
          </div>

          {/* Lineage chain */}
          <aside className="rounded-md border border-gold/40 bg-ivory p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              {lang === "ar" ? "سلسلة النسب" : "Lineage chain"}
            </div>
            <ol className="mt-6 space-y-2">
              {lineageChain.map((node, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-semibold text-ivory">
                    {i + 1}
                  </span>
                  <span className={`text-base ${i === 0 ? "font-semibold text-gold" : "text-navy"}`}>
                    {t(node)}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      {/* Vision / mission / goals */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={lang === "ar" ? "الرؤية والرسالة" : "Vision & mission"}
            title={lang === "ar" ? "ملامح المستقبل الذي نبنيه" : "The future we are building"}
            align="center"
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                head: { ar: "الرؤية", en: "Vision" },
                body: { ar: "أسرة مؤسسية رائدة، تجسر بين الموروث والحداثة، وتخدم أبناءها ومجتمعها.", en: "A leading institutional family that bridges heritage and modernity, in service of its members and community." },
              },
              {
                head: { ar: "الرسالة", en: "Mission" },
                body: { ar: "تنمية أبناء الأسرة إنسانياً وعلمياً واقتصادياً عبر برامج ومبادرات مستدامة.", en: "Developing family members personally, academically, and economically through sustainable programmes." },
              },
              {
                head: { ar: "الأهداف", en: "Goals" },
                body: { ar: "التوثيق، الوصل، والتمكين — بمعايير حوكمة تنسجم مع رؤية المملكة 2030.", en: "Documenting, connecting, empowering — under governance aligned with Vision 2030." },
              },
            ].map((c, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-8">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{t(c.head)}</div>
                <p className="mt-4 leading-loose text-navy/85">{t(c.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DNA study */}
      <section className="container-page py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading
              eyebrow={lang === "ar" ? "دراسة الحمض النووي" : "Y-DNA study"}
              title={lang === "ar" ? "السلالة الجينية J-Z20777" : "Haplogroup J-Z20777"}
            />
            <p className="mt-6 leading-loose text-navy/85">
              {lang === "ar"
                ? "بلغت الأسرة، ضمن مشاريع الحمض النووي المتخصصة، عمقاً جينياً واضحاً في السلالة الفرعية J-Z20777 التي يقدَّر ظهورها حوالي عام 600 ميلادي، متزامنة مع بزوغ فجر الإسلام والفتوحات الكبرى. وتنتظم فروع أعلى ضمن الشجرة الفيلوجينية عبر J-Z20774 (~550 م) و J-Z20776 (~350 م)."
                : "Within specialised Y-DNA projects, the family clusters clearly in the sub-haplogroup J-Z20777, dated to roughly 600 CE — coinciding with the dawn of Islam and the early conquests. Upstream branches on the phylogenetic tree include J-Z20774 (~550 CE) and J-Z20776 (~350 CE)."}
            </p>
            <p className="mt-4 leading-loose text-navy/85">
              {lang === "ar"
                ? "تشير التوزيعات المرجعية إلى انتشار السلالة عبر عائلات تميمية مرموقة في الخليج، مع تركز واضح في قطر."
                : "Reference distributions show the haplogroup present across notable Tamimi families throughout the Gulf, with a marked concentration in Qatar."}
            </p>
          </div>
          <div className="rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-navy text-ivory">
                <tr>
                  <th className="p-4 text-start font-semibold">{lang === "ar" ? "المنطقة" : "Region"}</th>
                  <th className="p-4 text-start font-semibold">{lang === "ar" ? "ملاحظات" : "Notes"}</th>
                </tr>
              </thead>
              <tbody>
                {dnaDistribution.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-4 font-semibold text-navy">{t(r.region)}</td>
                    <td className="p-4 text-muted-foreground">{t(r.note)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section className="bg-navy py-16 text-ivory">
        <div className="container-page grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "الترخيص" : "Registration"}</div>
            <div className="mt-2 text-2xl font-semibold">{t(siteMeta.registrationNumber)}</div>
            <p className="mt-2 text-sm text-ivory/70">{lang === "ar" ? "رقم الترخيص الرسمي للصندوق ككيان غير ربحي." : "Official registration number of the Fund as a licensed non-profit."}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "تاريخ الإشهار" : "Established"}</div>
            <div className="mt-2 text-2xl font-semibold">{siteMeta.foundedHijri} هـ</div>
            <p className="mt-2 text-sm text-ivory/70">{lang === "ar" ? "بعد أربع سنوات من التنسيق الإداري." : "After four years of institutional coordination."}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "الموطن" : "Home"}</div>
            <div className="mt-2 text-2xl font-semibold">{t(siteMeta.headquarters)}</div>
            <p className="mt-2 text-sm text-ivory/70">{lang === "ar" ? "مع امتداد فروع الأسرة في الخليج." : "With branches extending across the Gulf."}</p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-page py-20">
        <SectionHeading eyebrow={lang === "ar" ? "من الأرشيف" : "From the archive"} title={lang === "ar" ? "لقطات من الموروث" : "Glimpses of heritage"} />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[archiveAhsa, heroManuscript, heroGathering].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-border">
              <img src={src} alt="" className="h-64 w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* References */}
      <section className="container-page pb-24">
        <div className="rounded-md border border-border bg-card p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">{lang === "ar" ? "مصادر ومراجع" : "References"}</div>
          <ul className="mt-4 space-y-2 text-sm">
            {references.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-navy underline decoration-gold underline-offset-4 hover:text-navy-soft" dir="ltr">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
