import { createFileRoute } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";
import { z } from "zod";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { officialCharts, officialChartsPdf } from "@/content/tree/charts";
import { Eyebrow } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import {
  ElectronicFamilyTreeSection,
  OfficialPlateSection,
  VisualGenealogySection,
} from "@/components/site/FamilyTreeSections";
import { getPublicFamilyTreeData } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";

const searchSchema = z.object({
  branch: z.string().optional(),
  id: z.string().optional(),
  focus: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/family-tree")({
  validateSearch: (search: z.input<typeof searchSchema>) => searchSchema.parse(search),
  loader: async () => {
    const treeData = await getPublicFamilyTreeData();
    return { treeData };
  },
  head: ({ loaderData }) => {
    const n = (loaderData?.treeData?.members?.length ?? 550).toLocaleString("ar-EG");
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

const copy = {
  eyebrow: { ar: "المشجرة", en: "Family tree" } as BiText,
  title: { ar: "الفروع امتداد الجذور", en: "The Branches Extend the Roots" } as BiText,
  patriarch: { ar: "الجد الجامع", en: "Root ancestor" } as BiText,
  patriarchValue: {
    ar: "عبد الله بن دارم — العبادل من بني تميم",
    en: "ʿAbd Allāh ibn Dārim — the ʿAbadil of Banu Tamim",
  } as BiText,
  fullscreen: { ar: "فتح بملء الشاشة", en: "Open full screen" } as BiText,
};

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
      <ElectronicFamilyTreeSection />
      <OfficialPlateSection />
      <VisualGenealogySection />

      {/* ── The 12 official verified branch charts ──────────────────────────── */}
      <section className="reveal-on-scroll container-page mt-4 border-t border-border pt-10">
        <Eyebrow>{t({ ar: "المشجرات الرسمية المعتمدة", en: "Official verified charts" })}</Eyebrow>
        <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {t({
            ar: "المشجرات الاثنتا عشرة المعتمدة من لجنة التوثيق، وهي المرجع الذي بُنيت عليه بيانات المشجرة الإلكترونية. تُنشر للمراجعة والتوثيق ولا تُعد صيغة نهائية.",
            en: "The twelve committee-verified charts that the electronic tree is built from. Published for review and documentation; not a final edition.",
          })}
        </p>

        <button
          type="button"
          onClick={() =>
            openMediaViewer({
              src: officialChartsPdf,
              kind: "pdf",
              title: t({ ar: "المشجرات الرسمية المعتمدة", en: "Official verified charts" }),
            })
          }
          className="label-caps mt-5 inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs text-foreground transition-colors hover:border-foreground"
        >
          {t({ ar: "عرض الملف الكامل (PDF)", en: "View full file (PDF)" })}
        </button>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officialCharts.map((c) => (
            <li key={c.chart} className="border border-border bg-card">
              <button
                type="button"
                onClick={() => openMediaViewer({ src: c.image, kind: "image", title: c.titleAr })}
                className="block w-full text-start"
              >
                <img
                  src={c.image}
                  alt={c.titleAr}
                  loading="lazy"
                  className="aspect-4/3 w-full bg-white object-contain"
                />
                <div className="border-t border-border p-3">
                  <p className="label-caps text-bronze dark:text-gold">
                    <span className="nums">
                      {t({ ar: `مشجرة ${c.chart}`, en: `Chart ${c.chart}` })}
                    </span>
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground">{c.titleAr}</p>
                  <p className="nums mt-1 text-xs text-muted-foreground">
                    {t({ ar: `${c.people} اسمًا موثقًا`, en: `${c.people} documented names` })}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Official Tree Artwork & Lineage Documents ───────────────────────── */}
      <section className="reveal-on-scroll container-page mt-16 border-t border-border pt-10 pb-16">
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
