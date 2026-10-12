import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("dna", {
  eyebrow: { ar: "دراسة علمية", en: "Scientific study" } as BiText,
  subtitle: {
    ar: "نتائج فحوصات سلالة الكروموسوم الذكري (Y-DNA) لعينات من أبناء الأسرة، وموضع التحور في الشجرة الجينية العالمية، وانتشاره الجغرافي في الجزيرة العربية والخليج.",
    en: "Results of Y-chromosome testing on samples from family members, the position of the haplogroup within the global genetic tree, and its geographic distribution across Arabia and the Gulf.",
  } as BiText,

  metaHaplogroup: { ar: "التحور", en: "Haplogroup" } as BiText,
  metaSystem: { ar: "النظام", en: "System" } as BiText,
  metaSystemValue: { ar: "Y-DNA (خط الأب)", en: "Y-DNA (paternal line)" } as BiText,
  metaSamples: { ar: "نطاق العينات", en: "Sample range" } as BiText,
  metaSamplesValue: { ar: "الفروع السبعة", en: "All seven branches" } as BiText,

  noteLabel: { ar: "تنويه منهجي", en: "Methodological note" } as BiText,

  overviewEyebrow: { ar: "ملخص", en: "Summary" } as BiText,
  overviewTitle: {
    ar: "موضع الأسرة في الشجرة الجينية",
    en: "The family's position in the genetic tree",
  } as BiText,

  cladeEyebrow: { ar: "السلسلة التحورية", en: "Clade hierarchy" } as BiText,
  cladeTitle: { ar: "من J1-M267 إلى J-BY37877", en: "From J1-M267 to J-BY37877" } as BiText,
  cladeNote: {
    ar: "يُقرأ التسلسل من التحور الجذري الأعلى إلى التحور الطرفي الخاص بالأسرة.",
    en: "Read from the upstream root haplogroup down to the terminal clade specific to the family.",
  } as BiText,
  cladeRoot: { ar: "التحور الجذري", en: "Root" } as BiText,
  cladeTerminal: { ar: "التحور الطرفي", en: "Terminal" } as BiText,

  timelineEyebrow: { ar: "التسلسل الزمني", en: "Chronology" } as BiText,
  timelineTitle: {
    ar: "من J-Z20775 إلى J-BY37877",
    en: "From J-Z20775 to J-BY37877",
  } as BiText,
  timelineNote: {
    ar: "تقديرات زمن السلف المشترك الأحدث (TMRCA)، مأخوذة من لوحتي الشجرة الجينية المعتمدتين من الأسرة، مقروءة من الأقدم إلى الأحدث.",
    en: "Estimated time to most recent common ancestor (TMRCA), taken from the family's two haplogroup charts, read oldest to most recent.",
  } as BiText,
  familyMutation: {
    ar: "التحور الطرفي — تظهر تحته «آل بوعبيد»",
    en: 'Terminal mutation — "Al Bu Obaid" is named here',
  } as BiText,

  siblingEyebrow: { ar: "العوائل المتحالفة جينياً", en: "Genetically allied families" } as BiText,
  siblingNote: {
    ar: "عوائل تشترك مع آل بوعبيد في التحور الطرفي ذاته (J-BY37877)، بحسب لوحتي الشجرة الجينية للأسرة:",
    en: "Families sharing the same terminal mutation (J-BY37877) with Al Bu Obaid, per the family's two haplogroup charts:",
  } as BiText,
  chartCaption: {
    ar: "الإصدار الأول للشجرة الجينية الرسمية للتحور J-Z20777 (وثيقة مصورة كاملة قابلة للتكبير).",
    en: "The first edition of the family's official haplogroup chart for the J-Z20777 mutation (full source document — click to enlarge).",
  } as BiText,
  chartCaption2: {
    ar: "الإصدار الثاني (المنقّح) لشجرة السلالة الجينية، ويُظهر السلسلة الكاملة من J-Z20775 وحتى J-BY37877.",
    en: "The second (revised) edition of the haplogroup chart, showing the full chain from J-Z20775 to J-BY37877.",
  } as BiText,

  distEyebrow: { ar: "بيانات", en: "Data" } as BiText,
  distTitle: { ar: "الانتشار الجغرافي للتحور", en: "Geographic distribution" } as BiText,
  distNote: {
    ar: "أعداد العينات الموثقة في قواعد البيانات العالمية، لا نسب سكانية. والأعمدة نسبية إلى أكبر تجمع موثق.",
    en: "Counts of documented samples in the international databases — not population percentages. Bars are relative to the largest documented cluster.",
  } as BiText,
  colRegion: { ar: "الدولة", en: "Country" } as BiText,
  colAreas: { ar: "المناطق", en: "Regions" } as BiText,
  colFamilies: { ar: "العوائل والملاحظة", en: "Families & note" } as BiText,
  colShare: { ar: "العينات", en: "Samples" } as BiText,

  sourcesEyebrow: { ar: "قواعد البيانات", en: "Databases" } as BiText,
  sourcesNote: {
    ar: "نتائج التحور مقيدة ومتاحة للمراجعة في قواعد البيانات الجينية العالمية التالية.",
    en: "The haplogroup results are registered and available for review in the following international genetic databases.",
  } as BiText,

  lineageCta: {
    ar: "النسب الموثق بالمصادر التاريخية",
    en: "The documented historical lineage",
  } as BiText,
});
