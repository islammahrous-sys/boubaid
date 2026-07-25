import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, MessageCircle, Send } from "lucide-react";

import heroOasis from "@/assets/hero-oasis.jpg";
import heroGathering from "@/assets/hero-gathering.jpg";
import heroManuscript from "@/assets/hero-manuscript.jpg";
import archiveAhsa from "@/assets/archive-ahsa.jpg";

import { useLang } from "@/i18n/LanguageProvider";
import { T } from "@/i18n/translations";
import { news, initiatives, stats, siteMeta } from "@/content/site";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AnimatedCounter } from "@/components/site/AnimatedCounter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "آل بوعبيد — الموقع الرسمي | Al Bu Obaid Family" },
      { name: "description", content: "الموقع الرسمي لأسرة آل بوعبيد من فرع العبادل من بني تميم، ومقرها الأحساء، وصندوق التنمية العائلية التابع لها." },
      { property: "og:title", content: "آل بوعبيد — الموقع الرسمي" },
      { property: "og:description", content: "أسرة عريقة الجذور، وصندوق تنمية عائلي مرخّص يعمل بروح الموروث ومعايير العمل المؤسسي." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const slides = [
  { image: heroOasis, key: "oasis" },
  { image: heroGathering, key: "gathering" },
  { image: heroManuscript, key: "manuscript" },
];

function HomePage() {
  const { t, lang } = useLang();
  const [slide, setSlide] = useState(0);
  const rtl = lang === "ar";

  const headlines = [
    { ar: "أسرة عريقة الجذور، وحضور معاصر.", en: "Deep roots. A contemporary presence." },
    { ar: "من الأحساء إلى امتداد الخليج.", en: "From Al-Ahsa across the Gulf." },
    { ar: "من الأعراف الشفهية إلى كيان مؤسسي.", en: "From oral custom to institutional stewardship." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[78vh] min-h-[520px] overflow-hidden bg-navy text-ivory">
        {slides.map((s, i) => (
          <img
            key={s.key}
            src={s.image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === slide ? "opacity-40" : "opacity-0"}`}
            aria-hidden="true"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy" />
        <div className="container-page relative flex h-full flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">
            {t(T.brandSub)}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            {t(T.brand)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ivory/85 md:text-2xl">
            {t(headlines[slide])}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={siteMeta.contact.whatsapp}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-navy hover:bg-gold-soft"
            >
              <MessageCircle className="h-4 w-4" />
              {lang === "ar" ? "انضم لمجموعة الأسرة" : "Join the family channel"}
            </a>
            <Link
              to="/foundation"
              className="inline-flex items-center gap-2 rounded-md border border-ivory/40 px-5 py-3 font-semibold text-ivory hover:border-gold hover:text-gold"
            >
              {lang === "ar" ? "عن الصندوق" : "About the fund"}
              {rtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>

          <div className="mt-10 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`slide-${i + 1}`}
                className={`h-1.5 w-10 rounded-full transition-colors ${i === slide ? "bg-gold" : "bg-ivory/25"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading
              eyebrow={lang === "ar" ? "عن الأسرة" : "About the family"}
              title={lang === "ar" ? "جذور تميمية، ونسيج عائلي متجدد" : "Tamimi roots, a family fabric renewed"}
            />
            <p className="mt-6 text-base leading-loose text-navy/85 md:text-lg">
              {lang === "ar"
                ? "تنحدر أسرة آل بوعبيد من فرع العبادل، أبناء عبد الله بن دارم، أحد بطون قبيلة بني تميم العريقة. يمتد نسبها موغلاً في القدم حتى يلتقي مع الجدّ المشترك إلياس بن مضر، ومنه إلى عدنان، ومنه إلى إسماعيل عليه السلام. اتخذت الأسرة من الأحساء موطناً وامتدت فروعها في أرجاء الخليج."
                : "The Al Bu Obaid family descends from the ʿAbadil branch — the sons of ʿAbd Allāh ibn Dārim, one of the great houses of the Banī Tamīm tribe. Its lineage reaches back to Ilyās ibn Muḍar, ʿAdnān, and ultimately to Ismāʿīl (peace be upon him). The family took Al-Ahsa as its home, with branches extending across the Gulf."}
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-8 hover:text-navy-soft"
            >
              {t(T.common.readMore)}
              {rtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>
          <div className="relative">
            <img src={archiveAhsa} alt={lang === "ar" ? "الأحساء" : "Al-Ahsa"} className="rounded-md shadow-xl" loading="lazy" />
            <div className="absolute -bottom-4 -end-4 hidden rounded-md border border-gold bg-ivory p-4 shadow-lg md:block">
              <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "الموطن" : "Homeland"}</div>
              <div className="text-lg font-semibold text-navy">{t(siteMeta.headquarters)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy py-16 text-ivory">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.key} className="text-center">
              <div className="font-display text-5xl font-semibold text-gold md:text-6xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm uppercase tracking-widest text-ivory/70">
                {t(s.label)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "آخر الأخبار" : "Latest news"}
            title={lang === "ar" ? "من أخبار الأسرة والصندوق" : "From the family & the fund"}
          />
          <Link to="/news" className="text-sm font-semibold text-navy underline decoration-gold underline-offset-8">
            {t(T.common.viewAll)}
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {news.slice(0, 3).map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="aspect-[16/10] w-full overflow-hidden bg-navy/10">
                <img src={n.section === "fund" ? heroManuscript : heroGathering} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs uppercase tracking-widest text-gold">{n.date}</div>
                <h3 className="mt-2 text-lg font-semibold text-navy">{t(n.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(n.excerpt)}</p>
                <span className="mt-4 text-sm font-semibold text-navy">{t(T.common.details)} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Initiatives */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={lang === "ar" ? "المبادرات" : "Initiatives"}
              title={lang === "ar" ? "مشاريع تصنع الأثر" : "Programmes that make an impact"}
            />
            <Link to="/initiatives" className="text-sm font-semibold text-navy underline decoration-gold underline-offset-8">
              {t(T.common.viewAll)}
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {initiatives.slice(0, 3).map((i) => (
              <Link key={i.slug} to="/initiatives/$slug" params={{ slug: i.slug }} className="flex flex-col rounded-md border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${i.status === "completed" ? "bg-emerald/10 text-emerald" : i.status === "upcoming" ? "bg-gold/20 text-navy" : "bg-navy/10 text-navy"}`}>
                  {t(T.status[i.status])}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-navy">{t(i.title)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(i.summary)}</p>
                <span className="mt-4 text-sm font-semibold text-navy">{t(T.common.details)} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-xl bg-navy px-8 py-14 text-center text-ivory md:px-16 md:py-20">
          <h3 className="mx-auto max-w-2xl text-3xl font-semibold md:text-4xl">
            {lang === "ar" ? "كن على تواصل مع الأسرة" : "Stay connected with the family"}
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-ivory/80">
            {lang === "ar"
              ? "انضم إلى قنوات الأسرة الرسمية للاطلاع على الأخبار، الملتقيات، والمبادرات."
              : "Join our official channels for news, gatherings, and initiatives."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={siteMeta.contact.whatsapp} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-navy hover:bg-gold-soft">
              <MessageCircle className="h-4 w-4" /> {lang === "ar" ? "قناة واتساب" : "WhatsApp"}
            </a>
            <a href={siteMeta.contact.telegram} className="inline-flex items-center gap-2 rounded-md border border-ivory/40 px-5 py-3 font-semibold text-ivory hover:border-gold hover:text-gold">
              <Send className="h-4 w-4" /> {lang === "ar" ? "قناة تلغرام" : "Telegram"}
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container-page pb-24">
        <div className="grid gap-10 rounded-xl border border-border bg-card p-6 md:grid-cols-2 md:p-10">
          <div>
            <SectionHeading
              eyebrow={lang === "ar" ? "تواصل سريع" : "Quick contact"}
              title={lang === "ar" ? "أرسل لنا رسالة" : "Send us a note"}
            />
            <p className="mt-6 leading-loose text-muted-foreground">
              {lang === "ar"
                ? "لأي استفسار، سنعاود التواصل معك في أقرب وقت. للتواصل التفصيلي زر صفحة التواصل."
                : "Any question — we'll reply as soon as we can. For a fuller form, visit our contact page."}
            </p>
          </div>
          <QuickContactForm />
        </div>
      </section>
    </>
  );
}

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
});

function QuickContactForm() {
  const { lang } = useLang();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const r = schema.safeParse({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
        });
        if (!r.success) {
          toast.error(lang === "ar" ? "يرجى التحقق من الحقول" : "Please check the fields");
          return;
        }
        toast.success(lang === "ar" ? "شكراً لرسالتك — سنعاود التواصل قريباً" : "Thank you — we'll be in touch");
        (e.target as HTMLFormElement).reset();
      }}
      className="grid gap-4"
    >
      <input name="name" required placeholder={lang === "ar" ? "الاسم" : "Name"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
      <input name="email" type="email" required placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
      <textarea name="message" required rows={5} placeholder={lang === "ar" ? "رسالتك" : "Your message"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
      <button type="submit" className="rounded-md bg-navy px-5 py-3 font-semibold text-ivory hover:bg-navy-soft">
        {lang === "ar" ? "إرسال" : "Send"}
      </button>
    </form>
  );
}
