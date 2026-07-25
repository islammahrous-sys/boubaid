import { createFileRoute } from "@tanstack/react-router";
import { Download, Users, ShieldCheck, Landmark } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { trustees, committees, siteMeta } from "@/content/site";
import heroGathering from "@/assets/hero-gathering.jpg";

export const Route = createFileRoute("/foundation")({
  head: () => ({
    meta: [
      { title: "صندوق التنمية العائلية | Al Bu Obaid Family Development Fund" },
      { name: "description", content: "التعريف بصندوق التنمية العائلية لآل بوعبيد، مجلس الأمناء، اللوائح، الخطة الاستراتيجية، واللجان." },
      { property: "og:title", content: "صندوق التنمية العائلية لآل بوعبيد" },
      { property: "og:description", content: "كيان غير ربحي مرخّص، بحوكمة شفافة وأثر مستدام." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/foundation" },
    ],
    links: [{ rel: "canonical", href: "/foundation" }],
  }),
  component: FoundationPage,
});

function FoundationPage() {
  const { t, lang } = useLang();

  return (
    <>
      <PageHero
        image={heroGathering}
        eyebrow={lang === "ar" ? "الصندوق" : "The Fund"}
        title={lang === "ar" ? "صندوق التنمية العائلية لآل بوعبيد" : "Al Bu Obaid Family Development Fund"}
        subtitle={lang === "ar" ? `مُشهر رسمياً في ${siteMeta.foundedHijri} هـ، وفق منظومة العمل الأهلي في المملكة.` : `Formally established on ${siteMeta.foundedHijri} AH under the Kingdom's nonprofit framework.`}
      />

      {/* Overview */}
      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { icon: Landmark, h: { ar: "كيان مؤسسي", en: "Institutional" }, p: { ar: "انتقال من الأعراف الشفهية إلى كيان مرخّص بحوكمة واضحة.", en: "A move from custom to a licensed entity with clear governance." } },
            { icon: ShieldCheck, h: { ar: "امتثال قانوني", en: "Compliance" }, p: { ar: "لائحة أساسية معتمدة، وتقارير مالية مدققة.", en: "An approved charter and audited financial reports." } },
            { icon: Users, h: { ar: "أثر مستدام", en: "Impact" }, p: { ar: "برامج تخدم أبناء الأسرة وتنسجم مع رؤية 2030.", en: "Programmes serving family members aligned with Vision 2030." } },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="rounded-md border border-border bg-card p-8">
                <Icon className="h-8 w-8 text-gold" />
                <h3 className="mt-4 text-xl font-semibold text-navy">{t(b.h)}</h3>
                <p className="mt-3 leading-loose text-muted-foreground">{t(b.p)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Board */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow={lang === "ar" ? "الحوكمة" : "Governance"} title={lang === "ar" ? "مجلس الأمناء" : "Board of Trustees"} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trustees.map((tr, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-6">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-navy text-2xl font-bold text-gold">
                  {i + 1}
                </div>
                <div className="mt-4 text-lg font-semibold text-navy">{t(tr.name)}</div>
                <div className="text-sm text-muted-foreground">{t(tr.title)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bylaws & documents */}
      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow={lang === "ar" ? "اللوائح" : "Charter"} title={lang === "ar" ? "الوثائق الرسمية" : "Official documents"} />
            <ul className="mt-8 space-y-3">
              {[
                { ar: "اللائحة الأساسية للصندوق", en: "Fund Charter (Bylaws)" },
                { ar: "الخطة الاستراتيجية 2025-2030", en: "Strategic Plan 2025-2030" },
                { ar: "التقرير المالي الأول", en: "First Financial Report" },
              ].map((d, i) => (
                <li key={i}>
                  <a href="#" className="flex items-center justify-between rounded-md border border-border bg-card px-5 py-4 hover:border-gold">
                    <span className="font-semibold text-navy">{t(d)}</span>
                    <Download className="h-4 w-4 text-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow={lang === "ar" ? "الخطة" : "Strategy"} title={lang === "ar" ? "الركائز الاستراتيجية" : "Strategic pillars"} />
            <ol className="mt-8 space-y-4">
              {[
                { ar: "التوثيق: نسب الأسرة وتراثها.", en: "Documentation: lineage and heritage." },
                { ar: "الوصل: تعزيز التواصل بين الأجيال والفروع.", en: "Connection: bonds across generations and branches." },
                { ar: "التمكين: برامج التعليم والتفوق.", en: "Empowerment: education & excellence programmes." },
              ].map((p, i) => (
                <li key={i} className="flex gap-4 rounded-md border border-border bg-card p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-navy font-bold">{i + 1}</span>
                  <span className="text-navy/85">{t(p)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Committees */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow={lang === "ar" ? "اللجان" : "Committees"} title={lang === "ar" ? "لجان الصندوق" : "The Fund's committees"} />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {committees.map((c, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-6">
                <div className="text-xs uppercase tracking-widest text-gold">#{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-2 text-xl font-semibold text-navy">{t(c.name)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(c.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HQ highlight */}
      <section className="container-page pb-24 pt-20">
        <div className="rounded-xl bg-navy p-8 text-ivory md:p-12">
          <div className="text-xs uppercase tracking-[0.28em] text-gold">{lang === "ar" ? "أول محطة رأسمالية" : "First capital milestone"}</div>
          <h3 className="mt-3 text-3xl font-semibold md:text-4xl">
            {lang === "ar" ? "المقر المستقبلي للصندوق" : "The Fund's future headquarters"}
          </h3>
          <p className="mt-4 max-w-3xl leading-loose text-ivory/85">
            {lang === "ar"
              ? "شكّل استحواذ الصندوق على أرض المقر المستقبلي الحصة الأكبر من نفقاته الرأسمالية في دورته المالية الأولى، بما يعكس أولوية بناء أصل عقاري ثابت يخدم الأسرة لأجيال قادمة."
              : "Acquiring the land for the future headquarters made up the largest share of the Fund's first-cycle capital expenditure — a deliberate choice to build a lasting asset that will serve the family for generations."}
          </p>
        </div>
      </section>
    </>
  );
}
