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
      { title: "سجل المتميزين | آل بوعبيد" },
      {
        name: "description",
        content:
          "كفاءات ومتميزو أسرة آل بوعبيد من أبنائها وبناتها في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:title", content: "سجل المتميزين — آل بوعبيد" },
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
  eyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  title: { ar: "سجل الشرف", en: "Roll of Honor" } as BiText,
  subtitle: {
    ar: "يقيّد هذا السجل أصحاب التحصيل العلمي والمهني من أبناء وبنات الفروع السبعة. ويُحدَّث سنوياً عند حفل التكريم بالملتقى العام.",
    en: "This register records the academic and professional achievements of the sons and daughters of the seven branches. It is updated each year at the honours ceremony of the general assembly.",
  } as BiText,

  metaEntries: { ar: "عدد المقيدين", en: "Entries" } as BiText,
  metaFields: { ar: "الأعوام", en: "Years" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Last updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  empty: {
    ar: "لا توجد سجلات مضافة في هذا القسم حالياً.",
    en: "No records have been added to this section yet.",
  } as BiText,

  colName: { ar: "الاسم", en: "Name" } as BiText,
  colAchievement: { ar: "التميز", en: "Distinction" } as BiText,
  competencies: { ar: "كفاءات افراد الاسرة", en: "Family Members’ Competencies" } as BiText,
  excellence: { ar: "جائزة التميز", en: "Excellence Award" } as BiText,

  nominateTitle: { ar: "الترشيح لسجل المتميزين", en: "Nominations" } as BiText,
  nominateBody: {
    ar: "يُفتح باب الترشح لجائزة التفوق العلمي والتميز المهني لأبناء وبنات الأسرة. ويجري القيد بعد اعتماد أمانة المجلس واللجان المختصة.",
    en: "Nominations for academic and professional distinction are open to family members. Additions are confirmed following approval by the Secretariat and relevant committees.",
  } as BiText,
  nominateCta: { ar: "تقديم ترشيح جديد", en: "Submit a nomination" } as BiText,
};

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
    return [...groups.entries()]
      .sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : Number(a[0]) - Number(b[0])))
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
        subtitle={t(copy.subtitle)}
        image={pageImages.achievers.header.src}
        imageCaption={t(pageImages.achievers.header.caption)}
        meta={[
          { label: t(copy.metaEntries), value: achievers.length.toString(), mono: true },
          { label: t(copy.metaFields), value: yearGroups.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-16 space-y-16">
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
                        ? `عام ${year}${year === "1446" ? "" : "هـ"}`
                        : `Year ${year}${year === "1446" ? "" : " AH"}`}
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
            search={{ request: "achiever_nomination" }}
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
