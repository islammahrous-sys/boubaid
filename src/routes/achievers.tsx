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
import { getPublishedAchievers } from "@/lib/cms.functions";
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

const EXCELLENCE_CEREMONY_IMAGE =
  "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/official/excellence-award-ceremony.jpg";

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

const copy = {
  eyebrow: { ar: "سجل التميز", en: "Award" } as BiText,
  title: {
    ar: "جائزة آل بوعبيد للتفوق العلمي والتميز",
    en: "Al Bu Obaid Award for Academic Excellence and Distinction",
  } as BiText,
  subtitle: {
    ar: "جائزة تمنح للمميزين من أفراد الأسرة ذكوراً وإناثًا بمختلف مراحلهم الدراسية أو من هم على رأس العمل، في المجالات التالية:",
    en: "An award granted to distinguished family members, male and female, at every stage of study or in employment, in the following fields:",
  } as BiText,

  metaEntries: { ar: "عدد المقيدين", en: "Entries" } as BiText,
  metaFields: { ar: "الأعوام", en: "Years" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Last updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٨ هـ", en: "1448 AH" } as BiText,

  empty: {
    ar: "لا توجد سجلات مضافة في هذا القسم حالياً.",
    en: "No records have been added to this section yet.",
  } as BiText,

  colName: { ar: "الاسم", en: "Name" } as BiText,
  colAchievement: { ar: "التميز", en: "Distinction" } as BiText,
  competencies: { ar: "كفاءات افراد الاسرة", en: "Family Members’ Competencies" } as BiText,
  excellence: { ar: "جائزة التميز", en: "Excellence Award" } as BiText,

  nominateTitle: { ar: "الترشح لجائزة التميز", en: "Excellence Award Application" } as BiText,
  nominateBody: {
    ar: "يُفتح باب الترشح لجائزة التفوق العلمي والتميز المهني لأبناء وبنات الأسرة. ويجري القيد بعد اعتماد أمانة المجلس واللجان المختصة.",
    en: "Nominations for academic and professional distinction are open to family members. Additions are confirmed following approval by the Secretariat and relevant committees.",
  } as BiText,
  nominateCta: { ar: "تقديم ترشيح جديد", en: "Submit a nomination" } as BiText,
};

const AWARD_FIELDS: { text: BiText; sub?: BiText[] }[] = [
  { text: { ar: "حفظ القرآن الكريم كاملاً بشهادة معتمدة من جهة رسمية أو إجازة حفظ", en: "Memorising the entire Holy Qur'an, with a certificate from an official body or an ijazah" } },
  {
    text: { ar: "التميز العلمي وهو على النحو التالي:", en: "Academic excellence, as follows:" },
    sub: [
      { ar: "الدراسات العليا: الدكتوراه والماجستير", en: "Postgraduate studies: doctorate and master's" },
      { ar: "التخرج من المرحلة الجامعية بمعدل تراكمي 4.75 فما فوق", en: "University graduation with a cumulative GPA of 4.75 or above" },
    ],
  },
  { text: { ar: "الحصول على نسبة 90% في اختبار القدرات – الثالث ثانوي: الحصول على 90% في اختبار التحصيلي", en: "Scoring 90% in the Qudurat aptitude test – Grade 12: scoring 90% in the Tahsili achievement test" } },
  { text: { ar: "الحصول على جائزة محلية أو دولية في أي مجال علمي أو مهاري أو مهني", en: "Winning a local or international award in any academic, skills or professional field" } },
  { text: { ar: "الحصول على شهادة مهنية معتمدة", en: "Obtaining an accredited professional certificate" } },
];

const SPONSOR_HEAD: BiText[] = [
  { ar: "العام", en: "Year" },
  { ar: "عدد المشاركين", en: "Participants" },
  { ar: "المكرمين", en: "Honoured" },
  { ar: "فروع المسابقة", en: "Competition branches" },
  { ar: "قيمة الجوائز", en: "Prize value" },
  { ar: "فروع الفائزين", en: "Winners' fields" },
  { ar: "الرعاة والداعمين", en: "Sponsors & supporters" },
];

const br = (main: number, sub: number): BiText[] => [
  { ar: `${main} فروع رئيسة`, en: `${main} main branches` },
  { ar: `${sub} فروع فرعية`, en: `${sub} sub-branches` },
];
const F = {
  sci: { ar: "تميز علمي", en: "Academic distinction" },
  pro: { ar: "تميز مهني", en: "Professional distinction" },
  prize: { ar: "حصول على جائزة", en: "Award received" },
};
const sar = (n: string): BiText => ({ ar: `${n} ريال`, en: `SAR ${n}` });

const SPONSOR_ROWS = [
  { year: "1444", participants: 19, honoured: 7, branches: br(4, 3), prize: sar("8000"), fields: [F.sci, F.pro], sponsor: "ماهر بن أحمد بن إبراهيم" },
  { year: "1445", participants: 17, honoured: 5, branches: br(4, 3), prize: sar("6000"), fields: [F.sci, F.pro], sponsor: "عادل بن سعد بن علي بن صالح" },
  { year: "1446", participants: 15, honoured: 4, branches: br(3, 3), prize: sar("5000"), fields: [F.sci], sponsor: "عادل بن سعد بن علي بن صالح" },
  { year: "1447", participants: 18, honoured: 6, branches: br(3, 3), prize: sar("7000"), fields: [F.sci, F.pro, F.prize], sponsor: "عادل بن سعد بن علي بن صالح" },
];

function AchieversPage() {
  const { t, lang } = useLang();
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
    const ALLOWED = ["1448", "1447", "1446", "1445", "1444"];
    return [...groups.entries()]
      .filter(([year]) => ALLOWED.includes(year))
      .sort((a, b) => ALLOWED.indexOf(a[0]) - ALLOWED.indexOf(b[0]))
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
      toast.error(rtl ? "يرجى تعبئة الحقول المطلوبة" : "Please fill in required fields");
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
        toast.success(
          rtl ? "تم إرسال الترشيح بنجاح إلى أمانة المجلس" : "Nomination submitted successfully",
        );
      } else {
        toast.error(
          rtl ? "تعذر إرسال الترشيح، يرجى المحاولة لاحقاً" : "Failed to submit nomination",
        );
      }
    } catch {
      toast.error(rtl ? "حدث خطأ أثناء الإرسال" : "An error occurred");
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
            {rtl ? "مجالات الجائزة" : "Award fields"}
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
            {t({
              ar: "يُقيّد هذا السجل أصحاب التحصيل العلمي والمهني من أبناء وبنات الفروع السبعة. ويُحدَّث سنوياً عند حفل التكريم بالملتقى العام.",
              en: "This register records the academic and professional achievers among the sons and daughters of the seven branches, and is updated annually at the honours ceremony of the general assembly.",
            })}
          </p>
        </section>

        <section aria-labelledby="competencies-title">
          <Eyebrow>{rtl ? "القسم الأول" : "Section One"}</Eyebrow>
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
          <Eyebrow>{rtl ? "القسم الثاني" : "Section Two"}</Eyebrow>
          <h2
            id="excellence-title"
            className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl"
          >
            {t(copy.excellence)}
          </h2>
          <figure className="mt-6">
            <img
              src={EXCELLENCE_CEREMONY_IMAGE}
              alt={
                rtl
                  ? "تكريم أحد الفائزين بجائزة التميز في مجلس أسرة آل بوعبيد"
                  : "An Excellence Award recipient being honoured at the Al Bu Obaid Family Council"
              }
              width={1920}
              height={1280}
              loading="lazy"
              decoding="async"
              className="w-full rounded-md border border-border object-contain"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {rtl ? "من حفل تكريم جائزة التميز" : "From the Excellence Award ceremony"}
            </figcaption>
          </figure>
          <div className="mt-8 space-y-12">
            {!yearGroups.some((g) => g.year === "1448") ? (
              <section aria-labelledby="award-year-1448">
                <div className="flex items-center gap-4 border-b border-ink/25 pb-3 dark:border-ivory/20">
                  <h3 id="award-year-1448" className="nums text-xl font-bold text-bronze dark:text-gold">
                    {rtl ? "عام 1448هـ" : "Year 1448 AH"}
                  </h3>
                </div>
                <p className="py-5 text-sm text-muted-foreground">
                  {rtl ? "تُعلن أسماء المكرمين لعام 1448هـ بعد حفل التكريم." : "The 1448 AH honourees will be announced after the ceremony."}
                </p>
              </section>
            ) : null}
            {yearGroups.map(({ year, people }) => (
              <section key={year} aria-labelledby={`award-year-${year}`}>
                <div className="flex items-center gap-4 border-b border-ink/25 pb-3 dark:border-ivory/20">
                  <h3
                    id={`award-year-${year}`}
                    className="nums text-xl font-bold text-bronze dark:text-gold"
                  >
                    {year === ""
                      ? rtl
                        ? "بدون سنة محددة"
                        : "Year not specified"
                      : rtl
                        ? `عام ${year}هـ`
                        : `Year ${year} AH`}
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
        <Eyebrow>{rtl ? "جائزة التميز" : "Excellence Award"}</Eyebrow>
        <h2 id="sponsors-title" className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl">
          {rtl ? "الرعاة والداعمون" : "Supporters & Sponsors"}
        </h2>
        <div className="mt-6 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-secondary/60 text-foreground">
              <tr>
                {SPONSOR_HEAD.map((h) => (
                  <th key={h.en} scope="col" className="border-b border-border px-3 py-3 text-start font-semibold">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPONSOR_ROWS.map((r) => (
                <tr key={r.year} className="border-b border-border align-top">
                  <th scope="row" className="nums bg-secondary/30 px-3 py-3 text-start font-semibold">{r.year}</th>
                  <td className="nums px-3 py-3">{r.participants}</td>
                  <td className="nums px-3 py-3">{r.honoured}</td>
                  <td className="px-3 py-3">{r.branches.map((b) => <div key={b.en}>{t(b)}</div>)}</td>
                  <td className="nums px-3 py-3">{t(r.prize)}</td>
                  <td className="px-3 py-3">{r.fields.map((b) => <div key={b.en}>{t(b)}</div>)}</td>
                  <td className="px-3 py-3">{r.sponsor}</td>
                </tr>
              ))}
              <tr className="bg-secondary/50 font-semibold">
                <th scope="row" className="px-3 py-3 text-start">{rtl ? "المجموع" : "Total"}</th>
                <td className="nums px-3 py-3">{SPONSOR_ROWS.reduce((n, r) => n + r.participants, 0)}</td>
                <td className="nums px-3 py-3">{SPONSOR_ROWS.reduce((n, r) => n + r.honoured, 0)}</td>
                <td className="px-3 py-3" />
                <td className="nums px-3 py-3">{rtl ? "14000 ريال" : "SAR 14,000"}</td>
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
                    {rtl ? "التميز والإنجاز" : "Distinction & Recognition"}
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
                  {rtl ? "إغلاق" : "Close"}
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
