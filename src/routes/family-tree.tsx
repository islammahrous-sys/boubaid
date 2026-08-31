import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Maximize2, Lock, X } from "lucide-react";
import { z } from "zod";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { siteMeta } from "@/content/site";
import type { FamilyMemberNode } from "@/content/family-tree";
import { officialCharts, officialChartsPdf } from "@/content/tree/charts";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { cn } from "@/lib/utils";
import { getPublicFamilyTreeData } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";

const searchSchema = z.object({
  branch: z.string().optional(),
  id: z.string().optional(),
  focus: z.string().optional(),
});

export const Route = createFileRoute("/family-tree")({
  validateSearch: (search: z.input<typeof searchSchema>) => searchSchema.parse(search),
  loader: async () => {
    const treeData = await getPublicFamilyTreeData();
    return { treeData };
  },
  head: () => ({
    meta: [
      { title: "المشجرة التفاعلية | آل بوعبيد" },
      {
        name: "description",
        content:
          "المشجرة التفاعلية لأسرة آل بوعبيد من العبادل من بني تميم، وتغطي الأجيال الموثقة عبر الفروع السبعة.",
      },
      { property: "og:title", content: "المشجرة التفاعلية — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "المشجرة التفاعلية لأسرة آل بوعبيد من العبادل من بني تميم، تغطي الأجيال الموثقة عبر الفروع السبعة.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/family-tree") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/family-tree") }],
  }),
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

  privacyLabel: { ar: "الخصوصية", en: "Privacy" } as BiText,
  privacyBody: {
    ar: "لا تُنشر أرقام الهويات الوطنية ولا تواريخ الميلاد ولا بيانات التواصل الشخصية في المشجرة العامة. وتتاح التفاصيل الكاملة لأبناء الأسرة عبر الأمانة العامة.",
    en: "National ID numbers, dates of birth, and personal contact details are not published in the public tree. Full records are available to family members through the secretariat.",
  } as BiText,

  explorerEyebrow: { ar: "مستكشف الأجيال", en: "Generation explorer" } as BiText,
  explorerTitle: { ar: "الأفراد الموثقون", en: "Documented individuals" } as BiText,
  searchLabel: {
    ar: "بحث بالاسم أو النسب أو الموطن",
    en: "Search by name, lineage, or place",
  } as BiText,
  searchPlaceholder: { ar: "اكتب للبحث…", en: "Type to search…" } as BiText,
  branchLabel: { ar: "الفرع", en: "Branch" } as BiText,
  generationLabel: { ar: "الجيل", en: "Generation" } as BiText,
  all: { ar: "الكل", en: "All" } as BiText,
  results: { ar: "نتيجة", en: "results" } as BiText,
  empty: {
    ar: "لا توجد نتائج مطابقة لبحثك. جرّب كلمة أخرى أو امسح عوامل التصفية.",
    en: "No matching records for your search. Try another word or clear the filters.",
  } as BiText,
  searchHint: {
    ar: "ابدأ بكتابة اسم، فرع، أو قرية…",
    en: "Start typing a name, branch, or village…",
  } as BiText,
  clear: { ar: "إعادة ضبط", en: "Reset" } as BiText,

  rootBadge: { ar: "الجد الجامع", en: "Root ancestor" } as BiText,
  founderBadge: { ar: "مؤسس فرع", en: "Branch founder" } as BiText,

  artworkEyebrow: { ar: "الإصدار الأول — ١٤٤٧هـ", en: "First Edition — 1447H" } as BiText,
  artworkTitle: {
    ar: "اللوحة الرسمية المصورة للشجرة",
    en: "The official pictorial tree plate",
  } as BiText,
  artworkBody: {
    ar: "أُخرجت الأسرة هذه اللوحة الجدارية بتكلفة استثمارية بلغت 14,948 ريالاً سعودياً، وسُجلت حقوق ملكيتها الفكرية رسمياً لتكون مرجعاً بصرياً حصرياً يربط الجيل الناشئ بجذوره التميمية.",
    en: "The family commissioned this wall plate at an investment cost of SAR 14,948, and formally registered its intellectual-property rights to serve as an exclusive visual reference linking the rising generation to its Tamimi roots.",
  } as BiText,
  artworkOpen: { ar: "فتح اللوحة كاملة", en: "Open the full plate" } as BiText,

  detailLineage: { ar: "النسب", en: "Lineage" } as BiText,
  detailBranch: { ar: "الفرع", en: "Branch" } as BiText,
  detailSettlement: { ar: "الموطن", en: "Settlement" } as BiText,
  detailFather: { ar: "الأب", en: "Father" } as BiText,
  detailChildren: { ar: "عدد الأبناء الموثقين", en: "Documented children" } as BiText,
  detailSub: { ar: "الأفرع الداخلية", en: "Sub-lineages" } as BiText,
  detailChain: { ar: "عمود النسب", en: "Chain of descent" } as BiText,
  detailAchievements: { ar: "من الأعمال", en: "Notable" } as BiText,
  close: { ar: "إغلاق", en: "Close" } as BiText,
};

const arabicOrdinals = [
  "",
  "الأول",
  "الثاني",
  "الثالث",
  "الرابع",
  "الخامس",
  "السادس",
  "السابع",
  "الثامن",
  "التاسع",
  "العاشر",
  "الحادي عشر",
  "الثاني عشر",
];
const englishOrdinals = [
  "",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
];
function generationLabel(n: number): BiText {
  return {
    ar: `الجيل ${arabicOrdinals[n] ?? n}`,
    en: `${englishOrdinals[n] ?? n} generation`,
  };
}

function FamilyTreePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const { treeData } = Route.useLoaderData();
  const search = Route.useSearch();

  const [branchId, setBranchId] = useState(search.branch || "all");
  const [generation, setGeneration] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FamilyMemberNode | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  /** Branch filter options come from the database, not a hardcoded list. */
  const branchOptions = useMemo(
    () =>
      (treeData?.branches ?? []).map((b: any) => ({
        id: b.slug as string,
        name: { ar: b.name_ar, en: b.name_en || b.name_ar } as BiText,
        elder: { ar: b.elder_ar || "", en: b.elder_en || b.elder_ar || "" } as BiText,
      })),
    [treeData],
  );

  /**
   * The single source of truth: `family_members` + `family_relationships`,
   * seeded from the 12 official charts. Fatherhood and children come from the
   * real relationship rows — nothing is inferred or invented here.
   */
  const allMembers = useMemo(() => {
    const members: any[] = treeData?.members ?? [];
    const rels: any[] = treeData?.relationships ?? [];
    const byId = new Map(members.map((m) => [m.id, m]));
    const branchById = new Map((treeData?.branches ?? []).map((b: any) => [b.id, b]));

    const fatherOf = new Map<string, string>();
    const childrenOf = new Map<string, string[]>();
    for (const r of rels) {
      if (r.relationship_type === "parent") {
        fatherOf.set(r.related_person_id, r.person_id);
        childrenOf.set(r.person_id, [...(childrenOf.get(r.person_id) ?? []), r.related_person_id]);
      }
    }

    const nameOf = (id?: string | null) => {
      const row = id ? byId.get(id) : null;
      return row ? `${row.first_name_ar}` : null;
    };

    const chainOf = (id: string) => {
      const chain: string[] = [];
      let cur = fatherOf.get(id);
      let guard = 0;
      while (cur && guard++ < 20) {
        const nm = nameOf(cur);
        if (nm) chain.push(nm);
        cur = fatherOf.get(cur);
      }
      return chain;
    };

    return members.map((row): FamilyMemberNode => {
      const branchRow: any = row.branch_id ? branchById.get(row.branch_id) : null;
      const father = nameOf(fatherOf.get(row.id));
      const children = childrenOf.get(row.id) ?? [];
      const gen = Math.max(1, row.generation || 1);
      const displayAr =
        row.display_name_ar || `${row.first_name_ar} ${row.last_name_ar || ""}`.trim();

      return {
        id: row.id,
        name: {
          ar: row.first_name_ar,
          en: row.first_name_en || row.first_name_ar,
        },
        lineage: { ar: displayAr, en: row.display_name_en || displayAr },
        generation: gen,
        generationTitle: generationLabel(gen),
        branchId: branchRow?.slug || "root",
        branchName: {
          ar: branchRow?.name_ar || "الجذع",
          en: branchRow?.name_en || branchRow?.name_ar || "Trunk",
        },
        ancestorName: {
          ar: branchRow?.elder_ar || "عبدالله — الجد الجامع",
          en: branchRow?.elder_en || branchRow?.elder_ar || "Abdullah — root ancestor",
        },
        settlement: {
          ar: "المبرز، الأحساء",
          en: "Al-Mubarraz, Al-Ahsa",
        },
        title: row.occupation_ar
          ? { ar: row.occupation_ar, en: row.occupation_en || row.occupation_ar }
          : undefined,
        bio: {
          ar: row.biography_ar || `اسم موثق في المشجرات الرسمية المعتمدة — ${displayAr}.`,
          en:
            row.biography_en ||
            `Documented in the official verified charts — ${row.display_name_en || displayAr}.`,
        },
        relations: {
          father: father ? { ar: father, en: father } : undefined,
          childrenCount: children.length,
          lineageChain: chainOf(row.id).map((n) => ({ ar: n, en: n })),
        },
        isPatriarch: gen === 1,
        isBranchFounder: gen === 3 && children.length > 0,
      };
    });
  }, [treeData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMembers.filter((m) => {
      if (branchId !== "all" && m.branchId !== "root" && m.branchId !== branchId) return false;
      if (generation !== "all" && m.generation !== generation) return false;
      if (!q) return true;
      return [m.name, m.lineage, m.bio, m.settlement, m.title]
        .filter(Boolean)
        .map((field) => t(field as BiText).toLowerCase())
        .some((value) => value.includes(q));
    });
  }, [allMembers, branchId, generation, query, t]);

  /** Group results by generation so the register reads as a genealogy. */
  const grouped = useMemo(() => {
    const map = new Map<number, FamilyMemberNode[]>();
    for (const m of filtered) {
      map.set(m.generation, [...(map.get(m.generation) ?? []), m]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  /** A search result can deep-link here with ?focus=<memberId>; once that
   *  member is rendered in the list below, scroll to it and flash a
   *  highlight so the visitor can see which record was searched for. */
  useEffect(() => {
    const focusId = search.focus;
    if (!focusId) return;
    if (!allMembers.some((m) => m.id === focusId)) return;

    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`member-card-${focusId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setHighlightId(focusId);
      clearTimer = setTimeout(() => setHighlightId(null), 2500);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [search.focus, allMembers]);

  const availableGenerations = useMemo(
    () => [...new Set(allMembers.map((m) => m.generation))].sort((a, b) => a - b),
    [allMembers],
  );

  const isFiltered = branchId !== "all" || generation !== "all" || query !== "";

  const reset = () => {
    setBranchId("all");
    setGeneration("all");
    setQuery("");
  };

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

      {/* ── The canvas, given the whole width and no decoration ── */}
      <div className="bg-ink">
        <iframe
          src="/interactive-tree.html"
          title={t(copy.title)}
          className="block h-[50vh] sm:h-[65vh] min-h-[22rem] sm:min-h-[32rem] w-full border-0 bg-card"
        />
      </div>

      {/* Privacy note, stated plainly directly beneath the data. */}
      <aside className="border-b border-border bg-muted/40">
        <div className="container-page flex items-start gap-3 py-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-bronze dark:text-gold" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            <span className="label-caps me-2 text-bronze dark:text-gold">
              {t(copy.privacyLabel)}
            </span>
            {t(copy.privacyBody)}
          </p>
        </div>
      </aside>

      {/* ── The official commissioned artwork, alongside the digital explorer ── */}
      <section className="reveal-on-scroll container-page py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.artworkEyebrow)}</Eyebrow>
            <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl font-serif">
              {t(copy.artworkTitle)}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.artworkBody)}
            </p>
            <a
              href="/images/family_tree_official_artwork.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-xs font-semibold label-caps text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
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
              alt="اللوحة الجدارية المعتمدة للمشجرة العامة لأسرة آل بوعبيد"
              className="mx-auto h-auto max-h-[36rem] w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      {/* ── Generation explorer ─────────────────────────────── */}
      <section className="reveal-on-scroll container-page py-12 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{t(copy.explorerEyebrow)}</Eyebrow>
            <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl font-serif">
              {t(copy.explorerTitle)}
            </h2>
          </div>
          <p className="nums text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} {t(copy.results)}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-7 grid gap-4 sm:gap-5 border border-border bg-card p-3.5 sm:p-5 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label htmlFor="tree-search" className="label-caps mb-2 block text-muted-foreground">
              {t(copy.searchLabel)}
            </label>
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3"
                aria-hidden="true"
              />
              <input
                id="tree-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(copy.searchPlaceholder)}
                className="w-full border border-border bg-background py-2 text-sm sm:text-xs font-serif text-foreground outline-none transition-colors ps-9 pe-3 focus:border-foreground focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tree-branch" className="label-caps mb-2 block text-muted-foreground">
              {t(copy.branchLabel)}
            </label>
            <select
              id="tree-branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full border border-border bg-background px-3 py-2 text-sm sm:text-xs font-serif text-foreground outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-ring md:w-52 cursor-pointer"
            >
              <option value="all">{t(copy.all)}</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {t(b.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tree-gen" className="label-caps mb-2 block text-muted-foreground">
              {t(copy.generationLabel)}
            </label>
            <select
              id="tree-gen"
              value={String(generation)}
              onChange={(e) =>
                setGeneration(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full border border-border bg-background px-3 py-2 text-sm sm:text-xs font-serif text-foreground outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-ring md:w-40 cursor-pointer"
            >
              <option value="all">{t(copy.all)}</option>
              {availableGenerations.map((g) => (
                <option key={g} value={g}>
                  {t(generationLabel(g))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Branch Quick Filter Chips (Mobile & Desktop) */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setBranchId("all")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer",
              branchId === "all"
                ? "border-bronze bg-bronze text-white dark:border-gold dark:bg-gold dark:text-ink shadow-xs"
                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {t(copy.all)}
          </button>
          {branchOptions.map((b) => {
            const isSelected = branchId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBranchId(isSelected ? "all" : b.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer",
                  isSelected
                    ? "border-bronze bg-bronze text-white dark:border-gold dark:bg-gold dark:text-ink shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {t(b.name)}
              </button>
            );
          })}
        </div>

        {isFiltered ? (
          <button
            type="button"
            onClick={reset}
            className="mt-3 label-caps inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer active:scale-95"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t(copy.clear)}
          </button>
        ) : null}

        {/* Results, grouped by generation */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center border border-border bg-card mt-6">
            <p className="text-sm font-medium text-foreground">{t(copy.empty)}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t(copy.searchHint)}</p>
          </div>
        ) : (
          grouped.map(([gen, members]) => (
            <section key={gen} className="mt-10">
              <p className="label-caps border-b border-border pb-2 text-bronze dark:text-gold">
                {t(generationLabel(gen))}
                <span className="nums ms-2 text-muted-foreground">({members.length})</span>
              </p>

              <ol className="grid gap-4 md:grid-cols-2 mt-4">
                {members.map((m) => (
                  <li key={m.id} id={`member-card-${m.id}`} className="list-none scroll-mt-24">
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className={cn(
                        "group block w-full border border-border bg-card p-4 sm:p-5 text-start transition-all duration-200 hover:border-foreground rounded-lg active:scale-[0.98] cursor-pointer",
                        highlightId === m.id &&
                          "border-bronze ring-2 ring-bronze ring-offset-2 ring-offset-background bg-bronze/10 dark:border-gold dark:ring-gold dark:bg-gold/10",
                      )}
                    >
                      <div className="flex items-start gap-3.5">
                        <SaudiCulturalAvatar
                          src={(m as any).photoUrl || (m as any).avatar_path}
                          alt={t(m.name)}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-naskh text-base font-bold text-foreground transition-colors group-hover:text-bronze rtl:text-lg dark:group-hover:text-gold truncate">
                              {t(m.name)}
                            </span>
                            {m.isPatriarch ? (
                              <span className="label-caps shrink-0 border border-bronze/40 bg-bronze/10 px-2 py-0.5 text-[10px] text-bronze dark:border-gold/40 dark:bg-gold/10 dark:text-gold">
                                {t(copy.rootBadge)}
                              </span>
                            ) : m.isBranchFounder ? (
                              <span className="label-caps shrink-0 border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                {t(copy.founderBadge)}
                              </span>
                            ) : null}
                          </div>
                          {m.title ? (
                            <span className="mt-1 block text-xs font-medium text-bronze dark:text-gold">
                              {t(m.title)}
                            </span>
                          ) : null}
                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground truncate">
                            {t(m.settlement)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
      </section>

      {/* ── The 12 official verified branch charts ──────────────────────────── */}
      <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
        <Eyebrow>{t({ ar: "المشجرات الرسمية المعتمدة", en: "Official verified charts" })}</Eyebrow>
        <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {t({
            ar: "المشجرات الاثنتا عشرة المعتمدة من لجنة التوثيق، وهي المرجع الذي بُنيت عليه بيانات المشجرة التفاعلية والسجل أعلاه. تُنشر للمراجعة والتوثيق ولا تُعد صيغة نهائية.",
            en: "The twelve committee-verified charts that the interactive tree and the register above are built from. Published for review and documentation; not a final edition.",
          })}
        </p>

        <a
          href={officialChartsPdf}
          download
          className="label-caps mt-5 inline-flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs text-foreground transition-colors hover:border-foreground"
        >
          {t({ ar: "تنزيل الملف الكامل (PDF)", en: "Download full file (PDF)" })}
        </a>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officialCharts.map((c) => (
            <li key={c.chart} className="border border-border bg-card">
              <a href={c.image} target="_blank" rel="noreferrer" className="block">
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
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Official Tree Artwork & Lineage Documents ───────────────────────── */}
      <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
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

      {/* ── Member record ───────────────────────────────────── */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          dir={rtl ? "rtl" : "ltr"}
          className="max-h-[85vh] gap-0 overflow-y-auto border border-border bg-card p-0 shadow-xl sm:max-w-2xl"
        >
          {selected ? (
            <>
              <div className="border-b border-border px-6 py-5">
                <div className="flex items-center gap-4">
                  <SaudiCulturalAvatar
                    src={(selected as any).photoUrl || (selected as any).avatar_path}
                    alt={t(selected.name)}
                    size="xl"
                  />
                  <div className="flex-1 min-w-0">
                    <Eyebrow rule={false}>{t(selected.generationTitle)}</Eyebrow>
                    <DialogTitle className="mt-1 font-naskh text-2xl leading-tight font-bold text-foreground rtl:text-[1.75rem]">
                      {t(selected.name)}
                    </DialogTitle>
                    {selected.title ? (
                      <p className="mt-1 text-sm text-bronze dark:text-gold">{t(selected.title)}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <p className="text-sm leading-[1.85] text-foreground">{t(selected.bio)}</p>

                <dl className="mt-6 divide-y divide-border border-y border-border">
                  {[
                    { term: copy.detailLineage, value: t(selected.lineage) },
                    { term: copy.detailBranch, value: t(selected.branchName) },
                    { term: copy.detailSettlement, value: t(selected.settlement) },
                    ...(selected.relations.father
                      ? [{ term: copy.detailFather, value: t(selected.relations.father) }]
                      : []),
                    ...(selected.relations.childrenCount
                      ? [
                          {
                            term: copy.detailChildren,
                            value: String(selected.relations.childrenCount),
                            mono: true,
                          },
                        ]
                      : []),
                    ...(selected.relations.subBranches
                      ? [{ term: copy.detailSub, value: t(selected.relations.subBranches) }]
                      : []),
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-5"
                    >
                      <dt className="label-caps pt-0.5 text-muted-foreground">{t(row.term)}</dt>
                      <dd
                        className={cn(
                          "text-sm leading-relaxed text-foreground",
                          row.mono && "nums font-mono",
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {selected.relations.lineageChain?.length ? (
                  <div className="mt-6">
                    <p className="label-caps mb-2.5 text-muted-foreground">{t(copy.detailChain)}</p>
                    <ol className="space-y-1">
                      {selected.relations.lineageChain.map((node, i) => (
                        <li key={i} className="flex gap-3 text-[13px]">
                          <span
                            className="nums w-5 shrink-0 font-mono text-muted-foreground"
                            aria-hidden="true"
                          >
                            {i + 1}
                          </span>
                          <span className="font-naskh text-foreground rtl:text-[15px]">
                            {t(node)}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {selected.keyAchievements?.length ? (
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="label-caps mb-2.5 text-muted-foreground">
                      {t(copy.detailAchievements)}
                    </p>
                    <ul className="space-y-1.5">
                      {selected.keyAchievements.map((a, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-foreground">
                          <span
                            className="mt-2 h-1 w-1 shrink-0 bg-bronze dark:bg-gold"
                            aria-hidden="true"
                          />
                          {t(a)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <p className="nums mt-6 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                  {siteMeta.ncnpLicense}
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
