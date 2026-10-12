import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Maximize2, Network } from "lucide-react";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { Eyebrow } from "@/components/site/Editorial";
import { cn } from "@/lib/utils";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { pageImages } from "@/content/images";
import { inl } from "@/content/page-copy/familytreesections-inline";

/**
 * The three canonical family-tree presentations — the electronic (interactive)
 * tree, the official illustrated plate, and the visual genealogy guide — live
 * here so the lineage page and the home page render exactly the same sections
 * from the same data source instead of keeping two copies.
 */

export const treeCopy = {
  treeTitle: inl.t_9cbacbf8 as BiText,
  electronicEyebrow: inl.t_685f8080 as BiText,
  fullscreen: inl.t_520b9e0f as BiText,
  privacyLabel: inl.t_44baa431 as BiText,
  privacyBody: inl.t_a698c52d as BiText,

  artworkEyebrow: inl.t_d134d09b as BiText,
  artworkTitle: inl.t_86ef60e9 as BiText,
  artworkBody: inl.t_382dbcce as BiText,
  artworkOpen: inl.t_20a7b57a as BiText,
  artworkFull: inl.t_e68a2cbe as BiText,
  artworkCaption: inl.t_c2f24010 as BiText,

  visualEyebrow: inl.t_57e6e837 as BiText,
  visualTitle: inl.t_d40a037f as BiText,
  visualBody: inl.t_d1c66380 as BiText,
  visualCaption: inl.t_f5cb3156 as BiText,
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
  // Home page only: phones get the card, so the canvas is not mounted at all
  // there (a hidden iframe would still download d3 and lay out at 0px).
  const [showCanvas, setShowCanvas] = useState(!withHeading);
  useEffect(() => {
    if (!withHeading) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setShowCanvas(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [withHeading]);

  const query = new URLSearchParams();
  if (focusId) query.set("focus", focusId);
  if (focusName) query.set("q", focusName);
  const canvasSrc = query.size
    ? `/interactive-tree.html?${query.toString()}`
    : "/interactive-tree.html";

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
              className="tap-target-y label-caps hidden shrink-0 items-center sm:inline-flex gap-2 border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t(treeCopy.fullscreen)}
            </a>
          </div>
        </div>
      ) : null}

      {/* On the home page, phones get a card instead of the embedded canvas: a
          pan/zoom iframe inside a scrolling page traps the finger and is too
          cramped at 375px. The /family-tree page keeps the canvas everywhere. */}
      {withHeading ? (
        <div className="container-page mt-6 sm:hidden">
          <Link
            to="/family-tree"
            className="flex items-center gap-4 border border-border bg-card p-5 transition-colors hover:border-foreground"
          >
            <Network className="h-10 w-10 shrink-0 text-bronze dark:text-gold" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">{t(inl.mobileOpen)}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                {t(inl.mobileHint)}
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      <div className={cn(withHeading ? "mt-6 hidden bg-ink sm:block" : "bg-ink")}>
        {showCanvas ? (
          <iframe
            key={canvasSrc}
            src={canvasSrc}
            title={t(treeCopy.treeTitle)}
            loading="lazy"
            className="block h-[50vh] min-h-[22rem] w-full border-0 bg-card sm:h-[65vh] sm:min-h-[32rem]"
          />
        ) : (
          // Reserves the canvas height on desktop until it mounts after hydration.
          <div className="h-[65vh] min-h-[32rem] bg-card" aria-hidden="true" />
        )}
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
              src: pageImages.familyTree.plate.src,
              kind: "image",
              title: t(treeCopy.artworkTitle),
            })
          }
          className="group relative block w-full cursor-zoom-in overflow-hidden bg-background"
          aria-label={t(treeCopy.artworkFull)}
        >
          <img
            src={pageImages.familyTree.plate.src}
            alt={t(inl.t_84ce44b7)}
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
              href={pageImages.familyTree.plate.src}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target-y label-caps inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-xs font-semibold text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
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
                src: pageImages.familyTree.visualGuide.src,
                kind: "image",
                title: t(treeCopy.visualTitle),
              })
            }
            className="group relative block w-full cursor-zoom-in border border-border bg-card p-3 transition-colors hover:border-foreground md:p-4"
            aria-label={t(treeCopy.artworkFull)}
          >
            <img
              src={pageImages.familyTree.visualGuide.src}
              alt={t(inl.t_bb8f2050)}
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
