import { useState, useMemo, useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Globe,
  ArrowUp,
  ArrowDown,
  Edit2,
  Eye,
  EyeOff,
  Sparkles,
  Layout,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";

export type HomepageSectionConfig = {
  id: string;
  name_ar: string;
  name_en: string;
  enabled: boolean;
  order: number;
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  badge_ar?: string;
  badge_en?: string;
  cta_label_ar?: string;
  cta_label_en?: string;
  cta_url?: string;
  image_path?: string;
  custom_payload?: Record<string, any>;
};

const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionConfig[] = [
  {
    id: "hero",
    name_ar: "الراية الرئيسية والترحاب (Hero)",
    name_en: "Main Hero Banner",
    enabled: true,
    order: 1,
    title_ar: "أواصر",
    title_en: "Awaser",
    subtitle_ar:
      "منصة الأسرة المتكاملة لجمع الشمل، توثيق التاريخ، تنمية الأصول، ودعم المبادرات التنموية",
    subtitle_en:
      "The family’s integrated platform for strengthening kinship, documenting history, growing assets, and supporting development initiatives.",
    badge_ar: "مجلس أسرة آل بوعبيد — نصل الأرحام، نحفظ التاريخ، ونعظّم النماء",
    badge_en: "Al Bu Obaid Family Council — Gathered roots, growing legacy",
    cta_label_ar: "استكشف شجرة الأسرة",
    cta_label_en: "Explore Family Tree",
    cta_url: "/family-tree",
  },
  {
    id: "about_dean",
    name_ar: "كلمة عميد الأسرة ومجلس الأمناء",
    name_en: "Family Dean & Board Address",
    enabled: true,
    order: 2,
    title_ar: "كلمة عمادة الأسرة ومجلس الأمناء",
    title_en: "Dean & Board of Trustees Address",
    subtitle_ar: "رسالة العطاء والتكاتف وصلة الرحم الممتدة عبر الأجيال.",
    subtitle_en: "A message of unity, compassion, and shared heritage across generations.",
  },
  {
    id: "vision_mission",
    name_ar: "الرؤية والرسالة والقيم",
    name_en: "Vision, Mission & Values",
    enabled: true,
    order: 3,
    title_ar: "الرؤية والرسالة والقيم المؤسسية",
    title_en: "Vision, Mission & Core Values",
  },
  {
    id: "family_tree_home",
    name_ar: "المشجرة الإلكترونية واللوحة الرسمية",
    name_en: "Electronic Family Tree & Official Plate",
    enabled: true,
    order: 4,
    title_ar: "الفروع امتداد الجذور",
    title_en: "The Branches Extend the Roots",
  },
  {
    id: "initiatives_hq",
    name_ar: "المبادرات والمقر الدائم",
    name_en: "Initiatives & Permanent HQ",
    enabled: true,
    order: 5,
    title_ar: "مشروع المقر الدائم والمبادرات",
    title_en: "Flagship Permanent HQ & Initiatives",
    subtitle_ar: "مشاريع تنموية، صناديق تكافلية، ومقر جامع للمناسبات واللقاءات.",
    subtitle_en: "Development programs, social funds, and central assembly headquarters.",
    cta_label_ar: "تفاصيل المبادرات",
    cta_label_en: "View Initiatives",
    cta_url: "/initiatives",
  },
  {
    id: "latest_news",
    name_ar: "أحدث الأخبار والمقالات",
    name_en: "Latest News & Articles",
    enabled: true,
    order: 6,
    title_ar: "المركز الإعلامي وأخبار المجلس",
    title_en: "Media Center & Council News",
    subtitle_ar: "تغطية شاملة للمناسبات، القرارات، والإنجازات الأسرية.",
    subtitle_en: "Comprehensive coverage of council updates and family achievements.",
    cta_label_ar: "أرشيف الأخبار",
    cta_label_en: "News Archive",
    cta_url: "/news",
  },
  {
    id: "heritage_gallery",
    name_ar: "الأرشيف والصور التراثية",
    name_en: "Heritage & Photo Archive",
    enabled: true,
    order: 7,
    title_ar: "معرض التراث والوثائق التاريخية",
    title_en: "Historic Heritage & Archive Gallery",
    subtitle_ar: "مقتنيات نادرة، صور تاريخية، ومخطوطات توثق مسيرة الأسرة.",
    subtitle_en: "Rare manuscripts and vintage photographs documenting our legacy.",
    cta_label_ar: "المكتبة الرقمية",
    cta_label_en: "Digital Library",
    cta_url: "/library",
  },
  {
    id: "contact_inquiry",
    name_ar: "قنوات التواصل وصندوق المقترحات",
    name_en: "Contact & Secretariat Inquiries",
    enabled: true,
    order: 8,
    title_ar: "تواصل مع لجان مجلس الأسرة",
    title_en: "Contact the Family Council Committees",
    subtitle_ar: "اختر اللجنة المختصة وقدّم طلبك مباشرة ليصل إلى مسار المتابعة المناسب.",
    subtitle_en:
      "Choose the relevant committee and submit your request directly to the proper review path.",
    cta_label_ar: "إرسال طلب",
    cta_label_en: "Send a Request",
    cta_url: "/requests#committee-requests",
  },
];

// Both `upcoming_events` and `heritage_gallery` now have real render branches
// in src/routes/index.tsx (upcoming_events pulls from `events` via
// getPublishedEvents; heritage_gallery pulls from `galleries` +
// `gallery_media` + `media_assets`), so nothing is flagged as unimplemented
// here any more. Kept as an (empty) set rather than removing the mechanism
// entirely, in case a future section genuinely can't be wired up yet.
const UNIMPLEMENTED_SECTION_IDS = new Set<string>([]);

/**
 * Sections the public home page no longer renders. A saved configuration may
 * still list them (their records stay in the database), but offering a toggle
 * for something that cannot appear would be a dead control, so they are
 * dropped from the manager. Keep in sync with RETIRED_HOME_SECTIONS in
 * routes/index.tsx.
 */
const RETIRED_SECTION_IDS = new Set([
  "seven_branches",
  "branches",
  "dna_preview",
  "dna",
  "family_achievers",
  "achievers",
  "upcoming_events",
  "events",
  "poem_proposal",
  "initiatives_list",
  "programmes",
]);

/** Sections the home page always carries; if a saved configuration predates
 *  them they are added back (enabled) beside their neighbour so the admin can
 *  now see, reorder and hide them. */
const REQUIRED_SECTIONS: { id: string; after: string }[] = [
  { id: "vision_mission", after: "about_dean" },
  { id: "family_tree_home", after: "vision_mission" },
];

function normalizeSections(saved: HomepageSectionConfig[]): HomepageSectionConfig[] {
  const list = [...saved]
    .filter((s) => !RETIRED_SECTION_IDS.has(s.id))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const req of REQUIRED_SECTIONS) {
    if (list.some((s) => s.id === req.id)) continue;
    const def = DEFAULT_HOMEPAGE_SECTIONS.find((d) => d.id === req.id);
    if (!def) continue;
    const anchor = list.findIndex((s) => s.id === req.after);
    list.splice(anchor >= 0 ? anchor + 1 : list.length, 0, { ...def, enabled: true });
  }
  return list.map((s, i) => ({ ...s, order: i + 1 }));
}

export function HomepageManager({
  initialSettings,
  onSaveSettings,
}: {
  initialSettings?: any[];
  onSaveSettings: (data: SiteSettingInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  // Parse saved sections from site_settings or fallback to default
  const savedConfig = useMemo(() => {
    const found = (initialSettings ?? []).find((s) => s.key === "homepage_sections_config");
    if (found?.value?.sections && Array.isArray(found.value.sections)) {
      return normalizeSections(found.value.sections as HomepageSectionConfig[]);
    }
    return DEFAULT_HOMEPAGE_SECTIONS;
  }, [initialSettings]);

  const [sections, setSections] = useState<HomepageSectionConfig[]>(savedConfig);
  const [editingSection, setEditingSection] = useState<HomepageSectionConfig | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // `initialSettings` loads asynchronously — if this component mounts before
  // that query resolves, `sections` freezes on the hardcoded defaults forever
  // (useState's initializer only runs once). Re-derive once real data arrives.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!initialSettings || initialSettings.length === 0) return;
    hydratedRef.current = true;
    setSections(savedConfig);
  }, [initialSettings, savedConfig]);

  const handleToggleSection = async (sectionId: string, enabled: boolean) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, enabled } : s));
    setSections(updated);
    await persistSections(updated);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    // re-assign orders
    const normalized = updated.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(normalized);
    await persistSections(normalized);
  };

  const persistSections = async (list: HomepageSectionConfig[]) => {
    try {
      setSaving(true);
      await onSaveSettings({
        category: "cms_homepage",
        key: "homepage_sections_config",
        value: { sections: list, updated_at: new Date().toISOString() },
        is_public: true,
      });
      toast.success(
        isAr ? "تم تحديث ترتيب وإعدادات أقسام الرئيسية بنجاح" : "Homepage configuration saved",
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (sec: HomepageSectionConfig) => {
    setEditingSection({ ...sec });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    const updated = sections.map((s) => (s.id === editingSection.id ? editingSection : s));
    setSections(updated);
    setEditModalOpen(false);
    await persistSections(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              {isAr ? "إدارة أقسام وترتيب الصفحة الرئيسية" : "Homepage Section & Layout Manager"}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "تحكم كامل في ترتيب الأقسام الظاهرة على واجهة الموقع، تفعيلها أو إخفائها، وتعديل نصوصها وروابطها."
              : "Full control over public homepage section ordering, visibility toggles, headlines, and call-to-actions."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <a href="/" target="_blank" rel="noreferrer">
              <Eye className="w-3.5 h-3.5" />
              <span>{isAr ? "معاينة الواجهة" : "Live Preview"}</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5">
        {sections.map((sec, index) => (
          <div
            key={sec.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
              sec.enabled
                ? "bg-card border-border hover:border-primary/40 shadow-xs"
                : "bg-muted/20 border-border/40 opacity-60"
            }`}
          >
            {/* Left: Section details */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold font-mono text-xs text-primary shrink-0">
                {index + 1}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-foreground truncate">
                    {isAr ? sec.name_ar : sec.name_en}
                  </h4>
                  <Badge
                    variant={sec.enabled ? "secondary" : "outline"}
                    className="text-[10px] shrink-0 font-mono"
                  >
                    {sec.enabled ? (isAr ? "مفعّل" : "Active") : isAr ? "معطّل" : "Hidden"}
                  </Badge>
                  {UNIMPLEMENTED_SECTION_IDS.has(sec.id) && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] shrink-0"
                      title={
                        isAr
                          ? "هذا القسم غير مطبق بعد في الواجهة العامة — التعديل هنا لن يظهر للزوار"
                          : "Not yet implemented on the public homepage — edits here have no visible effect"
                      }
                    >
                      {isAr ? "غير مطبق في الواجهة" : "Not live yet"}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-xl">
                  {isAr ? sec.title_ar : sec.title_en}
                  {sec.subtitle_ar && ` — ${isAr ? sec.subtitle_ar : sec.subtitle_en}`}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 ms-auto shrink-0">
              {/* Move Up/Down */}
              <Button
                variant="ghost"
                size="icon"
                disabled={index === 0 || saving}
                onClick={() => handleMove(index, "up")}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                title={isAr ? "تحريك لأعلى" : "Move Up"}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={index === sections.length - 1 || saving}
                onClick={() => handleMove(index, "down")}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                title={isAr ? "تحريك لأسفل" : "Move Down"}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </Button>

              {/* Edit */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenEdit(sec)}
                className="w-7 h-7 text-primary hover:bg-primary/10"
                title={isAr ? "تعديل النصوص والعناوين" : "Edit Section"}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>

              {/* Enable/Disable Switch */}
              <div className="flex items-center gap-1.5 ms-2 ps-2 border-s border-border">
                <Switch
                  checked={sec.enabled}
                  disabled={saving}
                  onCheckedChange={(checked) => handleToggleSection(sec.id, checked)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" />
                <span>
                  {isAr ? "تعديل محتوى القسم:" : "Edit Section:"}{" "}
                  {isAr ? editingSection.name_ar : editingSection.name_en}
                </span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">
                  {isAr ? "العنوان الرئيسي (بالعربية) *" : "Main Headline (AR) *"}
                </Label>
                <Input
                  required
                  value={editingSection.title_ar}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title_ar: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">
                  {isAr ? "العنوان الرئيسي (EN)" : "Main Headline (EN)"}
                </Label>
                <Input
                  value={editingSection.title_en}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title_en: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">
                  {isAr ? "النص التوضيحي والفرعي (بالعربية)" : "Subtitle (AR)"}
                </Label>
                <Textarea
                  rows={2}
                  value={editingSection.subtitle_ar ?? ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle_ar: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">
                  {isAr ? "النص التوضيحي والفرعي (EN)" : "Subtitle (EN)"}
                </Label>
                <Textarea
                  rows={2}
                  value={editingSection.subtitle_en ?? ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle_en: e.target.value })
                  }
                />
              </div>

              {/* Badge / Tagline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "الشارة / التصنيف العلوي (AR)" : "Top Badge / Tag (AR)"}
                  </Label>
                  <Input
                    placeholder={isAr ? "مثال: الأصالة والتلاحم" : "e.g. Heritage & Unity"}
                    value={editingSection.badge_ar ?? ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, badge_ar: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "الشارة العلوي (EN)" : "Top Badge / Tag (EN)"}
                  </Label>
                  <Input
                    placeholder={isAr ? "Heritage & Unity" : "e.g. Heritage & Unity"}
                    value={editingSection.badge_en ?? ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, badge_en: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "نص زر الإجراء (CTA AR)" : "CTA Button Label (AR)"}
                  </Label>
                  <Input
                    value={editingSection.cta_label_ar ?? ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, cta_label_ar: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isAr ? "رابط الزر (URL)" : "CTA URL"}</Label>
                  <Input
                    value={editingSection.cta_url ?? ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, cta_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving
                    ? isAr
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : isAr
                      ? "حفظ التعديلات"
                      : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
