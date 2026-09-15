import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { formatDualDate } from "@/lib/dates";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import {
  getPublicContentPageBySlug,
  getPublishedBranches,
  getPublishedNews,
  getPublicAnnouncements,
  getPublicFamilyTreeData,
  getPublicGallery,
  getPublicMemberSpotlight,
} from "@/lib/cms.functions";
import { getPublishedEvents } from "@/lib/events-public.functions";
import { submitContactMessage } from "@/lib/forms.functions";
import { contactMessageSchema } from "@/lib/forms.schemas";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  Calendar,
  MapPin,
  Newspaper,
  Bell,
  PlayCircle,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Rule } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * Some block types (BlockRegistry.tsx) embed data from other public tables
 * rather than storing it inline — gallery, member_spotlight, branches, tree,
 * events, articles and announcements. This scans a page's sections once,
 * fetches only what's actually referenced, and attaches the result to each
 * section as `resolved` so the renderer below never needs its own fetch.
 */
async function hydrateSections(sections: any[]): Promise<any[]> {
  const types = new Set(sections.map((s) => s.type));
  const shared: Record<string, unknown> = {};
  const tasks: Promise<void>[] = [];

  if (types.has("branches")) {
    tasks.push(
      getPublishedBranches().then((rows) => {
        shared.branches = rows;
      }),
    );
  }
  if (types.has("events")) {
    tasks.push(
      getPublishedEvents().then((rows) => {
        shared.events = rows;
      }),
    );
  }
  if (types.has("articles")) {
    tasks.push(
      getPublishedNews().then((rows) => {
        shared.articles = rows;
      }),
    );
  }
  if (types.has("announcements")) {
    tasks.push(
      getPublicAnnouncements().then((rows) => {
        shared.announcements = rows;
      }),
    );
  }
  if (types.has("tree")) {
    tasks.push(
      getPublicFamilyTreeData().then((d) => {
        shared.tree = d;
      }),
    );
  }

  const galleryIds = [
    ...new Set(
      sections
        .filter((s) => s.type === "gallery" && s.data?.gallery_id)
        .map((s) => s.data.gallery_id as string),
    ),
  ];
  const memberIds = [
    ...new Set(
      sections
        .filter((s) => s.type === "member_spotlight" && s.data?.member_id)
        .map((s) => s.data.member_id as string),
    ),
  ];

  const galleryMap: Record<string, unknown> = {};
  const memberMap: Record<string, unknown> = {};

  tasks.push(
    ...galleryIds.map((id) =>
      getPublicGallery({ data: id }).then((g) => {
        galleryMap[id] = g;
      }),
    ),
  );
  tasks.push(
    ...memberIds.map((id) =>
      getPublicMemberSpotlight({ data: id }).then((m) => {
        memberMap[id] = m;
      }),
    ),
  );

  await Promise.all(tasks);

  return sections.map((s) => {
    if (s.type === "gallery" && s.data?.gallery_id)
      return { ...s, resolved: galleryMap[s.data.gallery_id] ?? null };
    if (s.type === "member_spotlight" && s.data?.member_id)
      return { ...s, resolved: memberMap[s.data.member_id] ?? null };
    if (shared[s.type] !== undefined) return { ...s, resolved: shared[s.type] };
    return s;
  });
}

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const data = await getPublicContentPageBySlug({ data: params.slug });
    if (!data || !data.page) {
      throw notFound();
    }
    const sections = await hydrateSections(data.sections ?? []);
    return { ...data, sections };
  },
  head: ({ params, loaderData }) => {
    const page = loaderData?.page;
    if (!page) return { meta: [{ title: "الصفحة غير موجودة | أسرة آل بوعبيد" }] };
    const title = `${page.seo_title_ar || page.title_ar} | أسرة آل بوعبيد`;
    const desc = page.seo_description_ar || page.excerpt_ar || "";
    const url = getCanonicalUrl(`/p/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: DynamicCmsPageComponent,
});

function DynamicCmsPageComponent() {
  const { page, sections } = Route.useLoaderData();
  const { lang } = useLang();
  const isAr = lang === "ar";
  const title = isAr ? page.title_ar : page.title_en || page.title_ar;

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        eyebrow={isAr ? "صفحة مخصصة" : "Special Page"}
        title={title}
        subtitle={
          page.excerpt_ar
            ? isAr
              ? page.excerpt_ar
              : page.excerpt_en || page.excerpt_ar
            : undefined
        }
      />

      {page.featured_media_path && (
        <div className="container-page mt-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border shadow-md">
            <img
              src={page.featured_media_path}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-page mt-12 space-y-16">
        {sections && sections.length > 0 ? (
          sections.map((section: any, idx: number) => (
            <DynamicBlockRenderer key={section.id || idx} section={section} isAr={isAr} />
          ))
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>
              {isAr
                ? "لا توجد أقسام مٶافة لهذه الصفحة بعد."
                : "No sections added to this page yet."}
            </p>
          </div>
        )}
      </div>

      <div className="container-page mt-20">
        <Rule variant="hair" />
      </div>
    </div>
  );
}

function DynamicBlockRenderer({ section, isAr }: { section: any; isAr: boolean }) {
  const { type, data, resolved } = section;
  if (!data) return null;

  switch (type) {
    case "hero":
      return (
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center relative overflow-hidden">
          {data.bg_image_url && (
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url(${data.bg_image_url})` }}
            />
          )}
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-brand text-foreground">
              {isAr ? data.title_ar : data.title_en || data.title_ar}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {isAr ? data.subtitle_ar : data.subtitle_en || data.subtitle_ar}
            </p>
            {data.button_text_ar && data.button_url && (
              <div className="pt-4">
                <Link
                  to={data.button_url}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
                >
                  <span>
                    {isAr ? data.button_text_ar : data.button_text_en || data.button_text_ar}
                  </span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            )}
          </div>
        </div>
      );

    case "rich_text":
      return (
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {isAr ? data.content_ar : data.content_en || data.content_ar}
          </div>
        </div>
      );

    case "image":
      return (
        <figure className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img src={data.url} alt={data.alt_ar || ""} className="w-full object-cover" />
          </div>
          {(data.caption_ar || data.caption_en) && (
            <figcaption className="mt-3 text-center text-xs text-muted-foreground">
              {isAr ? data.caption_ar : data.caption_en || data.caption_ar}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl border-y border-border bg-secondary/30 text-center relative">
          <Quote className="w-8 h-8 text-primary/30 mx-auto mb-4" />
          <blockquote className="text-lg md:text-xl font-medium text-foreground leading-relaxed font-naskh">
            &quot;{isAr ? data.quote_ar : data.quote_en || data.quote_ar}&quot;
          </blockquote>
          {data.author_ar && (
            <cite className="block mt-4 text-xs font-bold text-primary not-italic">
              — {isAr ? data.author_ar : data.author_en || data.author_ar}
            </cite>
          )}
        </div>
      );

    case "statistics":
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {(data.items || []).map((item: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border bg-card text-center space-y-1"
            >
              <span className="font-mono text-3xl md:text-4xl font-bold text-primary block">
                {item.number}
              </span>
              <span className="text-xs text-muted-foreground font-medium block">
                {isAr ? item.label_ar : item.label_en || item.label_ar}
              </span>
            </div>
          ))}
        </div>
      );

    case "cta":
      return (
        <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-secondary/30 p-8 md:p-12 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-brand text-foreground">
            {isAr ? data.title_ar : data.title_en || data.title_ar}
          </h2>
          {(data.desc_ar || data.desc_en) && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isAr ? data.desc_ar : data.desc_en || data.desc_ar}
            </p>
          )}
          {data.button_text_ar && data.button_url && (
            <div className="pt-2">
              <Link
                to={data.button_url}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
              >
                <span>
                  {isAr ? data.button_text_ar : data.button_text_en || data.button_text_ar}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          )}
        </div>
      );

    case "video": {
      const url: string | undefined = data.url;
      if (!url) return null;
      const youtubeEmbed = getYouTubeEmbedUrl(url);
      const isFile = !youtubeEmbed && isVideoFileUrl(url);
      return (
        <div className="max-w-4xl mx-auto space-y-3">
          {data.title_ar && (
            <h3 className="text-lg font-bold text-foreground text-center">
              {isAr ? data.title_ar : data.title_en || data.title_ar}
            </h3>
          )}
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-sm">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                title={data.title_ar || "video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : isFile ? (
              <video src={url} controls className="h-full w-full object-contain">
                <track kind="captions" />
              </video>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full w-full items-center justify-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <PlayCircle className="w-6 h-6" />
                {isAr ? "فتح الفيديو" : "Open video"}
              </a>
            )}
          </div>
        </div>
      );
    }

    case "gallery": {
      const gallery = resolved as {
        media: { id: string; url: string; caption_ar: string | null; caption_en: string | null }[];
      } | null;
      if (!gallery || gallery.media.length === 0) {
        return (
          <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            {isAr
              ? "لم يتم اختيار معرض صور بعد لهذا القسم."
              : "No gallery selected for this section yet."}
          </div>
        );
      }
      const columns = Math.min(6, Math.max(1, Number(data.columns) || 3));
      return (
        <div
          className={cn(
            "max-w-5xl mx-auto grid gap-3 grid-cols-2 sm:grid-cols-3",
            columns === 1 && "grid-cols-1 sm:grid-cols-1 md:grid-cols-1",
            columns === 2 && "md:grid-cols-2",
            columns === 3 && "md:grid-cols-3",
            columns === 4 && "md:grid-cols-4",
            columns === 5 && "md:grid-cols-5",
            columns >= 6 && "md:grid-cols-6",
          )}
        >
          {gallery.media.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={m.url}
                alt={(isAr ? m.caption_ar : m.caption_en) || ""}
                className="w-full aspect-square object-cover"
              />
              {(m.caption_ar || m.caption_en) && (
                <figcaption className="p-2 text-[11px] text-center text-muted-foreground">
                  {isAr ? m.caption_ar : m.caption_en || m.caption_ar}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      );
    }

    case "timeline":
      return (
        <div className="max-w-3xl mx-auto space-y-6">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="flex gap-4 border-s-2 border-primary/40 ps-5 relative">
              <span className="absolute -start-[7px] top-1 w-3 h-3 rounded-full bg-primary" />
              <div>
                <span className="font-mono text-xs font-bold text-primary">{item.year}</span>
                <h4 className="text-sm md:text-base font-bold text-foreground mt-0.5">
                  {isAr ? item.title_ar : item.title_en || item.title_ar}
                </h4>
                {(item.description_ar || item.description_en) && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {isAr ? item.description_ar : item.description_en || item.description_ar}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );

    case "cards":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {(data.cards || []).map((card: any, i: number) => {
            const content = (
              <>
                <h4 className="text-sm font-bold text-foreground">
                  {isAr ? card.title_ar : card.title_en || card.title_ar}
                </h4>
                {(card.desc_ar || card.desc_en) && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {isAr ? card.desc_ar : card.desc_en || card.desc_ar}
                  </p>
                )}
              </>
            );
            return card.link_url ? (
              <Link
                key={i}
                to={card.link_url}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-sm transition-all block"
              >
                {content}
              </Link>
            ) : (
              <div key={i} className="p-5 rounded-2xl border border-border bg-card">
                {content}
              </div>
            );
          })}
        </div>
      );

    case "member_spotlight": {
      const member = resolved as {
        display_name_ar: string;
        display_name_en: string | null;
        occupation_ar: string | null;
        occupation_en: string | null;
        biography_ar: string | null;
        biography_en: string | null;
        avatar_url: string | null;
      } | null;
      if (!member) {
        return (
          <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            {isAr ? "لم يتم تحديد فرد لهذا القسم بعد." : "No member selected for this section yet."}
          </div>
        );
      }
      return (
        <div className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-8 text-center space-y-3">
          {data.highlight_ar && (
            <span className="inline-block text-[11px] font-bold tracking-wide text-primary uppercase">
              {data.highlight_ar}
            </span>
          )}
          {member.avatar_url && (
            <img
              src={member.avatar_url}
              alt={member.display_name_ar}
              className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-primary/30"
            />
          )}
          <h3 className="text-xl font-bold text-foreground">
            {isAr ? member.display_name_ar : member.display_name_en || member.display_name_ar}
          </h3>
          {(member.occupation_ar || member.occupation_en) && (
            <p className="text-sm text-primary font-medium">
              {isAr ? member.occupation_ar : member.occupation_en || member.occupation_ar}
            </p>
          )}
          {(member.biography_ar || member.biography_en) && (
            <p className="text-xs text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {isAr ? member.biography_ar : member.biography_en || member.biography_ar}
            </p>
          )}
        </div>
      );
    }

    case "branches": {
      const branches = (resolved as any[]) || [];
      if (branches.length === 0) return null;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {branches.map((b: any) => (
            <Link
              key={b.id}
              to="/branches"
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-sm transition-all block"
            >
              <h4 className="text-sm font-bold text-foreground">
                {isAr ? b.name_ar : b.name_en || b.name_ar}
              </h4>
              {data.show_elders !== false && (b.elder_ar || b.elder_en) && (
                <p className="text-xs text-primary mt-1">
                  {isAr ? b.elder_ar : b.elder_en || b.elder_ar}
                </p>
              )}
              {(b.description_ar || b.description_en) && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                  {isAr ? b.description_ar : b.description_en || b.description_ar}
                </p>
              )}
            </Link>
          ))}
        </div>
      );
    }

    case "tree": {
      const treeData = resolved as { members: any[] } | null;
      const members = treeData?.members ?? [];
      if (members.length === 0) return null;
      const maxGen = Number(data.max_generations) || 4;
      const byGeneration = new Map<number, any[]>();
      for (const m of members) {
        if (m.generation > maxGen) continue;
        const list = byGeneration.get(m.generation) ?? [];
        list.push(m);
        byGeneration.set(m.generation, list);
      }
      const generations = [...byGeneration.keys()].sort((a, b) => a - b);
      return (
        <div className="max-w-5xl mx-auto space-y-5">
          {generations.map((gen) => (
            <div key={gen} className="space-y-2">
              <span className="text-[11px] font-bold text-primary">
                {isAr ? `الجيل ${gen}` : `Generation ${gen}`}
              </span>
              <div className="flex flex-wrap gap-2">
                {(byGeneration.get(gen) ?? []).map((m: any) => (
                  <span
                    key={m.id}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-foreground"
                  >
                    {isAr
                      ? m.display_name_ar || `${m.first_name_ar} ${m.last_name_ar}`
                      : m.display_name_en ||
                        `${m.first_name_en || m.first_name_ar} ${m.last_name_en || m.last_name_ar}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <Link
              to="/family-tree"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              {isAr ? "استعراض الشجرة الكاملة" : "View the full family tree"}
              {isAr ? (
                <ArrowLeft className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </Link>
          </div>
        </div>
      );
    }

    case "events": {
      const events = ((resolved as any[]) || []).slice(0, Number(data.limit) || 3);
      if (events.length === 0) {
        return (
          <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
            {isAr ? "لا توجد فعاليات قادمة حالياً." : "No upcoming events right now."}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {events.map((ev: any) => (
            <div key={ev.id} className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold">
                <Calendar className="w-3.5 h-3.5" />
                {formatDualDate(ev.start_at, isAr ? "ar" : "en")}
              </div>
              <h4 className="text-sm font-bold text-foreground">
                {isAr ? ev.title_ar : ev.title_en || ev.title_ar}
              </h4>
              {ev.place && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {isAr ? ev.place.name_ar : ev.place.name_en || ev.place.name_ar}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "articles": {
      const articles = ((resolved as any[]) || []).slice(0, Number(data.limit) || 3);
      if (articles.length === 0) return null;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {articles.map((a: any) => (
            <Link
              key={a.id}
              to="/news/$slug"
              params={{ slug: a.slug }}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-sm transition-all block"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                {a.gregorian_date}
              </div>
              <h4 className="text-sm font-bold text-foreground">
                {isAr ? a.title_ar : a.title_en || a.title_ar}
              </h4>
              {(a.excerpt_ar || a.excerpt_en) && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                  {isAr ? a.excerpt_ar : a.excerpt_en || a.excerpt_ar}
                </p>
              )}
            </Link>
          ))}
        </div>
      );
    }

    case "announcements": {
      const items = (resolved as any[]) || [];
      if (items.length === 0) return null;
      const style = data.style || "banner";
      return (
        <div className={`max-w-4xl mx-auto space-y-3 ${style === "banner" ? "" : ""}`}>
          {items.map((a: any) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30"
            >
              <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {isAr ? a.title_ar : a.title_en || a.title_ar}
                </h4>
                {(a.body_ar || a.body_en || a.message_ar) && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {isAr ? a.body_ar || a.message_ar : a.body_en || a.body_ar || a.message_ar}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "map": {
      const src =
        data.embed_url ||
        (data.address
          ? `https://www.google.com/maps?q=${encodeURIComponent(data.address)}&output=embed`
          : null);
      if (!src) return null;
      return (
        <div className="max-w-4xl mx-auto space-y-3">
          {data.title_ar && (
            <h3 className="text-lg font-bold text-foreground text-center">
              {isAr ? data.title_ar : data.title_en || data.title_ar}
            </h3>
          )}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
            <iframe
              src={src}
              title={data.title_ar || "map"}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
          {data.address && (
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {data.address}
            </p>
          )}
        </div>
      );
    }

    case "contact":
      return (
        <ContactFormBlock
          title={isAr ? data.title_ar : data.title_en || data.title_ar}
          isAr={isAr}
        />
      );

    case "divider":
      return <Rule variant="hair" />;

    default:
      return (
        <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground text-center">
          {isAr ? `قسم مخصى (${type})` : `Custom Section (${type})`}
        </div>
      );
  }
}

/**
 * Recognises a YouTube link (watch/short/embed forms, youtu.be) and returns
 * an embeddable player URL, or null if `url` isn't a YouTube link. Mirrors
 * the same helper in routes/library.tsx.
 */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = u.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/")[2] || null;
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/")[2] || null;
      }
    } else {
      return null;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

const VIDEO_FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];

/** True when `url` points at a stored video file (by extension) rather than an external link. */
function isVideoFileUrl(url: string): boolean {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return VIDEO_FILE_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/** Minimal, real, working contact form embedded via the "contact" block — posts through the same submitContactMessage server fn as /contact. */
function ContactFormBlock({ title, isAr }: { title?: string; isAr: boolean }) {
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const sendContact = useServerFn(submitContactMessage);
  const { lang } = useLang();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = contactMessageSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject") || undefined,
      message: fd.get("message"),
      website_url_check: fd.get("website_url_check") || undefined,
      locale: lang,
      turnstile_token: turnstileToken || undefined,
    });
    if (!result.success) {
      toast.error(isAr ? "يرجى مراجعة الحقول المطلوبة." : "Please check the required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await sendContact({ data: result.data });
      if (res.ok) {
        toast.success(isAr ? "تم استلام رسالتك بنجاح." : "Your message has been received.");
        form.reset();
        setTurnstileToken("");
        turnstileRef.current?.reset();
      } else {
        toast.error(
          isAr
            ? "تعذّر إرسال الرسالة. حاول مجدداً."
            : "Could not send the message. Please try again.",
        );
      }
    } catch {
      toast.error(
        isAr
          ? "تعذّر إرسال الرسالة. حاول مجدداً."
          : "Could not send the message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full border border-input bg-background px-3.5 py-2.5 text-sm rounded-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4">
      {title && <h3 className="text-lg font-bold text-foreground text-center">{title}</h3>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website_url_check">Leave empty</label>
          <input
            type="text"
            id="website_url_check"
            name="website_url_check"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="name"
            required
            maxLength={100}
            placeholder={isAr ? "الاسم الكامل" : "Full name"}
            className={fieldClass}
          />
          <input
            name="email"
            type="email"
            required
            maxLength={255}
            dir="ltr"
            placeholder={isAr ? "البريد الإلكتروني" : "Email"}
            className={fieldClass}
          />
        </div>
        <input
          name="subject"
          maxLength={160}
          placeholder={isAr ? "الموضوع (اختياري)" : "Subject (optional)"}
          className={fieldClass}
        />
        <textarea
          name="message"
          required
          rows={4}
          maxLength={1000}
          placeholder={isAr ? "نص الرسالة" : "Message"}
          className={`${fieldClass} resize-y`}
        />
        <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-primary bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-bold transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? (isAr ? "جاري الإرسال..." : "Sending...") : isAr ? "إرسال" : "Send"}
        </button>
      </form>
    </div>
  );
}
