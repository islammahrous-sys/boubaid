import { createFileRoute } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";
import { z } from "zod";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { Eyebrow } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import {
  ElectronicFamilyTreeSection,
  OfficialPlateSection,
  VisualGenealogySection,
} from "@/components/site/FamilyTreeSections";
import { getPublicFamilyStats } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/family-tree";

const searchSchema = z.object({
  branch: z.string().optional(),
  id: z.string().optional(),
  focus: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/family-tree")({
  validateSearch: (search: z.input<typeof searchSchema>) => searchSchema.parse(search),
  loader: async () => {
    // Only the member count is needed here (the interactive tree loads its own
    // data), so avoid shipping the full tree in the page HTML.
    const stats = await getPublicFamilyStats();
    return { memberCount: stats?.total ?? 550 };
  },
  head: ({ loaderData }) => {
    const n = (loaderData?.memberCount ?? 550).toLocaleString("ar-EG");
    return {
      meta: [
        { title: "المشجرة التفاعلية | آل بوعبيد" },
        {
          name: "description",
          content: `المشجرة التفاعلية لأسرة آل بوعبيد من العبادل من بني تميم: ${n} اسماً موثقاً عبر عشرة أجيال، مستخرجة من المشجرات الاثنتي عشرة المعتمدة.`,
        },
        { property: "og:title", content: "المشجرة التفاعلية — آل بوعبيد" },
        {
          property: "og:description",
          content: `المشجرة التفاعلية لأسرة آل بوعبيد: ${n} اسماً موثقاً عبر عشرة أجيال وفق المشجرات المعتمدة.`,
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: getCanonicalUrl("/family-tree") },
      ],
      links: [{ rel: "canonical", href: getCanonicalUrl("/family-tree") }],
    };
  },
  component: FamilyTreePage,
});



function FamilyTreePage() {
  const { t } = useLang();
  const { focus, q } = Route.useSearch();

  return (
    <>
      {/* ── Toolbar. This page is an instrument, not a document, so
             the chrome is a control strip rather than a masthead. ── */}
      <div className="border-b border-border bg-ink text-ivory">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <Eyebrow rule={false} className="text-gold">
              {t(copy.eyebrow)}
            </Eyebrow>
            <h1 className="mt-1 font-brand text-xl leading-tight font-bold text-ivory rtl:text-2xl">
              {t(copy.title)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div className="hidden sm:block">
              <p className="label-caps text-ivory/45">{t(copy.patriarch)}</p>
              <p className="mt-0.5 text-[13px] text-ivory/80">{t(copy.patriarchValue)}</p>
            </div>

            <a
              href="/interactive-tree.html"
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps inline-flex shrink-0 items-center gap-2 border border-gold bg-gold px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-transparent hover:text-gold"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t(copy.fullscreen)}
            </a>
          </div>
        </div>
      </div>

      {/* The electronic tree, the official plate and the visual guide are the
          shared sections also rendered on the home page. */}
      <ElectronicFamilyTreeSection focusId={focus} focusName={q} />
      <OfficialPlateSection />
      <VisualGenealogySection />

      {/* ── Official Tree Artwork & Lineage Documents ───────────────────────── */}
      <section className="reveal-on-scroll container-page mt-4 border-t border-border pt-10 pb-16">
        <Eyebrow>
          {t({ ar: "وثائق النسب والمشجرة الرسمية", en: "Lineage Documents & Official Tree" })}
        </Eyebrow>
        <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {t({
            ar: "اللوحة الرسمية المعتمدة لشجرة أسرة آل بوعبيد (مسجلة الملكية الفكرية)، والتقارير الجينية الموثقة.",
            en: "The official IP-registered pictorial family tree plate and documented genetic reports.",
          })}
        </p>
        <DocumentShowcase
          refs={["IP-Registered", "Genealogy Archive"]}
          variant="grid"
          className="mt-6"
        />
      </section>
    </>
  );
}
