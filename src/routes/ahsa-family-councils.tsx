import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/ahsa-family-councils")({
  head: () => ({
    meta: [
      { title: "مجالس أسر الأحساء | آل بوعبيد" },
      { name: "description", content: "صفحة مجالس أسر الأحساء وطلب الانضمام إليها عبر مركز الطلبات." },
      { property: "og:title", content: "مجالس أسر الأحساء — آل بوعبيد" },
      { property: "og:description", content: "مجالس أسر الأحساء وطلب الانضمام إليها." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/ahsa-family-councils") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/ahsa-family-councils") }],
  }),
  component: AhsaCouncilsPage,
});

function AhsaCouncilsPage() {
  const { t, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <>
      <PageHeader
        eyebrow={t({ ar: "الشراكات الأسرية", en: "Family partnerships" })}
        title={t({ ar: "مجالس أسر الأحساء", en: "Al-Ahsa Family Councils" })}
      />
      <div className="container-page py-14 md:py-16">
        <section>
          <Eyebrow rule>{t({ ar: "المجالس", en: "Councils" })}</Eyebrow>
          <div className="mt-6 rounded-md border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t({
                ar: "ستُنشر هنا معلومات مجالس أسر الأحساء قريباً.",
                en: "Information about the Al-Ahsa Family Councils will be published here soon.",
              })}
            </p>
          </div>
          <Link
            to="/requests"
            search={{ request: "ahsa_family_councils_join" }}
            className="mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze hover:text-foreground dark:border-gold dark:text-gold"
          >
            {t({ ar: "الانضمام إلى مجالس أسر الأحساء", en: "Join the Al-Ahsa Family Councils" })}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
