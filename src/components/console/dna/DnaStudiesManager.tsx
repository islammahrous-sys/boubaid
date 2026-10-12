import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Dna,
  Plus,
  Trash2,
  Save,
  Layers,
  Clock,
  Users,
  Globe,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { dnaStudiesDataSchema, type DnaStudiesDataInput } from "@/lib/admin-hub.schemas";
import { useConfirm } from "@/hooks/useConfirm";

export const DEFAULT_DNA_STUDIES_DATA: DnaStudiesDataInput = {
  haplogroup: "J-Z20777 / J-BY37877",
  terminal_mutation: "J-BY37877",
  root_haplogroup: "J1-M267",
  hierarchy: [
    {
      mutation: "J1-M267",
      label_ar: "التحور الجذري الأعلى (J1)",
      label_en: "Root Clade (J1)",
      description_ar: "التحور الجذري للكروموسوم الذكري السامي J1",
    },
    {
      mutation: "J-CTS5368",
      label_ar: "الفرع المشرقي الرئيسي",
      label_en: "Main Levantine / Arabian Branch",
      description_ar: "تحور رئيسي واسع الانتشار في الشرق الأدنى",
    },
    {
      mutation: "J-YSC0000235",
      label_ar: "فرع YSC235",
      label_en: "YSC235 Branch",
      description_ar: "حلقة وسيطة متفرعة في شبه الجزيرة العربية",
    },
    {
      mutation: "J-L858",
      label_ar: "التحور الإبراهيمي المشرقي",
      label_en: "Levantine / Arabian Clade",
      description_ar: "التحور الجامع للقبائل العربية العدنانية والمشرقية",
    },
    {
      mutation: "J-FGC11",
      label_ar: "تحور مضر / خندف",
      label_en: "Mudhar / Khandaf Clade",
      description_ar: "التحور الحاضن لعموم قبائل مضر وخندف",
    },
    {
      mutation: "J-FGC1723",
      label_ar: "تحور بني تميم القديم",
      label_en: "Banu Tamim Clade",
      description_ar: "التحور الجامع لقبائل بني تميم",
    },
    {
      mutation: "J-FGC1695",
      label_ar: "فرع تميم الرئيسي",
      label_en: "Tamim Main Branch",
      description_ar: "الفرع الحاضن لتفرعات تميم المشرقية",
    },
    {
      mutation: "J-Z20773",
      label_ar: "تحور العبادل التميمي",
      label_en: "Al-Abadil / Tamim",
      description_ar: "التحور الموثق لـ 28 عينة من العبادل وفروع تميم في الشرقية والخليج",
    },
    {
      mutation: "J-Z20775",
      label_ar: "فرع Z20775",
      label_en: "Z20775 Clade",
      description_ar: "حلقة وسيطة بعمر تقديري ٣٠٠٠ سنة",
    },
    {
      mutation: "J-Z20777",
      label_ar: "التحور الرئيسي الجامع",
      label_en: "Main Cluster (Z20777)",
      description_ar: "التحور الرئيسي لأسرة آل بوعبيد وعوائل شرق الجزيرة والمغرب",
    },
    {
      mutation: "J-ZS7621",
      label_ar: "فرع ZS7621",
      label_en: "ZS7621 Subclade",
      description_ar: "الفرع المحدد لآل بوعبيد وأبناء عمومتهم في لوحتي الأسرة",
    },
    {
      mutation: "J-ZS4623",
      label_ar: "حلقة ZS4623",
      label_en: "ZS4623 Subclade",
      description_ar: "الجيل السابق مباشرة للتحور الطرفي",
    },
    {
      mutation: "J-BY37877",
      label_ar: "التحور الطرفي لآل بوعبيد",
      label_en: "Al Bu Obaid Terminal Mutation",
      description_ar: "التحور الطرفي الخاص بأسرة آل بوعبيد والعوائل المتحالفة جينياً",
    },
  ],
  chronology: [
    {
      mutation: "J-Z20775",
      approx_date: "١٠٠٠ ق.م",
      tmrca: "٣٠٠٠ سنة",
      note_ar: "التحور الجامع الأوسع الذي يلتقي تحته عدد من قبائل شرق الجزيرة العربية والخليج.",
      note_en:
        "The wider overarching haplogroup under which several tribes of eastern Arabia and the Gulf converge.",
    },
    {
      mutation: "J-Z20777",
      approx_date: "٧٠٠ م (فجر الإسلام)",
      tmrca: "١٣٠٠ سنة",
      note_ar:
        "تحور فرعي بارز يتزامن نشوؤه مع فجر الإسلام وبداية الفتوحات الكبرى. وتظهر عينات مغربية متفرعة إثر فتوحات شمال أفريقيا.",
      note_en: "A prominent subclade coinciding with the dawn of Islam and the early conquests.",
    },
    {
      mutation: "J-ZS7621",
      approx_date: "١٠٠٠ م",
      tmrca: "١٠٠٠ سنة",
      note_ar: "الفرع المحدد الذي تتفرع منه سلالة آل بوعبيد وأبناء عمومتهم ضمن كلتا لوحتي الأسرة.",
      note_en:
        "The specific branch from which the Al Bu Obaid lineage and its cousins descend on both family charts.",
    },
    {
      mutation: "J-ZS4623",
      approx_date: "١٠٥٠ م",
      tmrca: "٩٥٠ سنة",
      note_ar: "الجيل السابق مباشرة للتحور الطرفي.",
      note_en: "The generation immediately preceding the terminal mutation.",
    },
    {
      mutation: "J-BY37877",
      approx_date: "١١٠٠ م",
      tmrca: "٩٠٠ سنة",
      note_ar:
        "التحور الطرفي الذي يظهر تحته اسم «آل بوعبيد» صراحةً في كلتا لوحتي الأسرة، إلى جانب آل درويش والنعيمي والرميحي وعوائل أخرى من الأحساء والخليج.",
      note_en:
        "The terminal mutation under which 'Al Bu Obaid' is named explicitly on both family charts, alongside Al Darwish, Al Naimi, Al Rumaihi, and other families from Al-Ahsa and the Gulf.",
    },
  ],
  sibling_families: [
    {
      name_ar: "آل درويش",
      name_en: "Al Darwish",
      origin_ar: "الأحساء والخليج",
      origin_en: "Al-Ahsa & Gulf",
      notes_ar: "تشترك مع آل بوعبيد في التحور الطرفي J-BY37877",
    },
    {
      name_ar: "آل بوعبيد",
      name_en: "Al Bu Obaid",
      origin_ar: "الأحساء - المبرز",
      origin_en: "Al-Mubarraz, Al-Ahsa",
      notes_ar: "الأسرة صاحبة الدراسة وسلالة العبادل من بني تميم",
    },
    {
      name_ar: "آل محمد الودعاني",
      name_en: "Al-Wadaani",
      origin_ar: "المنطقة الشرقية",
      origin_en: "Eastern Province",
      notes_ar: "تطابق في التحور الطرفي J-BY37877",
    },
    {
      name_ar: "المعاودة (العتوب)",
      name_en: "Al-Maawdah",
      origin_ar: "البحرين والكويت",
      origin_en: "Bahrain & Kuwait",
      notes_ar: "ضمن لوحتي الشجرة الجينية المعتمدتين",
    },
    {
      name_ar: "العدوان الرزين",
      name_en: "Al-Adwan",
      origin_ar: "الخليج العربي",
      origin_en: "Arabian Gulf",
      notes_ar: "تحور طرفي مطابق J-BY37877",
    },
    {
      name_ar: "البوعينين",
      name_en: "Al-Buainain",
      origin_ar: "الجبيل وقطر",
      origin_en: "Jubail & Qatar",
      notes_ar: "فرع تميمي تاريخي يلتقي في التحور الطرفي",
    },
    {
      name_ar: "الصمخان الكييسي",
      name_en: "Al-Samkhan",
      origin_ar: "الأحساء والخليج",
      origin_en: "Al-Ahsa & Gulf",
      notes_ar: "ضمن تكتل التحور الطرفي BY37877",
    },
    {
      name_ar: "آل مسلم",
      name_en: "Al Musallam",
      origin_ar: "قطر والأحساء",
      origin_en: "Qatar & Al-Ahsa",
      notes_ar: "تطابق العينات في الفحوصات الجينية المعتمدة",
    },
    {
      name_ar: "الحميدي",
      name_en: "Al-Humaidi",
      origin_ar: "المنطقة الشرقية",
      origin_en: "Eastern Province",
      notes_ar: "ضمن تكتل عينات الأحساء والشرقية",
    },
    {
      name_ar: "البوعقرة المنصوري",
      name_en: "Al-Buagrah Al-Mansouri",
      origin_ar: "الإمارات وقطر",
      origin_en: "UAE & Qatar",
      notes_ar: "تطابق التحور الطرفي BY37877",
    },
    {
      name_ar: "الرميحي",
      name_en: "Al-Rumaihi",
      origin_ar: "الشرقية والبحرين وقطر",
      origin_en: "Eastern Province, Bahrain & Qatar",
      notes_ar: "تطابق صريح في لوحتي الشجرة الجينية",
    },
    {
      name_ar: "آل أحمد",
      name_en: "Al Ahmed",
      origin_ar: "الأحساء",
      origin_en: "Al-Ahsa",
      notes_ar: "عوائل واحة الأحساء المتحالفة جينياً",
    },
    {
      name_ar: "العشان",
      name_en: "Al-Ashan",
      origin_ar: "الخليج العربي",
      origin_en: "Arabian Gulf",
      notes_ar: "ضمن عينات التحور الطرفي",
    },
    {
      name_ar: "المناعي",
      name_en: "Al-Mannai",
      origin_ar: "المنطقة الشرقية وقطر",
      origin_en: "Eastern Province & Qatar",
      notes_ar: "تحور طرفي مطابق",
    },
    {
      name_ar: "النعيمي (الرمزاني والجبر)",
      name_en: "Al Naimi",
      origin_ar: "قطر والإمارات",
      origin_en: "Qatar & UAE",
      notes_ar: "تطابق صريح وموثق في لوحتي الأسرة",
    },
    {
      name_ar: "بيوشقر آل علي",
      name_en: "Al Ali",
      origin_ar: "الخليج العربي",
      origin_en: "Arabian Gulf",
      notes_ar: "ضمن عينات التحور",
    },
    {
      name_ar: "آل الشيخ صالح",
      name_en: "Al Sheikh Saleh",
      origin_ar: "الأحساء",
      origin_en: "Al-Ahsa",
      notes_ar: "عوائل واحة الأحساء التاريخية",
    },
    {
      name_ar: "الطعان الخليفي",
      name_en: "Al-Taan",
      origin_ar: "الخليج العربي",
      origin_en: "Arabian Gulf",
      notes_ar: "تطابق جيني في سلالة التحور",
    },
    {
      name_ar: "السويدي (بن راشد، بن مطر، بن سيفان)",
      name_en: "Al-Suwaidi",
      origin_ar: "قطر والإمارات",
      origin_en: "Qatar & UAE",
      notes_ar: "فروع السويدي المطابقة للتحور الطرفي",
    },
  ],
  distribution: [
    {
      country_ar: "دولة قطر",
      country_en: "Qatar",
      samples_count: 78,
      regions_ar: "الدوحة، الوكرة، الشمال",
      note_ar:
        "الكواري، المهندي، البوعينين، الخيارين (تكتل فرعي J-ZS9361) - أكبر مركز ديموغرافي موثق للتحور",
    },
    {
      country_ar: "المملكة العربية السعودية",
      country_en: "Saudi Arabia",
      samples_count: 28,
      regions_ar: "المنطقة الشرقية (الأحساء والمبرز تحديداً) ونجد",
      note_ar:
        "آل بوعبيد وفروع بني تميم المتحالفة جينياً — 28 عينة موثقة لـ Z20773، منها 19 عينة لـ Z20777",
    },
    {
      country_ar: "مملكة البحرين",
      country_en: "Bahrain",
      samples_count: 10,
      regions_ar: "المحرق، الرفاع",
      note_ar: "أبناء العمومة من فروع بني تميم - امتداد جغرافي طبيعي لإقليم البحرين التاريخي",
    },
    {
      country_ar: "المملكة المغربية",
      country_en: "Morocco",
      samples_count: 8,
      regions_ar: "الدار البيضاء وأقاليم المغرب الأقصى",
      note_ar: "عينات موثقة ترتبط بفتوحات شمال أفريقيا الإسلامية واستقرار وحدات تميمية",
    },
    {
      country_ar: "دولة الكويت",
      country_en: "Kuwait",
      samples_count: 6,
      regions_ar: "العاصمة، الأحمدي",
      note_ar: "عوائل تميمية يلتقي معها التحور وهجرات ساحلية تجارية",
    },
    {
      country_ar: "الإمارات العربية المتحدة",
      country_en: "United Arab Emirates",
      samples_count: 4,
      regions_ar: "أبوظبي ودبي",
      note_ar: "تجمعات لعائلات مثل النعيمي والمنصوري",
    },
    {
      country_ar: "سلطنة عمان",
      country_en: "Oman",
      samples_count: 1,
      regions_ar: "مسقط",
      note_ar: "امتداد جغرافي عبر قوافل التجارة",
    },
  ],
};

function normalizeDnaData(raw: unknown): DnaStudiesDataInput {
  if (!raw || typeof raw !== "object") return DEFAULT_DNA_STUDIES_DATA;
  const obj = raw as Record<string, any>;

  // If all lists are empty, seed from default research data
  const hasContent =
    (Array.isArray(obj.hierarchy) && obj.hierarchy.length > 0) ||
    (Array.isArray(obj.chronology) && obj.chronology.length > 0) ||
    (Array.isArray(obj.sibling_families) && obj.sibling_families.length > 0) ||
    (Array.isArray(obj.distribution) && obj.distribution.length > 0);

  if (!hasContent) {
    return {
      ...DEFAULT_DNA_STUDIES_DATA,
      haplogroup: obj.haplogroup || DEFAULT_DNA_STUDIES_DATA.haplogroup,
      terminal_mutation: obj.terminal_mutation || DEFAULT_DNA_STUDIES_DATA.terminal_mutation,
      root_haplogroup: obj.root_haplogroup || DEFAULT_DNA_STUDIES_DATA.root_haplogroup,
    };
  }

  return {
    haplogroup: obj.haplogroup || DEFAULT_DNA_STUDIES_DATA.haplogroup,
    terminal_mutation: obj.terminal_mutation || DEFAULT_DNA_STUDIES_DATA.terminal_mutation,
    root_haplogroup: obj.root_haplogroup || DEFAULT_DNA_STUDIES_DATA.root_haplogroup,
    hierarchy: Array.isArray(obj.hierarchy) ? obj.hierarchy : DEFAULT_DNA_STUDIES_DATA.hierarchy,
    chronology: Array.isArray(obj.chronology)
      ? obj.chronology
      : DEFAULT_DNA_STUDIES_DATA.chronology,
    sibling_families: Array.isArray(obj.sibling_families)
      ? obj.sibling_families
      : DEFAULT_DNA_STUDIES_DATA.sibling_families,
    distribution: Array.isArray(obj.distribution)
      ? obj.distribution
      : DEFAULT_DNA_STUDIES_DATA.distribution,
  };
}

export function DnaStudiesManager({
  initialData,
  onSaveData,
}: {
  initialData: DnaStudiesDataInput | null;
  onSaveData: (data: DnaStudiesDataInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState<DnaStudiesDataInput>(() => normalizeDnaData(initialData));

  useEffect(() => {
    if (initialData) {
      setState(normalizeDnaData(initialData));
    }
  }, [initialData]);

  const handleResetToDefault = () => {
    setState(DEFAULT_DNA_STUDIES_DATA);
    toast.success(
      isAr
        ? "تم استيراد بيانات الدراسة الجينية المعتمدة بنجاح. لا تنسَ الضغط على 'حفظ كافة التغييرات'."
        : "Loaded official DNA research dataset. Don't forget to click 'Save All'.",
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSaveData(state);
      toast.success(
        isAr ? "تم حفظ إعدادات الدراسة الجينية بنجاح" : "DNA study data saved successfully",
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ البيانات" : "Failed to save data"));
    } finally {
      setLoading(false);
    }
  };

  // Add items helpers with safe array fallbacks
  const handleAddHierarchy = () => {
    setState((prev) => ({
      ...prev,
      hierarchy: [
        ...(prev.hierarchy ?? []),
        { mutation: "J-NEW", label_ar: "تحور جديد", label_en: "New Mutation", description_ar: "" },
      ],
    }));
  };

  const handleAddChronology = () => {
    setState((prev) => ({
      ...prev,
      chronology: [
        ...(prev.chronology ?? []),
        { mutation: "J-NEW", approx_date: "١٠٠٠ ق.م", tmrca: "٣٠٠٠ سنة", note_ar: "", note_en: "" },
      ],
    }));
  };

  const handleAddSiblingFamily = () => {
    setState((prev) => ({
      ...prev,
      sibling_families: [
        ...(prev.sibling_families ?? []),
        {
          name_ar: "عائلة جديدة",
          name_en: "New Family",
          origin_ar: "الأحساء",
          origin_en: "Al-Ahsa",
          notes_ar: "",
        },
      ],
    }));
  };

  const handleAddDistribution = () => {
    setState((prev) => ({
      ...prev,
      distribution: [
        ...(prev.distribution ?? []),
        {
          country_ar: "دولة جديدة",
          country_en: "Country",
          samples_count: 5,
          regions_ar: "المنطقة",
          note_ar: "",
        },
      ],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Dna className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr
                ? "إدارة نتائج الدراسة الجينية وسلالة التحور (Y-DNA)"
                : "Y-DNA Genetic Studies & Markers"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? "تعديل السلسلة التحورية، التسلسل الزمني، العوائل المتحالفة، والانتشار الجغرافي"
                : "Manage haplogroup tree, SNP chronology, allied families, and distribution"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetToDefault}
            className="h-8 text-xs gap-1.5 border-dashed"
            title={isAr ? "استيراد البيانات العلمية الأصلية" : "Reset to default research data"}
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            {isAr ? "استيراد البيانات المعتمدة" : "Load Official Data"}
          </Button>

          <Button size="sm" onClick={handleSave} disabled={loading} className="h-8 text-xs gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {loading
              ? isAr
                ? "جاري الحفظ..."
                : "Saving..."
              : isAr
                ? "حفظ كافة التغييرات"
                : "Save All"}
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card p-6 space-y-6">
        {/* Core Haplogroup Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {isAr ? "التحور الرئيسي (Haplogroup)" : "Main Haplogroup"}
            </Label>
            <Input
              value={state.haplogroup}
              onChange={(e) => setState({ ...state, haplogroup: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {isAr ? "التحور الطرفي الخاص بالأسرة" : "Terminal Mutation"}
            </Label>
            <Input
              value={state.terminal_mutation}
              onChange={(e) => setState({ ...state, terminal_mutation: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {isAr ? "التحور الجذري الأعلى" : "Root Haplogroup"}
            </Label>
            <Input
              value={state.root_haplogroup}
              onChange={(e) => setState({ ...state, root_haplogroup: e.target.value })}
              className="font-mono"
            />
          </div>
        </div>

        {/* Tabs for Hierarchy, Chronology, Sibling Families, Distribution */}
        <Tabs defaultValue="hierarchy" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="hierarchy" className="text-xs gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {isAr
                ? `السلسلة التحورية (${(state.hierarchy ?? []).length})`
                : `Hierarchy (${(state.hierarchy ?? []).length})`}
            </TabsTrigger>
            <TabsTrigger value="chronology" className="text-xs gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {isAr
                ? `التسلسل الزمني (${(state.chronology ?? []).length})`
                : `Chronology (${(state.chronology ?? []).length})`}
            </TabsTrigger>
            <TabsTrigger value="siblings" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {isAr
                ? `العوائل المتحالفة (${(state.sibling_families ?? []).length})`
                : `Allied Families (${(state.sibling_families ?? []).length})`}
            </TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {isAr
                ? `الانتشار الجغرافي (${(state.distribution ?? []).length})`
                : `Distribution (${(state.distribution ?? []).length})`}
            </TabsTrigger>
          </TabsList>

          {/* 1. Hierarchy */}
          <TabsContent value="hierarchy" className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddHierarchy}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                {isAr ? "إضافة حلقة تحور" : "Add Mutation"}
              </Button>
            </div>
            <div className="space-y-2">
              {(state.hierarchy ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground text-xs rounded-lg border border-dashed border-border">
                  <Layers className="w-6 h-6 opacity-40" />
                  <span>{isAr ? "لا توجد حلقات تحور مضافة بعد" : "No mutations added yet"}</span>
                </div>
              ) : (
                (state.hierarchy ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                  >
                    <Input
                      className="w-32 font-mono text-xs"
                      value={item.mutation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...prev.hierarchy];
                          copy[idx].mutation = val;
                          return { ...prev, hierarchy: copy };
                        });
                      }}
                      placeholder="رمز التحور"
                    />
                    <Input
                      className="flex-1 text-xs"
                      value={item.label_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...prev.hierarchy];
                          copy[idx].label_ar = val;
                          return { ...prev, hierarchy: copy };
                        });
                      }}
                      placeholder="التسمية بالعربية"
                    />
                    <Input
                      className="flex-1 text-xs"
                      value={item.description_ar ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...prev.hierarchy];
                          copy[idx].description_ar = val;
                          return { ...prev, hierarchy: copy };
                        });
                      }}
                      placeholder="الوصف والإيضاح"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive/70 hover:text-destructive"
                      onClick={async () => {
                        if (
                          !(await confirm({
                            title: isAr
                              ? `حذف التحور "${item.mutation}"؟`
                              : `Remove mutation "${item.mutation}"?`,
                            description: isAr
                              ? "سيتم حذف هذه الحلقة من السلسلة التحورية. لن يُطبَّق الحذف نهائياً إلا بعد الضغط على 'حفظ كافة التغييرات'."
                              : "This entry will be removed from the mutation hierarchy. It won't be permanent until you click 'Save All'.",
                            tone: "destructive",
                          }))
                        ) {
                          return;
                        }
                        setState((prev) => ({
                          ...prev,
                          hierarchy: (prev.hierarchy ?? []).filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* 2. Chronology */}
          <TabsContent value="chronology" className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddChronology}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                {isAr ? "إضافة مرحلة زمنية" : "Add Chronology Step"}
              </Button>
            </div>
            <div className="space-y-2">
              {(state.chronology ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground text-xs rounded-lg border border-dashed border-border">
                  <Clock className="w-6 h-6 opacity-40" />
                  <span>
                    {isAr ? "لا توجد مراحل زمنية مضافة بعد" : "No chronology steps added yet"}
                  </span>
                </div>
              ) : (
                (state.chronology ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                  >
                    <Input
                      className="w-28 font-mono text-xs"
                      value={item.mutation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.chronology ?? [])];
                          copy[idx].mutation = val;
                          return { ...prev, chronology: copy };
                        });
                      }}
                      placeholder="التحور"
                    />
                    <Input
                      className="w-32 text-xs"
                      value={item.approx_date}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.chronology ?? [])];
                          copy[idx].approx_date = val;
                          return { ...prev, chronology: copy };
                        });
                      }}
                      placeholder="التاريخ التقريبي"
                    />
                    <Input
                      className="w-28 text-xs font-mono"
                      value={item.tmrca}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.chronology ?? [])];
                          copy[idx].tmrca = val;
                          return { ...prev, chronology: copy };
                        });
                      }}
                      placeholder="TMRCA"
                    />
                    <Input
                      className="flex-1 text-xs"
                      value={item.note_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.chronology ?? [])];
                          copy[idx].note_ar = val;
                          return { ...prev, chronology: copy };
                        });
                      }}
                      placeholder="ملاحظات وسياق"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive/70 hover:text-destructive"
                      onClick={async () => {
                        if (
                          !(await confirm({
                            title: isAr
                              ? `حذف مرحلة "${item.mutation}"؟`
                              : `Remove step "${item.mutation}"?`,
                            description: isAr
                              ? "سيتم حذف هذه المرحلة من التسلسل الزمني. لن يُطبَّق الحذف نهائياً إلا بعد الضغط على 'حفظ كافة التغييرات'."
                              : "This entry will be removed from the chronology. It won't be permanent until you click 'Save All'.",
                            tone: "destructive",
                          }))
                        ) {
                          return;
                        }
                        setState((prev) => ({
                          ...prev,
                          chronology: (prev.chronology ?? []).filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* 3. Sibling Families */}
          <TabsContent value="siblings" className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSiblingFamily}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                {isAr ? "إضافة عائلة مشاركة" : "Add Sibling Family"}
              </Button>
            </div>
            <div className="space-y-2">
              {(state.sibling_families ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground text-xs rounded-lg border border-dashed border-border">
                  <Users className="w-6 h-6 opacity-40" />
                  <span>
                    {isAr ? "لا توجد عوائل متحالفة مضافة بعد" : "No allied families added yet"}
                  </span>
                </div>
              ) : (
                (state.sibling_families ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                  >
                    <Input
                      className="w-40 font-semibold text-xs"
                      value={item.name_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.sibling_families ?? [])];
                          copy[idx].name_ar = val;
                          return { ...prev, sibling_families: copy };
                        });
                      }}
                      placeholder="اسم العائلة"
                    />
                    <Input
                      className="w-36 text-xs"
                      value={item.origin_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.sibling_families ?? [])];
                          copy[idx].origin_ar = val;
                          return { ...prev, sibling_families: copy };
                        });
                      }}
                      placeholder="الموطن / الأصل"
                    />
                    <Input
                      className="flex-1 text-xs"
                      value={item.notes_ar ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.sibling_families ?? [])];
                          copy[idx].notes_ar = val;
                          return { ...prev, sibling_families: copy };
                        });
                      }}
                      placeholder="ملاحظات وتطابق العينات"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive/70 hover:text-destructive"
                      onClick={async () => {
                        if (
                          !(await confirm({
                            title: isAr
                              ? `حذف عائلة "${item.name_ar}"؟`
                              : `Remove family "${item.name_ar}"?`,
                            description: isAr
                              ? "سيتم حذف هذه العائلة من قائمة العوائل المتحالفة. لن يُطبَّق الحذف نهائياً إلا بعد الضغط على 'حفظ كافة التغييرات'."
                              : "This entry will be removed from the allied families list. It won't be permanent until you click 'Save All'.",
                            tone: "destructive",
                          }))
                        ) {
                          return;
                        }
                        setState((prev) => ({
                          ...prev,
                          sibling_families: (prev.sibling_families ?? []).filter(
                            (_, i) => i !== idx,
                          ),
                        }));
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* 4. Distribution */}
          <TabsContent value="distribution" className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddDistribution}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                {isAr ? "إضافة دولة" : "Add Country"}
              </Button>
            </div>
            <div className="space-y-2">
              {(state.distribution ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground text-xs rounded-lg border border-dashed border-border">
                  <Globe className="w-6 h-6 opacity-40" />
                  <span>{isAr ? "لا توجد دول مضافة بعد" : "No countries added yet"}</span>
                </div>
              ) : (
                (state.distribution ?? []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
                  >
                    <Input
                      className="w-36 font-semibold text-xs"
                      value={item.country_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.distribution ?? [])];
                          copy[idx].country_ar = val;
                          return { ...prev, distribution: copy };
                        });
                      }}
                      placeholder="الدولة"
                    />
                    <Input
                      type="number"
                      className="w-24 text-xs font-mono"
                      value={item.samples_count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setState((prev) => {
                          const copy = [...(prev.distribution ?? [])];
                          copy[idx].samples_count = val;
                          return { ...prev, distribution: copy };
                        });
                      }}
                      placeholder="العينات"
                    />
                    <Input
                      className="w-48 text-xs"
                      value={item.regions_ar}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.distribution ?? [])];
                          copy[idx].regions_ar = val;
                          return { ...prev, distribution: copy };
                        });
                      }}
                      placeholder="المناطق"
                    />
                    <Input
                      className="flex-1 text-xs"
                      value={item.note_ar ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setState((prev) => {
                          const copy = [...(prev.distribution ?? [])];
                          copy[idx].note_ar = val;
                          return { ...prev, distribution: copy };
                        });
                      }}
                      placeholder="ملاحظات الهجرة والانتشار"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive/70 hover:text-destructive"
                      onClick={async () => {
                        if (
                          !(await confirm({
                            title: isAr
                              ? `حذف دولة "${item.country_ar}"؟`
                              : `Remove country "${item.country_ar}"?`,
                            description: isAr
                              ? "سيتم حذف هذه الدولة من جدول الانتشار الجغرافي. لن يُطبَّق الحذف نهائياً إلا بعد الضغط على 'حفظ كافة التغييرات'."
                              : "This entry will be removed from the distribution table. It won't be permanent until you click 'Save All'.",
                            tone: "destructive",
                          }))
                        ) {
                          return;
                        }
                        setState((prev) => ({
                          ...prev,
                          distribution: (prev.distribution ?? []).filter((_, i) => i !== idx),
                        }));
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
