import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { getPublishedInitiatives } from "@/lib/cms.functions";
import { mapInitiativeRow } from "@/content/cms-adapt";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Status, Prose } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

/**
 * المسابقات و الجوائز — competitions and awards of the family council.
 *
 * Records live in the same CMS table as المشاريع and البرامج (`initiatives`),
 * separated by the `kind` column, so anything added in
 * Admin → المشاريع والبرامج with the section set to «المسابقات و الجوائز»
 * appears here with no code change.
 */
export const Route = createFileRoute("/competitions")({
  loader: async () => {
    const rows = await getPublishedInitiatives();
    return {
      competitions: rows
        .filter((r) => r.kind === "competition" && r.is_published)
        .map(mapInitiativeRow),
    };
  },
  head: () => ({
    meta: [
      { title: "المسابقات و الجوائز | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "المسابقات و الجوائز في مجلس أسرة آل بوعبيد: جوائز التفوق العلمي والمهني والمسابقات الثقافية المعتمدة من مجلس الأمناء.",
      },
      { property: "og:title", content: "المسابقات و الجوائز — مجلس أسرة آل بوعبيد" },
      {
        property: "og:description",
        content: "جوائز التفوق العلمي والمهني والمسابقات الثقافية المعتمدة من مجلس الأمناء.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/competitions") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/competitions") }],
  }),
  component: CompetitionsPage,
});

const copy = {
  eyebrow: { ar: "التكريم والتنافس", en: "Recognition and competition" } as BiText,
  title: { ar: "المسابقات و الجوائز", en: "Competitions & Awards" } as BiText,
  subtitle: {
    ar: "الجوائز والمسابقات التي يعتمدها مجلس الأمناء لتكريم المتميزين من أبناء الأسرة وتشجيع التنافس العلمي والثقافي.",
    en: "Awards and competitions approved by the board of trustees to honour high achievers and encourage academic and cultural excellence.",
  } as BiText,
  listTitle: { ar: "المسابقات والجوائز المنشورة", en: "Published Competitions & Awards" } as BiText,
  empty: {
    ar: "لم تُنشر مسابقات أو جوائز حتى الآن. تُضاف من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "Nothing has been published yet. Entries are added from the admin console and appear here immediately.",
  } as BiText,
  requestCta: { ar: "الانتقال إلى مركز الطلبات", en: "Go to the Requests Hub" } as BiText,
};

function CompetitionsPage() {
  const { t, lang } = useLang();
  const { competitions } = Route.useLoaderData();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-14 md:py-16">
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.listTitle)}</Eyebrow>

          {competitions.length === 0 ? (
            <p className="measure mt-5 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.empty)}
            </p>
          ) : (
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {competitions.map((item) => (
                <li
                  key={item.slug}
                  className="flex flex-col rounded-md border border-border bg-card p-6 transition-colors hover:border-bronze dark:hover:border-gold"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={t(item.title)}
                      loading="lazy"
                      className="mb-4 aspect-[16/9] w-full rounded object-cover"
                    />
                  ) : null}
                  <Status
                    tone={
                      item.status === "ongoing"
                        ? "active"
                        : item.status === "completed"
                          ? "neutral"
                          : "pending"
                    }
                  >
                    {item.status === "ongoing"
                      ? t({ ar: "مستمرة", en: "Ongoing" })
                      : item.status === "completed"
                        ? t({ ar: "مكتملة", en: "Completed" })
                        : t({ ar: "قادمة", en: "Upcoming" })}
                  </Status>
                  <h2 className="mt-3 text-[17px] font-semibold leading-snug text-foreground">
                    {t(item.title)}
                  </h2>
                  {t(item.summary) ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {t(item.summary)}
                    </p>
                  ) : null}
                  {t(item.body) ? <Prose className="mt-3 text-[13px]">{t(item.body)}</Prose> : null}
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/requests"
            className="mt-10 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.requestCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
