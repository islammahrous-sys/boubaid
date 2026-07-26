import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { achievers } from "@/content/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievers")({
  head: () => ({
    meta: [
      { title: "سجل المتميزين | منظمة التنمية العائلية آل بوعبيد" },
      {
        name: "description",
        content:
          "سجل الكفاءات والمتميزين من أبناء وبنات آل بوعبيد في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:title", content: "سجل المتميزين — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: AchieversPage,
});

const copy = {
  eyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  title: { ar: "سجل الكفاءات والمتميزين", en: "Register of Achievers" } as BiText,
  subtitle: {
    ar: "يقيّد هذا السجل أصحاب التحصيل العلمي والمهني من أبناء وبنات الفروع السبعة. ويُحدَّث سنوياً عند حفل التكريم بالملتقى العام.",
    en: "This register records the academic and professional achievements of the sons and daughters of the seven branches. It is updated each year at the honours ceremony of the general assembly.",
  } as BiText,

  metaEntries: { ar: "عدد المقيدين", en: "Entries" } as BiText,
  metaFields: { ar: "المجالات", en: "Fields" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Last updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  filterLabel: { ar: "تصفية حسب المجال", en: "Filter by field" } as BiText,
  empty: { ar: "لا توجد قيود في هذا المجال بعد.", en: "No entries in this field yet." } as BiText,

  colName: { ar: "الاسم", en: "Name" } as BiText,
  colField: { ar: "المجال", en: "Field" } as BiText,
  colAchievement: { ar: "التميز", en: "Distinction" } as BiText,
  colBranch: { ar: "الفرع", en: "Branch" } as BiText,

  nominateTitle: { ar: "الترشيح للسجل", en: "Nominations" } as BiText,
  nominateBody: {
    ar: "يُفتح باب الترشح لجائزة التفوق العلمي والتميز المهني سنوياً. ويجري القيد بعد اعتماد لجنة الأنشطة والبرامج.",
    en: "Nominations for the Academic and Professional Excellence Award open annually. Entry to the register follows approval by the Activities & Programmes Committee.",
  } as BiText,
  nominateCta: { ar: "تقديم ترشيح", en: "Submit a nomination" } as BiText,
};

const categories: { key: string; label: BiText }[] = [
  { key: "all", label: { ar: "الكل", en: "All" } },
  { key: "medical", label: { ar: "الطب", en: "Medicine" } },
  { key: "academic", label: { ar: "الأكاديميا", en: "Academia" } },
  { key: "military", label: { ar: "الخدمة العسكرية", en: "Military" } },
  { key: "business", label: { ar: "الأعمال والتقنية", en: "Business & Technology" } },
  { key: "sports", label: { ar: "الرياضة", en: "Sport" } },
  { key: "public", label: { ar: "الخدمة العامة", en: "Public service" } },
];

export function AchieversPage() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState("all");
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const filtered =
    selected === "all" ? achievers : achievers.filter((a) => a.category === selected);

  const fieldCount = new Set(achievers.map((a) => a.category)).size;

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaEntries), value: achievers.length.toString(), mono: true },
          { label: t(copy.metaFields), value: fieldCount.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-14">
        {/* Filter — text links along a rule, not a row of pills. */}
        <div className="border-b border-border pb-4">
          <Eyebrow>{t(copy.filterLabel)}</Eyebrow>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            {categories.map((c) => {
              const count =
                c.key === "all"
                  ? achievers.length
                  : achievers.filter((a) => a.category === c.key).length;
              const active = selected === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelected(c.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-baseline gap-1.5 border-b pb-0.5 text-sm transition-colors",
                    active
                      ? "border-bronze font-semibold text-foreground dark:border-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(c.label)}
                  <span className="nums text-xs text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The register itself */}
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
        ) : (
          <>
            {/* Column headings, shown once at the top of the register. */}
            <div className="mt-8 hidden border-b border-ink/25 pb-2.5 md:grid md:grid-cols-[2.5rem_4rem_minmax(0,14rem)_minmax(0,10rem)_1fr] md:gap-6 dark:border-ivory/20">
              <span className="label-caps text-muted-foreground" aria-hidden="true" />
              <span className="label-caps text-muted-foreground" aria-hidden="true" />
              <span className="label-caps text-muted-foreground">{t(copy.colName)}</span>
              <span className="label-caps text-muted-foreground">{t(copy.colField)}</span>
              <span className="label-caps text-muted-foreground">{t(copy.colAchievement)}</span>
            </div>

            <ol>
              {filtered.map((person, i) => (
                <li
                  key={`${person.name.en}-${i}`}
                  className="grid grid-cols-[4rem_1fr] items-start gap-x-5 gap-y-1.5 border-b border-border py-5 md:grid-cols-[2.5rem_4rem_minmax(0,14rem)_minmax(0,10rem)_1fr] md:gap-x-6"
                >
                  <span
                    className="nums order-2 hidden font-mono text-sm text-bronze/70 md:order-none md:block dark:text-gold/60"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Portrait, framed rather than cropped to a circle —
                      a register plate, not an avatar. */}
                  <img
                    src={person.image}
                    alt=""
                    className="aspect-[3/4] w-16 border border-border object-cover object-top"
                    loading="lazy"
                  />

                  <span className="md:pt-0.5">
                    <span className="block font-naskh text-base font-bold text-foreground transition-colors hover:text-gold-foil rtl:text-lg">
                      {t(person.name)}
                    </span>
                    <span className="mt-0.5 block text-xs text-bronze md:hidden dark:text-gold">
                      {t(person.field)}
                    </span>
                  </span>

                  <span className="hidden text-[13px] text-bronze md:block md:pt-1 dark:text-gold">
                    {t(person.field)}
                  </span>

                  <span className="col-start-2 text-[13px] leading-relaxed text-muted-foreground md:col-start-auto md:pt-1">
                    {t(person.achievement)}
                    {/* Full-strength muted-foreground, not a translucent tint —
                        /75 measured 2.67:1 against paper, below the 4.5:1 this
                        line of text needs. */}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t(person.branch)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {/* ── Nominations ──────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="font-naskh text-xl md:text-2xl font-bold text-foreground transition-colors hover:text-gold-foil">{t(copy.nominateTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.nominateBody)}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            {t(copy.nominateCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
