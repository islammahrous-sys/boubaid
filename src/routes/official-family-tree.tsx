import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, ShoppingBag, Sparkles, Ruler } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import {
  treeFrameProducts,
  treeFrameCustom,
  treeFrameCustomColour,
  treeFrameCustomPriceNote,
  type TreeFrameProduct,
} from "@/content/tree-frames";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/official-family-tree")({
  head: () => ({
    meta: [
      { title: "شجرة العائلة — اللوحة الرسمية المصورة لشجرة العائلة | آل بوعبيد" },
      {
        name: "description",
        content:
          "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد: الفريمات والمقاسات المتوفرة وأسعارها، مع إمكانية طلب فريم خاص بمقاس حسب الطلب.",
      },
      { property: "og:title", content: "اللوحة الرسمية المصورة لشجرة العائلة — آل بوعبيد" },
      {
        property: "og:description",
        content: "اختر تصميم ومقاس شجرة العائلة المناسب لك واطلبها الآن.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/official-family-tree") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/official-family-tree") }],
  }),
  component: OfficialFamilyTreePage,
});

const copy = {
  eyebrow: { ar: "الإصدار الأول — ١٤٤٧هـ", en: "First Edition — 1447H" } as BiText,
  title: {
    ar: "اللوحة الرسمية المصورة لشجرة العائلة",
    en: "Official Illustrated Family Tree",
  } as BiText,
  subtitle: {
    ar: "لوحة جدارية معتمدة من مجلس الأسرة، متوفرة بعدة فريمات ومقاسات لتناسب المجالس والبيوت، مع إمكانية طلب مقاس خاص.",
    en: "A wall plate approved by the Family Council, available in several frames and sizes for majlis and home, with a made-to-order option.",
  } as BiText,
  artworkBody: {
    ar: "أُخرجت الأسرة هذه اللوحة الجدارية بتكلفة استثمارية بلغت 14,948 ريالاً سعودياً، وسُجلت حقوق ملكيتها الفكرية رسمياً لتكون مرجعاً بصرياً حصرياً يربط الجيل الناشئ بجذوره التميمية.",
    en: "The family commissioned this wall plate at an investment cost of SAR 14,948, and formally registered its intellectual-property rights to serve as an exclusive visual reference linking the rising generation to its Tamimi roots.",
  } as BiText,
  artworkOpen: { ar: "فتح اللوحة كاملة", en: "Open the full plate" } as BiText,

  noticeTitle: {
    ar: "اختر تصميم ومقاس شجرة العائلة المناسب لك واطلبها الآن",
    en: "Choose the Family Tree design and size that suits you and order yours now.",
  } as BiText,
  noticeBody: {
    ar: "جميع المقاسات تُسلَّم مؤطرة وجاهزة للتعليق، والطلب يتم عبر متجر الأسرة الرسمي.",
    en: "Every size is delivered framed and ready to hang. Orders are placed through the family's official store.",
  } as BiText,

  productsEyebrow: { ar: "الفريمات والمقاسات", en: "Frames & sizes" } as BiText,
  productsTitle: { ar: "المقاسات المتوفرة", en: "Available editions" } as BiText,
  frameLabel: { ar: "الفريم", en: "Frame" } as BiText,
  sizeLabel: { ar: "المقاس", en: "Size" } as BiText,
  widthLabel: { ar: "العرض", en: "Width" } as BiText,
  lengthLabel: { ar: "الطول", en: "Length" } as BiText,
  colourLabel: { ar: "اللون", en: "Colour" } as BiText,
  priceLabel: { ar: "السعر", en: "Price" } as BiText,
  buy: { ar: "أضف إلى السلة", en: "Add to basket" } as BiText,
  order: { ar: "اطلب فريم خاص", en: "Order a custom frame" } as BiText,
  customEyebrow: { ar: "حسب الطلب", en: "Made to order" } as BiText,
};

function OfficialFamilyTreePage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const { data: dynamicSettings = {} } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const storeUrl = dynamicSettings.salla_url || siteMeta.sallaStoreUrl;

  const priceText = (product: TreeFrameProduct) =>
    product.price === null ? null : isAr ? `${product.price} ريال` : `${product.price} SAR`;

  const Row = ({ label, value }: { label: BiText; value: string }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 last:border-b-0">
      <span className="text-[12px] text-muted-foreground">{t(label)}</span>
      <span className="nums text-[13px] font-semibold text-foreground">{value}</span>
    </div>
  );

  return (
    <div>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: isAr ? "عدد المقاسات" : "Editions",
            value: `${treeFrameProducts.length}`,
            mono: true,
          },
          {
            label: isAr ? "يبدأ من" : "From",
            value: isAr ? "220 ريال" : "220 SAR",
            mono: true,
          },
          {
            label: isAr ? "مقاس خاص" : "Custom size",
            value: isAr ? "متاح" : "Available",
          },
        ]}
      />

      {/* ── Purchasing notice ─────────────────────────────────── */}
      <section className="container-page pt-10">
        <div className="relative overflow-hidden border border-gold/50 bg-gold/10 p-5 md:p-6 dark:border-gold/30 dark:bg-gold/[0.08] rounded-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-gold/50 bg-background/60 text-bronze dark:text-gold rounded-md"
                aria-hidden="true"
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="font-serif text-base font-bold leading-snug text-foreground md:text-lg">
                  {t(copy.noticeTitle)}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t(copy.noticeBody)}
                </p>
              </div>
            </div>
            <a
              href="#tree-frames"
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {isAr ? "تصفح المقاسات" : "Browse the sizes"}
            </a>
          </div>
        </div>
      </section>

      {/* ── The official commissioned artwork ─────────────────── */}
      <section className="reveal-on-scroll container-page py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.eyebrow)}</Eyebrow>
            <h2 className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
              {t(copy.title)}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.artworkBody)}
            </p>
            <a
              href="/images/family_tree_official_artwork.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 label-caps text-xs font-semibold text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.artworkOpen)}
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <a
            href="/images/family_tree_official_artwork.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border bg-card p-3 transition-colors hover:border-foreground"
          >
            <img
              src="/images/family_tree_official_artwork.jpg"
              alt={
                isAr
                  ? "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد"
                  : "The official illustrated family tree of the Al Bu Obaid family"
              }
              className="mx-auto h-auto max-h-[36rem] w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      {/* ── Product catalogue ────────────────────────────────── */}
      <section id="tree-frames" className="container-page border-t border-border py-12 md:py-14">
        <Eyebrow rule>{t(copy.productsEyebrow)}</Eyebrow>
        <h2 className="mt-4 font-serif text-2xl leading-tight text-foreground md:text-3xl">
          {t(copy.productsTitle)}
        </h2>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {treeFrameProducts.map((product) => (
            <li
              key={product.id}
              className="flex flex-col border border-border bg-card transition-colors hover:border-bronze dark:hover:border-gold rounded-md overflow-hidden"
            >
              <img
                src={product.image}
                alt={t(product.name)}
                loading="lazy"
                className="aspect-[4/3] w-full border-b border-border bg-background object-contain"
              />

              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-serif text-base font-bold leading-snug text-foreground md:text-lg">
                  {t(product.name)}
                </h3>

                <div className="mt-3 flex-1">
                  <Row label={copy.frameLabel} value={t(product.frameNo)} />
                  <Row label={copy.sizeLabel} value={t(product.sizeName)} />
                  <Row label={copy.widthLabel} value={t(product.width)} />
                  <Row label={copy.lengthLabel} value={t(product.length)} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="nums font-serif text-lg font-bold text-bronze dark:text-gold">
                    {priceText(product)}
                  </span>
                  <a
                    href={product.storeUrl || storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-gold bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md"
                    aria-label={`${t(copy.buy)} — ${t(product.name)}`}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    {t(copy.buy)}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* ── Custom frame ───────────────────────────────────── */}
        <div className="mt-10 border border-dashed border-bronze/50 bg-secondary/30 p-5 md:p-6 dark:border-gold/40 rounded-md">
          <div className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:items-center">
            <img
              src={treeFrameCustom.image}
              alt={t(treeFrameCustom.name)}
              loading="lazy"
              className="w-full border border-border bg-background object-contain rounded-md"
            />
            <div>
              <Eyebrow>{t(copy.customEyebrow)}</Eyebrow>
              <h3 className="mt-3 font-serif text-lg font-bold text-foreground md:text-xl">
                {t(treeFrameCustom.name)}
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {t(treeFrameCustom.sizeName)}
              </p>

              <div className="mt-3 max-w-sm">
                <Row label={copy.widthLabel} value={t(treeFrameCustom.width)} />
                <Row label={copy.lengthLabel} value={t(treeFrameCustom.length)} />
                <Row label={copy.colourLabel} value={t(treeFrameCustomColour)} />
              </div>

              <p className="mt-3 text-[12.5px] font-semibold text-bronze dark:text-gold">
                {t(treeFrameCustomPriceNote)}
              </p>

              <a
                href={treeFrameCustom.storeUrl || storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-[13px] font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold rounded-md"
                aria-label={`${t(copy.order)} — ${t(treeFrameCustom.name)}`}
              >
                <Ruler className="h-4 w-4" aria-hidden="true" />
                {t(copy.order)}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
