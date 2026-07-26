import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ExternalLink, Phone } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { businesses } from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "دليل الأعمال | منظمة التنمية العائلية آل بوعبيد" },
      {
        name: "description",
        content:
          "دليل المنشآت والأعمال التي يديرها أبناء أسرة آل بوعبيد في الأحساء والمنطقة الشرقية والرياض.",
      },
      { property: "og:title", content: "دليل أعمال آل بوعبيد" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DirectoryPage,
});

const copy = {
  eyebrow: { ar: "دليل مبوب", en: "Classified index" } as BiText,
  title: { ar: "دليل أعمال الأسرة", en: "Family Business Directory" } as BiText,
  subtitle: {
    ar: "قيد بالمنشآت والمكاتب التي يملكها أو يديرها أبناء الأسرة، مرتبة حسب القطاع. القيد بالدليل لا يعد توصية أو ضماناً من المنظمة.",
    en: "A register of enterprises and practices owned or managed by family members, ordered by sector. Inclusion is a listing, not an endorsement or warranty by the organisation.",
  } as BiText,

  metaListings: { ar: "عدد القيود", en: "Listings" } as BiText,
  metaSectors: { ar: "القطاعات", en: "Sectors" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  searchLabel: { ar: "بحث في الدليل", en: "Search the directory" } as BiText,
  searchPlaceholder: {
    ar: "اسم المنشأة، القطاع، أو المدينة…",
    en: "Name, sector, or city…",
  } as BiText,
  resultsCount: { ar: "قيد مطابق", en: "matching listings" } as BiText,
  empty: {
    ar: "لا توجد قيود مطابقة. جرّب كلمة بحث أخرى.",
    en: "No matching listings. Try a different search term.",
  } as BiText,

  labelCity: { ar: "المدينة", en: "City" } as BiText,
  labelBranch: { ar: "الفرع", en: "Branch" } as BiText,
  labelContact: { ar: "الهاتف", en: "Telephone" } as BiText,
  visit: { ar: "الموقع", en: "Website" } as BiText,

  listTitle: { ar: "إدراج منشأة في الدليل", en: "Listing a business" } as BiText,
  listBody: {
    ar: "يُقيَّد في الدليل بعد التحقق من انتساب المالك أو المدير لأحد الفروع السبعة. تُرسل الطلبات إلى الأمانة العامة.",
    en: "Entries are recorded after verifying that the owner or manager belongs to one of the seven branches. Requests go to the secretariat.",
  } as BiText,
};

export function DirectoryPage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const sectors = useMemo(() => Array.from(new Set(businesses.map((b) => b.category.en))), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) =>
      [
        b.name.ar,
        b.name.en,
        b.category.ar,
        b.category.en,
        b.city.ar,
        b.city.en,
        b.description.ar,
        b.description.en,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  /** Group listings by sector so the directory reads as a classified index. */
  const grouped = useMemo(() => {
    const map = new Map<string, typeof businesses>();
    for (const b of filtered) {
      const key = b.category.en;
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaListings), value: businesses.length.toString(), mono: true },
          { label: t(copy.metaSectors), value: sectors.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-14">
        {/* Search */}
        <div className="border-b border-border pb-5">
          <label
            htmlFor="directory-search"
            className="label-caps mb-2.5 block text-bronze dark:text-gold"
          >
            {t(copy.searchLabel)}
          </label>
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
              aria-hidden="true"
            />
            <input
              id="directory-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(copy.searchPlaceholder)}
              className="w-full border border-input bg-background py-2.5 text-sm outline-none transition-colors focus:border-bronze ps-11 pe-3.5 dark:focus:border-gold"
            />
          </div>
          <p className="nums mt-2.5 text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} {t(copy.resultsCount)}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
        ) : (
          grouped.map(([sector, items]) => (
            <section key={sector} className="mt-12 first:mt-10">
              <Eyebrow>{t(items[0].category)}</Eyebrow>

              <ol className="mt-4 border-t border-ink/25 dark:border-ivory/20">
                {items.map((b) => (
                  <li key={b.id} className="border-b border-border py-6">
                    <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[1fr_minmax(0,16rem)]">
                      <div>
                        <h3 className="text-[15px] font-semibold text-foreground">{t(b.name)}</h3>
                        <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                          {t(b.description)}
                        </p>
                      </div>

                      {/* Contact block, set like a classified entry */}
                      <dl className="space-y-1.5 text-[13px] lg:border-s lg:border-border lg:ps-8">
                        <div className="flex gap-2">
                          <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                            {t(copy.labelCity)}
                          </dt>
                          <dd className="text-foreground">{t(b.city)}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                            {t(copy.labelBranch)}
                          </dt>
                          <dd className="text-foreground">{t(b.ownerBranch)}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                            {t(copy.labelContact)}
                          </dt>
                          <dd>
                            <a
                              href={`tel:${b.contact.replace(/\s/g, "")}`}
                              dir="ltr"
                              className="nums inline-flex items-center gap-1.5 font-mono text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                            >
                              <Phone className="h-3 w-3" aria-hidden="true" />
                              {b.contact}
                            </a>
                          </dd>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <dt className="w-20 shrink-0" aria-hidden="true" />
                          <dd>
                            <a
                              href={b.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 border-b border-bronze pb-0.5 font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                            >
                              {t(copy.visit)}
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}

        {/* Listing note */}
        <aside className="mt-14 border-s-2 border-bronze/40 ps-5 dark:border-gold/40">
          <p className="label-caps mb-2 text-bronze dark:text-gold">{t(copy.listTitle)}</p>
          <p className="measure text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.listBody)}
          </p>
        </aside>
      </div>
    </>
  );
}
