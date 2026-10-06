import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  User,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { branches } from "@/content/site";
import { getPublishedAchievers, getPublicSiteSettings } from "@/lib/cms.functions";
import { useQuery } from "@tanstack/react-query";
import { SPONSOR_HEAD, SPONSOR_ROWS, type SponsorRow } from "@/content/award-sponsors";
import { submitAchieverNomination } from "@/lib/forms.functions";
import { mapAchieverRow } from "@/content/cms-adapt";
import { pageImages } from "@/content/images";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/achievers";
import { inl } from "@/content/page-copy/achievers-inline";

export const Route = createFileRoute("/achievers")({
  loader: async () => {
    const rows = await getPublishedAchievers();
    return { achievers: rows.map(mapAchieverRow) };
  },
  head: () => ({
    meta: [
      { title: "جائزة آل بوعبيد للتفوق العلمي والتميز" },
      {
        name: "description",
        content:
          "كفاءات ومتميزو أسرة آل بوعبيد من أبنائها وبناتها في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:title", content: "جائزة آل بوعبيد للتفوق العلمي والتميز" },
      {
        property: "og:description",
        content:
          "كفاءات ومتميزو أسرة آل بوعبيد من أبنائها وبناتها في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: getCanonicalUrl("/achievers") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/achievers") }],
  }),
  component: AchieversPage,
});

const AWARD_FIELDS: { text: BiText; sub?: BiText[] }[] = [
  {
    text: inl.t_aca790ab,
  },
  {
    text: inl.t_18cbdc1c,
    sub: [inl.t_7f2f3dac, inl.t_8391ef3a],
  },
  {
    text: inl.t_88b71f2c,
  },
  {
    text: inl.t_0d9f8155,
  },
  {
    text: inl.t_fd1213d6,
  },
];

function AchieversPage() {
  const { t, lang } = useLang();
  const { data: siteSettings } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const sponsorCfg = (siteSettings as Record<string, any> | undefined)?.award_sponsors;
  const sponsorRows: SponsorRow[] =
    Array.isArray(sponsorCfg?.rows) && sponsorCfg.rows.length ? sponsorCfg.rows : SPONSOR_ROWS;
  const sponsorTotal: BiText | null =
    sponsorCfg?.total_ar || sponsorCfg?.total_en
      ? { ar: sponsorCfg.total_ar || "", en: sponsorCfg.total_en || "" }
      : null;
  const { achievers } = Route.useLoaderData();
  const [activeAchiever, setActiveAchiever] = useState<any | null>(null);
  const [nominationOpen, setNominationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    nominee_name: "",
    branch_slug: "",
    category: "academic" as "medical" | "academic" | "military" | "business" | "sports" | "other",
    field: "",
    achievement_summary: "",
    biography: "",
    nomination_reason: "",
    year: "1447",
    evidence_url: "",
    nominator_name: "",
    nominator_phone: "",
    nominator_email: "",
    notes: "",
    website_url_check: "",
  });

  const sendNomination = useServerFn(submitAchieverNomination);

  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const ATTACH_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const ATTACH_MAX_BYTES = 10 * 1024 * 1024;
  const ATTACH_MAX_COUNT = 6;

  const addAttachments = (files: FileList | null) => {
    if (!files) return;
    const next = [...attachments];
    for (const f of Array.from(files)) {
      if (next.length >= ATTACH_MAX_COUNT) {
        toast.error(
          rtl ? `الحد الأقصى ${ATTACH_MAX_COUNT} ملفات` : `Maximum ${ATTACH_MAX_COUNT} files`,
        );
        break;
      }
      if (!ATTACH_TYPES.includes(f.type)) {
        toast.error(rtl ? `صيغة غير مدعومة: ${f.name}` : `Unsupported file: ${f.name}`);
        continue;
      }
      if (f.size > ATTACH_MAX_BYTES) {
        toast.error(rtl ? `الملف كبير جداً: ${f.name}` : `File too large: ${f.name}`);
        continue;
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setAttachments(next);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        resolve(result.slice(result.indexOf(",") + 1));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const competencies = useMemo(
    () =>
      achievers
        .filter((a) => a.section === "family_competency")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [achievers],
  );
  const excellence = useMemo(
    () => achievers.filter((a) => a.section === "excellence_award"),
    [achievers],
  );
  // Years come from the records themselves, so a new award year entered in the
  // console appears here without a code change. Eastern-Arabic digits and a
  // trailing "هـ"/"AH" typed by an editor normalise to the same group.
  const yearGroups = useMemo(() => {
    const normalise = (raw: string | null | undefined) => {
      const digits = String(raw ?? "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
      const match = digits.match(/\d{3,4}/);
      return match ? match[0] : "";
    };
    const groups = new Map<string, typeof excellence>();
    for (const person of excellence) {
      const year = normalise(person.awardYear);
      const bucket = groups.get(year);
      if (bucket) bucket.push(person);
      else groups.set(year, [person]);
    }
    // Keep every supplied award cohort visible in descending Hijri-year order.
    // Other years stay visible too; records without a year come last.
    return [...groups.entries()]
      .sort((a, b) => {
        if (!a[0]) return 1;
        if (!b[0]) return -1;
        return Number(b[0]) - Number(a[0]);
      })
      .map(([year, people]) => ({
        year,
        people: [...people].sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  }, [excellence]);

  const handleNominationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nominee_name ||
      !formData.field ||
      !formData.achievement_summary ||
      !formData.nominator_name ||
      !formData.nominator_phone
    ) {
      toast.error(t(inl.t_65336d17));
      return;
    }

    setIsSubmitting(true);
    try {
      const encoded = await Promise.all(
        attachments.map(async (f) => ({
          name: f.name,
          type: f.type as "application/pdf" | "image/jpeg" | "image/png" | "image/webp",
          data: await fileToBase64(f),
        })),
      );
      const res = await sendNomination({ data: { ...formData, attachments: encoded } });
      if (res.ok) {
        setSubmittedSuccess(true);
        setAttachments([]);
        toast.success(t(inl.t_acfb7a19));
      } else {
        toast.error(t(inl.t_00c9cbaf));
      }
    } catch {
      toast.error(t(inl.t_686f770d));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        variant="plate"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        image={pageImages.achievers.header.src}
        imageCaption={t(pageImages.achievers.header.caption)}
        meta={[
          { label: t(copy.metaEntries), value: achievers.length.toString(), mono: true },
          { label: t(copy.metaFields), value: yearGroups.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-16 space-y-16">
        <section aria-labelledby="award-fields-title">
          <h2 id="award-fields-title" className="sr-only">
            {t(inl.t_5b6c2723)}
          </h2>
          <p className="measure mb-5 text-[16px] font-medium leading-relaxed text-foreground">
            {t(copy.subtitle)}
          </p>
          <ol className="grid gap-3 md:grid-cols-2">
            {AWARD_FIELDS.map((f, i) => (
              <li key={i} className="rounded-md border border-border bg-card p-5">
                <span className="nums font-mono text-xs text-bronze dark:text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground">{t(f.text)}</p>
                {f.sub ? (
                  <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                    {f.sub.map((x, j) => (
                      <li key={j}>{t(x)}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="measure mt-6 border-s-2 border-bronze ps-4 text-[15px] leading-relaxed text-foreground dark:border-gold">
            {t(inl.t_db5b70ef)}
          </p>
        </section>

        <section aria-labelledby="competencies-title">
          <Eyebrow>{t(inl.t_b2a930b0)}</Eyebrow>
          <h2
            id="competencies-title"
            className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl"
          >
            {t(copy.competencies)}
          </h2>
          {competencies.length === 0 ? (
            <div className="mt-6 border-y border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">{t(copy.empty)}</p>
            </div>
          ) : (
            <ol className="mt-6 divide-y divide-border border-y border-border">
              {competencies.map((person, index) => (
                <li
                  key={person.id}
                  className="grid gap-2 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6"
                >
                  <span className="nums text-sm text-bronze/70 dark:text-gold/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveAchiever(person)}
                    className="text-start font-naskh text-base font-bold text-foreground hover:text-bronze dark:hover:text-gold"
                  >
                    {t(person.name)}
                  </button>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(person.field) || t(person.achievement)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="excellence-title">
          <Eyebrow>{t(inl.t_a1cbbe31)}</Eyebrow>
          <h2
            id="excellence-title"
            className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl"
          >
            {t(copy.excellence)}
          </h2>
          <figure className="mt-6">
            <img
              src={pageImages.achievers.ceremony.src}
              alt={t(inl.t_32f27a01)}
              width={1920}
              height={1280}
              loading="lazy"
              decoding="async"
              className="w-full rounded-md border border-border object-contain"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {t(inl.t_86fbd95c)}
            </figcaption>
          </figure>
          <div className="mt-8 space-y-12">
            {!yearGroups.some((g) => g.year === "1448") ? (
              <section aria-labelledby="award-year-1448">
                <div className="flex items-center gap-4 border-b border-ink/25 pb-3 dark:border-ivory/20">
                  <h3
                    id="award-year-1448"
                    className="nums text-xl font-bold text-bronze dark:text-gold"
                  >
                    {t(inl.t_5f14880e)}
                  </h3>
                </div>
                <p className="py-5 text-sm text-muted-foreground">{t(inl.t_82666bc6)}</p>
              </section>
            ) : null}
            {yearGroups.map(({ year, people }) => (
              <section key={year} aria-labelledby={`award-year-${year}`}>
                <div className="flex items-center gap-4 border-b border-ink/25 pb-3 dark:border-ivory/20">
                  <h3
                    id={`award-year-${year}`}
                    className="nums text-xl font-bold text-bronze dark:text-gold"
                  >
                    {year === "" ? t(inl.t_cc7a9654) : rtl ? `عام ${year}هـ` : `Year ${year} AH`}
                  </h3>
                  <span className="nums text-xs text-muted-foreground">{people.length}</span>
                </div>
                <ol className="divide-y divide-border">
                  {people.map((person, index) => (
                    <li
                      key={person.id}
                      className="grid gap-2 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6"
                    >
                      <span className="nums text-sm text-bronze/70 dark:text-gold/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveAchiever(person)}
                        className="text-start font-naskh text-base font-bold text-foreground hover:text-bronze dark:hover:text-gold"
                      >
                        {t(person.name)}
                      </button>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t(person.achievement)}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="sponsors-title" className="container-page pb-16">
        <Eyebrow>{t(inl.t_c1bce362)}</Eyebrow>
        <h2
          id="sponsors-title"
          className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl"
        >
          {t(inl.t_62428037)}
        </h2>
        <div className="mt-6 space-y-3 sm:hidden">
          {sponsorRows.map((r) => (
            <article
              key={r.year}
              className="overflow-hidden rounded-md border border-border bg-card"
            >
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-secondary/60 px-4 py-3">
                <h3 className="nums text-lg font-bold text-foreground">
                  {rtl ? `عام ${r.year}هـ` : `Year ${r.year} AH`}
                </h3>
                <span className="text-xs font-semibold text-bronze dark:text-gold">
                  {t(r.prize)}
                </span>
              </header>
              <dl className="grid grid-cols-2 gap-px bg-border text-sm">
                <div className="min-w-0 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{t(SPONSOR_HEAD[1])}</dt>
                  <dd className="nums mt-1 font-semibold text-foreground">{r.participants}</dd>
                </div>
                <div className="min-w-0 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{t(SPONSOR_HEAD[2])}</dt>
                  <dd className="nums mt-1 font-semibold text-foreground">{r.honoured}</dd>
                </div>
                <div className="min-w-0 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{t(SPONSOR_HEAD[3])}</dt>
                  <dd className="mt-1 leading-relaxed text-foreground">
                    {(r.branches ?? []).map((branch) => (
                      <div key={branch.en}>{t(branch)}</div>
                    ))}
                  </dd>
                </div>
                <div className="min-w-0 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{t(SPONSOR_HEAD[5])}</dt>
                  <dd className="mt-1 leading-relaxed text-foreground">
                    {(r.fields ?? []).map((field) => (
                      <div key={field.en}>{t(field)}</div>
                    ))}
                  </dd>
                </div>
                <div className="col-span-2 min-w-0 bg-card p-3">
                  <dt className="text-xs text-muted-foreground">{t(SPONSOR_HEAD[6])}</dt>
                  <dd className="mt-1 break-words font-medium text-foreground">{r.sponsor}</dd>
                </div>
              </dl>
            </article>
          ))}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border text-center">
            <div className="bg-secondary/60 p-3">
              <div className="text-[11px] text-muted-foreground">{t(inl.t_10e1e00c)}</div>
              <div className="nums mt-1 text-base font-bold text-foreground">
                {sponsorRows.reduce((n, r) => n + Number(r.participants || 0), 0)}
              </div>
              <div className="text-[10px] text-muted-foreground">{t(SPONSOR_HEAD[1])}</div>
            </div>
            <div className="bg-secondary/60 p-3">
              <div className="text-[11px] text-muted-foreground">{t(inl.t_10e1e00c)}</div>
              <div className="nums mt-1 text-base font-bold text-foreground">
                {sponsorRows.reduce((n, r) => n + Number(r.honoured || 0), 0)}
              </div>
              <div className="text-[10px] text-muted-foreground">{t(SPONSOR_HEAD[2])}</div>
            </div>
            <div className="bg-secondary/60 p-3">
              <div className="text-[11px] text-muted-foreground">{t(inl.t_10e1e00c)}</div>
              <div className="nums mt-1 text-sm font-bold text-foreground">
                {sponsorTotal ? t(sponsorTotal) : t(inl.t_7f87301d)}
              </div>
              <div className="text-[10px] text-muted-foreground">{t(SPONSOR_HEAD[4])}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 hidden overflow-x-auto rounded-md border border-border sm:block">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-secondary/60 text-foreground">
              <tr>
                {SPONSOR_HEAD.map((h) => (
                  <th
                    key={h.en}
                    scope="col"
                    className="border-b border-border px-3 py-3 text-start font-semibold"
                  >
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sponsorRows.map((r) => (
                <tr key={r.year} className="border-b border-border align-top">
                  <th
                    scope="row"
                    className="nums bg-secondary/30 px-3 py-3 text-start font-semibold"
                  >
                    {r.year}
                  </th>
                  <td className="nums px-3 py-3">{r.participants}</td>
                  <td className="nums px-3 py-3">{r.honoured}</td>
                  <td className="px-3 py-3">
                    {(r.branches ?? []).map((b) => (
                      <div key={b.en}>{t(b)}</div>
                    ))}
                  </td>
                  <td className="nums px-3 py-3">{t(r.prize)}</td>
                  <td className="px-3 py-3">
                    {(r.fields ?? []).map((b) => (
                      <div key={b.en}>{t(b)}</div>
                    ))}
                  </td>
                  <td className="px-3 py-3">{r.sponsor}</td>
                </tr>
              ))}
              <tr className="bg-secondary/50 font-semibold">
                <th scope="row" className="px-3 py-3 text-start">
                  {t(inl.t_1558b9f4)}
                </th>
                <td className="nums px-3 py-3">
                  {sponsorRows.reduce((n, r) => n + Number(r.participants || 0), 0)}
                </td>
                <td className="nums px-3 py-3">
                  {sponsorRows.reduce((n, r) => n + Number(r.honoured || 0), 0)}
                </td>
                <td className="px-3 py-3" />
                <td className="nums px-3 py-3">
                  {sponsorTotal ? t(sponsorTotal) : t(inl.t_7f87301d)}
                </td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Achiever Detail Dialog Modal ──────────────────────── */}
      <Dialog open={!!activeAchiever} onOpenChange={(open) => !open && setActiveAchiever(null)}>
        <DialogContent className="max-w-xl p-6 bg-card border-border">
          {activeAchiever ? (
            <div>
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary/60">
                  <SaudiCulturalAvatar
                    src={activeAchiever.image}
                    alt={t(activeAchiever.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-bronze dark:text-gold px-2.5 py-0.5 rounded-full bg-bronze/10 dark:bg-gold/10">
                    <Award className="w-3.5 h-3.5" />
                    {t(activeAchiever.field)}
                  </span>
                  <DialogTitle className="font-naskh text-xl md:text-2xl font-bold text-foreground">
                    {t(activeAchiever.name)}
                  </DialogTitle>
                  {activeAchiever.branch ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      {t(activeAchiever.branch)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {t(inl.t_42553b11)}
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground bg-secondary/40 p-3.5 rounded-md border border-border">
                    {t(activeAchiever.achievement)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActiveAchiever(null)}
                  className="text-xs"
                >
                  {t(inl.t_21250b81)}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* The nomination form itself now lives in the Requests Hub
          (`/requests?request=achiever_nomination`); the server function behind it
          is unchanged, so earlier nominations stay in the same inbox. */}

      {/* ── Nominations CTA section ──────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="text-xl text-foreground font-bold">{t(copy.nominateTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.nominateBody)}
            </p>
          </div>
          {/* Nominations are filed through the Requests Hub so every request on
              the site follows one submission, review and tracking path. */}
          <Link
            to="/requests"
            search={{ request: "excellence_award_application" }}
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-gold dark:text-ink" />
            {t(copy.nominateCta)}
          </Link>
        </div>
      </section>
    </>
  );
}
