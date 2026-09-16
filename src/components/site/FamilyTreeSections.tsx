import { Link } from "@tanstack/react-router";
import { Lock, Maximize2 } from "lucide-react";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { Eyebrow } from "@/components/site/Editorial";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { historyMedia } from "@/content/history-source";

/**
 * The three canonical family-tree presentations — the electronic (interactive)
 * tree, the official illustrated plate, and the visual genealogy guide — live
 * here so the lineage page and the home page render exactly the same sections
 * from the same data source instead of keeping two copies.
 */

export const OFFICIAL_FAMILY_TREE_IMAGE =
  "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/official/family-tree-plate-1447.jpg";

export const treeCopy = {
  treeTitle: { ar: "الفروع امتداد الجذور", en: "The Branches Extend the Roots" } as BiText,
  electronicEyebrow: { ar: "المشجرة الإلكترونية", en: "Electronic family tree" } as BiText,
  fullscreen: { ar: "فتح بملء الشاشة", en: "Open full screen" } as BiText,
  privacyLabel: { ar: "الخصوصية", en: "Privacy" } as BiText,
  privacyBody: {
    ar: "لا تُنشر أرقام الهويات الوطنية ولا تواريخ الميلاد ولا بيانات التواصل الشخصية في المشجرة العامة. وتتاح التفاصيل الكاملة لأبناء الأسرة عبر الأمانة العامة.",
    en: "National ID numbers, dates of birth, and personal contact details are not published in the public tree. Full records are available to family members through the secretariat.",
  } as BiText,

  artworkEyebrow: { ar: "الإصدار الأول — ١٤٤٧هـ", en: "First Edition — 1447 AH" } as BiText,
  artworkTitle: {
    ar: "اللوحة الرسمية المصورة لشجرة العائلة",
    en: "Official Illustrated Family Tree",
  } as BiText,
  artworkBody: {
    ar: "أُخرجت الأسرة هذه اللوحة الجدارية بتكلفة استثمارية بلغت 14,948 ريالاً سعودياً، وسُجلت حقوق ملكيتها الفكرية رسمياً لتكون مرجعاً بصرياً حصرياً يربط الجيل الناشئ بجذوره التميمية.",
    en: "The family commissioned this wall plate at an investment cost of SAR 14,948, and formally registered its intellectual-property rights to serve as an exclusive visual reference linking the rising generation to its Tamimi roots.",
  } as BiText,
  artworkOpen: { ar: "فتح اللوحة كاملة", en: "Open the full plate" } as BiText,
  artworkFull: { ar: "عرض الصورة بالحجم الكامل", en: "View full-size image" } as BiText,
  artworkCaption: {
    ar: "اضغط على اللوحة لتكبيرها، أو افتح النسخة الأصلية عالية الدقة.",
    en: "Click the plate to enlarge it, or open the original high-resolution copy.",
  } as BiText,

  visualEyebrow: { ar: "الدليل البصري", en: "Visual genealogy" } as BiText,
  visualTitle: {
    ar: "شجرة آل بوعبيد البصرية — من الجذور إلى الأفق الرقمي",
    en: "Al Bu Obaid Visual Genealogy — from roots to the digital horizon",
  } as BiText,
  visualBody: {
    ar: "يوضح هذا المخطط البصري كيف تتشابك الجذور النسبية التقليدية مع الأسس الرقمية المعاصرة لتوثيق شجرة الأسرة، مما يجعل الإرث القبلي مرجعاً حياً يُحَدَّث ويُتداول بين الأجيال.",
    en: "This visual diagram shows how traditional genealogical roots intertwine with contemporary digital foundations for documenting the family tree, turning tribal heritage into a living reference that is updated and shared across generations.",
  } as BiText,
  visualCaption: {
    ar: "الدليل البصري لشجرة أسرة آل بوعبيد: إرث ينمو من الجذور إلى الأفق الرقمي.",
    en: "Visual guide to the Al Bu Obaid family tree: a heritage growing from its roots to the digital horizon.",
  } as BiText,
};

/**
 * The interactive canvas itself. `withHeading` adds the section title used on
 * the home page, where the tree is one section among many rather than the
 * whole page.
 */
export function ElectronicFamilyTreeSection({
  withHeading = false,
  focusId,
  focusName,
}: {
  withHeading?: boolean;
  /** Deep-link target coming from the site-wide search, forwarded to the canvas. */
  focusId?: string;
  focusName?: string;
}) {
  const { t } = useLang();

  const query = new URLSearchParams();
  if (focusId) query.set("focus", focusId);
  if (focusName) query.set("q", focusName);
  const canvasSrc = query.size ? `/interactive-tree.html?${query.toString()}` : "/interactive-tree.html";

  return (
    <section id="electronic-family-tree" className="scroll-mt-24">
      {withHeading ? (
        <div className="container-page pt-14 md:pt-16">
          <Eyebrow>{t(treeCopy.electronicEyebrow)}</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-2xl leading-tight text-foreground md:text-[1.75rem]">
              {t(treeCopy.treeTitle)}
            </h2>
            <a
              href={canvasSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps inline-flex shrink-0 items-center gap-2 border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t(treeCopy.fullscreen)}
            </a>
          </div>
        </div>
      ) : null}

      <div className={withHeading ? "mt-6 bg-ink" : "bg-ink"}>
        <iframe
          src="/interactive-tree.html"
          title={t(treeCopy.treeTitle)}
          className="block h-[50vh] min-h-[22rem] w-full border-0 bg-card sm:h-[65vh] sm:min-h-[32rem]"
        />
      </div>

      <aside className="border-b border-border bg-muted/40">
        <div className="container-page flex items-start gap-3 py-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-bronze dark:text-gold" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            <span className="label-caps me-2 text-bronze dark:text-gold">
              {t(treeCopy.privacyLabel)}
            </span>
            {t(treeCopy.privacyBody)}
          </p>
        </div>
      </aside>
    </section>
  );
}

/** The official illustrated plate (IP-registered wall artwork). */
export function OfficialPlateSection() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";

  return (
    <section
      id="official-plate"
      className="reveal-on-scroll container-page scroll-mt-24 py-12 md:py-14"
    >
      <Eyebrow>{t(treeCopy.artworkEyebrow)}</Eyebrow>
      <h2 className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
        {t(treeCopy.artworkTitle)}
      </h2>
      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
        {t(treeCopy.artworkBody)}
      </p>

      <figure className="mt-6 rounded-md border border-border bg-card p-3 md:p-5">
        <button
          type="button"
          onClick={() =>
            openMediaViewer({
              src: OFFICIAL_FAMILY_TREE_IMAGE,
              kind: "image",
              title: t(treeCopy.artworkTitle),
            })
          }
          className="group relative block w-full cursor-zoom-in overflow-hidden bg-background"
          aria-label={t(treeCopy.artworkFull)}
        >
          <img
            src={OFFICIAL_FAMILY_TREE_IMAGE}
            alt={
              rtl
                ? "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد"
                : "The official illustrated family tree of the Al Bu Obaid family"
            }
            width={1344}
            height={1920}
            decoding="async"
            className="mx-auto h-auto w-full max-w-[54rem] object-contain"
          />
          <span className="pointer-events-none absolute end-3 top-3 inline-flex items-center gap-1.5 border border-border bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            {t(treeCopy.artworkFull)}
          </span>
        </button>
        <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <span className="text-[13px] leading-relaxed text-muted-foreground">
            {t(treeCopy.artworkCaption)}
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <a
              href={OFFICIAL_FAMILY_TREE_IMAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-xs font-semibold text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(treeCopy.artworkFull)}
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <Link
              to="/official-family-tree"
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold"
            >
              {t(treeCopy.artworkOpen)}
            </Link>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}

/** The visual genealogy chart that explains the documentation approach. */
export function VisualGenealogySection() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";

  return (
    <section
      id="visual-genealogy"
      className="reveal-on-scroll container-page scroll-mt-24 pb-12 md:pb-14"
    >
      <div className="border-t border-border pt-10">
        <Eyebrow>{t(treeCopy.visualEyebrow)}</Eyebrow>
        <h2 className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
          {t(treeCopy.visualTitle)}
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          {t(treeCopy.visualBody)}
        </p>

        <figure className="mt-6">
          <button
            type="button"
            onClick={() =>
              openMediaViewer({
                src: historyMedia.visualGenealogy,
                kind: "image",
                title: t(treeCopy.visualTitle),
              })
            }
            className="group relative block w-full cursor-zoom-in border border-border bg-card p-3 transition-colors hover:border-foreground md:p-4"
            aria-label={t(treeCopy.artworkFull)}
          >
            <img
              src={historyMedia.visualGenealogy}
              alt={
                rtl
                  ? "الدليل البصري لشجرة أسرة آل بوعبيد: إرث ينمو من الجذور إلى الأفق الرقمي"
                  : "Visual guide to the Al Bu Obaid family tree: a heritage growing from its roots to the digital horizon"
              }
              decoding="async"
              loading="lazy"
              className="mx-auto h-auto w-full object-contain"
            />
            <span className="pointer-events-none absolute end-4 top-4 inline-flex items-center gap-1.5 border border-border bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              {t(treeCopy.artworkFull)}
            </span>
          </button>
          <figcaption className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(treeCopy.visualCaption)}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
