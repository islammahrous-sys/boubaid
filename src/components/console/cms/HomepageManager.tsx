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
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
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
    title_ar: "منظومة أسرة آل بوعبيد",
    title_en: "Al Bu Obaid Family Heritage Hub",
    subtitle_ar:
      "صرح توثيقي ورقمي موحد يجمع شمل الأسرة، يوثق الأنساب، ويدير المبادرات التنموية والخزينة.",
    subtitle_en:
      "A unified platform connecting family, documenting lineage, and advancing community initiatives.",
    badge_ar: "الأصالة والتلاحم",
    badge_en: "Heritage & Unity",
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
    cta_label_ar: "قراءة الوثيقة الكاملة",
    cta_label_en: "Read Full Charter",
    cta_url: "/foundation",
  },
  {
    id: "seven_branches",
    name_ar: "الفروع السبعة للأسرة",
    name_en: "The Seven Family Branches",
    enabled: true,
    order: 3,
    title_ar: "الفروع السبعة الكريمة",
    title_en: "The Seven Noble Branches",
    subtitle_ar: "امتدادات الأسرة وتفرعاتها التاريخية الموثقة في سجلات المجلس.",
    subtitle_en: "Documented historical lineage branches under the family council.",
    cta_label_ar: "استعراض كافة الفروع",
    cta_label_en: "View All Branches",
    cta_url: "/branches",
  },
  {
    id: "initiatives_hq",
    name_ar: "المبادرات والمقر الدائم",
    name_en: "Initiatives & Permanent HQ",
    enabled: true,
    order: 4,
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
    order: 5,
    title_ar: "المركز الإعلامي وأخبار المجلس",
    title_en: "Media Center & Council News",
    subtitle_ar: "تغطية شاملة للمناسبات، القرارات، والإنجازات الأسرية.",
    subtitle_en: "Comprehensive coverage of council updates and family achievements.",
    cta_label_ar: "أرشيف الأخبار",
    cta_label_en: "News Archive",
    cta_url: "/news",
  },
  {
    id: "family_achievers",
    name_ar: "سجل التميز وكفاءات الأسرة",
    name_en: "Family Achievers Roll of Honour",
    enabled: true,
    order: 6,
    title_ar: "من كفاءات الأسرة",
    title_en: "Among the Family's Achievers",
    subtitle_ar: "أبرز الأعلام والكفاءات الموثقة في سجل تميز الأسرة.",
    subtitle_en: "Distinguished family members recognised in the roll of honour.",
    cta_label_ar: "السجل كاملاً",
    cta_label_en: "The Full Roll",
    cta_url: "/achievers",
  },
  {
    id: "initiatives_list",
    name_ar: "المبادرات والبرامج الجارية",
    name_en: "Current Initiatives & Programmes",
    enabled: true,
    order: 7,
    title_ar: "المبادرات الجارية",
    title_en: "Current Initiatives",
    subtitle_ar: "البرامج التنموية والتكافلية التي يديرها الصندوق حالياً.",
    subtitle_en: "Development and solidarity programmes currently run by the fund.",
    cta_label_ar: "كل المبادرات",
    cta_label_en: "All Initiatives",
    cta_url: "/initiatives",
  },
  {
    id: "dna_preview",
    name_ar: "دراسة الحمض النووي والسلالة الوراثية",
    name_en: "DNA & Genetic Lineage Study",
    enabled: true,
    order: 8,
    title_ar: "دراسة علمية للسلالة الوراثية",
    title_en: "Scientific Genetic Lineage Study",
    subtitle_ar: "نتائج تحليل الحمض النووي وربطها بالسلالة التحورية للأسرة.",
    subtitle_en: "DNA analysis results linking the family to its parent haplogroup.",
    cta_label_ar: "نتائج الدراسة الكاملة",
    cta_label_en: "Full Study Results",
    cta_url: "/dna",
  },
  {
    id: "upcoming_events",
    name_ar: "الفعاليات واللقاءات القادمة",
    name_en: "Upcoming Events & Gatherings",
    enabled: true,
    order: 9,
    title_ar: "الفعاليات والاجتماعات العائلية",
    title_en: "Family Events & Council Meetings",
    subtitle_ar: "جدول اللقاءات الدورية، مجالس الأعياد، وورش العمل.",
    subtitle_en: "Calendar of regular gatherings, Eid assemblies, and workshops.",
    cta_label_ar: "سجل الفعاليات",
    cta_label_en: "All Events",
    cta_url: "/events",
  },
  {
    id: "heritage_gallery",
    name_ar: "الأرشيف والصور التراثية",
    name_en: "Heritage & Photo Archive",
    enabled: true,
    order: 10,
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
    order: 11,
    title_ar: "تواصل مع أمانة المجلس",
    title_en: "Contact the Council Secretariat",
    subtitle_ar: "قنوات مفتوحة لاستقبال استفسارات الأعضاء، تحديثات الأنساب، والمقترحات.",
    subtitle_en: "Open channels for member inquiries, lineage updates, and proposals.",
    cta_label_ar: "إرسال رسالة",
    cta_label_en: "Send Message",
    cta_url: "/contact",
  },
];

// Both `upcoming_events` and `heritage_gallery` now have real render branches
// in src/routes/index.tsx (upcoming_events pulls from `events` via
// getPublishedEvents; heritage_gallery pulls from `galleries` +
// `gallery_media` + `media_assets`), so nothing is flagged as unimplemented
// here any more. Kept as an (empty) set rather than removing the mechanism
// entirely, in case a future section genuinely can't be wired up yet.
const UNIMPLEMENTED_SECTION_IDS = new Set<string>([]);

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
      return found.value.sections as HomepageSectionConfig[];
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

              {/* Background / Cover Image Upload */}
              <div className="space-y-1 pt-1 border-t border-border">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {isAr ? "صورة الخلفية / الغلاف للقسم" : "Section Background / Cover Photo"}
                  </span>
                </Label>
                <ImageUploadInput
                  bucket="site-media"
                  value={editingSection.image_path}
                  onChange={(url) => setEditingSection({ ...editingSection, image_path: url })}
                  placeholder={
                    isAr ? "رابط الصورة أو ارفع صورة جديدة..." : "Image URL or upload..."
                  }
                  helperText={
                    isAr
                      ? "صورة الغلاف أو الخلفية الظاهرة لهذا القسم في الصفحة الرئيسية"
                      : "Cover or background image displayed in this section"
                  }
                />
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
