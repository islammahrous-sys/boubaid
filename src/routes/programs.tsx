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
 * البرامج — programmes of the family council.
 *
 * Programmes live in the same CMS table as المشاريع (`initiatives`), separated
 * by the `kind` column, so a new programme added in Admin → المشاريع والبرامج
 * with the section set to «البرامج» appears here with no code change.
 */
export const Route = createFileRoute("/programs")({
  loader: async () => {
    const rows = await getPublishedInitiatives();
    return {
      programs: rows
        .filter((r) => r.kind === "program" && r.is_published)
        .map(mapInitiativeRow),
    };
  },
  head: () => ({
    meta: [
      { title: "البرامج | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "برامج مجلس أسرة آل بوعبيد: البرامج الأسرية والتنموية والتعليمية المعتمدة من مجلس الأمناء وجدول تنفيذها.",
      },
      { property: "og:title", content: "البرامج — مجلس أسرة آل بوعبيد" },
      {
        property: "og:description",
        content: "البرامج الأسرية والتنموية والتعليمية المعتمدة من مجلس الأمناء.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/programs") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/programs") }],
  }),
  component: ProgramsPage,
});

const copy = {
  eyebrow: { ar: "الأنشطة المعتمدة", en: "Approved activities" } as BiText,
  title: { ar: "البرامج", en: "Programs" } as BiText,
  subtitle: {
    ar: "البرامج التي يعتمدها مجلس الأمناء وتنفذها اللجان التنفيذية لخدمة أفراد الأسرة وتنمية قدراتهم.",
    en: "Programmes approved by the board of trustees and delivered by the standing committees for the benefit of family members.",
  } as BiText,
  listTitle: { ar: "البرامج المنشورة", en: "Published Programs" } as BiText,
  empty: {
    ar: "لم تُنشر برامج حتى الآن. تُضاف البرامج من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "No programmes have been published yet. Programmes are added from the admin console and appear here immediately.",
  } as BiText,
  requestCta: { ar: "الانتقال إلى مركز الطلبات", en: "Go to the Requests Hub" } as BiText,
};

function ProgramsPage() {
  const { t, lang } = useLang();
  const { programs } = Route.useLoaderData();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

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

          {programs.length === 0 ? (
            <p className="measure mt-5 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.empty)}
            </p>
          ) : (
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {programs.map((program) => (
                <li
                  key={program.slug}
                  className="flex flex-col rounded-md border border-border bg-card p-6 transition-colors hover:border-bronze dark:hover:border-gold"
                >
                  {program.image ? (
                    <img
                      src={program.image}
                      alt={t(program.title)}
                      loading="lazy"
                      className="mb-4 aspect-[16/9] w-full rounded object-cover"
                    />
                  ) : null}
                  <Status
                    tone={
                      program.status === "ongoing"
                        ? "active"
                        : program.status === "completed"
                          ? "neutral"
                          : "pending"
                    }
                  >
                    {program.status === "ongoing"
                      ? t({ ar: "مستمر", en: "Ongoing" })
                      : program.status === "completed"
                        ? t({ ar: "مكتمل", en: "Completed" })
                        : t({ ar: "قادم", en: "Upcoming" })}
                  </Status>
                  <h2 className="mt-3 text-[17px] font-semibold leading-snug text-foreground">
                    {t(program.title)}
                  </h2>
                  {t(program.summary) ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {t(program.summary)}
                    </p>
                  ) : null}
                  {t(program.body) ? (
                    <Prose className="mt-3 text-[13px]">{t(program.body)}</Prose>
                  ) : null}
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
