import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { T } from "@/i18n/translations";
import { initiatives } from "@/content/site";
import heroManuscript from "@/assets/hero-manuscript.jpg";

export const Route = createFileRoute("/initiatives/$slug")({
  loader: ({ params }) => {
    const item = initiatives.find((i) => i.slug === params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.item.title.ar} — ${loaderData.item.title.en}` : "مبادرة";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.item.summary.ar ?? "" },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.item.summary.en ?? "" },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: InitiativeDetail,
});

function InitiativeDetail() {
  const { item } = Route.useLoaderData();
  const { t, lang } = useLang();

  return (
    <>
      <PageHero
        image={heroManuscript}
        eyebrow={t(T.status[item.status as keyof typeof T.status])}
        title={t(item.title)}
        subtitle={t(item.summary)}
      />
      <article className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-loose text-navy/85">{t(item.body)}</p>
          <div className="gold-divider my-10 w-24" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { h: { ar: "المرحلة الأولى", en: "Phase I" }, p: { ar: "الإطلاق والتخطيط", en: "Launch & planning" } },
              { h: { ar: "المرحلة الثانية", en: "Phase II" }, p: { ar: "التنفيذ", en: "Execution" } },
              { h: { ar: "المرحلة الثالثة", en: "Phase III" }, p: { ar: "التقييم والتوسع", en: "Assessment & scale" } },
            ].map((phase, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-gold">{t(phase.h)}</div>
                <div className="mt-2 font-semibold text-navy">{t(phase.p)}</div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/initiatives" className="text-sm font-semibold text-navy underline decoration-gold underline-offset-8">
              ← {lang === "ar" ? "كل المبادرات" : "All initiatives"}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
