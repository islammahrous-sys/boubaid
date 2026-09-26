import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("index", {
  standfirst: {
    ar: "أسرة من فرع العبادل من بني تميم، استقرت بمدينة المبرز في واحة الأحساء، وتدير اليوم شؤونها الأهلية والوقفية عبر كيان مرخص.",
    en: "A family of the ʿAbadil branch of Banu Tamim, settled at Al-Mubarraz in the Al-Ahsa oasis, and today administering its civic and endowment affairs through a licensed organisation.",
  } as BiText,
  seat: { ar: "المقر", en: "Seat" } as BiText,
  seatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
  registered: { ar: "سنة الإشهار", en: "Registered" } as BiText,
  branchCount: { ar: "الفروع الموثقة", en: "Documented branches" } as BiText,
  licence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  visitCount: { ar: "عدد الزيارات", en: "Visits" } as BiText,
  todayDate: { ar: "تاريخ اليوم", en: "Today" } as BiText,
  easternWeather: {
    ar: "الطقس — الأحساء",
    en: "Weather — Al Ahsa",
  } as BiText,
  weatherUpdating: { ar: "جارٍ تحديث الطقس", en: "Updating weather" } as BiText,
  weatherFailed: { ar: "تعذر تحديث الطقس حالياً", en: "Weather unavailable right now" } as BiText,
  weatherRetry: { ar: "إعادة المحاولة", en: "Retry" } as BiText,
  weatherHigh: { ar: "العظمى", en: "High" } as BiText,
  weatherLow: { ar: "الصغرى", en: "Low" } as BiText,

  quickFund: { ar: "صندوق تنمية الأسرة", en: "Family Development Fund" } as BiText,
  quickRequests: { ar: "مركز الطلبات", en: "Requests Centre" } as BiText,
  quickArchive: { ar: "الأرشيف", en: "Archive" } as BiText,
  quickCta: { ar: "اضغط هنا", en: "Explore" } as BiText,

  openingEyebrow: { ar: "افتتاحية", en: "Introduction" } as BiText,
  openingTitle: {
    ar: "نسب موثق، وأرشيف يُحفظ، وأوقاف تُدار",
    en: "A documented lineage, a kept archive, an administered endowment",
  } as BiText,
  openingP1: {
    ar: "تنحدر أسرة آل بوعبيد من فرع العبادل، أبناء عبد الله بن دارم، أحد بطون قبيلة بني تميم. ويمتد عمود نسبها صعوداً عبر بني حنظلة بن مالك إلى تميم بن مر، فإلياس بن مضر، حتى عدنان.",
    en: "The Al Bu Obaid descend from the ʿAbadil — the sons of ʿAbd Allāh ibn Dārim — one of the constituent houses of Banu Tamim. The chain of descent ascends through Banū Ḥanẓalah to Tamīm ibn Murr, then Ilyās ibn Muḍar, to ʿAdnān.",
  } as BiText,
  openingP2: {
    ar: "استقرت الأسرة في مدينة المبرز بواحة الأحساء، وتشهد وثائق المحاكم الشرعية المؤرخة سنة 1102 هـ على حضور أعيانها شهوداً وأوصياء على الوقفيات. ومن المبرز امتد أبناؤها إلى المنطقة الشرقية والرياض ودول الخليج.",
    en: "The family settled at Al-Mubarraz in the Al-Ahsa oasis. Sharia court records dated 1102 AH attest to its elders standing as witnesses and trustees over local endowments. From Al-Mubarraz its members extended into the Eastern Province, Riyadh, and the Gulf states.",
  } as BiText,
  openingLink: { ar: "تفصيل النسب والمصادر", en: "Full lineage and sources" } as BiText,

  branchesEyebrow: { ar: "البنية العائلية", en: "Family structure" } as BiText,
  branchesTitle: { ar: "الفروع السبعة", en: "The Seven Branches" } as BiText,
  branchesSub: {
    ar: "تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن عبدالله وأخيه صالح، ولكل فرع أفرعه الداخلية وممثلوه في مجلس الأسرة.",
    en: "The family is organised into seven principal branches descending from the sons of the patriarch Ahmed bin Abdullah and his brother Salih, each with its own sub-lineages and representation on the family council.",
  } as BiText,
  members: { ar: "فرداً موثقاً", en: "documented" } as BiText,
  allBranches: { ar: "استعراض الفروع بالتفصيل", en: "All branches in detail" } as BiText,

  hqEyebrow: { ar: "المشروع القائم", en: "Project in progress" } as BiText,
  hqCaption: {
    ar: "تصور معماري للمقر الدائم بحي الحزام الذهبي، المبرز.",
    en: "Architectural rendering of the permanent headquarters, Al-Hizam Al-Dhahabi, Al-Mubarraz.",
  } as BiText,
  hqProgress: { ar: "نسبة الإنجاز", en: "Completion" } as BiText,
  hqDetails: { ar: "تفاصيل المشروع", en: "Project details" } as BiText,
  hqFacilities: { ar: "المرافق المخططة", en: "Planned facilities" } as BiText,

  honoursEyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  honoursTitle: {
    ar: "من كفاءات ومتميزين الأسرة",
    en: "The family's achievers & distinguished members",
  } as BiText,
  allHonours: { ar: "السجل كاملاً", en: "The full roll" } as BiText,

  newsEyebrow: { ar: "المستجدات", en: "Latest" } as BiText,
  newsTitle: { ar: "المركز الإعلامي", en: "Media Center" } as BiText,
  allNews: { ar: "كل الأخبار", en: "All news" } as BiText,

  dnaEyebrow: { ar: "دراسة علمية", en: "Scientific study" } as BiText,
  dnaLink: { ar: "نتائج الدراسة الكاملة", en: "Full study results" } as BiText,
  parentClade: { ar: "السلسلة التحورية", en: "Parent clade" } as BiText,

  programmesEyebrow: { ar: "البرامج", en: "Programmes" } as BiText,
  programmesTitle: { ar: "المبادرات والبرامج", en: "Initiatives & programmes" } as BiText,
  allProgrammes: { ar: "كل المبادرات", en: "All initiatives" } as BiText,

  poemEyebrow: { ar: "من وجدان الأسرة", en: "Family verse" } as BiText,
  poemTitle: { ar: "مقترح شاعر", en: "Poet's Proposal" } as BiText,
  poemBody: {
    ar: "مساحة مخصصة لقصيدة الأسرة المقترحة. يُدرج النص هنا عند اعتماده من مجلس الأسرة.",
    en: "A reserved space for the proposed family poem. The text will appear here once approved by the family council.",
  } as BiText,

  hqSupportCta: { ar: "ننتظر دعمك", en: "We await your support" } as BiText,
  hqLocationLink: {
    ar: "موقع المقر على الخريطة",
    en: "Headquarters location on the map",
  } as BiText,

  joinTitle: {
    ar: "المشاركة في أعمال الصندوق",
    en: "Take part in the organisation's work",
  } as BiText,
  joinBody: {
    ar: "الاشتراك الشهري يموّل الأوقاف وبرامج التكافل ومشروع المقر. ويسع أبناء الأسرة كذلك المشاركة في اللجان أو تحديث بياناتهم في السجل.",
    en: "Monthly subscription funds the endowments, the solidarity programmes, and the headquarters project. Family members may also join a committee or update their record in the register.",
  } as BiText,
  joinCta: { ar: "الاشتراك والمساهمة", en: "Subscribe & contribute" } as BiText,
  contactCta: { ar: "تواصل مع لجان مجلس الأسرة", en: "Contact Family Council Committees" } as BiText,
});
