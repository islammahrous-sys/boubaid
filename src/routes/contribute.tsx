import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import heroGathering from "@/assets/hero-gathering.jpg";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "المساهمة | Contribute — Al Bu Obaid Fund" },
      { name: "description", content: "طرق المساهمة في صندوق التنمية العائلية لآل بوعبيد." },
      { property: "og:title", content: "المساهمة في صندوق آل بوعبيد" },
      { property: "og:description", content: "تحويلات بنكية، وطرق دفع إلكترونية قريباً." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/contribute" },
    ],
    links: [{ rel: "canonical", href: "/contribute" }],
  }),
  component: ContributePage,
});

function ContributePage() {
  const { t, lang } = useLang();
  return (
    <>
      <PageHero
        image={heroGathering}
        eyebrow={lang === "ar" ? "المساهمة" : "Contribute"}
        title={lang === "ar" ? "استثمار في مستقبل الأسرة" : "An investment in the family's future"}
        subtitle={lang === "ar" ? "مساهماتكم تُوجَّه لبرامج التعليم، وبناء المقر، والحفاظ على الموروث." : "Your contribution supports education, the future HQ, and heritage preservation."}
      />

      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow={lang === "ar" ? "أثر مباشر" : "Direct impact"} title={lang === "ar" ? "أين تذهب مساهمتك؟" : "Where your contribution goes"} />
            <ul className="mt-8 space-y-4 text-navy/85">
              <li className="rounded-md border border-border bg-card p-5">
                <div className="text-sm font-semibold text-gold uppercase tracking-widest">50%</div>
                <div className="mt-1 font-semibold text-navy">{lang === "ar" ? "برامج التعليم والتفوق" : "Education & excellence programmes"}</div>
              </li>
              <li className="rounded-md border border-border bg-card p-5">
                <div className="text-sm font-semibold text-gold uppercase tracking-widest">30%</div>
                <div className="mt-1 font-semibold text-navy">{lang === "ar" ? "بناء المقر الدائم" : "Permanent headquarters"}</div>
              </li>
              <li className="rounded-md border border-border bg-card p-5">
                <div className="text-sm font-semibold text-gold uppercase tracking-widest">20%</div>
                <div className="mt-1 font-semibold text-navy">{lang === "ar" ? "الأرشيف والفعاليات الثقافية" : "Archive & cultural events"}</div>
              </li>
            </ul>
          </div>

          <div>
            <SectionHeading eyebrow={lang === "ar" ? "طرق المساهمة" : "How to give"} title={lang === "ar" ? "قنوات الدفع" : "Payment channels"} />
            <div className="mt-8 rounded-md border border-border bg-card p-6">
              <div className="text-sm font-semibold text-navy">{lang === "ar" ? "تحويل بنكي" : "Bank transfer"}</div>
              <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{lang === "ar" ? "المستفيد" : "Beneficiary"}</dt>
                <dd className="font-semibold text-navy">{lang === "ar" ? "صندوق التنمية العائلية لآل بوعبيد" : "Al Bu Obaid Family Development Fund"}</dd>
                <dt className="text-muted-foreground">IBAN</dt>
                <dd className="font-semibold text-navy" dir="ltr">SA00 0000 0000 0000 0000 0000</dd>
                <dt className="text-muted-foreground">{lang === "ar" ? "البنك" : "Bank"}</dt>
                <dd className="font-semibold text-navy">{lang === "ar" ? "قيد التحديث" : "To be updated"}</dd>
              </dl>
            </div>

            <div className="mt-4 rounded-md border border-gold/40 bg-ivory p-6">
              <div className="text-sm font-semibold text-navy">{lang === "ar" ? "الدفع الإلكتروني — قريباً" : "Online payment — coming soon"}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lang === "ar"
                  ? "سيتم تفعيل الدفع الإلكتروني وفق الأنظمة المعتمدة في المملكة."
                  : "Online payment will be enabled once regulatory requirements are met."}
              </p>
              <button disabled className="mt-4 cursor-not-allowed rounded-md bg-muted px-5 py-3 font-semibold text-muted-foreground">
                {lang === "ar" ? "قريباً" : "Coming soon"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading eyebrow={lang === "ar" ? "الأسئلة الشائعة" : "FAQ"} title={lang === "ar" ? "شفافية كاملة" : "Full transparency"} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { q: { ar: "هل الصندوق مرخّص؟", en: "Is the Fund licensed?" }, a: { ar: "نعم، كيان غير ربحي مرخّص وفق منظومة العمل الأهلي بالمملكة.", en: "Yes, a licensed non-profit under the Kingdom's nonprofit framework." } },
              { q: { ar: "هل هناك تقارير مالية؟", en: "Are there financial reports?" }, a: { ar: "نعم، ينشر الصندوق تقاريره المالية سنوياً عبر المكتبة.", en: "Yes, financial reports are published annually in the Library." } },
              { q: { ar: "هل مساهمتي محفوظة؟", en: "Is my contribution protected?" }, a: { ar: "تُدار المساهمات وفق سياسات صارمة يعتمدها مجلس الأمناء.", en: "Contributions are managed under strict policies approved by the Board of Trustees." } },
            ].map((f, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-5">
                <div className="font-semibold text-navy">{t(f.q)}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t(f.a)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
