import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Central placeholder-driven site data. Family editors can replace fields
 * here (or migrate to a CMS later — each entry already has ar/en).
 */

export const siteMeta = {
  tagline: {
    ar: "أسرة عريقة، جذور تميمية، وحضور معاصر.",
    en: "A rooted family. Tamimi lineage. A contemporary presence.",
  } as BiText,
  foundedHijri: "20 صفر 1447",
  foundedGregorian: "2025",
  headquarters: {
    ar: "الأحساء، المملكة العربية السعودية",
    en: "Al-Ahsa, Kingdom of Saudi Arabia",
  } as BiText,
  registrationNumber: {
    ar: "قيد التحديث",
    en: "To be updated",
  } as BiText,
  contact: {
    phone: "+966 5X XXX XXXX",
    email: "info@alboabid.family",
    whatsapp: "https://chat.whatsapp.com/placeholder",
    telegram: "https://t.me/placeholder",
    x: "https://x.com/alboabid",
    instagram: "https://instagram.com/alboabid",
    snapchat: "https://snapchat.com/add/alboabid",
    tiktok: "https://tiktok.com/@alboabid",
    youtube: "https://youtube.com/@alboabid",
  },
};

export const stats = [
  {
    key: "members",
    label: { ar: "من أبناء الأسرة", en: "Family members" } as BiText,
    value: 1200,
    suffix: "+",
  },
  {
    key: "founded",
    label: { ar: "عام تأسيس الصندوق", en: "Fund established" } as BiText,
    value: 1447,
    suffix: " هـ",
  },
  {
    key: "initiatives",
    label: { ar: "مبادرة ومشروع", en: "Initiatives & projects" } as BiText,
    value: 12,
    suffix: "+",
  },
  {
    key: "regions",
    label: { ar: "منطقة جغرافية", en: "Regional chapters" } as BiText,
    value: 6,
    suffix: "",
  },
];

export const news = [
  {
    slug: "assembly-1447",
    date: "1447-02-20",
    section: "fund" as const,
    title: {
      ar: "إشهار صندوق التنمية العائلية لآل بوعبيد",
      en: "Al Bu Obaid Family Development Fund officially established",
    } as BiText,
    excerpt: {
      ar: "بعد أربع سنوات من الإعداد والتنسيق، تُوّج مسار الأسرة بإشهار الصندوق رسمياً وفق منظومة العمل الأهلي في المملكة.",
      en: "After four years of coordinated preparation, the Fund was formally established in line with the Kingdom's nonprofit framework.",
    } as BiText,
    body: {
      ar: "يمثل إشهار صندوق التنمية العائلية لآل بوعبيد في العشرين من صفر 1447 هـ محطة مؤسسية بارزة، تنقل عمل الأسرة من الأعراف الشفهية إلى كيان مرخص خاضع لمعايير الحوكمة والشفافية المالية، وذلك انسجاماً مع رؤية المملكة 2030 في مأسسة العمل الأهلي.",
      en: "The formal establishment of the Al Bu Obaid Family Development Fund on 20 Safar 1447 AH marks a milestone: the family moves from customary practice to a licensed entity governed by transparency and compliance standards aligned with Saudi Vision 2030.",
    } as BiText,
  },
  {
    slug: "hq-land-acquisition",
    date: "1447-01-10",
    section: "fund" as const,
    title: {
      ar: "الصندوق يستحوذ على أرض المقر المستقبلي",
      en: "Fund acquires land for its future headquarters",
    } as BiText,
    excerpt: {
      ar: "استثمار رأسمالي استراتيجي طويل الأجل يعكس التزام الأسرة ببناء بنية تحتية دائمة لأنشطتها.",
      en: "A strategic long-term capital investment reflecting the family's commitment to a permanent home for its activities.",
    } as BiText,
    body: {
      ar: "شكّل استحواذ الصندوق على أرض المقر المستقبلي الحصة الأكبر من النفقات الرأسمالية في دورته المالية الأولى، بما يعكس أولوية بناء أصل عقاري ثابت يخدم الأجيال القادمة.",
      en: "The land acquisition represented the largest share of the Fund's first-cycle capital expenditure, prioritising a lasting real-estate asset that will serve future generations.",
    } as BiText,
  },
  {
    slug: "family-gathering",
    date: "1447-03-05",
    section: "family" as const,
    title: {
      ar: "الملتقى السنوي للأسرة يجمع فروعها من الخليج",
      en: "Annual family assembly brings branches from across the Gulf",
    } as BiText,
    excerpt: {
      ar: "جمع الملتقى ممثلي فروع الأسرة في نسيج واحد يجدد الصلة بالجذور التميمية.",
      en: "The assembly gathered representatives from the family's branches, renewing the bond with its Tamimi roots.",
    } as BiText,
    body: {
      ar: "احتفت الأسرة بملتقاها السنوي بحضور فروعها الممتدة، مؤكدةً على وحدة النسيج العائلي وأهمية التواصل بين الأجيال.",
      en: "The annual assembly celebrated unity across the family's extended branches and reinforced inter-generational connection.",
    } as BiText,
  },
  {
    slug: "scholarship-program",
    date: "1447-04-01",
    section: "fund" as const,
    title: {
      ar: "إطلاق برنامج المنح الدراسية لأبناء الأسرة",
      en: "Family scholarships programme launched",
    } as BiText,
    excerpt: {
      ar: "برنامج سنوي لدعم أبناء الأسرة المتفوقين في المراحل الجامعية والدراسات العليا.",
      en: "An annual programme supporting outstanding family students in undergraduate and postgraduate study.",
    } as BiText,
    body: {
      ar: "يهدف البرنامج إلى تنمية رأس المال البشري داخل الأسرة عبر منح دراسية سنوية، ويشترط التميز الأكاديمي والالتزام بخدمة المجتمع.",
      en: "The programme develops the family's human capital through annual scholarships awarded on academic merit and community service.",
    } as BiText,
  },
];

export const initiatives = [
  {
    slug: "scholarships",
    title: { ar: "منح التعليم والتفوق", en: "Education & Excellence Grants" } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "دعم مستمر لأبناء الأسرة في الجامعات والدراسات العليا.",
      en: "Continuous support for family members in higher education.",
    } as BiText,
    body: {
      ar: "تشمل المنح الرسوم الدراسية والمصاريف المرتبطة بها، مع إرشاد أكاديمي ومهني، وفق معايير شفافة يعتمدها مجلس الأمناء.",
      en: "Grants cover tuition and related expenses, alongside academic and career mentorship, governed by transparent criteria approved by the Board of Trustees.",
    } as BiText,
  },
  {
    slug: "headquarters",
    title: { ar: "بناء المقر الدائم", en: "Permanent Headquarters" } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "تحويل الأرض المستحوذ عليها إلى مقر جامع لأنشطة الأسرة.",
      en: "Transforming the acquired land into a home for the family's activities.",
    } as BiText,
    body: {
      ar: "مشروع رأسمالي متعدد المراحل يوفر قاعات للاجتماعات، ومكتبة عائلية، ومساحة لأرشيف الأسرة، ضمن تصميم يستلهم الطراز المحلي.",
      en: "A multi-phase capital project delivering meeting halls, a family library, and an archive space, in a design inspired by local vernacular architecture.",
    } as BiText,
  },
  {
    slug: "genealogy",
    title: { ar: "توثيق النسب والدراسة الجينية", en: "Lineage & Genetic Study" } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "بحث علمي يجمع بين المصادر النسبية الكلاسيكية ونتائج الحمض النووي الحديث.",
      en: "Scholarly work bridging classical genealogical sources with modern Y-DNA findings.",
    } as BiText,
    body: {
      ar: "يوثق المشروع تسلسل الأسرة من فرع العبادل من بني تميم، ويحلل مواقعها ضمن السلالة الجينية J-Z20777، بالتعاون مع مشاريع الحمض النووي المتخصصة.",
      en: "The project documents the family's descent within the ʿAbadil branch of Banī Tamīm and situates it inside the J-Z20777 haplogroup, in partnership with specialised Y-DNA projects.",
    } as BiText,
  },
  {
    slug: "youth-forum",
    title: { ar: "ملتقى شباب الأسرة", en: "Family Youth Forum" } as BiText,
    status: "upcoming" as const,
    summary: {
      ar: "برنامج سنوي يعزز القيادة والريادة لدى الجيل الجديد.",
      en: "An annual programme fostering leadership and entrepreneurship for the next generation.",
    } as BiText,
    body: {
      ar: "يجمع الملتقى شباب الأسرة في يومين من ورش القيادة، وريادة الأعمال، والحوار مع رواد من داخل الأسرة وخارجها.",
      en: "The forum brings family youth together for two days of leadership workshops, entrepreneurship tracks, and dialogues with achievers from inside and outside the family.",
    } as BiText,
  },
  {
    slug: "elders-honor",
    title: { ar: "تكريم كبار الأسرة", en: "Honouring the Elders" } as BiText,
    status: "completed" as const,
    summary: {
      ar: "مبادرة سنوية لتوثيق سيرة كبار الأسرة وتكريمهم.",
      en: "An annual initiative documenting and honouring the family's elders.",
    } as BiText,
    body: {
      ar: "تشمل المبادرة تسجيل مقابلات مصورة وأرشفتها في المكتبة الرقمية للأسرة، وتكريم الكبار في احتفال سنوي.",
      en: "The initiative records and archives filmed interviews in the family's digital library, culminating in an annual honouring ceremony.",
    } as BiText,
  },
  {
    slug: "cultural-archive",
    title: { ar: "الأرشيف الثقافي الرقمي", en: "Digital Cultural Archive" } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "رقمنة الوثائق والصور والمخطوطات المرتبطة بتاريخ الأسرة.",
      en: "Digitising documents, photographs, and manuscripts tied to the family's history.",
    } as BiText,
    body: {
      ar: "يجري المشروع بالشراكة مع متخصصين في الأرشفة، ويهدف إلى إتاحة الموروث لأبناء الأسرة عبر بوابة رقمية آمنة.",
      en: "Carried out with archival specialists, the project makes the family's heritage accessible via a secure digital portal.",
    } as BiText,
  },
];

export const achievers = [
  {
    name: { ar: "د. عبدالله بوعبيد", en: "Dr. Abdullah Bu Obaid" } as BiText,
    field: { ar: "الطب", en: "Medicine" } as BiText,
    achievement: { ar: "استشاري في جراحة القلب", en: "Consultant cardiac surgeon" } as BiText,
    category: "medical" as const,
  },
  {
    name: { ar: "أ. فاطمة بوعبيد", en: "Prof. Fatimah Bu Obaid" } as BiText,
    field: { ar: "الأكاديميا", en: "Academia" } as BiText,
    achievement: { ar: "أستاذة اللسانيات — جامعة الملك فيصل", en: "Professor of Linguistics — King Faisal University" } as BiText,
    category: "academic" as const,
  },
  {
    name: { ar: "المهندس يوسف بوعبيد", en: "Eng. Yousef Bu Obaid" } as BiText,
    field: { ar: "الأعمال", en: "Business" } as BiText,
    achievement: { ar: "قيادي في قطاع الطاقة", en: "Energy sector leader" } as BiText,
    category: "business" as const,
  },
  {
    name: { ar: "خالد بوعبيد", en: "Khalid Bu Obaid" } as BiText,
    field: { ar: "الرياضة", en: "Sports" } as BiText,
    achievement: { ar: "بطل وطني في الفروسية", en: "National equestrian champion" } as BiText,
    category: "sports" as const,
  },
  {
    name: { ar: "د. نورة بوعبيد", en: "Dr. Nora Bu Obaid" } as BiText,
    field: { ar: "الخدمة العامة", en: "Public Service" } as BiText,
    achievement: { ar: "قيادية في العمل الأهلي", en: "Civil-society leader" } as BiText,
    category: "public" as const,
  },
  {
    name: { ar: "م. سلطان بوعبيد", en: "Eng. Sultan Bu Obaid" } as BiText,
    field: { ar: "الهندسة", en: "Engineering" } as BiText,
    achievement: { ar: "خبير في الطاقة المتجددة", en: "Renewable-energy specialist" } as BiText,
    category: "business" as const,
  },
  {
    name: { ar: "أ. مريم بوعبيد", en: "Ms. Maryam Bu Obaid" } as BiText,
    field: { ar: "الأدب", en: "Literature" } as BiText,
    achievement: { ar: "روائية وناقدة", en: "Novelist and critic" } as BiText,
    category: "academic" as const,
  },
  {
    name: { ar: "د. فيصل بوعبيد", en: "Dr. Faisal Bu Obaid" } as BiText,
    field: { ar: "الطب", en: "Medicine" } as BiText,
    achievement: { ar: "باحث في الطب الجيني", en: "Genetic-medicine researcher" } as BiText,
    category: "medical" as const,
  },
];

export const trustees = [
  { name: { ar: "رئيس مجلس الأمناء", en: "Chair, Board of Trustees" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
  { name: { ar: "نائب الرئيس", en: "Vice Chair" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
  { name: { ar: "الأمين العام", en: "Secretary General" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
  { name: { ar: "المدير المالي", en: "Chief Financial Officer" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
  { name: { ar: "عضو مجلس الأمناء", en: "Trustee" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
  { name: { ar: "عضو مجلس الأمناء", en: "Trustee" } as BiText, title: { ar: "قيد الإعلان", en: "To be announced" } as BiText },
];

export const committees = [
  { name: { ar: "اللجنة الاجتماعية", en: "Social Committee" } as BiText, desc: { ar: "الملتقيات، الأفراح، والمناسبات.", en: "Gatherings, celebrations, and family occasions." } as BiText },
  { name: { ar: "اللجنة المالية", en: "Finance Committee" } as BiText, desc: { ar: "الميزانية، الاستثمار، والتقارير المالية.", en: "Budget, investment, and financial reporting." } as BiText },
  { name: { ar: "اللجنة الإعلامية", en: "Media Committee" } as BiText, desc: { ar: "التواصل والإعلام الرقمي للأسرة.", en: "Communications and the family's digital presence." } as BiText },
  { name: { ar: "اللجنة الثقافية", en: "Cultural Committee" } as BiText, desc: { ar: "التوثيق، الأرشيف، والبرامج الثقافية.", en: "Documentation, archival, and cultural programmes." } as BiText },
];

export const libraryItems = {
  documents: [
    { title: { ar: "اللائحة الأساسية للصندوق", en: "Fund Charter (Bylaws)" } as BiText, year: 1447, kind: "PDF" },
    { title: { ar: "الخطة الاستراتيجية", en: "Strategic Plan" } as BiText, year: 1447, kind: "PDF" },
    { title: { ar: "التقرير المالي الأول", en: "First Financial Report" } as BiText, year: 1447, kind: "PDF" },
    { title: { ar: "دراسة النسب والحمض النووي", en: "Lineage & DNA Study" } as BiText, year: 1446, kind: "PDF" },
  ],
  photos: [
    { title: { ar: "الملتقى السنوي", en: "Annual Assembly" } as BiText, year: 1447 },
    { title: { ar: "توقيع اللائحة الأساسية", en: "Signing of the Charter" } as BiText, year: 1447 },
    { title: { ar: "تكريم الكبار", en: "Honouring the Elders" } as BiText, year: 1446 },
    { title: { ar: "زيارة المقر", en: "Headquarters Site Visit" } as BiText, year: 1447 },
  ],
  videos: [
    { title: { ar: "كلمة رئيس مجلس الأمناء", en: "Chair's Address" } as BiText, year: 1447 },
    { title: { ar: "قصة الأسرة", en: "The Family Story" } as BiText, year: 1446 },
  ],
};

export const lineageChain = [
  { ar: "الأسرة", en: "The Family" },
  { ar: "العبادل", en: "Al-ʿAbadil" },
  { ar: "عبد الله بن دارم", en: "ʿAbd Allāh ibn Dārim" },
  { ar: "بنو تميم", en: "Banī Tamīm" },
  { ar: "إلياس بن مضر", en: "Ilyās ibn Muḍar" },
  { ar: "عدنان", en: "ʿAdnān" },
  { ar: "إسماعيل عليه السلام", en: "Ismāʿīl (peace be upon him)" },
];

export const dnaDistribution = [
  { region: { ar: "قطر", en: "Qatar" } as BiText, note: { ar: "الكواري، المهندي، البوعينين، الخيارين", en: "Al-Kuwari, Al-Mohannadi, Al-Buainain, Al-Khayarin" } as BiText },
  { region: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" } as BiText, note: { ar: "فروع تميمية متعددة", en: "Multiple Tamimi branches" } as BiText },
  { region: { ar: "الإمارات والبحرين والكويت", en: "UAE, Bahrain, Kuwait" } as BiText, note: { ar: "امتداد ديموغرافي مستقر", en: "Established demographic presence" } as BiText },
];

export const references = [
  { label: "معجم قبائل العرب — المكتبة الإلكترونية", url: "https://www.masaha.org/book/view/2995/page/709" },
  { label: "Al-3rab 29 (1994) — Internet Archive", url: "https://archive.org/stream/al3rab29-1994/al3rab29-1994_djvu.txt" },
  { label: "Alnoaim Y-DNA Results — FamilyTreeDNA", url: "https://www.familytreedna.com/public/Alnoaim?iframe=ydna-results-overview" },
];
