import { createFileRoute } from "@tanstack/react-router";
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

  const competencies = useMemo(() => achievers.filter((a) => a.section === "family_competency"), [achievers]);
  const excellence = useMemo(() => achievers.filter((a) => a.section === "excellence_award"), [achievers]);
  const yearGroups = useMemo(() => {
    const years = ["1444", "1445", "1446", "1447"];
    return years.map((year) => ({ year, people: excellence.filter((a) => a.awardYear === year).sort((a, b) => a.sortOrder - b.sortOrder) }));
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
          <h2 id="competencies-title" className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl">{t(copy.competencies)}</h2>
          <div className="mt-6 border-y border-border py-10 text-center">
            {competencies.length === 0 ? <p className="text-sm text-muted-foreground">{t(copy.empty)}</p> : null}
          </div>
        </section>

        <section aria-labelledby="excellence-title">
          <Eyebrow>{rtl ? "القسم الثاني" : "Section Two"}</Eyebrow>
          <h2 id="excellence-title" className="mt-3 font-naskh text-2xl font-bold text-foreground md:text-3xl">{t(copy.excellence)}</h2>
          <div className="mt-8 space-y-12">
            {yearGroups.map(({ year, people }) => (
              <section key={year} aria-labelledby={`award-year-${year}`}>
                <div className="flex items-center gap-4 border-b border-ink/25 pb-3 dark:border-ivory/20">
                  <h3 id={`award-year-${year}`} className="nums text-xl font-bold text-bronze dark:text-gold">
                    {rtl ? `عام ${year}${year === "1446" ? "" : "هـ"}` : `Year ${year}${year === "1446" ? "" : " AH"}`}
                  </h3>
                  <span className="nums text-xs text-muted-foreground">{people.length}</span>
                </div>
                <ol className="divide-y divide-border">
                  {people.map((person, index) => (
                    <li key={person.id} className="grid gap-2 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-6">
                      <span className="nums text-sm text-bronze/70 dark:text-gold/60">{String(index + 1).padStart(2, "0")}</span>
                      <button type="button" onClick={() => setActiveAchiever(person)} className="text-start font-naskh text-base font-bold text-foreground hover:text-bronze dark:hover:text-gold">
                        {t(person.name)}
                      </button>
                      <p className="text-sm leading-relaxed text-muted-foreground">{t(person.achievement)}</p>
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

      {/* ── Interactive Nomination Dialog Modal ───────────────── */}
      <Dialog
        open={nominationOpen}
        onOpenChange={(open) => {
          setNominationOpen(open);
          if (!open) {
            setSubmittedSuccess(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze dark:text-gold">
              <Sparkles className="w-4 h-4" />
              {rtl ? "جائزة التميز العائلي" : "Family Excellence Award"}
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {t(copy.nominateTitle)}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {rtl
                ? "يتم مراجعة كافة الترشيحات وتدقيقها من قبل أمانة المجلس واللجان لإدراجها في لوحة الشرف الرسمية."
                : "All nominations are reviewed and audited by the council secretariat before inclusion on the official honor roll."}
            </DialogDescription>
          </DialogHeader>

          {submittedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {rtl ? "تم استلام طلب الترشيح بنجاح" : "Nomination Received Successfully"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {rtl
                  ? "شكراً لمساهمتك في توثيق تميز أبناء وبنات الأسرة. سيتم مراجعة الطلب والتواصل مع مقدم الترشيح عند الحاجة."
                  : "Thank you for documenting our family achievers. The submission will be reviewed by the council secretariat."}
              </p>
              <Button
                type="button"
                onClick={() => {
                  setNominationOpen(false);
                  setSubmittedSuccess(false);
                }}
                className="mt-4"
              >
                {rtl ? "تم" : "Done"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleNominationSubmit} className="space-y-4 mt-2">
              <input
                type="text"
                name="website_url_check"
                value={formData.website_url_check}
                onChange={(e) => setFormData({ ...formData, website_url_check: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "اسم المرشح الكامل *" : "Nominee Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nominee_name}
                    onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                    placeholder={
                      rtl ? "د. محمد بن أحمد آل بوعبيد" : "e.g. Dr. Mohammed Al Bu Obaid"
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "الفرع العائلي" : "Family Branch"}
                  </label>
                  <select
                    value={formData.branch_slug}
                    onChange={(e) => setFormData({ ...formData, branch_slug: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">
                      {rtl ? "-- اختر الفرع (اختياري) --" : "-- Select Branch (Optional) --"}
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t(b.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "تصنيف التميز *" : "Category *"}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="academic">{rtl ? "أكاديمي وتعليمي" : "Academic"}</option>
                    <option value="medical">{rtl ? "طب وصحة" : "Medical & Health"}</option>
                    <option value="military">
                      {rtl ? "خدمة عسكرية ووطنية" : "Military & Defense"}
                    </option>
                    <option value="business">
                      {rtl ? "أعمال وابتكار وتقنية" : "Business & Tech"}
                    </option>
                    <option value="sports">{rtl ? "رياضة وبطولات" : "Sports"}</option>
                    <option value="other">{rtl ? "مجال آخر" : "Other Field"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "التخصص الدقيق / المسمى *" : "Field / Specialty *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    placeholder={
                      rtl ? "استشاري جراحة قلب / بروفيسور" : "e.g. Consultant Surgeon / Professor"
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "ملخص الإنجاز والتميز *" : "Achievement Summary *"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.achievement_summary}
                  onChange={(e) =>
                    setFormData({ ...formData, achievement_summary: e.target.value })
                  }
                  placeholder={
                    rtl
                      ? "اذكر تفاصيل الإنجاز، الشهادات، براءات الاختراع، أو التكريمات الرسمية…"
                      : "Provide details of the achievement, degree, award or distinction…"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "نبذة مختصرة عن المرشح (اختياري)" : "Short Biography (Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder={
                    rtl
                      ? "المسيرة العلمية والمهنية، المناصب، أبرز المحطات…"
                      : "Academic and professional path, positions, key milestones…"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "أسباب الترشيح (اختياري)" : "Reasons for the Nomination (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={formData.nomination_reason}
                  onChange={(e) => setFormData({ ...formData, nomination_reason: e.target.value })}
                  placeholder={
                    rtl
                      ? "لماذا يستحق المرشح الإدراج في سجل كفاءات ومتميزي الأسرة؟"
                      : "Why should the nominee be added to the register of achievers?"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl
                    ? "إرفاق الشهادات (خبرة / تقدير / تدريب / تخرج)"
                    : "Attach Certificates (experience / recognition / training / graduation)"}
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    addAttachments(e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground file:me-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {rtl
                    ? "PDF أو صورة، حتى ٦ ملفات، وبحد أقصى ١٠ ميغابايت للملف."
                    : "PDF or image, up to 6 files, 10 MB each."}
                </p>
                {attachments.length > 0 && (
                  <ul className="space-y-1">
                    {attachments.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between gap-2 rounded border border-border bg-secondary/40 px-2 py-1 text-[11px]"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, x) => x !== i))}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={rtl ? "إزالة" : "Remove"}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl
                    ? "أو رابط الشهادات / السيرة الذاتية (اختياري)"
                    : "Or a Certificates / CV Link (Optional)"}
                </label>
                <input
                  type="url"
                  value={formData.evidence_url}
                  onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground">
                  {rtl ? "بيانات مقدم الترشيح" : "Nominator Contact Info"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={rtl ? "اسمك الكامل *" : "Your Name *"}
                    value={formData.nominator_name}
                    onChange={(e) => setFormData({ ...formData, nominator_name: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder={rtl ? "رقم الجوال * (05xxxxxxx)" : "Mobile Phone *"}
                    value={formData.nominator_phone}
                    onChange={(e) => setFormData({ ...formData, nominator_phone: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder={rtl ? "البريد الإلكتروني" : "Email"}
                    value={formData.nominator_email}
                    onChange={(e) => setFormData({ ...formData, nominator_email: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNominationOpen(false)}
                  className="text-xs"
                >
                  {rtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs font-bold gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting
                    ? rtl
                      ? "جاري الإرسال…"
                      : "Submitting…"
                    : rtl
                      ? "إرسال الترشيح"
                      : "Submit Nomination"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Nominations CTA section ──────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="text-xl text-foreground font-bold">{t(copy.nominateTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.nominateBody)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNominationOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-gold dark:text-ink" />
            {t(copy.nominateCta)}
          </button>
        </div>
      </section>
    </>
  );
}
