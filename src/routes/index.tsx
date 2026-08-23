import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, ExternalLink, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import {
  news as staticNews,
  initiatives as staticInitiatives,
  branches,
  siteMeta,
  dnaInfo,
  achievers,
  hqProject,
} from "@/content/site";
import {
  SectionHeading,
  Rule,
  Ornament,
  Prose,
  Eyebrow,
  Status,
} from "@/components/site/Editorial";
import { newsImage } from "@/content/news-images";
import { pageImages } from "@/content/images";
import { HeroVideo } from "@/components/site/HeroVideo";
import { getPublishedNews, getPublishedInitiatives, getPublicHomepageConfig } from "@/lib/cms.functions";
import { getPublishedEvents } from "@/lib/events-public.functions";
import type { PublicEventRow } from "@/lib/events-public.functions";
import { mergeNews, mergeInitiatives } from "@/content/cms-adapt";
import { getCanonicalUrl } from "@/lib/seo";

type PublicGalleryPreviewItem = {
  id: string;
  url: string;
  alt_ar: string | null;
  alt_en: string | null;
  caption_ar: string | null;
  caption_en: string | null;
};

type PublicGalleryPreview = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
} & { items: PublicGalleryPreviewItem[] };

/**
 * Homepage "heritage gallery" preview: a handful of images from one
 * published, publicly-visible gallery. `galleries` / `gallery_media` both
 * carry public anon SELECT policies (gallery_media and media_assets are
 * fully open reads; galleries is scoped to status='published' AND
 * visibility='public'), so this runs through the anon-key client exactly
 * like the other public homepage data below — no service-role client
 * needed. media_assets always carries its own `bucket`, so the object URL
 * is built directly from bucket + storage_path (every bucket that holds
 * media_assets rows is a public bucket) rather than guessing the bucket
 * from the path the way content-media.server.ts's fallback does for the
 * single `content` bucket.
 */
const getHomepageGalleryPreview = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicGalleryPreview | null> => {
    try {
      const { createPublicServerClient } = await import("@/lib/supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: gallery, error: galleryError } = await supabase
        .from("galleries")
        .select("id, slug, title_ar, title_en")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (galleryError || !gallery) {
        if (galleryError) {
          console.error("[home] gallery lookup failed", galleryError.code, galleryError.message);
        }
        return null;
      }

      const { data: media, error: mediaError } = await supabase
        .from("gallery_media")
        .select(
          "id, sort_order, caption_ar, caption_en, media_assets(bucket, storage_path, public_url, alt_text_ar, alt_text_en)",
        )
        .eq("gallery_id", gallery.id)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (mediaError) {
        console.error("[home] gallery media lookup failed", mediaError.code, mediaError.message);
        return { ...gallery, items: [] };
      }

      const baseUrl =
        process.env?.SUPABASE_URL ||
        process.env?.VITE_SUPABASE_URL ||
        "https://ywsvittlswbbyqhahorh.supabase.co";

      const items = (media ?? [])
        .map((row: any): PublicGalleryPreviewItem | null => {
          const asset = row.media_assets;
          if (!asset) return null;
          const url: string | null =
            asset.public_url || (asset.bucket && asset.storage_path
              ? `${baseUrl}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`
              : null);
          if (!url) return null;
          return {
            id: row.id,
            url,
            alt_ar: asset.alt_text_ar ?? null,
            alt_en: asset.alt_text_en ?? null,
            caption_ar: row.caption_ar ?? null,
            caption_en: row.caption_en ?? null,
          };
        })
        .filter((x): x is PublicGalleryPreviewItem => x !== null);

      return { ...gallery, items };
    } catch (err) {
      console.error("[home] getHomepageGalleryPreview caught error", err);
      return null;
    }
  },
);

export const Route = createFileRoute("/")({
  loader: async () => {
    const [newsRows, initiativeRows, homepageConfig, upcomingEvents, galleryPreview] = await Promise.all([
      getPublishedNews(),
      getPublishedInitiatives(),
      getPublicHomepageConfig(),
      getPublishedEvents(),
      getHomepageGalleryPreview(),
    ]);
    return {
      news: mergeNews(newsRows, staticNews),
      initiatives: mergeInitiatives(initiativeRows, staticInitiatives),
      homepageConfig,
      upcomingEvents: upcomingEvents.slice(0, 3),
      galleryPreview,
    };
  },
  head: () => ({
    meta: [
      { title: "آل بوعبيد — صندوق التنمية العائلية | البوابة الرسمية" },
      {
        name: "description",
        content: `البوابة الرسمية لصندوق التنمية العائلية (آل بوعبيد) من بني تميم بالأحساء — النسب والفروع والمبادرات (ترخيص NCNP ${siteMeta.ncnpLicense}).`,
      },
      { property: "og:title", content: "صندوق التنمية العائلية (آل بوعبيد) — الأحساء" },
      {
        property: "og:description",
        content:
          "البوابة الرسمية لأسرة آل بوعبيد وصندوق التنمية العائلية — من العبادل من بني تميم، ومقرها المبرز بالأحساء.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/") }],
  }),
  component: HomePage,
});

const copy = {
  standfirst: {
    ar: "أسرة من فرع العبادل من بني تميم، استقرت بمدينة المبرز في واحة الأحساء، وتدير اليوم شؤونها الأهلية والوقفية عبر كيان مرخص.",
    en: "A family of the ʿAbadil branch of Banu Tamim, settled at Al-Mubarraz in the Al-Ahsa oasis, and today administering its civic and endowment affairs through a licensed organisation.",
  } as BiText,
  seat: { ar: "المقر", en: "Seat" } as BiText,
  seatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
  registered: { ar: "سنة الإشهار", en: "Registered" } as BiText,
  branchCount: { ar: "الفروع الموثقة", en: "Documented branches" } as BiText,
  licence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,

  openingEyebrow: { ar: "افتتاحية", en: "Introduction" } as BiText,
  openingTitle: {
    ar: "نسب موثق، وأرشيف يُحفظ، وأوقاف تُدار",
    en: "A documented lineage, a kept archive, an administered endowment",
  } as BiText,
  openingP1: {
    ar: "تنحدر أسرة آل بوعبيد من فرع العبادل، أبناء عبد الله بن دارم، أحد بطون قبيلة بني تميم. ويمتد عمود نسبها صعوداً عبر بني حنظلة بن مالك إلى تميم بن مر، فإلياس بن مضر، حتى عدنان.",
    en: "The Al Bu Obaid descend from the ʿAbadil — the sons of ʿAbd Allāh ibn Dārim — one of the constituent houses of Banu Tamim. The chain of descent ascends through Banū Ḥanẓalah to Tamīm ibn Murr, then Ilyās ibn Muḍar, to ʿAdnān.",
  } as BiText,
  openingP2: {
    ar: "استقرت الأسرة في مدينة المبرز بواحة الأحساء، وتشهد وثائق المحاكم الشرعية المؤرخة سنة 1102 هـ على حضور أعيانها شهوداً وأوصياء على الوقفيات. ومن المبرز امتد أبناؤها إلى المنطقة الشرقية والرياض ودول الخليج.",
    en: "The family settled at Al-Mubarraz in the Al-Ahsa oasis. Sharia court records dated 1102 AH attest to its elders standing as witnesses and trustees over local endowments. From Al-Mubarraz its members extended into the Eastern Province, Riyadh, and the Gulf states.",
  } as BiText,
  openingLink: { ar: "تفصيل النسب والمصادر", en: "Full lineage and sources" } as BiText,

  branchesEyebrow: { ar: "البنية العائلية", en: "Family structure" } as BiText,
  branchesTitle: { ar: "الفروع السبعة", en: "The Seven Branches" } as BiText,
  branchesSub: {
    ar: "تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن صالح، ولكل فرع أفرعه الداخلية وممثلوه في مجلس الأسرة.",
    en: "The family is organised into seven principal branches descending from the sons of the patriarch Ahmed bin Salih, each with its own sub-lineages and representation on the family council.",
  } as BiText,
  members: { ar: "فرداً موثقاً", en: "documented" } as BiText,
  allBranches: { ar: "استعراض الفروع بالتفصيل", en: "All branches in detail" } as BiText,

  hqEyebrow: { ar: "المشروع القائم", en: "Project in progress" } as BiText,
  hqCaption: {
    ar: "تصور معماري للمقر الدائم بحي الحزام الذهبي، المبرز.",
    en: "Architectural rendering of the permanent headquarters, Al-Hizam Al-Dhahabi, Al-Mubarraz.",
  } as BiText,
  hqProgress: { ar: "نسبة الإنجاز", en: "Completion" } as BiText,
  hqDetails: { ar: "تفاصيل المشروع", en: "Project details" } as BiText,
  hqFacilities: { ar: "المرافق المخططة", en: "Planned facilities" } as BiText,

  honoursEyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  honoursTitle: { ar: "من كفاءات الأسرة", en: "Among the family's achievers" } as BiText,
  allHonours: { ar: "السجل كاملاً", en: "The full roll" } as BiText,

  newsEyebrow: { ar: "المستجدات", en: "Latest" } as BiText,
  newsTitle: { ar: "الأخبار والبيانات الرسمية", en: "News & official notices" } as BiText,
  allNews: { ar: "كل الأخبار", en: "All news" } as BiText,

  dnaEyebrow: { ar: "دراسة علمية", en: "Scientific study" } as BiText,
  dnaLink: { ar: "نتائج الدراسة الكاملة", en: "Full study results" } as BiText,
  parentClade: { ar: "السلسلة التحورية", en: "Parent clade" } as BiText,

  programmesEyebrow: { ar: "البرامج", en: "Programmes" } as BiText,
  programmesTitle: { ar: "المبادرات الجارية", en: "Current initiatives" } as BiText,
  allProgrammes: { ar: "كل المبادرات", en: "All initiatives" } as BiText,

  joinTitle: {
    ar: "المشاركة في أعمال الصندوق",
    en: "Take part in the organisation's work",
  } as BiText,
  joinBody: {
    ar: "الاشتراك الشهري يموّل الأوقاف وبرامج التكافل ومشروع المقر. ويسع أبناء الأسرة كذلك المشاركة في اللجان أو تحديث بياناتهم في السجل.",
    en: "Monthly subscription funds the endowments, the solidarity programmes, and the headquarters project. Family members may also join a committee or update their record in the register.",
  } as BiText,
  joinCta: { ar: "الاشتراك والمساهمة", en: "Subscribe & contribute" } as BiText,
  contactCta: { ar: "تواصل مع الأمانة العامة", en: "Contact the secretariat" } as BiText,
};

/** Arabic abjad-style ordinals for the branch index. */
const ordinals = ["١", "٢", "٣", "٤", "٥", "٦", "٧"];

// The home component is code-split out of the route module, so read loader
// data through the route API rather than the `Route` binding.
const homeRoute = getRouteApi("/");

type SectionConfig = {
  id: string;
  name_ar?: string;
  name_en?: string;
  enabled: boolean;
  order: number;
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  badge_ar?: string;
  badge_en?: string;
  cta_label_ar?: string;
  cta_label_en?: string;
  cta_url?: string;
  image_path?: string;
  custom_payload?: Record<string, any>;
};

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero", enabled: true, order: 1 },
  { id: "about_dean", enabled: true, order: 2 },
  { id: "seven_branches", enabled: true, order: 3 },
  { id: "initiatives_hq", enabled: true, order: 4 },
  { id: "latest_news", enabled: true, order: 5 },
  { id: "family_achievers", enabled: true, order: 6 },
  { id: "initiatives_list", enabled: true, order: 7 },
  { id: "dna_preview", enabled: true, order: 8 },
  { id: "upcoming_events", enabled: true, order: 9 },
  { id: "heritage_gallery", enabled: true, order: 10 },
  { id: "contact_inquiry", enabled: true, order: 11 },
];

/** Compact date for the homepage events preview cards (no weekday, unlike the full /events page). */
function formatHomeEventDate(iso: string, lang: "ar" | "en", timezone: string) {
  try {
    // calendar: "gregory" pinned -- "ar-SA" can otherwise resolve to the
    // Hijri calendar in some ICU builds, differently between Node's SSR
    // render and the browser, causing a hydration mismatch on every load.
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", {
      calendar: "gregory",
      timeZone: timezone || "Asia/Riyadh",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");
  }
}

function HomePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const {
    news,
    initiatives,
    homepageConfig: rawHomepageConfig,
    upcomingEvents,
    galleryPreview,
  } = homeRoute.useLoaderData();
  const homepageConfig = rawHomepageConfig as { sections?: SectionConfig[] } | null;
  const [lead, ...rest] = news;

  // Compute active, ordered sections
  const activeSections = (() => {
    const rawList: SectionConfig[] =
      homepageConfig?.sections && Array.isArray(homepageConfig.sections)
        ? homepageConfig.sections
        : DEFAULT_SECTIONS;

    return [...rawList]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .filter((s) => s.enabled !== false);
  })();

  const renderSection = (sec: SectionConfig) => {
    switch (sec.id) {
      case "hero":
        return (
          <div key={sec.id}>
            <HeroVideo
              poster={sec.image_path?.endsWith(".mp4") ? "/images/ahsa_oasis.png" : (sec.image_path || "/images/ahsa_oasis.png")}
              videoUrl={sec.custom_payload?.video_url || (sec.image_path?.endsWith(".mp4") ? sec.image_path : null)}
            >
              <div className="container-page flex min-h-[86vh] flex-col items-center justify-center py-24 text-center md:min-h-[92vh]">
                {/* Emblem */}
                <div className="mx-auto w-max motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
                  <img
                    src="/logo-mark-gold.svg"
                    alt=""
                    className="h-24 w-24 object-contain md:h-32 md:w-32"
                    aria-hidden="true"
                  />
                </div>

                <p className="label-caps mt-8 text-gold/90 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
                  {sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(siteMeta.ncnpAuthority)}
                </p>

                <h1 className="mx-auto mt-5 max-w-4xl text-balance font-brand text-4xl leading-[1.2] font-bold text-ivory motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700 md:text-6xl lg:text-7xl">
                  {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(siteMeta.officialName)}
                </h1>

                <div
                  className="mx-auto mt-8 flex max-w-xs items-center gap-4 text-gold/70 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 motion-safe:delay-500"
                  aria-hidden="true"
                >
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                  <span className="ornament-star text-gold drop-shadow-[0_0_10px_rgba(237,167,70,0.6)]" />
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                </div>

                <p className="measure mx-auto mt-8 text-balance text-base leading-relaxed text-ivory/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-1000 motion-safe:delay-700 md:text-lg">
                  {sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(copy.standfirst)}
                </p>

                <div className="mt-12 flex flex-wrap items-center justify-center gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-1000 motion-safe:delay-1000">
                  <Link
                    to={sec.cta_url || "/family-tree"}
                    className="group relative inline-flex items-center gap-2.5 overflow-hidden border border-gold bg-gradient-to-r from-gold via-gold/95 to-gold-soft px-7 py-3.5 text-sm font-bold text-ink shadow-[0_10px_40px_-10px_rgba(237,167,70,0.6)] transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_15px_50px_-10px_rgba(237,167,70,0.8)] active:scale-[0.98]"
                  >
                    <span>
                      {sec.cta_label_ar && rtl
                        ? sec.cta_label_ar
                        : sec.cta_label_en && !rtl
                        ? sec.cta_label_en
                        : lang === "ar"
                        ? "تصفح مشجرة النسب"
                        : "Explore Family Tree"}
                    </span>
                    <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>

                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 border border-ivory/40 bg-ivory/5 px-7 py-3.5 text-sm font-medium text-ivory backdrop-blur-md transition-[color,background-color,border-color,transform] duration-300 ease-out hover:border-gold/70 hover:bg-ivory/10 hover:text-gold active:scale-[0.98]"
                  >
                    <span>{lang === "ar" ? "قصة الأسرة" : "Our Story"}</span>
                  </Link>
                </div>

                {/* Scroll cue — mobile only */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto flex w-full justify-center motion-safe:animate-bounce lg:hidden"
                  aria-hidden="true"
                >
                  <div className="flex h-10 w-6 justify-center rounded-full border border-ivory/40 pt-2">
                    <span className="h-2 w-0.5 rounded-full bg-ivory/70" />
                  </div>
                </div>
              </div>

              {/* Colophon strip — sits at the base of the cinematic hero */}
              <div className="relative border-t border-gold/20 bg-ink/70 backdrop-blur-md">
                <dl className="container-page grid grid-cols-2 divide-y divide-ivory/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse">
                  {[
                    { label: copy.licence, value: siteMeta.ncnpLicense, mono: true, link: null },
                    {
                      label: copy.registered,
                      value: `${siteMeta.foundedHijri} هـ`,
                      mono: false,
                      link: null,
                    },
                    {
                      label: copy.branchCount,
                      value: rtl ? "سبعة فروع" : "Seven Branches",
                      mono: false,
                      link: "/branches",
                    },
                    { label: copy.seat, value: t(copy.seatValue), mono: false, link: "/contact" },
                  ].map((item, i) => {
                    const content = (
                      <div className="flex h-full flex-col justify-center px-4 py-6 transition-[background-color,transform] duration-200 ease-out group-hover:bg-ivory/[0.06] active:scale-[0.98] sm:px-6 sm:text-center sm:first:ps-0 sm:last:pe-0">
                        <dt className="label-caps flex items-center justify-center gap-1.5 text-ivory/50 transition-colors group-hover:text-gold">
                          {t(item.label)}
                          {item.link && (
                            <Arrow
                              className="h-3 w-3 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100 rtl:group-hover:-translate-x-0.5"
                              aria-hidden="true"
                            />
                          )}
                        </dt>
                        <dd
                          className={cn(
                            "mt-2 text-sm font-semibold text-ivory transition-colors group-hover:text-gold sm:text-base",
                            item.mono && "nums font-mono text-gold group-hover:text-gold-soft",
                          )}
                        >
                          {item.value}
                        </dd>
                      </div>
                    );

                    return (
                      <div key={i} className="group relative transition-transform duration-200 ease-out">
                        {item.link ? (
                          <Link to={item.link} className="block h-full w-full">
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
                </dl>
              </div>
            </HeroVideo>
            {/* Paper-grain divider */}
            <div className="h-5 w-full paper-texture opacity-25" aria-hidden="true" />
          </div>
        );

      case "about_dean":
      case "opening":
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
              <div>
                <Eyebrow>{sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.openingEyebrow)}</Eyebrow>
                <h2 className="mt-4 text-2xl leading-tight text-foreground md:text-[1.75rem]">
                  {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.openingTitle)}
                </h2>
              </div>

              <div>
                <Prose dropCap>
                  <p>{sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(copy.openingP1)}</p>
                  <p>{t(copy.openingP2)}</p>
                </Prose>

                <Link
                  to={sec.cta_url || "/about"}
                  className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.openingLink)}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );

      case "seven_branches":
      case "branches":
        return (
          <section key={sec.id} className="border-y border-border bg-secondary/40 reveal-on-scroll">
            <div className="container-page py-16 md:py-20">
              <SectionHeading
                eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.branchesEyebrow)}
                title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.branchesTitle)}
                subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(copy.branchesSub)}
              />

              <ol className="mt-10 border-t border-border">
                {branches.map((b, i) => (
                  <li key={b.id}>
                    <Link
                      to="/branches"
                      hash={b.id}
                      className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 border-b border-border py-4 transition-[color,background-color,transform] duration-150 ease-out hover:bg-background/60 active:scale-[0.99] sm:grid-cols-[2.5rem_minmax(0,16rem)_1fr_auto] sm:gap-x-6"
                    >
                      <span
                        className="nums font-naskh text-lg text-bronze/60 dark:text-gold/50"
                        aria-hidden="true"
                      >
                        {rtl ? ordinals[i] : i + 1}
                      </span>

                      <span className="text-[15px] font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                        {t(b.name)}
                      </span>

                      <span className="col-start-2 text-[13px] text-muted-foreground sm:col-start-3">
                        {t(b.settlement)}
                      </span>

                      <span className="nums col-start-3 justify-self-end text-[13px] text-muted-foreground sm:col-start-4">
                        {b.count} <span className="text-xs">{t(copy.members)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              <Link
                to={sec.cta_url || "/branches"}
                className="mt-7 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
              >
                {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.allBranches)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        );

      case "initiatives_hq":
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <figure>
                <img
                  src={sec.image_path || pageImages.home.project.src}
                  alt={t(hqProject.title)}
                  className="photo-plate w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                  <span>{t(pageImages.home.project.caption)}</span>
                </figcaption>
              </figure>

              <div>
                <Eyebrow>{sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.hqEyebrow)}</Eyebrow>
                <h2 className="mt-4 text-2xl leading-tight text-foreground md:text-[1.75rem]">
                  {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(hqProject.title)}
                </h2>
                <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(hqProject.fundingModel)}
                </p>

                {/* Progress */}
                <div className="mt-7 border-t border-border pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="label-caps text-muted-foreground">{t(copy.hqProgress)}</span>
                    <span className="nums font-mono text-2xl text-foreground">
                      {hqProject.progress}%
                    </span>
                  </div>
                  <div
                    className="mt-3 h-1.5 w-full bg-border"
                    role="progressbar"
                    aria-valuenow={hqProject.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t(copy.hqProgress)}
                  >
                    <div
                      className="h-full bg-bronze dark:bg-gold"
                      style={{ width: `${hqProject.progress}%` }}
                    />
                  </div>
                </div>

                <dl className="mt-6 divide-y divide-border border-y border-border">
                  {[
                    { term: copy.seat, value: t(hqProject.location) },
                    { term: { ar: "المساحة", en: "Area" } as BiText, value: hqProject.area },
                    { term: { ar: "المرحلة", en: "Stage" } as BiText, value: t(hqProject.status) },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-5"
                    >
                      <dt className="label-caps pt-0.5 text-muted-foreground">{t(row.term)}</dt>
                      <dd className="nums text-sm text-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <p className="label-caps mb-2.5 text-muted-foreground">{t(copy.hqFacilities)}</p>
                  <ul className="space-y-1.5">
                    {hqProject.facilities.map((f, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-foreground">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 bg-bronze dark:bg-gold"
                          aria-hidden="true"
                        />
                        {t(f)}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={sec.cta_url || "/initiatives"}
                  className="mt-7 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.hqDetails)}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        );

      case "latest_news":
      case "news":
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <SectionHeading
                eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.newsEyebrow)}
                title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.newsTitle)}
                subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
              />
              <Link
                to={sec.cta_url || "/news"}
                className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
              >
                {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.allNews)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
              {/* Lead story */}
              {lead && (
                <article>
                  <Link
                    to="/news/$slug"
                    params={{ slug: lead.slug }}
                    className="group block hover-lift active-scale"
                  >
                    <img
                      src={lead.image ?? newsImage(lead.slug)}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                      loading="lazy"
                    />
                    <p className="nums label-caps mt-4 text-bronze dark:text-gold">
                      {lead.dateGregorian}
                    </p>
                    <h3 className="mt-2 text-xl leading-snug text-foreground transition-colors group-hover:text-bronze md:text-2xl dark:group-hover:text-gold">
                      {t(lead.title)}
                    </h3>
                    <p className="measure mt-3 text-sm leading-relaxed text-muted-foreground">
                      {t(lead.excerpt)}
                    </p>
                  </Link>
                </article>
              )}

              {/* Remaining stories */}
              <ol className="border-t border-border">
                {rest.map((n) => (
                  <li key={n.slug}>
                    <Link
                      to="/news/$slug"
                      params={{ slug: n.slug }}
                      className="group block border-b border-border py-5 hover-lift active-scale"
                    >
                      <p className="nums label-caps text-muted-foreground">{n.dateGregorian}</p>
                      <h3 className="mt-1.5 text-[15px] leading-snug font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                        {t(n.title)}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );

      case "family_achievers":
      case "achievers":
        return (
          <section key={sec.id} className="border-y border-border bg-secondary/40 reveal-on-scroll">
            <div className="container-page py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <SectionHeading
                  eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.honoursEyebrow)}
                  title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.honoursTitle)}
                  subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
                />
                <Link
                  to={sec.cta_url || "/achievers"}
                  className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.allHonours)}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <ul className="reveal-stagger mt-10 grid gap-x-14 gap-y-0 border-t border-border md:grid-cols-2">
                {achievers.slice(0, 6).map((person, i) => (
                  <li key={i} className="border-b border-border py-4">
                    <p className="text-[15px] font-semibold text-foreground">{t(person.name)}</p>
                    <p className="mt-1 text-[13px] text-bronze dark:text-gold">{t(person.field)}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                      {t(person.achievement)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );

      case "initiatives_list":
      case "programmes":
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <SectionHeading
                eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.programmesEyebrow)}
                title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.programmesTitle)}
                subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
              />
              <Link
                to={sec.cta_url || "/initiatives"}
                className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
              >
                {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.allProgrammes)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="reveal-stagger mt-10 grid gap-x-14 border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {initiatives.slice(0, 6).map((init) => (
                <article
                  key={init.slug}
                  className="group border-b border-border py-5 transition-transform duration-150 ease-out active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[15px] leading-snug font-semibold text-foreground">
                      <Link
                        to="/initiatives/$slug"
                        params={{ slug: init.slug }}
                        className="transition-colors group-hover:text-bronze dark:group-hover:text-gold"
                      >
                        {t(init.title)}
                      </Link>
                    </h3>
                    <Status
                      tone={
                        init.status === "ongoing"
                          ? "active"
                          : init.status === "completed"
                            ? "neutral"
                            : "pending"
                      }
                    >
                      {init.status === "ongoing"
                        ? rtl
                          ? "جارية"
                          : "Active"
                        : init.status === "completed"
                          ? rtl
                            ? "منتهية"
                            : "Completed"
                          : rtl
                            ? "قادمة"
                            : "Planned"}
                    </Status>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(init.summary)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );

      case "dna_preview":
      case "dna":
        return (
          <section key={sec.id} className="border-y border-border bg-secondary/40 reveal-on-scroll">
            <div className="container-page py-16 md:py-20">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
                <div>
                  <Eyebrow>{sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : t(copy.dnaEyebrow)}</Eyebrow>
                  <p className="nums mt-4 font-mono text-3xl text-foreground">{dnaInfo.haplogroup}</p>
                </div>

                <div>
                  <h2 className="text-2xl leading-tight text-foreground md:text-[1.75rem]">
                    {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(dnaInfo.title)}
                  </h2>
                  <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                    {sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(dnaInfo.overview)}
                  </p>

                  <div className="mt-6 border-y border-border py-3">
                    <p className="label-caps text-muted-foreground">{t(copy.parentClade)}</p>
                    <p
                      className="nums mt-1.5 font-mono text-[13px] break-all text-foreground"
                      dir="ltr"
                    >
                      {dnaInfo.parentClade}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
                    <Link
                      to={sec.cta_url || "/dna"}
                      className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.dnaLink)}
                      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    {dnaInfo.databases.map((db) => (
                      <a
                        key={db.name}
                        href={db.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {db.name}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "family_stats": {
        const totalMembers = branches.reduce((sum, b) => sum + b.count, 0);
        const statItems: { value: string; label: BiText }[] = [
          { value: String(branches.length), label: { ar: "فروع عائلية", en: "Family Branches" } },
          { value: String(totalMembers), label: { ar: "فرد موثق", en: "Documented Members" } },
          { value: siteMeta.ncnpLicense, label: copy.licence },
          { value: `${siteMeta.foundedHijri} هـ`, label: copy.registered },
        ];
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <SectionHeading
              eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : (rtl ? "أرقام ومنجزات" : "Numbers & Achievements")}
              title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : (rtl ? "الأسرة في أرقام ومنجزات" : "The Family in Numbers")}
              subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
            />
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
              {statItems.map((s, i) => (
                <div key={i} className="text-center">
                  <dd className="nums font-mono text-3xl font-bold text-bronze md:text-4xl dark:text-gold">
                    {s.value}
                  </dd>
                  <dt className="label-caps mt-2 text-muted-foreground">{t(s.label)}</dt>
                </div>
              ))}
            </dl>
          </section>
        );
      }

      case "tree_highlight":
        return (
          <section key={sec.id} className="border-y border-border bg-secondary/40 reveal-on-scroll">
            <div className="container-page py-16 text-center md:py-20">
              <Eyebrow>
                {sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : (rtl ? "الشجرة التفاعلية" : "Interactive Tree")}
              </Eyebrow>
              <h2 className="mt-4 text-2xl leading-tight text-foreground md:text-[1.75rem]">
                {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : (rtl ? "شجرة العائلة الرقمية التفاعلية" : "Interactive Digital Family Tree")}
              </h2>
              {(sec.subtitle_ar || sec.subtitle_en) && (
                <p className="measure mx-auto mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en}
                </p>
              )}
              <Link
                to={sec.cta_url || "/family-tree"}
                className="mt-7 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-[color,background-color,border-color,transform] duration-150 ease-out hover:bg-transparent hover:text-foreground active:scale-[0.97] dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
              >
                {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : (rtl ? "فتح الشجرة التفاعلية" : "Open Tree Canvas")}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        );

      case "contact_inquiry":
      case "join_cta":
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
              <div>
                <h2 className="text-2xl leading-tight text-foreground md:text-[1.75rem]">
                  {sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : t(copy.joinTitle)}
                </h2>
                <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground">
                  {sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : t(copy.joinBody)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/contribute"
                  className="inline-flex items-center border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-[color,background-color,border-color,transform] duration-150 ease-out hover:bg-transparent hover:text-foreground active:scale-[0.97] dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
                >
                  {t(copy.joinCta)}
                </Link>
                <Link
                  to={sec.cta_url || "/contact"}
                  className="inline-flex items-center border border-border px-5 py-3 text-sm font-medium text-foreground transition-[color,background-color,border-color,transform] duration-150 ease-out hover:bg-secondary active:scale-[0.97]"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : t(copy.contactCta)}
                </Link>
              </div>
            </div>
          </section>
        );

      case "upcoming_events": {
        if (!upcomingEvents || upcomingEvents.length === 0) return null;
        return (
          <section key={sec.id} className="border-y border-border bg-secondary/40 reveal-on-scroll">
            <div className="container-page py-16 md:py-20">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <SectionHeading
                  eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : (rtl ? "التقويم" : "Calendar")}
                  title={sec.title_ar && rtl ? sec.title_ar : sec.title_en && !rtl ? sec.title_en : (rtl ? "الفعاليات والاجتماعات العائلية" : "Family Events & Council Meetings")}
                  subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
                />
                <Link
                  to={sec.cta_url || "/events"}
                  className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : (rtl ? "سجل الفعاليات" : "View all events")}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <ol className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((evt: PublicEventRow) => (
                  <li key={evt.id}>
                    <Link
                      to="/events"
                      className="group block h-full border border-border bg-card p-5 transition-transform duration-150 ease-out hover:border-bronze/50 active:scale-[0.99] dark:hover:border-gold/50"
                    >
                      {evt.cover_url ? (
                        <img
                          src={evt.cover_url}
                          alt=""
                          className="mb-4 aspect-[16/10] w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="flex items-center gap-2 text-xs text-bronze dark:text-gold">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="nums">{formatHomeEventDate(evt.start_at, lang, evt.timezone)}</span>
                      </div>
                      <h3 className="mt-3 text-[15px] leading-snug font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                        {rtl ? evt.title_ar : evt.title_en || evt.title_ar}
                      </h3>
                      {evt.place ? (
                        <p className="mt-2 text-[13px] text-muted-foreground">
                          {rtl ? evt.place.name_ar : evt.place.name_en || evt.place.name_ar}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      }

      case "heritage_gallery": {
        if (!galleryPreview || galleryPreview.items.length === 0) return null;
        return (
          <section key={sec.id} className="container-page py-16 md:py-20 reveal-on-scroll">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <SectionHeading
                eyebrow={sec.badge_ar && rtl ? sec.badge_ar : sec.badge_en && !rtl ? sec.badge_en : (rtl ? "الأرشيف" : "Archive")}
                title={
                  sec.title_ar && rtl
                    ? sec.title_ar
                    : sec.title_en && !rtl
                    ? sec.title_en
                    : rtl
                    ? galleryPreview.title_ar
                    : galleryPreview.title_en || galleryPreview.title_ar
                }
                subtitle={sec.subtitle_ar && rtl ? sec.subtitle_ar : sec.subtitle_en && !rtl ? sec.subtitle_en : undefined}
              />
              {sec.cta_url ? (
                <Link
                  to={sec.cta_url}
                  className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                >
                  {sec.cta_label_ar && rtl ? sec.cta_label_ar : sec.cta_label_en && !rtl ? sec.cta_label_en : (rtl ? "المزيد" : "More")}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>

            <ol className="reveal-stagger mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {galleryPreview.items.slice(0, 6).map((item) => (
                <li key={item.id} className="hover-lift active-scale aspect-square overflow-hidden">
                  <img
                    src={item.url}
                    alt={(rtl ? item.alt_ar : item.alt_en) || (rtl ? item.caption_ar : item.caption_en) || ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ol>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {activeSections.map((sec) => renderSection(sec))}
      <Rule variant="hair" className="container-page" />
    </>
  );
}
