import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { ZodTypeAny } from "zod";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import {
  getCmsOverview,
  upsertCmsRow,
  setCmsPublished,
  deleteCmsRow,
  uploadContentMedia,
  type CmsOverview,
} from "@/lib/cms.functions";
import {
  newsInputSchema,
  initiativeInputSchema,
  achieverInputSchema,
  libraryInputSchema,
  branchInputSchema,
  type CmsTable,
} from "@/lib/cms.schemas";

export const Route = createFileRoute("/_authenticated/content")({
  head: () => ({
    meta: [
      { title: "منصة المحتوى | آل بوعبيد" },
      {
        name: "description",
        content: "منصة الأمانة لإدارة الأخبار والمبادرات والمتميزين والمكتبة والفروع.",
      },
      { property: "og:title", content: "منصة المحتوى | آل بوعبيد" },
      { property: "og:description", content: "إدارة محتوى الموقع للأمانة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContentPage,
});

/* --------------------------- field configuration --------------------------- */

type FieldKind = "text" | "textarea" | "select" | "number" | "checkbox" | "media";

type FieldConfig = {
  name: string;
  ar: string;
  en: string;
  kind: FieldKind;
  options?: { value: string; ar: string; en: string }[];
};

type TabConfig = {
  key: CmsTable;
  ar: string;
  en: string;
  dataKey: keyof CmsOverview;
  schema: ZodTypeAny;
  fields: FieldConfig[];
  titleOf: (row: Record<string, unknown>) => string;
  subtitleOf?: (row: Record<string, unknown>) => string;
  emptyValues: Record<string, unknown>;
};

const TABS: TabConfig[] = [
  {
    key: "news_posts",
    ar: "الأخبار",
    en: "News",
    dataKey: "news",
    schema: newsInputSchema,
    titleOf: (r) => String(r.title_ar ?? ""),
    subtitleOf: (r) => String(r.slug ?? ""),
    emptyValues: {
      slug: "",
      section: "fund",
      title_ar: "",
      title_en: "",
      excerpt_ar: "",
      excerpt_en: "",
      body_ar: "",
      body_en: "",
      hijri_date: "",
      gregorian_date: "",
      cover_path: "",
      is_published: false,
      sort_order: 0,
    },
    fields: [
      { name: "slug", ar: "المعرف (slug)", en: "Slug", kind: "text" },
      {
        name: "section",
        ar: "القسم",
        en: "Section",
        kind: "select",
        options: [
          { value: "fund", ar: "الصندوق", en: "Fund" },
          { value: "family", ar: "العائلة", en: "Family" },
        ],
      },
      { name: "title_ar", ar: "العنوان (عربي)", en: "Title (Arabic)", kind: "text" },
      { name: "title_en", ar: "العنوان (إنجليزي)", en: "Title (English)", kind: "text" },
      { name: "excerpt_ar", ar: "مقتطف (عربي)", en: "Excerpt (Arabic)", kind: "textarea" },
      { name: "excerpt_en", ar: "مقتطف (إنجليزي)", en: "Excerpt (English)", kind: "textarea" },
      { name: "body_ar", ar: "النص (عربي)", en: "Body (Arabic)", kind: "textarea" },
      { name: "body_en", ar: "النص (إنجليزي)", en: "Body (English)", kind: "textarea" },
      { name: "hijri_date", ar: "التاريخ الهجري", en: "Hijri date", kind: "text" },
      { name: "gregorian_date", ar: "التاريخ الميلادي", en: "Gregorian date", kind: "text" },
      { name: "cover_path", ar: "صورة الغلاف", en: "Cover image", kind: "media" },
      { name: "sort_order", ar: "الترتيب", en: "Sort order", kind: "number" },
    ],
  },
  {
    key: "initiatives",
    ar: "المبادرات",
    en: "Initiatives",
    dataKey: "initiatives",
    schema: initiativeInputSchema,
    titleOf: (r) => String(r.title_ar ?? ""),
    subtitleOf: (r) => String(r.slug ?? ""),
    emptyValues: {
      slug: "",
      status: "ongoing",
      title_ar: "",
      title_en: "",
      summary_ar: "",
      summary_en: "",
      body_ar: "",
      body_en: "",
      cover_path: "",
      is_published: false,
      sort_order: 0,
    },
    fields: [
      { name: "slug", ar: "المعرف (slug)", en: "Slug", kind: "text" },
      {
        name: "status",
        ar: "الحالة",
        en: "Status",
        kind: "select",
        options: [
          { value: "ongoing", ar: "جارية", en: "Ongoing" },
          { value: "planned", ar: "مخطَّطة", en: "Planned" },
          { value: "completed", ar: "منتهية", en: "Completed" },
        ],
      },
      { name: "title_ar", ar: "العنوان (عربي)", en: "Title (Arabic)", kind: "text" },
      { name: "title_en", ar: "العنوان (إنجليزي)", en: "Title (English)", kind: "text" },
      { name: "summary_ar", ar: "ملخص (عربي)", en: "Summary (Arabic)", kind: "textarea" },
      { name: "summary_en", ar: "ملخص (إنجليزي)", en: "Summary (English)", kind: "textarea" },
      { name: "body_ar", ar: "النص (عربي)", en: "Body (Arabic)", kind: "textarea" },
      { name: "body_en", ar: "النص (إنجليزي)", en: "Body (English)", kind: "textarea" },
      { name: "cover_path", ar: "صورة الغلاف", en: "Cover image", kind: "media" },
      { name: "sort_order", ar: "الترتيب", en: "Sort order", kind: "number" },
    ],
  },
  {
    key: "achievers",
    ar: "المتميزون",
    en: "Achievers",
    dataKey: "achievers",
    schema: achieverInputSchema,
    titleOf: (r) => String(r.name_ar ?? ""),
    subtitleOf: (r) => String(r.category ?? ""),
    emptyValues: {
      name_ar: "",
      name_en: "",
      field_ar: "",
      field_en: "",
      achievement_ar: "",
      achievement_en: "",
      category: "academic",
      branch_ar: "",
      branch_en: "",
      image_path: "",
      is_published: false,
      sort_order: 0,
    },
    fields: [
      { name: "name_ar", ar: "الاسم (عربي)", en: "Name (Arabic)", kind: "text" },
      { name: "name_en", ar: "الاسم (إنجليزي)", en: "Name (English)", kind: "text" },
      { name: "field_ar", ar: "المجال (عربي)", en: "Field (Arabic)", kind: "text" },
      { name: "field_en", ar: "المجال (إنجليزي)", en: "Field (English)", kind: "text" },
      {
        name: "achievement_ar",
        ar: "الإنجاز (عربي)",
        en: "Achievement (Arabic)",
        kind: "textarea",
      },
      {
        name: "achievement_en",
        ar: "الإنجاز (إنجليزي)",
        en: "Achievement (English)",
        kind: "textarea",
      },
      {
        name: "category",
        ar: "التصنيف",
        en: "Category",
        kind: "select",
        options: [
          { value: "academic", ar: "أكاديمي", en: "Academic" },
          { value: "military", ar: "عسكري", en: "Military" },
          { value: "business", ar: "أعمال", en: "Business" },
          { value: "civic", ar: "مجتمعي", en: "Civic" },
          { value: "medical", ar: "طبي", en: "Medical" },
          { value: "other", ar: "أخرى", en: "Other" },
        ],
      },
      { name: "branch_ar", ar: "الفرع (عربي)", en: "Branch (Arabic)", kind: "text" },
      { name: "branch_en", ar: "الفرع (إنجليزي)", en: "Branch (English)", kind: "text" },
      { name: "image_path", ar: "الصورة", en: "Image", kind: "media" },
      { name: "sort_order", ar: "الترتيب", en: "Sort order", kind: "number" },
    ],
  },
  {
    key: "library_items",
    ar: "المكتبة",
    en: "Library",
    dataKey: "library",
    schema: libraryInputSchema,
    titleOf: (r) => String(r.title_ar ?? ""),
    subtitleOf: (r) => String(r.collection ?? ""),
    emptyValues: {
      collection: "documents",
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      year: "",
      kind: "",
      reference: "",
      file_path: "",
      external_url: "",
      is_published: false,
      sort_order: 0,
    },
    fields: [
      {
        name: "collection",
        ar: "المجموعة",
        en: "Collection",
        kind: "select",
        options: [
          { value: "documents", ar: "وثائق", en: "Documents" },
          { value: "publications", ar: "إصدارات", en: "Publications" },
          { value: "media", ar: "وسائط", en: "Media" },
        ],
      },
      { name: "title_ar", ar: "العنوان (عربي)", en: "Title (Arabic)", kind: "text" },
      { name: "title_en", ar: "العنوان (إنجليزي)", en: "Title (English)", kind: "text" },
      {
        name: "description_ar",
        ar: "الوصف (عربي)",
        en: "Description (Arabic)",
        kind: "textarea",
      },
      {
        name: "description_en",
        ar: "الوصف (إنجليزي)",
        en: "Description (English)",
        kind: "textarea",
      },
      { name: "year", ar: "السنة (هجري)", en: "Year (Hijri)", kind: "number" },
      { name: "kind", ar: "النوع", en: "Kind", kind: "text" },
      { name: "reference", ar: "المرجع", en: "Reference", kind: "text" },
      { name: "file_path", ar: "الملف", en: "File", kind: "media" },
      { name: "external_url", ar: "رابط خارجي", en: "External URL", kind: "text" },
      { name: "sort_order", ar: "الترتيب", en: "Sort order", kind: "number" },
    ],
  },
  {
    key: "branches",
    ar: "الفروع",
    en: "Branches",
    dataKey: "branches",
    schema: branchInputSchema,
    titleOf: (r) => String(r.name_ar ?? ""),
    subtitleOf: (r) => String(r.slug ?? ""),
    emptyValues: {
      slug: "",
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      elder_ar: "",
      elder_en: "",
      image_path: "",
      is_published: false,
      sort_order: 0,
    },
    fields: [
      { name: "slug", ar: "المعرف (slug)", en: "Slug", kind: "text" },
      { name: "name_ar", ar: "الاسم (عربي)", en: "Name (Arabic)", kind: "text" },
      { name: "name_en", ar: "الاسم (إنجليزي)", en: "Name (English)", kind: "text" },
      {
        name: "description_ar",
        ar: "الوصف (عربي)",
        en: "Description (Arabic)",
        kind: "textarea",
      },
      {
        name: "description_en",
        ar: "الوصف (إنجليزي)",
        en: "Description (English)",
        kind: "textarea",
      },
      { name: "elder_ar", ar: "شيخ الفرع (عربي)", en: "Elder (Arabic)", kind: "text" },
      { name: "elder_en", ar: "شيخ الفرع (إنجليزي)", en: "Elder (English)", kind: "text" },
      { name: "image_path", ar: "الصورة", en: "Image", kind: "media" },
      { name: "sort_order", ar: "الترتيب", en: "Sort order", kind: "number" },
    ],
  },
];

const ERROR_MESSAGES: Record<string, { ar: string; en: string }> = {
  duplicate_slug: {
    ar: "هذا المعرف (slug) مستخدم من قبل. اختر معرفًا مختلفًا.",
    en: "That slug is already in use. Choose a different one.",
  },
  insert_failed: { ar: "تعذر إضافة العنصر.", en: "We couldn't create that item." },
  update_failed: { ar: "تعذر تحديث العنصر.", en: "We couldn't update that item." },
  delete_failed: { ar: "تعذر حذف العنصر.", en: "We couldn't delete that item." },
};

/* -------------------------------- component -------------------------------- */

function ContentPage() {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<CmsTable>("news_posts");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchOverview = useServerFn(getCmsOverview);
  const upsert = useServerFn(upsertCmsRow);
  const publish = useServerFn(setCmsPublished);
  const remove = useServerFn(deleteCmsRow);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-overview"],
    queryFn: () => fetchOverview(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cms-overview"] });

  const publishMutation = useMutation({
    mutationFn: (input: { table: CmsTable; id: string; is_published: boolean }) =>
      publish({ data: input }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(label("تم تحديث حالة النشر.", "Publish status updated."));
        void invalidate();
      } else {
        const msg = ERROR_MESSAGES[result.error];
        toast.error(msg ? label(msg.ar, msg.en) : label("تعذر التحديث.", "Update failed."));
      }
    },
    onError: () => toast.error(label("تعذر التحديث.", "Update failed.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (input: { table: CmsTable; id: string }) => remove({ data: input }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(label("تم حذف العنصر.", "Item deleted."));
        void invalidate();
      } else {
        const msg = ERROR_MESSAGES[result.error];
        toast.error(msg ? label(msg.ar, msg.en) : label("تعذر الحذف.", "Delete failed."));
      }
    },
    onError: () => toast.error(label("تعذر الحذف.", "Delete failed.")),
  });

  const activeTab = useMemo(() => TABS.find((t) => t.key === tab)!, [tab]);
  const rows = (data?.[activeTab.dataKey] as Record<string, unknown>[] | undefined) ?? [];

  if (isLoading) {
    return (
      <div className="container-page py-24 text-sm text-muted-foreground">
        {label("جارٍ التحقق…", "Checking access…")}
      </div>
    );
  }

  if (data && !data.canEdit) {
    return (
      <div className="container-page py-24">
        <h1 className="text-2xl font-bold text-foreground">
          {label(
            "هذه المنصة لأمانة المجلس والمحررين",
            "This console is for the secretariat and editors",
          )}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {label(
            "حسابك لا يملك صلاحية تحرير المحتوى. تواصل مع الأمانة إذا كنت تحتاج هذه الصلاحية.",
            "Your account doesn't have content-editing permission. Contact the secretariat if you need access.",
          )}
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
        >
          {label("العودة إلى لوحة الأمانة", "Back to council console")}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("إدارة المحتوى", "Content management")}
        title={label("منصة المحتوى", "Content console")}
        subtitle={label(
          "إدارة الأخبار والمبادرات والمتميزين والمكتبة والفروع، ونشرها أو حفظها كمسودة.",
          "Manage news, initiatives, achievers, library items, and branches — publish or keep as drafts.",
        )}
        actions={
          <Link
            to="/admin"
            className="border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
          >
            {label("لوحة الأمانة", "Council console")}
          </Link>
        }
      />

      <section className="container-page mt-10">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {TABS.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => {
                setTab(tb.key);
                setShowForm(false);
                setEditing(null);
              }}
              className={`border px-4 py-2 text-[13px] font-medium transition-colors ${
                tab === tb.key
                  ? "border-gold bg-gold text-ink"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {label(tb.ar, tb.en)}
              <span className="nums ms-2 font-mono text-[11px] opacity-70">
                {(data?.[tb.dataKey] as unknown[] | undefined)?.length ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="border border-gold bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold"
          >
            {label("+ إضافة عنصر جديد", "+ Add new item")}
          </button>
        </div>

        {showForm ? (
          <CmsForm
            key={`${activeTab.key}-${(editing?.id as string) ?? "new"}`}
            config={activeTab}
            initial={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            upsert={upsert}
            onSaved={() => {
              setShowForm(false);
              setEditing(null);
              void invalidate();
            }}
          />
        ) : null}

        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <li
              key={row.id as string}
              className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-foreground">{activeTab.titleOf(row)}</p>
                  <span
                    className={`label-caps text-[10px] ${
                      row.is_published
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-bronze dark:text-gold"
                    }`}
                  >
                    {row.is_published ? label("منشور", "Published") : label("مسودة", "Draft")}
                  </span>
                </div>
                {activeTab.subtitleOf ? (
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {activeTab.subtitleOf(row)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    publishMutation.mutate({
                      table: activeTab.key,
                      id: row.id as string,
                      is_published: !row.is_published,
                    })
                  }
                  disabled={publishMutation.isPending}
                  className="border border-border px-3 py-1.5 text-[12px] hover:bg-secondary disabled:opacity-60"
                >
                  {row.is_published ? label("إلغاء النشر", "Unpublish") : label("نشر", "Publish")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(row);
                    setShowForm(true);
                  }}
                  className="border border-border px-3 py-1.5 text-[12px] hover:bg-secondary"
                >
                  {label("تعديل", "Edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = window.confirm(
                      label("هل تريد حذف هذا العنصر نهائيًا؟", "Delete this item permanently?"),
                    );
                    if (ok) deleteMutation.mutate({ table: activeTab.key, id: row.id as string });
                  }}
                  disabled={deleteMutation.isPending}
                  className="border border-destructive/50 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/10 disabled:opacity-60"
                >
                  {label("حذف", "Delete")}
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              {label("لا توجد عناصر في هذا القسم بعد.", "No items in this section yet.")}
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

/* ----------------------------------- form ----------------------------------- */

function CmsForm({
  config,
  initial,
  onCancel,
  onSaved,
  upsert,
}: {
  config: TabConfig;
  initial: Record<string, unknown> | null;
  onCancel: () => void;
  onSaved: () => void;
  upsert: ReturnType<typeof useServerFn<typeof upsertCmsRow>>;
}) {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...config.emptyValues,
    ...(initial ?? {}),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues({ ...config.emptyValues, ...(initial ?? {}) });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key, initial?.id]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      upsert({ data: { table: config.key, values: payload } as never }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          initial
            ? label("تم تحديث العنصر.", "Item updated.")
            : label("تم إنشاء العنصر.", "Item created."),
        );
        onSaved();
      } else {
        const msg = ERROR_MESSAGES[result.error];
        toast.error(msg ? label(msg.ar, msg.en) : label("تعذر الحفظ.", "Save failed."));
      }
    },
    onError: () => toast.error(label("تعذر الحفظ.", "Save failed.")),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const raw: Record<string, unknown> = { ...values };
    if (initial?.id) raw.id = initial.id;
    // normalize numeric fields
    for (const field of config.fields) {
      if (field.kind === "number") {
        const v = raw[field.name];
        if (v === "" || v === null || v === undefined) {
          raw[field.name] = field.name === "year" ? undefined : 0;
        } else {
          raw[field.name] = Number(v);
        }
      }
    }
    const parsed = config.schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error(label("تحقق من الحقول المطلوبة.", "Please check the required fields."));
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data as Record<string, unknown>);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 border border-border bg-card p-6 reveal-fade"
    >
      <h2 className="text-lg font-bold text-foreground">
        {initial
          ? label(`تعديل: ${config.ar}`, `Edit: ${config.en}`)
          : label(`إضافة إلى: ${config.ar}`, `New in: ${config.en}`)}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.name} className={field.kind === "textarea" ? "sm:col-span-2" : ""}>
            <label
              htmlFor={`f-${field.name}`}
              className="label-caps mb-1.5 block text-muted-foreground"
            >
              {label(field.ar, field.en)}
            </label>
            {field.kind === "media" ? (
              <MediaField
                id={`f-${field.name}`}
                folder={config.key}
                value={String(values[field.name] ?? "")}
                onChange={(next) => setValues((v) => ({ ...v, [field.name]: next }))}
              />
            ) : field.kind === "textarea" ? (
              <textarea
                id={`f-${field.name}`}
                rows={4}
                value={String(values[field.name] ?? "")}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
              />
            ) : field.kind === "select" ? (
              <select
                id={`f-${field.name}`}
                value={String(values[field.name] ?? "")}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {label(opt.ar, opt.en)}
                  </option>
                ))}
              </select>
            ) : field.kind === "number" ? (
              <input
                id={`f-${field.name}`}
                type="number"
                value={
                  values[field.name] === null || values[field.name] === undefined
                    ? ""
                    : String(values[field.name])
                }
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
              />
            ) : (
              <input
                id={`f-${field.name}`}
                type="text"
                value={String(values[field.name] ?? "")}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
              />
            )}
            {errors[field.name] ? (
              <p className="mt-1 text-[12px] text-destructive">{errors[field.name]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={Boolean(values.is_published)}
          onChange={(e) => setValues((v) => ({ ...v, is_published: e.target.checked }))}
        />
        <span>{label("نشر مباشرة", "Publish immediately")}</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
        >
          {mutation.isPending ? label("جارٍ الحفظ…", "Saving…") : label("حفظ", "Save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-border px-5 py-2.5 text-[13px] font-medium hover:bg-secondary"
        >
          {label("إلغاء", "Cancel")}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------ media field -------------------------------- */

const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf";

/**
 * Uploads the chosen file to the private `content` bucket and stores the
 * returned storage path in the row. The path stays editable by hand so an
 * editor can also point at a file that already lives in `/public`.
 */
function MediaField({
  id,
  folder,
  value,
  onChange,
}: {
  id: string;
  folder: CmsTable;
  value: string;
  onChange: (next: string) => void;
}) {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const upload = useServerFn(uploadContentMedia);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buffer.length; i += 8192) {
        binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
      }
      const result = await upload({
        data: {
          folder,
          fileName: file.name,
          contentType: file.type,
          dataBase64: btoa(binary),
        },
      });
      if (result.ok) {
        onChange(result.path);
        toast.success(label("تم رفع الملف.", "File uploaded."));
      } else {
        toast.error(
          result.error === "forbidden"
            ? label("لا تملك صلاحية الرفع.", "You are not allowed to upload.")
            : label("تعذر رفع الملف.", "Upload failed."),
        );
      }
    } catch {
      toast.error(label("تعذر رفع الملف.", "Upload failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label("مسار الملف أو رابط داخلي", "Storage path or internal URL")}
        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
      />
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={MEDIA_ACCEPT}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
          className="text-[12px] text-muted-foreground"
        />
        {busy ? (
          <span className="text-[12px] text-muted-foreground">
            {label("جارٍ الرفع…", "Uploading…")}
          </span>
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[12px] text-destructive underline"
          >
            {label("إزالة", "Remove")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
