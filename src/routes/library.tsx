import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Download, Play, Image as ImageIcon } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { libraryItems } from "@/content/site";
import heroManuscript from "@/assets/hero-manuscript.jpg";
import archiveAhsa from "@/assets/archive-ahsa.jpg";
import heroGathering from "@/assets/hero-gathering.jpg";
import heroOasis from "@/assets/hero-oasis.jpg";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "المكتبة | Library — Al Bu Obaid" },
      { name: "description", content: "مكتبة الأسرة الرقمية: الوثائق، الصور، والفيديوهات." },
      { property: "og:title", content: "مكتبة آل بوعبيد" },
      { property: "og:description", content: "أرشيف رقمي للأسرة." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/library" },
    ],
    links: [{ rel: "canonical", href: "/library" }],
  }),
  component: LibraryPage,
});

const photoImages = [archiveAhsa, heroManuscript, heroGathering, heroOasis];

function LibraryPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"docs" | "photos" | "videos">("docs");

  return (
    <>
      <PageHero
        image={heroManuscript}
        eyebrow={lang === "ar" ? "المكتبة" : "Library"}
        title={lang === "ar" ? "أرشيف الأسرة الرقمي" : "The family's digital archive"}
      />

      <section className="container-page py-16">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "docs" as const, ar: "الوثائق", en: "Documents", icon: FileText },
            { key: "photos" as const, ar: "الصور", en: "Photos", icon: ImageIcon },
            { key: "videos" as const, ar: "الفيديوهات", en: "Videos", icon: Play },
          ].map((tabDef) => {
            const Icon = tabDef.icon;
            return (
              <button
                key={tabDef.key}
                onClick={() => setTab(tabDef.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === tabDef.key ? "bg-navy text-ivory" : "border border-border bg-background text-navy/70 hover:text-navy"}`}
              >
                <Icon className="h-4 w-4" />
                {t({ ar: tabDef.ar, en: tabDef.en })}
              </button>
            );
          })}
        </div>

        {tab === "docs" ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {libraryItems.documents.map((d, i) => (
              <a key={i} href="#" className="flex items-center justify-between rounded-md border border-border bg-card px-5 py-4 hover:border-gold">
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-gold" />
                  <div>
                    <div className="font-semibold text-navy">{t(d.title)}</div>
                    <div className="text-xs text-muted-foreground">{d.year} هـ · {d.kind}</div>
                  </div>
                </div>
                <Download className="h-4 w-4 text-navy/60" />
              </a>
            ))}
          </div>
        ) : null}

        {tab === "photos" ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {libraryItems.photos.map((p, i) => (
              <figure key={i} className="overflow-hidden rounded-md border border-border">
                <img src={photoImages[i % photoImages.length]} alt={t(p.title)} className="h-56 w-full object-cover" loading="lazy" />
                <figcaption className="border-t border-border bg-card p-3 text-xs">
                  <div className="font-semibold text-navy">{t(p.title)}</div>
                  <div className="text-muted-foreground">{p.year} هـ</div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        {tab === "videos" ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {libraryItems.videos.map((v, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-4">
                <div className="grid aspect-video place-items-center rounded-md bg-navy text-ivory">
                  <Play className="h-10 w-10 text-gold" />
                </div>
                <div className="mt-3 font-semibold text-navy">{t(v.title)}</div>
                <div className="text-xs text-muted-foreground">{v.year} هـ</div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
