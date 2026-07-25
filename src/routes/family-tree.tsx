import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import heroOasis from "@/assets/hero-oasis.jpg";

export const Route = createFileRoute("/family-tree")({
  head: () => ({
    meta: [
      { title: "شجرة العائلة | Family Tree — Al Bu Obaid" },
      { name: "description", content: "الشجرة النسبية لأسرة آل بوعبيد ودليل أبناء الأسرة." },
      { property: "og:title", content: "شجرة عائلة آل بوعبيد" },
      { property: "og:description", content: "الجدّ الجامع، الفروع، والأجيال." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/family-tree" },
    ],
    links: [{ rel: "canonical", href: "/family-tree" }],
  }),
  component: FamilyTreePage,
});

const branches = [
  {
    root: { ar: "الجدّ الجامع — عبد الله بن دارم", en: "Common ancestor — ʿAbd Allāh ibn Dārim" },
    kids: [
      { ar: "فرع أول", en: "Branch I" },
      { ar: "فرع ثانٍ", en: "Branch II" },
      { ar: "فرع ثالث", en: "Branch III" },
    ],
  },
];

const directory = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: { ar: `الاسم ${i + 1} بوعبيد`, en: `Member ${i + 1} Bu Obaid` },
  generation: (i % 4) + 1,
  branch: (i % 3) + 1,
}));

function FamilyTreePage() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [gen, setGen] = useState<number | "all">("all");

  const filtered = useMemo(() => {
    return directory.filter((m) => {
      const name = t(m.name).toLowerCase();
      const okQ = q ? name.includes(q.toLowerCase()) : true;
      const okG = gen === "all" ? true : m.generation === gen;
      return okQ && okG;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, gen, lang]);

  return (
    <>
      <PageHero
        image={heroOasis}
        eyebrow={lang === "ar" ? "الشجرة" : "The Tree"}
        title={lang === "ar" ? "شجرة عائلة آل بوعبيد" : "The Al Bu Obaid Family Tree"}
        subtitle={lang === "ar" ? "من الجدّ الجامع إلى الأجيال المعاصرة." : "From the common ancestor to today's generations."}
      />

      {/* Visual tree */}
      <section className="container-page py-20">
        <SectionHeading eyebrow={lang === "ar" ? "بنية النسب" : "Structure"} title={lang === "ar" ? "الفروع والأجيال" : "Branches and generations"} />
        <div className="mt-12 overflow-x-auto">
          <div className="mx-auto min-w-[720px] max-w-4xl">
            {branches.map((b, bi) => (
              <div key={bi}>
                <div className="mx-auto w-fit rounded-md border border-gold bg-navy px-6 py-4 text-center text-ivory shadow-lg">
                  <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "الجذر" : "Root"}</div>
                  <div className="mt-1 text-lg font-semibold">{t(b.root)}</div>
                </div>
                <div className="relative mx-auto my-6 h-10 w-1 bg-gold/50" />
                <div className="grid grid-cols-3 gap-6">
                  {b.kids.map((k, ki) => (
                    <div key={ki} className="flex flex-col items-center">
                      <div className="h-6 w-1 bg-gold/50" />
                      <div className="rounded-md border border-border bg-card px-5 py-3 text-center">
                        <div className="text-sm font-semibold text-navy">{t(k)}</div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="rounded-md border border-border bg-secondary px-3 py-1 text-xs text-navy/70">
                            {lang === "ar" ? `جيل ${n}` : `Gen ${n}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="bg-secondary/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow={lang === "ar" ? "الدليل" : "Directory"} title={lang === "ar" ? "أبناء الأسرة" : "Family members"} />
          <div className="mt-6 flex items-start gap-3 rounded-md border border-gold/40 bg-ivory p-4 text-sm text-navy/80">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <p>
              {lang === "ar"
                ? "خصوصية أبناء الأسرة أولوية. البيانات المعروضة هنا للتوضيح فقط، وسيتم الالتزام بضوابط الخصوصية في النسخة النهائية."
                : "Member privacy is a priority. The data below is illustrative; the final release will follow strict privacy controls."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute inset-y-0 my-auto ms-3 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={lang === "ar" ? "ابحث بالاسم..." : "Search by name..."}
                className="w-full rounded-md border border-input bg-background ps-9 pe-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <div className="flex gap-1">
              {(["all", 1, 2, 3, 4] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGen(g)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${gen === g ? "bg-navy text-ivory" : "border border-border bg-background text-navy/70 hover:text-navy"}`}
                >
                  {g === "all" ? (lang === "ar" ? "الكل" : "All") : lang === "ar" ? `جيل ${g}` : `Gen ${g}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((m) => (
              <div key={m.id} className="rounded-md border border-border bg-card p-4">
                <div className="text-sm font-semibold text-navy">{t(m.name)}</div>
                <div className="text-xs text-muted-foreground">
                  {lang === "ar" ? `جيل ${m.generation} · فرع ${m.branch}` : `Gen ${m.generation} · Branch ${m.branch}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elder bios */}
      <section className="container-page py-20">
        <SectionHeading eyebrow={lang === "ar" ? "من كبار الأسرة" : "Elders & founders"} title={lang === "ar" ? "سِير من ذاكرة الأسرة" : "Voices from family memory"} />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <article key={i} className="rounded-md border border-border bg-card p-6">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-xl font-bold text-navy">{i}</div>
              <h3 className="mt-4 text-lg font-semibold text-navy">
                {lang === "ar" ? `اسم الكبير ${i}` : `Elder Name ${i}`}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "سيرة موجزة سيتم تحديثها من قِبَل اللجنة الثقافية، تسرد أثر هذا الجدّ في تاريخ الأسرة."
                  : "A short biography to be updated by the Cultural Committee, telling how this elder shaped the family."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
