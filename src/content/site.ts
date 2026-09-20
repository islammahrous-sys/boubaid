import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Official site content for Al Bu Obaid Family ("آل بوعبيد")
 * Operating under registered entity: صندوق التنمية العائلية (Family Development Fund)
 * Licensed by NCNP (المركز الوطني لتنمية القطاع غير الربحي) under license #1200758400 (20 Safar 1447H / 14 August 2025)
 */

export const siteMeta = {
  officialName: {
    ar: "صندوق التنمية العائلية (آل بوعبيد)",
    en: "Al-Boabid Family Development Fund",
  } as BiText,
  shortName: {
    ar: "آل بوعبيد",
    en: "Al-Boabid",
  } as BiText,
  tagline: {
    ar: "أسرة عريقة، جذور تميمية، وحضور مؤسسي معاصر.",
    en: "An ancient family, Tamimi roots, and a contemporary institutional presence.",
  } as BiText,
  ncnpLicense: "1200758400",
  ncnpAuthority: {
    ar: "المركز الوطني لتنمية القطاع غير الربحي",
    en: "National Center for Nonprofit Sector (NCNP)",
  } as BiText,
  /** Unified National Number issued alongside the NCNP license — appears on the license certificate and audited financial statements. */
  unifiedNationalNumber: "7051186638",
  licenseIssued: "2025-08-14",
  licenseExpiry: "2029-08-14",
  legalBasis: {
    ar: "المرسوم الملكي رقم م/8 وتاريخ 19/2/1437هـ (نظام الجمعيات والمؤسسات الأهلية)",
    en: "Royal Decree No. M/8 dated 19/02/1437H (Law of Associations and Civil Institutions)",
  } as BiText,
  foundedHijri: "20 صفر 1447",
  foundedGregorian: "14 أغسطس 2025",
  /** Bilingual, display-ready registration date (already includes هـ / AH). */
  foundedHijriLabel: { ar: "20 صفر 1447 هـ", en: "20 Safar 1447 AH" } as BiText,
  foundedGregorianLabel: { ar: "14 أغسطس 2025", en: "14 August 2025" } as BiText,
  headquarters: {
    ar: "حي الحزام الذهبي، المبرز، محافظة الأحساء، المملكة العربية السعودية",
    en: "Al-Hizam Al-Dhahabi District, Al-Mubarraz, Al-Ahsa Governorate, KSA",
  } as BiText,
  /** Precise Saudi National Address (Address Proof #1073542966, issued 16/10/2025). */
  nationalAddress: {
    shortAddress: "FMDF7959",
    buildingNo: "7959",
    street: { ar: "الصدفة", en: "Al Sudfa" } as BiText,
    district: { ar: "حي الحزام الذهبي", en: "Al Hizam Adh Dhahabi District" } as BiText,
    secondaryNo: "3411",
    postalCode: "36422",
    city: { ar: "المبرز", en: "Al Mubarraz" } as BiText,
    country: { ar: "المملكة العربية السعودية", en: "Kingdom of Saudi Arabia" } as BiText,
    full: {
      ar: "مبنى 7959، شارع الصدفة، حي الحزام الذهبي 3411، الرمز البريدي 36422، المبرز، المملكة العربية السعودية (العنوان المختصر: FMDF7959)",
      en: "Building 7959, Al Sudfa Street, Al Hizam Adh Dhahabi Dist. 3411, Postal Code 36422, Al Mubarraz, Kingdom of Saudi Arabia (Short Address: FMDF7959)",
    } as BiText,
  },
  domain: "albouabidfamily.com",
  /** Official family-tree frames catalog on the external store. */
  frameStoreUrl:
    "https://albouabidfamily.com/%D8%B4%D8%AC%D8%B1%D8%A9-%D8%A7%D9%84%D8%A3%D8%B3%D8%B1%D8%A9/c1284478939",
  sallaStoreUrl: "https://albouabidfamily.com/القسط-الشهري/c1360847582",

  contact: {
    phone: "+966 13 580 0000",
    email: "contact@albouabidfamily.com",
    /** Secretariat / chairman correspondence address. */
    secretariatEmail: "khalid@buobaidlc.sa.com",
    /** Bank-registered address for the fund — used on the contribution page. */
    fundEmail: "family.fund@boubaid.com",
    whatsapp: "https://chat.whatsapp.com/albouabidfamily",
    telegram: "https://t.me/albouabidfamily",
    x: "https://x.com/alboubaidsa?s=11&t=JjqjL-WTkQap2J3eRRQdSQ",
    instagram: "https://www.instagram.com/alboubaidsa?igsi=b21oN2I4dXhlcGg3",
    youtube: "https://youtube.com/@albouabidfamily",
    snapchat: "https://www.snapchat.com/add/alboubaidsa",
    /** Google Maps pin for the permanent headquarters plot. */
    mapUrl: "https://maps.app.goo.gl/75fDFmv9vnEboKr58",
  },
  // The fund's bank account is NOT kept here — anything in this file ships to
  // every anonymous visitor in the client bundle. It is served member-gated by
  // `getMemberBankAccount` (src/lib/contributions.functions.ts) from `SITE_BANK_*`
  // server env.
};

/**
 * The seven principal lines of the family, as drawn in the twelve
 * committee-verified charts (see `src/content/tree/charts.ts`).
 *
 * `count` is a fallback only — the live figure comes from
 * `getPublicFamilyStats()` (a live count of `family_members`), summed over
 * each branch's `dbSlugs`. `id` matches the `branches.slug` used in Supabase
 * so the content console can override a branch's name, text and portrait;
 * `dbSlugs` lists the chart-level DB branch rows that roll up into this
 * editorial branch (the sixth branch aggregates six `عبدالرحمن` sub-lines).
 */
export const branches = [
  {
    id: "al-yousef",
    dbSlugs: ["al-yousef"],
    name: { ar: "فرع آل يوسف", en: "Al Yousef Branch" } as BiText,
    ancestor: {
      ar: "الجد يوسف بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Yousef bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_yousef.png",
    treePoster: "/images/branch_tree_al_yousef.jpg",
    settlement: {
      ar: "المبرز بالأحساء، الرياض، جدة",
      en: "Al-Mubarraz (Al-Ahsa), Riyadh, Jeddah",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية الموثقة: ذرية محمد بن يوسف • ذرية يوسف بن يوسف — المشجرة المعتمدة رقم ١",
      en: "Documented sub-lineages: descendants of Mohammed bin Yousef and Yousef bin Yousef — official chart 1",
    } as BiText,
    description: {
      ar: "فرع ينبض بالحيوية والطموح، يضم طاقات شبابية قيادية متميزة في التقنية وريادة الأعمال والاستثمار، وإسهامات بارزة في الإعلام والتنظيم اللوجستي لاجتماعات الأسرة في الأحساء والمملكة.",
      en: "A dynamic and ambitious branch featuring young leaders in technology, entrepreneurship, investment and media, and in organising the family's gatherings in Al-Ahsa and beyond.",
    } as BiText,
    count: 46,
    keyFigures: [
      {
        ar: "أ. يوسف بن محمد بوعبيد (رائد أعمال)",
        en: "Mr. Yousef bin Mohammed Bu Obaid (Entrepreneur)",
      } as BiText,
      {
        ar: "أ. عبدالإله بن محمد بوعبيد (إعلامي)",
        en: "Mr. Abdulelah bin Mohammed Bu Obaid (Media Executive)",
      } as BiText,
    ],
  },
  {
    id: "al-abdulaziz",
    dbSlugs: ["al-abdulaziz"],
    name: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالعزيز بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Abdulaziz bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdulaziz.png",
    treePoster: "/images/branch_tree_al_abdulaziz.jpg",
    settlement: {
      ar: "الأحساء، الرياض، الجبيل الصناعية",
      en: "Al-Ahsa, Riyadh, Jubail Industrial City",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية الموثقة: ذرية أحمد بن عبدالعزيز • ذرية محمد بن عبدالعزيز — المشجرة المعتمدة رقم ٢",
      en: "Documented sub-lineages: descendants of Ahmed and Mohammed bin Abdulaziz — official chart 2",
    } as BiText,
    description: {
      ar: "يمتاز هذا الفرع الأصيل بحضوره في قطاعات الخدمة العامة والهندسة والإدارة المالية، وله إسهامات فاعلة في إدارة المبادرات العائلية وصندوق الأسرة وبرامج التواصل المشترك.",
      en: "Distinguished by presence in public service, engineering and financial management, and by an active role in the family's endowment initiatives and inter-branch programmes.",
    } as BiText,
    count: 35,
    keyFigures: [
      {
        ar: "العميد عبدالعزيز بن صالح بوعبيد",
        en: "Brigadier Abdulaziz bin Salih Bu Obaid",
      } as BiText,
      { ar: "م. نبيل بن محمد بوعبيد", en: "Eng. Nabil bin Mohammed Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-mohammed-ahmed",
    dbSlugs: ["al-mohammed-ahmed"],
    name: { ar: "فرع آل محمد", en: "Al Mohammed Branch" } as BiText,
    ancestor: {
      ar: "الجد محمد بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Mohammed bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_mohammed_ahmed.png",
    treePoster: "/images/branch_tree_al_mohammed_ahmed.jpg",
    settlement: {
      ar: "الأحساء، الدمام، الكويت، البحرين",
      en: "Al-Ahsa, Dammam, Kuwait, Bahrain",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية الموثقة: ذرية جاسم (قاسم) بن محمد • ذرية عيسى بن محمد — المشجرتان المعتمدتان ٥ و٩",
      en: "Documented sub-lineages: descendants of Jasim (Qasim) and Isa bin Mohammed — official charts 5 and 9",
    } as BiText,
    description: {
      ar: "أصغر الفروع عدداً في المشجرات المعتمدة، ويتميز بالعطاء العلمي والثقافي وبكفاءاته في قطاعات التقنية والتطوير المؤسسي، مع اهتمام خاص بالتوثيق الرقمي للمشجرة.",
      en: "The smallest branch in the verified charts, marked by academic and cultural contribution, expertise in technology and institutional development, and a particular interest in digital genealogical preservation.",
    } as BiText,
    count: 9,
    keyFigures: [
      {
        ar: "أ. محمد بن أحمد بوعبيد (لجنة التواصل)",
        en: "Mr. Mohammed bin Ahmed Bu Obaid (Communication Chair)",
      } as BiText,
    ],
  },
  {
    id: "al-saad",
    dbSlugs: ["al-saad"],
    name: { ar: "فرع آل سعد", en: "Al Saad Branch" } as BiText,
    ancestor: {
      ar: "الجد سعد بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Saad bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_saad.png",
    treePoster: "/images/branch_tree_al_saad.jpg",
    settlement: {
      ar: "المبرز بالأحساء، الدمام، الرياض",
      en: "Al-Mubarraz (Al-Ahsa), Dammam, Riyadh",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية الموثقة: ذرية أحمد بن سعد • ذرية عيسى بن سعد • ذرية محمد بن سعد — المشجرة المعتمدة رقم ٦",
      en: "Documented sub-lineages: descendants of Ahmed, Isa and Mohammed bin Saad — official chart 6",
    } as BiText,
    description: {
      ar: "أحد أعرق فروع الأسرة في المبرز بالأحساء، يتميز ببروز كفاءاته في القيادة الإدارية والقطاعات الاقتصادية والوقفيات الأهلية، مع إسهامات مشهودة في دعم مجلس الأسرة والتنمية المجتمعية.",
      en: "One of the family's most historic branches in Al-Mubarraz, Al-Ahsa, notable for administrative leadership, economic sectors and civic endowments, with recognised support for the family council and community development.",
    } as BiText,
    count: 46,
    keyFigures: [
      {
        ar: "الشيخ سعد بن عبدالله بوعبيد (عضو مجلس الأمناء)",
        en: "Sheikh Saad bin Abdullah Bu Obaid (Trustee)",
      } as BiText,
      { ar: "أ. مانع بن سعد بوعبيد", en: "Mr. Mana bin Saad Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-abdullatif",
    dbSlugs: ["al-abdullatif"],
    name: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    ancestor: {
      ar: "الجد عبداللطيف بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Abdullatif bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdullatif.png",
    treePoster: "/images/branch_tree_al_abdullatif.jpg",
    settlement: { ar: "المبرز القديم بالأحساء، الدمام", en: "Old Al-Mubarraz, Dammam" } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية الموثقة: ذرية أحمد بن عبداللطيف • ذرية محمد بن عبداللطيف — المشجرة المعتمدة رقم ٧",
      en: "Documented sub-lineages: descendants of Ahmed and Mohammed bin Abdullatif — official chart 7",
    } as BiText,
    description: {
      ar: "يُعتبر هذا الفرع أيقونة أكاديمية ومهنية حديثة في تاريخ الأسرة، فقد أثمر شخصيات بارزة حصدت أعلى المراتب، ويرأس منه حالياً رئيس مجلس أمناء الصندوق، كما يضم قيادات أمنية وعسكرية شابة متميزة.",
      en: "A modern academic and professional icon in the family's history, this branch has produced figures who reached the highest ranks — including the organisation's current Chairman of the Board of Trustees — alongside distinguished young security and military leaders.",
    } as BiText,
    count: 48,
    keyFigures: [
      {
        ar: "د. خالد بن يوسف بن أحمد بوعبيد (رئيس مجلس الأمناء)",
        en: "Dr. Khaled bin Yousef bin Ahmed Bu Obaid (Chairman, Board of Trustees)",
      } as BiText,
      {
        ar: "الضابط عبدالله بن خالد بوعبيد (كلية الملك فهد الأمنية)",
        en: "Officer Abdullah bin Khaled Bu Obaid (King Fahd Security College)",
      } as BiText,
      {
        ar: "الضابط ريان بن خالد بوعبيد (كلية الملك عبدالله للدفاع الجوي)",
        en: "Officer Rayan bin Khaled Bu Obaid (King Abdullah Air Defence College)",
      } as BiText,
    ],
  },
  {
    id: "al-abdulrahman",
    dbSlugs: [
      "al-abdullah-salih",
      "al-ali-salih",
      "al-mohammed-salih",
      "al-ibrahim-salih",
      "al-ahmed-abdulrahman",
      "al-abdulaziz-abdulrahman",
    ],
    name: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالرحمن بن أحمد بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Abdulrahman bin Ahmed bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdulrahman.png",
    treePoster: "/images/branch_tree_al_abdulrahman.jpg",
    settlement: {
      ar: "حي العيوني والمبرز بالأحساء، الخبر، الظهران",
      en: "Al-Oyouni & Al-Mubarraz, Khobar, Dhahran",
    } as BiText,
    subBranches: {
      ar: "أكبر الفروع، وأفرعه الداخلية الموثقة: ذرية صالح بن عبدالرحمن (عبدالله، علي، محمد، إبراهيم) • ذرية أحمد بن عبدالرحمن • ذرية عبدالعزيز بن عبدالرحمن — المشجرات المعتمدة ٣ و٤ و٩ و١٠ و١١ و١٢",
      en: "The largest branch; documented sub-lineages: descendants of Salih bin Abdulrahman (Abdullah, Ali, Mohammed, Ibrahim), Ahmed bin Abdulrahman and Abdulaziz bin Abdulrahman — official charts 3, 4, 9, 10, 11 and 12",
    } as BiText,
    description: {
      ar: "أكبر فروع الأسرة عدداً في المشجرات المعتمدة، وله ثقل اجتماعي وتاريخي بارز في المبرز والمنطقة الشرقية، ويزخر بالنخب الأكاديمية والطبية والهندسية، وتعود وثائقه الشرعية وأوقافه إلى حقب عريقة مسجلة في سجلات الأحساء.",
      en: "The largest branch in the verified charts and a prominent social and historical pillar in Al-Mubarraz and the Eastern Province, rich in academic, medical and engineering talent, with endowment deeds recorded in the historic registers of Al-Ahsa.",
    } as BiText,
    count: 276,
    keyFigures: [
      {
        ar: "د. عبدالرحمن بن محمد بوعبيد (أكاديمي وطبيب)",
        en: "Dr. Abdulrahman bin Mohammed Bu Obaid",
      } as BiText,
      { ar: "أ. يعقوب بن محمد بوعبيد", en: "Mr. Yaqoub bin Mohammed Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-abdullah-salih-abdullah",
    dbSlugs: ["al-abdullah-salih-abdullah"],
    name: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالله بن صالح بن عبدالله آل بوعبيد التميمي",
      en: "Patriarch Abdullah bin Salih bin Abdullah Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdullah_salih.png",
    treePoster: "/images/branch_tree_al_abdullah_salih.jpg",
    settlement: {
      ar: "حي الحزام الذهبي بالأحساء، الخبر",
      en: "Al-Hizam Al-Dhahabi (Al-Ahsa), Khobar",
    } as BiText,
    subBranches: {
      ar: "الفرع المنحدر من صالح بن عبدالله — الجد الجامع، وذريته موثقة في المشجرة المعتمدة رقم ٨",
      en: "The line descending from Salih bin Abdullah, the root ancestor; documented in official chart 8",
    } as BiText,
    description: {
      ar: "يمثل ركيزة أساسية في الروابط العائلية، ويشتهر رجاله بالعطاء الاجتماعي والمبادرات الإنسانية والتواجد المؤثر في اللجان التنظيمية، وقيادة مشروع المقر الرئيسي للأسرة في حي الحزام الذهبي.",
      en: "A cornerstone of family cohesion, known for social philanthropy, civic initiative and leadership of the family's headquarters project in Al-Hizam Al-Dhahabi.",
    } as BiText,
    count: 87,
    keyFigures: [
      {
        ar: "أ. عبدالله بن صالح بوعبيد (رئيس لجنة المقر)",
        en: "Mr. Abdullah bin Salih Bu Obaid (HQ Chair)",
      } as BiText,
      { ar: "أ. وليد بن محمد بوعبيد", en: "Mr. Walid bin Mohammed Bu Obaid" } as BiText,
    ],
  },
];

export const dnaInfo = {
  haplogroup: "J-BY37877",
  parentClade:
    "J1-M267 > J-M304 > J-Z20775 > J-Z20773 > J-Z20776 > J-Z20774 > J-Z20777 > J-ZS7621 > J-ZS4623 > J-BY37877",
  title: {
    ar: "الدراسة الجينية لأسرة آل بوعبيد (تحت التحور J-Z20777)",
    en: "Y-DNA Genetic Genealogy of Al Bu Obaid Family (under the J-Z20777 clade)",
  } as BiText,
  overview: {
    ar: "أسفر فحص الحمض النووي (Y-DNA) الممثل لأسرة آل بوعبيد في الأحساء عن انتماء بيّن لا يقبل الشك إلى السلالة J-Z20773، وهو تحور فرعي محوري يتطابق بشكل مطلق مع النتائج المرجعية لقبيلة بني تميم عموماً ولفرع بني دارم خصوصاً. ويتفرع منها لاحقاً التحور الأحدث J-Z20777 الذي تزامن نشوؤه مع فجر الإسلام وبداية الفتوحات الكبرى، وصولاً إلى الفرع الطرفي J-BY37877 حيث يظهر اسم «آل بوعبيد» صراحةً في لوحتي الأسرة الجينيتين إلى جانب عوائل الأحساء والخليج المتحالفة معها جينياً.",
    en: "Y-DNA testing of samples representing the Al Bu Obaid family of Al-Ahsa produced an unambiguous match to the J-Z20773 lineage, a pivotal branch mutation that aligns exactly with reference results for Banu Tamim generally and the Banu Dārim branch specifically. A more recent downstream mutation, J-Z20777 — whose emergence coincides with the dawn of Islam and the early conquests — leads down to the terminal branch J-BY37877, under which 'Al Bu Obaid' is named explicitly on both of the family's own haplogroup charts, alongside genetically allied families from Al-Ahsa and the Gulf.",
  } as BiText,
  disclaimer: {
    ar: "ملاحظة منهجية: تُعرض نتائج علم الجينات والأنساب الجينية بوصفها قرائن بحثية واستئناسية علمية معاصرة تدعم المصادر التاريخية المكتوبة والمشجرات الأهلية الموثقة، وليست بديلاً عن الموروث والوثائق الشرعية. كما تجدر الإشارة إلى أن الأسرة تحتفظ بنسختين (إصدارين) من لوحة الشجرة الجينية، تختلفان قليلاً في تسميات بعض التحورات الوسيطة وتقديرات أعمارها — وهو أمر متوقع مع تحديث أدوات التحليل الجيني العالمية دورياً — لكنهما تتفقان تماماً على موضع «آل بوعبيد» ضمن الفرع الطرفي ذاته.",
    en: "Methodological Disclaimer: Genetic genealogy results serve as contemporary scientific research evidence that complements historical documents and verified oral traditions, not as a replacement for legal family deeds. Note also that the family holds two editions of its haplogroup chart, which differ slightly in the labelling of some intermediate mutations and their age estimates — expected as global genetic-analysis tools are periodically updated — but which agree exactly on Al Bu Obaid's position within the same terminal branch.",
  } as BiText,
  /**
   * SNP-by-SNP path, read root to tip. This merges the two haplogroup charts
   * commissioned by the family (a first and a revised "second" edition): the
   * upstream chain (Z20775→Z20773→Z20776→Z20774→Z20777) and TMRCA years are
   * taken from the fuller, revised edition; both editions agree that "Al Bu
   * Obaid" is named explicitly at the tip of the ZS7621→ZS4623→BY37877 branch.
   */
  haplogroupTimeline: [
    {
      snp: "J-Z20775",
      year: "١٦٥٠ سنة",
      note: {
        ar: "الجد الأعلى المشترك لهذا التكتل الفرعي داخل السلالة الأكبر J1.",
        en: "The shared common ancestor of this sub-cluster within the larger J1 lineage.",
      } as BiText,
    },
    {
      snp: "J-Z20773",
      year: "١٥٥٠ سنة",
      note: {
        ar: "التحور المرجعي الذي أكدت الفحوصات الجينية انتماء آل بوعبيد إليه قطعياً، ويتطابق مع نتائج بني تميم عموماً وبني دارم خصوصاً.",
        en: "The reference mutation Al Bu Obaid's testing confirmed unambiguously, matching results for Banu Tamim generally and Banu Dārim specifically.",
      } as BiText,
    },
    {
      snp: "J-Z20776",
      year: "١٣٥٠ سنة",
      note: {
        ar: "استمرار التفرع داخل التكتل نفسه.",
        en: "Continued branching within the same cluster.",
      } as BiText,
    },
    {
      snp: "J-Z20774",
      year: "١٣٢٥ سنة",
      note: {
        ar: "استمرار التفرع داخل التكتل نفسه.",
        en: "Continued branching within the same cluster.",
      } as BiText,
    },
    {
      snp: "J-Z20777",
      year: "١٣٠٠ سنة",
      note: {
        ar: "تحور فرعي بارز يتزامن نشوؤه مع فجر الإسلام وبداية الفتوحات الكبرى. وضمن هذا التكتل الأوسع (بحسب لوحتي الأسرة) يظهر أيضاً امتداد نادر إلى عوائل في المغرب استقرت هناك إثر الفتوحات الإسلامية لشمال أفريقيا.",
        en: "A prominent subclade coinciding with the dawn of Islam and the early conquests. Within this wider cluster (per the family's two charts) there also appears a rare extension to families in Morocco who settled there following the Islamic conquests of North Africa.",
      } as BiText,
    },
    {
      snp: "J-ZS7621",
      year: "١٠٠٠ سنة",
      note: {
        ar: "الفرع المحدد الذي تتفرع منه سلالة آل بوعبيد وأبناء عمومتهم ضمن كلتا لوحتي الأسرة.",
        en: "The specific branch from which the Al Bu Obaid lineage and its cousins descend on both of the family's charts.",
      } as BiText,
    },
    {
      snp: "J-ZS4623",
      year: "٩٥٠ سنة",
      note: {
        ar: "الجيل السابق مباشرة للتحور الطرفي.",
        en: "The generation immediately preceding the terminal mutation.",
      } as BiText,
    },
    {
      snp: "J-BY37877",
      year: "٩٠٠ سنة",
      note: {
        ar: "التحور الطرفي الذي يظهر تحته اسم «آل بوعبيد» صراحةً في كلتا لوحتي الأسرة، إلى جانب آل درويش والنعيمي والرميحي وعوائل أخرى من الأحساء والخليج.",
        en: "The terminal mutation under which 'Al Bu Obaid' is named explicitly on both family charts, alongside Al Darwish, Al Naimi, Al Rumaihi, and other families from Al-Ahsa and the Gulf.",
      } as BiText,
    },
  ],
  /** Families sharing the terminal branch J-BY37877 with Al Bu Obaid, per the family's own haplogroup charts (merged from both editions). */
  siblingFamilies: {
    region: {
      ar: "الأحساء، الخبر، الدمام، وعوائل ممتدة في قطر والكويت",
      en: "Al-Ahsa, Khobar, Dammam, and extended families in Qatar and Kuwait",
    } as BiText,
    names: [
      "آل درويش",
      "آل بوعبيد",
      "آل محمد الودعاني",
      "المعاودة (العتوب)",
      "العدوان الرزين",
      "البوعينين",
      "الصمخان الكييسي",
      "آل مسلم",
      "الحميدي",
      "البوعقرة المنصوري",
      "الرميحي",
      "آل أحمد",
      "العشان",
      "المناعي",
      "النعيمي (الرمزاني والجبر)",
      "بيوشقر آل علي",
      "آل الشيخ صالح",
      "الطعان الخليفي",
      "السويدي (بن راشد، بن مطر، بن سيفان)",
    ],
  },
  timelineNote: {
    ar: "المصدر: نسختا الشجرة الجينية للتحور J-Z20777 المعتمدتان من الأسرة (إصدار أول وإصدار ثانٍ منقّح). تختلف النسختان قليلاً في أسماء بعض التحورات الوسيطة وتقديرات أعمارها — بل وفي موضع تفرّع بعض العوائل البعيدة — غير أنهما تتفقان تماماً على أن «آل بوعبيد» يظهر اسمه صراحةً في نهاية الفرع Z20777 → ZS7621 → ZS4623 → BY37877، إلى جانب عوائل الأحساء والخليج المتحالفة معه جينياً. كما تُظهر كلتا اللوحتين، كلٌ بطريقتها، امتداداً لافتاً ضمن هذا التكتل الأوسع إلى عوائل في المغرب استقرت هناك إثر الفتوحات الإسلامية لشمال أفريقيا.",
    en: "Source: the two editions of the family's J-Z20777 haplogroup chart (a first and a revised second edition). The two differ slightly in the labelling of some intermediate mutations and their age estimates — and even in exactly where certain distant families branch off — but agree exactly that 'Al Bu Obaid' is named explicitly at the end of the Z20777 → ZS7621 → ZS4623 → BY37877 branch, alongside genetically allied families from Al-Ahsa and the Gulf. Both charts, each in its own way, also show a notable extension within this wider cluster to families in Morocco who settled there following the Islamic conquests of North Africa.",
  } as BiText,
  geographicDistribution: [
    {
      country: { ar: "دولة قطر", en: "Qatar" } as BiText,
      flagCode: "qa",
      regions: { ar: "الدوحة، الوكرة، الشمال", en: "Doha, Al Wakrah, Al Shamal" } as BiText,
      families: {
        ar: "الكواري، المهندي، البوعينين، الخيارين (تكتل فرعي J-ZS9361)",
        en: "Al-Kuwari, Al-Mohannadi, Al-Buainain, Al-Khayarin (J-ZS9361 sub-cluster)",
      } as BiText,
      sampleLabel: { ar: "78 عينة", en: "78 samples" } as BiText,
      barWidth: "100%",
      note: {
        ar: "تشكل قطر أكبر مركز ديموغرافي موثق للتحور، ويعكس ذلك تركز مكثف في المنطقة الشرقية القطرية.",
        en: "Qatar forms the largest documented demographic centre for the mutation, reflecting a dense concentration in the country's eastern region.",
      } as BiText,
    },
    {
      country: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" } as BiText,
      flagCode: "sa",
      regions: {
        ar: "المنطقة الشرقية (الأحساء والمبرز تحديداً) ونجد",
        en: "Eastern Province (specifically Al-Ahsa and Al-Mubarraz) and Najd",
      } as BiText,
      families: {
        ar: "آل بوعبيد وفروع بني تميم المتحالفة جينياً — 28 عينة موثقة لـ Z20773، منها 19 عينة موثقة لـ Z20777",
        en: "Al Bu Obaid & allied Tamimi branches — 28 samples confirmed for Z20773, 19 of which confirmed for Z20777",
      } as BiText,
      sampleLabel: { ar: "28 عينة", en: "28 samples" } as BiText,
      barWidth: "36%",
      note: {
        ar: "يعكس الثقل الديموغرافي التاريخي لهجرة العبادل من حوطة بني تميم نحو الساحل.",
        en: "Reflects the historic demographic weight of the ʿAbadil migration from Al-Hawtah of Banu Tamim toward the coast.",
      } as BiText,
    },
    {
      country: { ar: "مملكة البحرين", en: "Bahrain" } as BiText,
      flagCode: "bh",
      regions: { ar: "المحرق، الرفاع", en: "Muharraq, Riffa" } as BiText,
      families: {
        ar: "أبناء العمومة من فروع بني تميم",
        en: "Cousin branches of Banu Tamim",
      } as BiText,
      sampleLabel: { ar: "10 عينات", en: "10 samples" } as BiText,
      barWidth: "13%",
      note: {
        ar: "يمثل امتداداً جغرافياً طبيعياً وبيولوجياً للوجود الديموغرافي التاريخي في إقليم البحرين القديم اللصيق بواحة الأحساء.",
        en: "A natural geographic and biological extension of the historic demographic presence in the old Bahrain region adjoining the Al-Ahsa oasis.",
      } as BiText,
    },
    {
      country: { ar: "دولة الكويت", en: "Kuwait" } as BiText,
      flagCode: "kw",
      regions: { ar: "العاصمة، الأحمدي", en: "Kuwait City, Ahmadi" } as BiText,
      families: {
        ar: "عوائل تميمية يلتقي معها التحور",
        en: "Tamimi families under the same haplogroup",
      } as BiText,
      sampleLabel: { ar: "6 عينات", en: "6 samples" } as BiText,
      barWidth: "8%",
      note: {
        ar: "يعكس هجرات متأخرة ناتجة عن النشاط التجاري المزدهر والتواصل البيني على طول ساحل الخليج العربي.",
        en: "Reflects later migrations driven by flourishing trade activity and interconnection along the Gulf coast.",
      } as BiText,
    },
    {
      country: { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" } as BiText,
      flagCode: "ae",
      regions: { ar: "أبوظبي ودبي", en: "Abu Dhabi and Dubai" } as BiText,
      families: {
        ar: "تجمعات لعائلات مثل النعيمي والمنصوري",
        en: "Clusters including Al Naimi and Al Mansouri families",
      } as BiText,
      sampleLabel: { ar: "3-4 عينات", en: "3-4 samples" } as BiText,
      barWidth: "5%",
      note: {
        ar: "تشير إلى تحالفات قبلية وهجرات ساحلية لعائلات مثل النعيمي والمنصوري.",
        en: "Suggests tribal alliances and coastal migrations for families such as Al Naimi and Al Mansouri.",
      } as BiText,
    },
    {
      country: { ar: "سلطنة عمان", en: "Oman" } as BiText,
      flagCode: "om",
      regions: { ar: "مسقط", en: "Muscat" } as BiText,
      families: {
        ar: "عينة موثقة واحدة",
        en: "A single documented sample",
      } as BiText,
      sampleLabel: { ar: "عينة واحدة", en: "1 sample" } as BiText,
      barWidth: "1%",
      note: {
        ar: "تشير إلى امتداد جغرافي محدود نحو جنوب شرق شبه الجزيرة العربية عبر قوافل التجارة.",
        en: "Points to a limited geographic extension toward the southeast of the Arabian Peninsula via trade caravans.",
      } as BiText,
    },
    {
      country: { ar: "المملكة المغربية", en: "Morocco" } as BiText,
      flagCode: "ma",
      regions: {
        ar: "الدار البيضاء وأقاليم المغرب الأقصى",
        en: "Casablanca and the Far Maghreb",
      } as BiText,
      families: {
        ar: "عينات موثقة غير متوقعة ديموغرافياً",
        en: "Demographically unexpected but documented samples",
      } as BiText,
      sampleLabel: { ar: "8 عينات", en: "8 samples" } as BiText,
      barWidth: "10%",
      note: {
        ar: "مفاجأة تربط أنثروبولوجياً بفتوحات شمال أفريقيا الإسلامية، حيث استقرت وحدات عسكرية من بني تميم في أقصى المغرب واندمجت في النسيج المحلي مع احتفاظها ببصمتها الأبوية.",
        en: "An anthropological surprise linked to the Islamic conquests of North Africa, where Bani Tamim military units settled in the far Maghreb and assimilated into the local fabric while retaining their paternal genetic signature.",
      } as BiText,
    },
  ],
  databases: [
    {
      name: "FamilyTreeDNA Discover — J-Z20773",
      url: "https://discover.familytreedna.com/y-dna/J-Z20773",
    },
    {
      name: "FamilyTreeDNA Discover — J-Z20777",
      url: "https://discover.familytreedna.com/y-dna/J-Z20777",
    },
    {
      name: "FamilyTreeDNA Discover — J-Z20775",
      url: "https://discover.familytreedna.com/y-dna/J-Z20775",
    },
    {
      name: "FamilyTreeDNA Discover — J-FT162931",
      url: "https://discover.familytreedna.com/y-dna/J-FT162931",
    },
    { name: "YFull Tree (J-Z20773)", url: "https://www.yfull.com/tree/J-Z20773/" },
    {
      name: "Qatar Y-DNA Results Overview (FamilyTreeDNA)",
      url: "https://www.familytreedna.com/public/qatar?iframe=ydna-results-overview",
    },
  ],
};

export const boardOfTrustees = [
  {
    role: { ar: "عميد الأسرة (المنصب التقليدي)", en: "Family Dean (Traditional Office)" } as BiText,
    name: {
      ar: "الأستاذ سعد بن عبدالرحمن بن علي بوعبيد",
      en: "Mr. Saad bin Abdulrahman bin Ali Bu Obaid",
    } as BiText,
    bio: {
      ar: "يحتفظ بمنصب «عميد الأسرة» العرفي، ويمثل استمرارية «رأس المال الرمزي» الذي يوازن بين الحوكمة الإدارية الحديثة الملتزمة بتعليمات الدولة والمكانة الاجتماعية المتوارثة التي تضمن التماسك الروحي وولاء الأسرة الممتدة.",
      en: "Holds the customary office of Family Dean, embodying the family's continuing 'symbolic capital' — a deliberate balance between modern, state-compliant administrative governance and the inherited social standing that secures the extended family's spiritual cohesion and loyalty.",
    } as BiText,
  },
  {
    role: { ar: "رئيس مجلس الأمناء", en: "Chairman, Board of Trustees" } as BiText,
    name: {
      ar: "د. خالد بن يوسف بن أحمد بوعبيد",
      en: "Dr. Khaled bin Yousef bin Ahmed Bu Obaid",
    } as BiText,
    bio: {
      ar: "حاصل على الدكتوراه من المعهد العالي للقضاء، وله خبرة في الفقه والقضاء وإدارة الشركات. يرأس مؤسسات فاعلة مثل شركة «سلسلة الثقة للمقاولات»، وله مساهمات بحثية في الفقه الطبي المستجد (فقه نوازل كورونا). يتولى القيادة العليا والإشراف على الامتثال للائحة الأساسية.",
      en: "Holds a PhD from the Higher Institute of Judiciary, with expertise in jurisprudence, the judiciary, and corporate management. He chairs active enterprises such as Silsilat Al-Thiqa for Contracting, and has published research in contemporary medical jurisprudence (COVID-era rulings). Holds senior leadership of the board and oversees compliance with the bylaws.",
    } as BiText,
  },
  {
    role: { ar: "نائب رئيس مجلس الأمناء", en: "Vice Chairman, Board of Trustees" } as BiText,
    name: {
      ar: "الأستاذ حسين بن عبدالله بن حسين بوعبيد",
      en: "Mr. Hussein bin Abdullah bin Hussein Bu Obaid",
    } as BiText,
    bio: {
      ar: "يقدم المساندة القيادية ويضمن سير العمليات الإدارية والمبادرات الاجتماعية، وأحد ثلاثة مفوضين رئيسيين يشترط توقيعهم المشترك على المعاملات المالية الحساسة.",
      en: "Provides leadership support and ensures the smooth running of administrative operations and social initiatives; one of three principal signatories whose joint signature is required for sensitive financial transactions.",
    } as BiText,
  },
  {
    role: { ar: "عضو مجلس الأمناء", en: "Board Trustee" } as BiText,
    name: {
      ar: "الأستاذ عبدالرحمن بن عبدالعزيز بن عبدالرحمن بوعبيد",
      en: "Mr. Abdulrahman bin Abdulaziz bin Abdulrahman Bu Obaid",
    } as BiText,
    bio: {
      ar: "يتولى الإشراف ضمن الدائرة المصغرة المخوّلة باتخاذ القرارات المالية والاستراتيجية، وأحد الموقّعين الثلاثة على التفويض البنكي الدقيق للصندوق.",
      en: "Oversees decisions within the small executive circle authorised to take financial and strategic decisions, and is one of three signatories on the fund's bank authorisation.",
    } as BiText,
  },
  {
    role: { ar: "عضو مجلس الأمناء", en: "Board Trustee" } as BiText,
    name: {
      ar: "الأستاذ عبدالله بن سعود بن عبدالعزيز بوعبيد",
      en: "Mr. Abdullah bin Saud bin Abdulaziz Bu Obaid",
    } as BiText,
    bio: {
      ar: "يشارك في التوجيه الاستراتيجي للصندوق وتطوير مواردها.",
      en: "Participates in the organisation's strategic direction and resource development.",
    } as BiText,
  },
];

/** First board term: one year from formation, per NCNP letter Ref. PTEB031650 dated 20 Safar 1447H. */
export const boardTerm = {
  ar: "الدورة الأولى لمجلس الأمناء: سنة واحدة من تاريخ 20 صفر 1447هـ (خطاب تشكيل المجلس رقم PTEB031650).",
  en: "First Board term: one year from 20 Safar 1447H (Board Formation Letter Ref. PTEB031650).",
} as BiText;

/**
 * The fund's ten founders, per the current bylaws (Article II). Four of the
 * ten (Hussein bin Abdullah, Khaled bin Yousef, Abdulrahman bin Abdulaziz,
 * and Abdullah bin Saud) also sit on the Board of Trustees — see
 * `boardOfTrustees` — while the remaining six lead the five standing
 * committees. National IDs and phone numbers on file are not published here.
 */
export const foundingMembers = [
  {
    ar: "الأستاذ رياض بن عبدالعزيز بن أحمد بوعبيد",
    en: "Mr. Riyadh bin Abdulaziz bin Ahmed Bu Obaid",
  } as BiText,
  {
    ar: "الأستاذ صالح بن عبدالعزيز بن عبدالله بوعبيد",
    en: "Mr. Saleh bin Abdulaziz bin Abdullah Bu Obaid",
  } as BiText,
  {
    ar: "الأستاذ صالح بن محمد بن يوسف بوعبيد",
    en: "Mr. Saleh bin Mohammed bin Yousef Bu Obaid",
  } as BiText,
  {
    ar: "الأستاذ عبدالرحمن بن صالح بن علي بوعبيد",
    en: "Mr. Abdulrahman bin Salih bin Ali Bu Obaid",
  } as BiText,
  {
    ar: "الأستاذ عبدالله بن عبدالعزيز بن عبدالرحمن بوعبيد",
    en: "Mr. Abdullah bin Abdulaziz bin Abdulrahman Bu Obaid",
  } as BiText,
  {
    ar: "الأستاذ عامر بن أحمد بن إبراهيم بوعبيد",
    en: "Mr. Amer bin Ahmed bin Ibrahim Bu Obaid",
  } as BiText,
];

/** The chief executive officer requirement stated in the bylaws: bachelor's degree + 16 years' administrative experience. */
export const ceoRequirement = {
  ar: "تشترط اللائحة الأساسية في المدير التنفيذي للصندوق الحصول على درجة البكالوريوس مع امتلاك خبرة إدارية تتجاوز 16 عاماً.",
  en: "The bylaws require the fund's Chief Executive to hold a bachelor's degree and have more than 16 years of administrative experience.",
} as BiText;

export const committees = [
  {
    id: "comm",
    name: {
      ar: "لجنة التواصل والخدمة الاجتماعية",
      en: "Communication & Social Services Committee",
    } as BiText,
    desc: {
      ar: "تتولى تنظيم الملتقيات السنوية، متابعة المناسبات الأهلية، وتقديم الدعم الاجتماعي والتكافل بين أبناء الأسرة.",
      en: "Organizes annual assemblies, monitors family occasions, and provides social solidarity support.",
    } as BiText,
    lead: {
      ar: "الأستاذ عبدالله بن عبدالعزيز بن عبدالرحمن بوعبيد",
      en: "Mr. Abdullah bin Abdulaziz bin Abdulrahman Bu Obaid",
    } as BiText,
  },
  {
    id: "finance",
    name: { ar: "لجنة الشؤون المالية والادخار", en: "Finance & Endowment Committee" } as BiText,
    desc: {
      ar: "تُشرف على الميزانية المعتمدة، الاشتراكات الشهرية، الحسابات المستقلة للزكاة والصُّندُوق، والتخطيط الاستثماري الوقفي.",
      en: "Oversees the approved budget, monthly subscriptions, dedicated zakat accounts, and endowment planning.",
    } as BiText,
    lead: {
      ar: "الأستاذ عبدالرحمن بن صالح بن علي بوعبيد",
      en: "Mr. Abdulrahman bin Salih bin Ali Bu Obaid",
    } as BiText,
  },
  {
    id: "hq",
    name: {
      ar: "لجنة المقر والتطوير العقاري",
      en: "Headquarters & Real Estate Committee",
    } as BiText,
    desc: {
      ar: "مسؤولة عن متابعة أرض مشروع المقر الدائم بحي الحزام الذهبي بالمبرز، والتصاميم الهندسية ومراحل الإنشاء والتطوير.",
      en: "Responsible for managing the headquarters land project in Al-Hizam Al-Dhahabi district, engineering designs, and construction.",
    } as BiText,
    lead: {
      ar: "الأستاذ رياض بن عبدالعزيز بن أحمد بوعبيد",
      en: "Mr. Riyadh bin Abdulaziz bin Ahmed Bu Obaid",
    } as BiText,
  },
  {
    id: "activities",
    name: { ar: "لجنة الأنشطة والبرامج", en: "Activities & Youth Programs Committee" } as BiText,
    desc: {
      ar: "تنظم جائزة التفوق العلمي، مسابقة رمضان الثقافية عبر واتساب، الدورات التدريبية للشباب واللقاءات الرياضية.",
      en: "Organizes the Academic Excellence Award, Ramadan WhatsApp quiz, youth skills workshops, and sports events.",
    } as BiText,
    lead: {
      ar: "الأستاذ صالح بن عبدالعزيز بن عبدالله بوعبيد",
      en: "Mr. Saleh bin Abdulaziz bin Abdullah Bu Obaid",
    } as BiText,
  },
  {
    id: "media",
    name: { ar: "اللجنة الإعلامية والتوثيق", en: "Media & Documentation Committee" } as BiText,
    desc: {
      ar: "إدارة البوابة الرقمية، حسابات التواصل الاجتماعي، التوثيق التاريخي والجيني، وتصميم إصدارات الأسرة.",
      en: "Manages the web platform, official social channels, historical/DNA archives, and family publications.",
    } as BiText,
    lead: {
      ar: "الأستاذ عامر بن أحمد بن إبراهيم بوعبيد",
      en: "Mr. Amer bin Ahmed bin Ibrahim Bu Obaid",
    } as BiText,
  },
];

export const hqProject = {
  title: {
    ar: "مشروع مقر مجلس الأسرة",
    en: "Family Council Headquarters Project",
  } as BiText,
  location: {
    ar: "حي الحزام الذهبي، مدينة المبرز، محافظة الأحساء",
    en: "Al-Hizam Al-Dhahabi District, Al-Mubarraz, Al-Ahsa",
  } as BiText,
  status: {
    ar: "أرض مملوكة بالكامل، رخصة بناء سارية، مرحلة التمويل الإنشائي",
    en: "Land fully acquired, valid building permit, construction-financing phase",
  } as BiText,
  /** Strategic acquisition: 905.35 m² of land, permit allows building up to 1,818.15 m² across multiple floors. */
  area: "905.35 م²",
  buildableArea: "1,818.15 م²",
  buildingPermitExpiry: "1450/07/29 هـ",
  facilities: [
    { ar: "مجلس عميد الأسرة والضيوف الرسمي", en: "Official Family Dean Assembly Hall" } as BiText,
    {
      ar: "قاعة متعددة الأغراض للمناسبات والملتقيات",
      en: "Multi-purpose Events & Assembly Hall",
    } as BiText,
    {
      ar: "المكتبة الرقمية وأرشيف الوثائق التاريخية",
      en: "Digital Library & Historical Archives Room",
    } as BiText,
    {
      ar: "مكاتب الإدارة واللجان الخمس المعتمدة",
      en: "Administrative Offices for the 5 Standing Committees",
    } as BiText,
    {
      ar: "مركز التدريب وتطوير مهارات الناشئة",
      en: "Youth Training & Skill Development Center",
    } as BiText,
  ],
  progress: 10,
  fundingModel: {
    ar: "تم شراء أرض المقر بالكامل بتمويل استراتيجي بلغ 1,140,741 ريالاً، ومع تجاوز التكلفة الإجمالية للسيولة المتاحة، بادر ثمانية من ميسوري أبناء الأسرة بضخ قروض حسنة تراوحت مساهمة كل منهم بين 100 و120 ألف ريال (بسيولة إجمالية بلغت 820,000 ريال)، وسُدد جزء منها لاحقاً (350,000 ريال)، مع بقاء رصيد مستحق كالتزام آمن قدره 470,000 ريال بنهاية 2025.",
    en: "The headquarters land was purchased in full through a strategic outlay of SAR 1,140,741. As total costs exceeded available liquidity, eight of the family's more affluent members stepped in with interest-free loans of SAR 100,000–120,000 each (SAR 820,000 in total liquidity); part of this (SAR 350,000) has since been repaid, leaving an outstanding, secured commitment of SAR 470,000 at the end of 2025.",
  } as BiText,
  /** Approved 2023–2025 budget breakdown (SAR), from the audited financial statement. */
  budgetBreakdown: [
    {
      item: {
        ar: "الاستحواذ على أرض المقر (حي الحزام الذهبي)",
        en: "Headquarters land acquisition (Al-Hizam Al-Dhahabi)",
      } as BiText,
      amount: 1140741,
    },
    {
      item: {
        ar: "فحص التربة، التراخيص، الرسوم الهندسية والتأمين",
        en: "Soil testing, permits, engineering fees & insurance",
      } as BiText,
      amount: 44415,
    },
    {
      item: {
        ar: "مشروع الشجرة العائلية وتسجيل حقوق الملكية الفكرية",
        en: "Family tree project & intellectual-property registration",
      } as BiText,
      amount: 14948,
    },
    {
      item: {
        ar: "مصاريف تشغيلية للاجتماعات، الأعياد، ولجان الأنشطة والإعلام",
        en: "Operating expenses for meetings, Eid gatherings, and activities/media committees",
      } as BiText,
      amount: 20889,
    },
  ],
  financials: {
    totalRevenue: 740991,
    totalExpenses: 1220991,
    deficit: 480000,
    periodLabel: {
      ar: "من بداية 2023 حتى 31 ديسمبر 2025",
      en: "From the start of 2023 through 31 December 2025",
    } as BiText,
    note: {
      ar: "الفجوة المحاسبية بين الإيرادات والمصروفات (480,000 ريال) ناتجة عن قرار استراتيجي جريء بالاستحواذ الرأسمالي على الأرض (CAPEX)، وليست ناتجة عن أي هدر تشغيلي، وقد جرت تغطيتها بآليات تمويل داخلي مبتكرة دون أي أعباء فوائد بنكية.",
      en: "The accounting gap between revenue and expenses (SAR 480,000) stems from a bold strategic decision to acquire capital land (CAPEX), not from any operating waste, and has been covered through innovative internal financing mechanisms free of any bank-interest burden.",
    } as BiText,
    approvedBy: {
      ar: "اعتمد مجلس الأمناء هذه القوائم المالية بتاريخ 13 يونيو 2026.",
      en: "Approved by the Board of Trustees on 13 June 2026.",
    } as BiText,
  },
  /** Interest-free shareholder loans (Note 4b/4c of the audited statement) — amount contributed and repaid per member, SAR. */
  shareholderLoans: [
    { label: { ar: "المساهم 1", en: "Shareholder 1" } as BiText, amount: 100000, repaid: 100000 },
    { label: { ar: "المساهم 2", en: "Shareholder 2" } as BiText, amount: 100000, repaid: 100000 },
    { label: { ar: "المساهم 3", en: "Shareholder 3" } as BiText, amount: 100000, repaid: 100000 },
    { label: { ar: "المساهم 4", en: "Shareholder 4" } as BiText, amount: 120000, repaid: 0 },
    { label: { ar: "المساهم 5", en: "Shareholder 5" } as BiText, amount: 100000, repaid: 0 },
    { label: { ar: "المساهم 6", en: "Shareholder 6" } as BiText, amount: 100000, repaid: 0 },
    { label: { ar: "المساهم 7", en: "Shareholder 7" } as BiText, amount: 100000, repaid: 0 },
    { label: { ar: "المساهم 8", en: "Shareholder 8" } as BiText, amount: 100000, repaid: 50000 },
  ],
  /** Eid-gathering operating deficit by Hijri year (Note 7 of the audited statement), SAR. */
  eidDeficitByYear: [
    { year: "1444هـ", amount: 3300 },
    { year: "1445هـ", amount: 4550 },
    { year: "1446هـ", amount: 2000 },
    { year: "1447هـ", amount: 4001 },
  ],
};

/**
 * الأخبار تُدار حصريًا من لوحة التحكم (Supabase)؛ تبقى هذه القائمة فارغة
 * حتى لا يظهر أي خبر مكرر أو قديم في الموقع.
 */
export const news: {
  slug: string;
  date: string;
  dateGregorian: string;
  section: "fund" | "family";
  title: BiText;
  excerpt: BiText;
  body: BiText;
  image?: string;
}[] = [];

/**
 * المشاريع والبرامج والمسابقات are maintained exclusively in Supabase through
 * the CMS; this list stays empty so nothing is duplicated in code.
 */
export const initiatives: import("./cms-adapt").InitiativeItem[] = [];

/** Roll of Honor records are maintained exclusively in Supabase through the CMS. */

/**
 * The family business directory is fully database-driven: real entries are
 * submitted by members and approved in the admin console (`businesses` table).
 * The former sample records were removed so no invented company names, phone
 * numbers, or websites are ever presented as official family businesses.
 */
export const businesses: never[] = [];

export const libraryItems = {
  documents: [
    {
      title: {
        ar: "وثيقة النسب والتقرير الجيني (J-Z20773 / J-Z20777)",
        en: "Lineage & Y-DNA Scientific Study (J-Z20773 / J-Z20777)",
      } as BiText,
      year: 1446,
      kind: "PDF",
      ncnpRef: "Genealogy Archive",
    },
    {
      title: {
        ar: "الشجرة الجينية للتحور J-Z20777 — الإصدار الأول (لوحة مصورة)",
        en: "Haplogroup Chart for the J-Z20777 Mutation — 1st Edition (plate)",
      } as BiText,
      year: 1447,
      kind: "PNG",
      ncnpRef: "DNA Archive",
      href: "/images/dna_z20777_haplogroup_tree.png",
    },
    {
      title: {
        ar: "الشجرة الجينية الكاملة (من J-Z20775) — الإصدار الثاني المنقّح",
        en: "Full Haplogroup Chart (from J-Z20775) — 2nd Revised Edition",
      } as BiText,
      year: 1447,
      kind: "PNG",
      ncnpRef: "DNA Archive",
      href: "/images/dna_haplogroup_tree_v2_full.png",
    },
    {
      title: {
        ar: "اللوحة الرسمية المصورة لشجرة أسرة آل بوعبيد — الإصدار الأول",
        en: "Official Pictorial Family Tree Plate — First Edition",
      } as BiText,
      year: 1447,
      kind: "JPG",
      ncnpRef: "IP-Registered",
      href: "/images/family_tree_official_artwork.jpg",
    },
    {
      title: {
        ar: "التقرير المالي والحوكمة المعتمد دورة 1447هـ",
        en: "Approved Governance & Financial Audit Report 1447H",
      } as BiText,
      year: 1447,
      kind: "PDF",
      ncnpRef: "Audit Certificate",
    },
    {
      title: {
        ar: "مخطط مشروع المقر الدائم بحي الحزام الذهبي",
        en: "Permanent HQ Architectural Masterplan (Al-Hizam Al-Dhahabi)",
      } as BiText,
      year: 1447,
      kind: "PDF",
      ncnpRef: "Engineering Spec",
    },
  ],
  photos: [
    {
      title: {
        ar: "تسلم ترخيص NCNP رقم 1200758400",
        en: "Receiving Official NCNP License #1200758400",
      } as BiText,
      year: 1447,
      category: "Governance",
    },
    {
      title: {
        ar: "الملتقى السنوي العام لأبناء الأسرة بالمبرز",
        en: "Annual Family Assembly in Al-Mubarraz",
      } as BiText,
      year: 1447,
      category: "Gatherings",
    },
    {
      title: {
        ar: "حفل تكريم المتميزين والحاصلين على الدكتوراة",
        en: "Academic Excellence Awards Ceremony",
      } as BiText,
      year: 1446,
      category: "Awards",
    },
    {
      title: {
        ar: "معايدة عيد الفطر المبارك بحضور عميد الأسرة",
        en: "Eid Al-Fitr Reception with the Family Dean",
      } as BiText,
      year: 1447,
      category: "Celebrations",
    },
  ],
  videos: [
    {
      title: {
        ar: "كلمة عميد الأسرة الشيخ سعد بوعبيد بمناسبة إشهار الصندوق",
        en: "Address by Family Dean Sheikh Saad Bu Obaid on NCNP Licensing",
      } as BiText,
      year: 1447,
      duration: "12:45",
    },
    {
      title: {
        ar: "العرض التعريفي بمشروع أرض المقر بحي الحزام الذهبي",
        en: "Video Tour of Headquarters Land Project in Al-Hizam Al-Dhahabi",
      } as BiText,
      year: 1447,
      duration: "06:18",
    },
    {
      title: {
        ar: "وثائقي: تاريخ آل بوعبيد ونسبهم التميمي في الأحساء",
        en: "Documentary: History of Al Bu Obaid & Tamimi Descent in Al-Ahsa",
      } as BiText,
      year: 1446,
      duration: "24:10",
    },
  ],
};

export const lineageChain = [
  { ar: "أسرة آل بوعبيد (المبرز — الأحساء)", en: "Al Bu Obaid Family (Al-Mubarraz, Al-Ahsa)" },
  { ar: "فرع العبادل (الأبداح والعبدال)", en: "Al-ʿAbadil Branch" },
  {
    ar: "آل العداقل (أبناء عبدالله بن دارم)",
    en: "Al-ʿAdaqil (Descendants of ʿAbd Allāh ibn Dārim)",
  },
  { ar: "بنو دارم بن مالك", en: "Banū Dārim ibn Mālik" },
  { ar: "بنو حنظلة بن مالك", en: "Banū Ḥanẓalah ibn Mālik" },
  { ar: "بنو تميم بن مر", en: "Banū Tamīm ibn Murr" },
  { ar: "إلياس بن مضر", en: "Ilyās ibn Muḍar" },
  { ar: "عدنان (من ولد إسماعيل عليه السلام)", en: "ʿAdnān (Descendants of Prophet Ishmael PBUH)" },
];

export const references = [
  {
    label: "المركز الوطني لتنمية القطاع غير الربحي — الاستعلام عن التراخيص (رقم 1200758400)",
    url: "https://ncnp.gov.sa",
  },
  {
    label: "معجم قبائل العرب — نسب بني تميم وفروع العبادل والعداقل",
    url: "https://www.masaha.org/book/view/2995/page/709",
  },
  {
    label: "نتائج التحور الجيني J-Z20773 — FamilyTreeDNA Discover Portal",
    url: "https://discover.familytreedna.com/y-dna/J-Z20773",
  },
  {
    label: "شجرة الجينات العالمية YFull — السلالة J-Z20773",
    url: "https://www.yfull.com/tree/J-Z20773/",
  },
];
