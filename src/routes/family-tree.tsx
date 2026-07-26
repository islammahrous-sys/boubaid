import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Maximize2, Lock, X } from "lucide-react";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { branches, siteMeta } from "@/content/site";
import { familyMembersData, type FamilyMemberNode } from "@/content/family-tree";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/site/Editorial";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/family-tree")({
  head: () => ({
    meta: [
      { title: "المشجرة التفاعلية | الفروع امتداد الجذور — آل بوعبيد" },
      {
        name: "description",
        content:
          "المشجرة التفاعلية لأسرة آل بوعبيد من العبادل من بني تميم، وتغطي الأجيال الموثقة عبر الفروع السبعة.",
      },
      { property: "og:title", content: "المشجرة التفاعلية — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
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
  empty: { ar: "لا توجد نتائج مطابقة.", en: "No matching records." } as BiText,
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

const generationLabels: Record<number, BiText> = {
  1: { ar: "الجيل الأول", en: "First generation" },
  2: { ar: "الجيل الثاني", en: "Second generation" },
  3: { ar: "الجيل الثالث", en: "Third generation" },
  4: { ar: "الجيل الرابع", en: "Fourth generation" },
};

export function FamilyTreePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";

  const [branchId, setBranchId] = useState("all");
  const [generation, setGeneration] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FamilyMemberNode | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return familyMembersData.filter((m) => {
      if (branchId !== "all" && m.branchId !== "root" && m.branchId !== branchId) return false;
      if (generation !== "all" && m.generation !== generation) return false;
      if (!q) return true;
      return [m.name, m.lineage, m.bio, m.settlement, m.title]
        .filter(Boolean)
        .map((field) => t(field as BiText).toLowerCase())
        .some((value) => value.includes(q));
    });
  }, [branchId, generation, query, t]);

  /** Group results by generation so the register reads as a genealogy. */
  const grouped = useMemo(() => {
    const map = new Map<number, FamilyMemberNode[]>();
    for (const m of filtered) {
      map.set(m.generation, [...(map.get(m.generation) ?? []), m]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

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
            <h1 className="mt-1 font-naskh text-xl leading-tight font-bold text-ivory rtl:text-2xl">
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
              className="inline-flex shrink-0 items-center gap-2 border border-gold bg-gold px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-transparent hover:text-gold"
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
          className="block h-[70vh] min-h-[32rem] w-full border-0 bg-[#FDFBF7]"
        />
      </div>

      {/* Privacy note, stated plainly directly beneath the data. */}
      <aside className="border-b border-border bg-secondary/50">
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
      <section className="container-page py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.artworkEyebrow)}</Eyebrow>
            <h2 className="mt-3 font-naskh text-xl md:text-2xl lg:text-3xl leading-tight text-foreground transition-colors hover:text-gold-foil">
              {t(copy.artworkTitle)}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.artworkBody)}
            </p>
            <a
              href="/images/family_tree_official_artwork.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.artworkOpen)}
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <a
            href="/images/family_tree_official_artwork.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border bg-white"
          >
            <img
              src="/images/family_tree_official_artwork.jpg"
              alt=""
              className="mx-auto h-auto max-h-[36rem] w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      {/* ── Generation explorer ─────────────────────────────── */}
      <section className="container-page py-12 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{t(copy.explorerEyebrow)}</Eyebrow>
            <h2 className="mt-3 font-naskh text-2xl md:text-3xl lg:text-[2rem] leading-tight text-foreground transition-colors hover:text-gold-foil">
              {t(copy.explorerTitle)}
            </h2>
          </div>
          <p className="nums text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} {t(copy.results)}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-7 grid gap-5 border-y border-border py-5 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <label htmlFor="tree-search" className="label-caps mb-2 block text-muted-foreground">
              {t(copy.searchLabel)}
            </label>
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
                aria-hidden="true"
              />
              <input
                id="tree-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(copy.searchPlaceholder)}
                className="w-full border border-input bg-background py-2.5 text-sm outline-none transition-colors focus:border-bronze ps-11 pe-3.5 dark:focus:border-gold"
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
              className="w-full border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-bronze md:w-52 dark:focus:border-gold"
            >
              <option value="all">{t(copy.all)}</option>
              {branches.map((b) => (
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
              className="w-full border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-bronze md:w-40 dark:focus:border-gold"
            >
              <option value="all">{t(copy.all)}</option>
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>
                  {t(generationLabels[g])}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFiltered ? (
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t(copy.clear)}
          </button>
        ) : null}

        {/* Results, grouped by generation */}
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
        ) : (
          grouped.map(([gen, members]) => (
            <section key={gen} className="mt-10">
              <p className="label-caps border-b border-ink/25 pb-2 text-bronze dark:border-ivory/20 dark:text-gold">
                {t(generationLabels[gen])}
                <span className="nums ms-2 text-muted-foreground">({members.length})</span>
              </p>

              <ol className="grid gap-x-12 md:grid-cols-2">
                {members.map((m) => (
                  <li key={m.id} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="group block w-full py-4 text-start"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-naskh text-base font-bold text-foreground transition-colors group-hover:text-gold-foil rtl:text-lg">
                          {t(m.name)}
                        </span>
                        {m.isPatriarch ? (
                          <span className="label-caps shrink-0 text-bronze dark:text-gold">
                            {t(copy.rootBadge)}
                          </span>
                        ) : m.isBranchFounder ? (
                          <span className="label-caps shrink-0 text-muted-foreground">
                            {t(copy.founderBadge)}
                          </span>
                        ) : null}
                      </div>
                      {m.title ? (
                        <span className="mt-1 block text-[13px] text-bronze dark:text-gold">
                          {t(m.title)}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                        {t(m.settlement)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
      </section>

      {/* ── Member record ───────────────────────────────────── */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          dir={rtl ? "rtl" : "ltr"}
          className="max-h-[85vh] gap-0 overflow-y-auto rounded-none border-border bg-background p-0 sm:max-w-2xl"
        >
          {selected ? (
            <>
              <div className="border-b border-ink/25 px-6 py-5 dark:border-ivory/20">
                <Eyebrow rule={false}>{t(selected.generationTitle)}</Eyebrow>
                <DialogTitle className="mt-2 font-naskh text-2xl leading-tight font-bold text-foreground transition-colors hover:text-gold-foil rtl:text-[1.75rem]">
                  {t(selected.name)}
                </DialogTitle>
                {selected.title ? (
                  <p className="mt-1.5 text-sm text-bronze dark:text-gold">{t(selected.title)}</p>
                ) : null}
              </div>

              <div className="px-6 py-6">
                <p className="text-sm leading-[1.85] text-ink-soft dark:text-foreground/85">
                  {t(selected.bio)}
                </p>

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
