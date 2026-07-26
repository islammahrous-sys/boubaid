import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Official site content for Al Bu Obaid Family ("آل بوعبيد")
 * Operating under registered entity: صندوق التنمية العائلية (Family Development Fund)
 * Licensed by NCNP (المركز الوطني لتنمية القطاع غير الربحي) under license #1200758400 (20 Safar 1447H / 14 August 2025)
 */

export const siteMeta = {
  officialName: {
    ar: "صندوق التنمية العائلية (آل بوعبيد)",
    en: "Al Bu Obaid Family Development Fund",
  } as BiText,
  shortName: {
    ar: "آل بوعبيد",
    en: "Al Bu Obaid",
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
  sallaStoreUrl: "https://albouabidfamily.com/القسط-الشهري/c1360847582",
  contact: {
    phone: "+966 13 580 0000",
    email: "contact@albouabidfamily.com",
    whatsapp: "https://chat.whatsapp.com/albouabidfamily",
    telegram: "https://t.me/albouabidfamily",
    x: "https://x.com/albouabidfamily",
    instagram: "https://instagram.com/albouabidfamily",
    youtube: "https://youtube.com/@albouabidfamily",
  },
};

export const stats = [
  {
    key: "license",
    label: { ar: "ترخيص رسمي NCNP", en: "NCNP License No." } as BiText,
    value: 1200758400,
    suffix: "",
    isString: true,
    displayVal: "1200758400",
  },
  {
    key: "members",
    label: { ar: "أبناء الأسرة الموثقين", en: "Documented Members" } as BiText,
    value: 400,
    suffix: "+",
  },
  {
    key: "branches",
    label: { ar: "فروع الأسرة الرئيسية", en: "Main Family Branches" } as BiText,
    value: 7,
    suffix: "",
  },
  {
    key: "initiatives",
    label: { ar: "مبادرات وبرامج جارية", en: "Active Programs" } as BiText,
    value: 12,
    suffix: "+",
  },
];

export const branches = [
  {
    id: "al-saad",
    name: { ar: "فرع آل سعد", en: "Al Saad Branch" } as BiText,
    ancestor: {
      ar: "الجد سعد بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Saad bin Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_saad.png",
    treePoster: "/images/branch_tree_al_saad.jpg",
    settlement: {
      ar: "المبرز بالأحساء، الدمام، الرياض",
      en: "Al-Mubarraz (Al-Ahsa), Dammam, Riyadh",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية سعد بن عبدالعزيز (عيسى، خالد، وليد، بندر، فيصل، مانع) • ذرية سعد بن عبدالرحمن (صالح، إبراهيم، محمد، توفيق)",
      en: "Sub-lineages: Descendants of Saad bin Abdulaziz (Isa, Khalid...) & Saad bin Abdulrahman (Salih, Ibrahim...)",
    } as BiText,
    description: {
      ar: "أحد أعرق وأكبر فروع الأسرة تاريخياً في المبرز بالأحساء، يتميز بامتداده الديموغرافي الواسع وبروز كفاءاته في القيادة الإدارية والقطاعات الاقتصادية والوقفيات الأهلية، مع إسهامات مشهودة في دعم مجلس الأسرة والتنمية المجتمعية.",
      en: "One of the largest and most historic branches settled in Al-Mubarraz, Al-Ahsa, distinguished by its widespread demographic reach and leadership in civic endowments, economic sectors, and family governance.",
    } as BiText,
    count: 85,
    keyFigures: [
      {
        ar: "الشيخ سعد بن عبدالله بوعبيد (عضو مجلس الأمناء)",
        en: "Sheikh Saad bin Abdullah Bu Obaid (Trustee)",
      } as BiText,
      { ar: "أ. مانع بن سعد بوعبيد", en: "Mr. Mana bin Saad Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-abdulrahman",
    name: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالرحمن بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Abdulrahman bin Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdulrahman.png",
    treePoster: "/images/branch_tree_al_abdulrahman.jpg",
    settlement: {
      ar: "حي العيوني والمبرز بالأحساء، الخبر، الظهران",
      en: "Al-Oyouni & Al-Mubarraz, Khobar, Dhahran",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية عبدالله (جمال، طارق، مشاري، عبدالرؤوف، سعود) • ذرية عيسى (عبدالعزيز، خالد، ماهر، صالح) • ذرية محمد (يوسف، يعقوب، نادر، فهد، بدر، عبدالباري)",
      en: "Sub-lineages: Descendants of Abdullah, Isa, and Mohammed",
    } as BiText,
    description: {
      ar: "فرع ذو ثقل اجتماعي وتاريخي بارز في المبرز والمنطقة الشرقية، يزخر بالنخب الأكاديمية والطبية والهندسية، وتعود وثائقهم الشرعية وأوقافهم إلى حقب تاريخية عريقة مسجلة في سجلات الأحساء.",
      en: "A prominent social and historical pillar in Al-Mubarraz and the Eastern Province, boasting top academic, medical, and engineering talent with ancient registered endowment deeds.",
    } as BiText,
    count: 72,
    keyFigures: [
      {
        ar: "د. عبدالرحمن بن محمد بوعبيد (أكاديمي وطبيب)",
        en: "Dr. Abdulrahman bin Mohammed Bu Obaid",
      } as BiText,
      { ar: "أ. يعقوب بن محمد بوعبيد", en: "Mr. Yaqoub bin Mohammed Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-abdulaziz",
    name: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالعزيز بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Abdulaziz bin Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdulaziz.png",
    treePoster: "/images/branch_tree_al_abdulaziz.jpg",
    settlement: {
      ar: "الأحساء، الرياض، الجبيل الصناعية",
      en: "Al-Ahsa, Riyadh, Jubail Industrial City",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية محمد (زياد، نبيل، فهد، عبدالرحمن، حفاظ) • ذرية علي (عبدالله، صالح) • ذرية سعد (رياض، عصام، ياسر، أحمد)",
      en: "Sub-lineages: Descendants of Mohammed, Ali, and Saad",
    } as BiText,
    description: {
      ar: "يمتاز هذا الفرع الأصيل بحضوره القوي في قطاعات الخدمة العامة والهندسة والإدارة المالية، وله إسهامات فاعلة في إدارة المبادرات العائلية وصندوق الأسرة الوقفية وبرامج التواصل المشترك.",
      en: "Distinguished by strong leadership in public service, engineering, and financial management, actively driving family endowment initiatives and inter-branch programs.",
    } as BiText,
    count: 64,
    keyFigures: [
      {
        ar: "العميد عبدالعزيز بن صالح بوعبيد",
        en: "Brigadier Abdulaziz bin Salih Bu Obaid",
      } as BiText,
      { ar: "م. نبيل بن محمد بوعبيد", en: "Eng. Nabil bin Mohammed Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-abdullatif",
    name: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    ancestor: {
      ar: "الجد عبداللطيف بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Abdullatif bin Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdullatif.png",
    treePoster: "/images/branch_tree_al_abdullatif.jpg",
    settlement: { ar: "المبرز القديم بالأحساء، الدمام", en: "Old Al-Mubarraz, Dammam" } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية خالد (عبدالله، ريان، يوسف) • ذرية سعود (محمد، سعد، عبدالرحمن) • ذرية عبدالمجيد (يوسف، أحمد)",
      en: "Sub-lineages: Descendants of Khalid, Saud, and Abdulmajeed",
    } as BiText,
    description: {
      ar: "يُعتبر هذا الفرع أيقونة أكاديمية ومهنية حديثة في تاريخ الأسرة، فقد أثمر شخصيات بارزة حصدت أعلى المراتب، ويرأس منه حالياً رئيس مجلس أمناء الصندوق، كما يضم قيادات أمنية وعسكرية شابة متميزة.",
      en: "A modern academic and professional icon in the family's history, this branch has produced figures who reached the highest ranks — including the organisation's current Chairman of the Board of Trustees — alongside distinguished young security and military leaders.",
    } as BiText,
    count: 58,
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
    id: "al-abdullah-salih",
    name: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" } as BiText,
    ancestor: {
      ar: "الجد عبدالله صالح بن محمد آل بوعبيد التميمي",
      en: "Patriarch Abdullah Salih bin Mohammed Al Bu Obaid",
    } as BiText,
    image: "/images/branch_abdullah_salih.png",
    treePoster: "/images/branch_tree_al_abdullah_salih.jpg",
    settlement: {
      ar: "حي الحزام الذهبي بالأحساء، الخبر",
      en: "Al-Hizam Al-Dhahabi (Al-Ahsa), Khobar",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية محمد (وليد، صالح، عادل، مشعل) • ذرية أحمد (حمد، عبدالعزيز، نايف) • ذرية سعد (عبدالرحمن، يوسف، محمد)",
      en: "Sub-lineages: Descendants of Mohammed, Ahmed, and Saad",
    } as BiText,
    description: {
      ar: "يمثل ركيزة أساسية في الروابط العائلية، ويشتهر رجاله بالعطاء الاجتماعي والمبادرات الإنسانية والتواجد المؤثر في المحافل واللجان التنظيمية، وقيادة مشروع المقر الرئيسي للأسرة في حي الحزام الذهبي.",
      en: "A cornerstone of family cohesion, known for social philanthropy, civic leadership, and spearheading the family's official headquarters development in Al-Hizam Al-Dhahabi.",
    } as BiText,
    count: 51,
    keyFigures: [
      {
        ar: "أ. عبدالله بن صالح بوعبيد (رئيس لجنة المقر)",
        en: "Mr. Abdullah bin Salih Bu Obaid (HQ Chair)",
      } as BiText,
      { ar: "أ. وليد بن محمد بوعبيد", en: "Mr. Walid bin Mohammed Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-mohammed-ahmed",
    name: { ar: "فرع آل محمد أحمد", en: "Al Mohammed Ahmed Branch" } as BiText,
    ancestor: {
      ar: "الجد محمد أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Mohammed Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_mohammed_ahmed.png",
    treePoster: "/images/branch_tree_al_mohammed_ahmed.jpg",
    settlement: {
      ar: "الأحساء، الدمام، الكويت، البحرين",
      en: "Al-Ahsa, Dammam, Kuwait, Bahrain",
    } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية عبدالعزيز (إبراهيم، خالد، يوسف) • ذرية عبدالله (سلمان، فواز، أحمد، جاسم) • ذرية عيسى (أنس، براء، عمار)",
      en: "Sub-lineages: Descendants of Abdulaziz, Abdullah, and Isa",
    } as BiText,
    description: {
      ar: "فرع يتميز بالعطاء العلمي والثقافي، وبروز كفاءاته الشابة في قطاعات التقنية والتطوير المؤسسي والقطاع المالي في المملكة ودول الخليج، مع اهتمام خاص بالتوثيق الرقمي والمشجرة التفاعلية.",
      en: "Distinguished by scientific and cultural enrichment, with vibrant young talent leading in technology, corporate development, finance, and digital genealogical preservation.",
    } as BiText,
    count: 48,
    keyFigures: [
      {
        ar: "أ. محمد بن أحمد بوعبيد (لجنة التواصل)",
        en: "Mr. Mohammed bin Ahmed Bu Obaid (Communication Chair)",
      } as BiText,
      { ar: "م. سلمان بن عبدالله بوعبيد", en: "Eng. Salman bin Abdullah Bu Obaid" } as BiText,
    ],
  },
  {
    id: "al-yousef",
    name: { ar: "فرع آل يوسف", en: "Al Yousef Branch" } as BiText,
    ancestor: {
      ar: "الجد يوسف بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Yousef bin Ahmed bin Salih Al Bu Obaid",
    } as BiText,
    image: "/images/branch_yousef.png",
    treePoster: "/images/branch_tree_al_yousef.jpg",
    settlement: { ar: "الأحساء، الرياض، جدة", en: "Al-Ahsa, Riyadh, Jeddah" } as BiText,
    subBranches: {
      ar: "الأفرع الداخلية: ذرية محمد (عبدالإله، تركي، نواف، فيصل) • ذرية عبدالرحمن (صلاح، حمود، يعقوب، راشد) • ذرية عبداللطيف (ماجد، عبدالرزاق، طلال، صالح، غانم)",
      en: "Sub-lineages: Descendants of Mohammed, Abdulrahman, and Abdullatif",
    } as BiText,
    description: {
      ar: "فرع ينبض بالحيوية والطموح، يضم طاقات شبابية قيادية متميزة في التكنولوجيا وريادة الأعمال والاستثمار، وإسهامات بارزة في الإعلام والأنشطة الرياضية والتنظيم اللوجستي لاجتماعات الأسرة في الأحساء والمملكة.",
      en: "A dynamic and ambitious branch featuring young leaders in technology, entrepreneurship, venture capital, media, sports, and logistical management of family reunions.",
    } as BiText,
    count: 42,
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
  { ar: "الأستاذ رياض بن عبدالعزيز بن أحمد بوعبيد", en: "Mr. Riyadh bin Abdulaziz bin Ahmed Bu Obaid" } as BiText,
  { ar: "الأستاذ صالح بن عبدالعزيز بن عبدالله بوعبيد", en: "Mr. Saleh bin Abdulaziz bin Abdullah Bu Obaid" } as BiText,
  { ar: "الأستاذ صالح بن محمد بن يوسف بوعبيد", en: "Mr. Saleh bin Mohammed bin Yousef Bu Obaid" } as BiText,
  { ar: "الأستاذ عبدالرحمن بن صالح بن علي بوعبيد", en: "Mr. Abdulrahman bin Salih bin Ali Bu Obaid" } as BiText,
  { ar: "الأستاذ عبدالله بن عبدالعزيز بن عبدالرحمن بوعبيد", en: "Mr. Abdullah bin Abdulaziz bin Abdulrahman Bu Obaid" } as BiText,
  { ar: "الأستاذ عامر بن أحمد بن إبراهيم بوعبيد", en: "Mr. Amer bin Ahmed bin Ibrahim Bu Obaid" } as BiText,
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
    ar: "مشروع المقر الدائم لأسرة آل بوعبيد",
    en: "Permanent Headquarters Land Project",
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
  progress: 65,
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

export const news = [
  {
    slug: "ncnp-license-issuance",
    date: "1447-02-20",
    dateGregorian: "14 أغسطس 2025",
    section: "fund" as const,
    title: {
      ar: "صدور الترخيص الرسمي لصندوق التنمية العائلية (آل بوعبيد) برقم (1200758400)",
      en: "Official NCNP License No. 1200758400 Issued for Al Bu Obaid Family Fund",
    } as BiText,
    excerpt: {
      ar: "تكللت الجهود الصادقة لأبناء الأسرة بتحصيل الاعتماد الرسمي من المركز الوطني لتنمية القطاع غير الربحي، مما ينقل أعمال الصندوق إلى المأسسة الكاملة.",
      en: "The sincere efforts of family members culminated in receiving official NCNP licensing, establishing full institutional governance.",
    } as BiText,
    body: {
      ar: "في خطوة تاريخية مباركة، أعلن مجلس الأمناء عن استلام الترخيص الرسمي الصادر من المركز الوطني لتنمية القطاع غير الربحي تحت رقم (1200758400) وتاريخ 20 صفر 1447 هـ (الموافق 14 أغسطس 2025 م). يأتي هذا الانجاز ليعزز مبادئ الشفافية والامتثال الزكوي والمالي وفق مستهدفات رؤية المملكة 2030، وليوفر مظلة نظامية معتمدة لجميع مبادرات الأسرة وبرامجها التنموية بالأحساء والمنطقة الشرقية.",
      en: "In a landmark achievement, the Board of Trustees announced the receipt of NCNP License #1200758400 dated 20 Safar 1447H (August 14, 2025). This milestone strengthens transparency, financial audit compliance, and zakat regulations aligned with Saudi Vision 2030, offering an accredited framework for all family initiatives.",
    } as BiText,
  },
  {
    slug: "hq-land-hizam-dhahabi",
    date: "1447-01-15",
    dateGregorian: "9 أغسطس 2025",
    section: "fund" as const,
    title: {
      ar: "استكمال إجراءات أرض المقر الدائم بحي الحزام الذهبي بالمبرز",
      en: "Finalizing Acquisition Procedures for Headquarters Land in Al-Hizam Al-Dhahabi",
    } as BiText,
    excerpt: {
      ar: "استثمار عقاري استراتيجي يوفر مقراً جامعاً لكافة الفروع السبعة ومرافق ثقافية واجتماعية متكاملة.",
      en: "A strategic capital expenditure securing a permanent home for all 7 branches with comprehensive cultural facilities.",
    } as BiText,
    body: {
      ar: "أنهت لجنة المقر والتطوير العقاري إجراءات الشراء وتوثيق أرض المقر الدائم الواقعة في حي الحزام الذهبي بمدينة المبرز بمحافظة الأحساء. وتمثل هذه الأرض الركيزة الأساسية لبناء ديوان الأسرة والمجمع الثقافي الاجتماعي، وتم تمويل المشروع من خلال القروض الحسنة المساهمة وااشتراكات الصندوق المعتمدة.",
      en: "The Headquarters & Real Estate Committee finalized deed procedures for the permanent site in Al-Hizam Al-Dhahabi district, Al-Mubarraz. Funded through interest-free shareholder loans and subscription funds, the site will house the main assembly hall and cultural complex.",
    } as BiText,
  },
  {
    slug: "excellence-award-1447",
    date: "1447-03-01",
    dateGregorian: "24 أغسطس 2025",
    section: "family" as const,
    title: {
      ar: "فتح باب الترشح لجائزة آل بوعبيد للتفوق العلمي والتميز المهني",
      en: "Nominations Open for Al Bu Obaid Academic & Professional Excellence Award",
    } as BiText,
    excerpt: {
      ar: "التكريم السنوي للطلاب والطالبات الحاصلين على مرتبة الشرف والأطباء والمهندسين وأصحاب الابتكارات.",
      en: "Annual ceremony honoring students with first-class honors, medical doctors, engineers, and innovators.",
    } as BiText,
    body: {
      ar: "أعلنت لجنة الأنشطة والبرامج عن بدء استقبال طلبات الترشح لـ 'جائزة آل بوعبيد للتفوق العلمي' في دورته الجديدة. تهدف الجائزة إلى تشجيع التحصيل الأكاديمي المتميز في المراحل الجامعية والدراسات العليا وتكريم حملة الدكتوراة والماجستير والكفاءات الوطنية المبدعة من أبناء الأسرة.",
      en: "The Activities Committee launched nominations for the annual Academic Excellence Award. The prize celebrates high-achieving undergraduates, postgraduate scholars, PhD holders, and outstanding innovators across all 7 family branches.",
    } as BiText,
  },
  {
    slug: "ramadan-quiz-series",
    date: "1447-03-10",
    dateGregorian: "2 سبتمبر 2025",
    section: "family" as const,
    title: {
      ar: "انطلاق المسابقة الثقافية الرمضانية التفاعلية عبر مجتمعات واتساب الأسرة",
      en: "Launch of the Interactive Ramadan Cultural Competition on WhatsApp",
    } as BiText,
    excerpt: {
      ar: "مسابقة اليومية تهدف لتثقيف الجيل الجديد بتاريخ الأسرة ونسبها التميمي وسير أعلامها.",
      en: "Daily quiz series educating youth on family heritage, Tamimi lineage, and historic figures.",
    } as BiText,
    body: {
      ar: "تواصل اللجنة الإعلامية إقامة المسابقة الثقافية الرمضانية اليومية عبر القناة الرسمية للأسرة في واتساب. وتتضمن الأسئلة مسابقات في حفظ القرآن الكريم، وتاريخ الأحساء والمبرز، وتوثيق السيرة التاريخية لأعلام آل بوعبيد، مع رصد جوائز تشجيعية للفائزين.",
      en: "The Media Committee continues the daily Ramadan cultural quiz via the family's official WhatsApp channel. Questions cover Quranic memorization, Al-Ahsa history, Tamimi heritage, and biographies of family ancestors, with prizes awarded to youth winners.",
    } as BiText,
  },
];

export const initiatives = [
  {
    slug: "excellence-award",
    title: {
      ar: "جائزة آل بوعبيد للتفوق العلمي والتميز",
      en: "Academic & Professional Excellence Award",
    } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "برنامج سنوي لتكريم المتفوقين دراسياً وحملة الشهادات العليا والكفاءات الوطنية.",
      en: "Annual program honoring high achievers, postgraduate degree holders, and civic leaders.",
    } as BiText,
    body: {
      ar: "تسعى الجائزة لمكافأة الجهد الأكاديمي والبحثي لأبناء وبنات الأسرة في كافة المراحل الجامعية، وتشمل دروعاً تذكارية ومكافآت تشجيعية تُسلَّم في حفل الملتقى السنوي بحضور عميد الأسرة وأعضاء مجلس الأمناء.",
      en: "The award celebrates academic and research excellence across all 7 branches. Winners receive honorary shields and financial grants during the annual family assembly.",
    } as BiText,
  },
  {
    slug: "headquarters",
    title: {
      ar: "مشروع المقر الدائم (حي الحزام الذهبي)",
      en: "Permanent HQ Land Project (Al-Hizam Al-Dhahabi)",
    } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "تأسيس ديوان الأسرة والمجمع الاجتماعي والثقافي على أرض مملوكة بالكامل للصندوق.",
      en: "Establishing the main assembly hall and cultural complex on fully-owned organization land.",
    } as BiText,
    body: {
      ar: "مشروع استراتيجي بمدينة المبرز يضم قاعات للمناسبات، ومكتبة رقمية لأرشيف الوثائق التاريخية، ومقر الإدارة للجان الخمس. يتم التمويل بحوكمة عالية عبر القروض الحسنة المساهمة والاشتراكات المعتمدة.",
      en: "A strategic capital development in Al-Mubarraz housing assembly halls, archival library, and administrative offices for the 5 committees, managed under strict NCNP financial compliance.",
    } as BiText,
  },
  {
    slug: "ramadan-quiz",
    title: {
      ar: "مسابقة رمضان الثقافية عبر واتساب",
      en: "Ramadan Cultural Quiz on WhatsApp",
    } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "منافسات ثقافية ودينية يومية تجمع أبناء الأسرة في كافة مناطق المملكة والخليج.",
      en: "Daily cultural and religious quizzes connecting family members across KSA and the Gulf.",
    } as BiText,
    body: {
      ar: "برنامج تفاعلي يُدار عبر مجتمعات الواتساب الرسمية لتعزيز التواصل بين الناشئة وكبار الأسرة، ويركز على التاريخ الإسلامي والنسب التميمي والمعارف العامة.",
      en: "An interactive digital program managed via official WhatsApp channels fostering intergenerational connection and knowledge of Tamimi history.",
    } as BiText,
  },
  {
    slug: "youth-training",
    title: {
      ar: "برنامج تطوير مهارات الشباب والناشئة",
      en: "Youth Skills & Capacity Building Workshop",
    } as BiText,
    status: "upcoming" as const,
    summary: {
      ar: "ورش عمل تخصصية في الإرشاد المهني، والذكاء الاصطناعي، وريادة الأعمال.",
      en: "Specialized workshops in career mentorship, AI skills, and entrepreneurship.",
    } as BiText,
    body: {
      ar: "ينظم البرنامج جلسات إرشاد مهني يقدمها نخبة من الأطباء والمهندسين ورجال الأعمال من أبناء الأسرة لتوجيه الطلاب والخرّيجين الجدد نحو الفرص الوظيفية والريادية الواعدة.",
      en: "Offers mentorship sessions led by senior physicians, engineers, and corporate executives from the family to guide students and graduates toward promising careers.",
    } as BiText,
  },
  {
    slug: "eid-gatherings",
    title: {
      ar: "الملتقى السنوي واحتفالات العيدين",
      en: "Annual Assembly & Eid Celebrations",
    } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "لقاءات معايدة تجمع الفروع السبعة في الأحساء والشرقية والرياض ودول الخليج.",
      en: "Festive gatherings bringing together all 7 branches in Al-Ahsa, Eastern Province, Riyadh, and Gulf states.",
    } as BiText,
    body: {
      ar: "تُقام احتفالات العيد سنوياً برعاية عميد الأسرة ومجلس الأمناء لتجديد أواصر الرحمة والصلة، وتكريم رواد الأسرة والترحيب بالمواليد والعرسان الجدد.",
      en: "Annual Eid celebrations hosted under the patronage of the Family Dean to strengthen kinship ties, welcome newborns, and celebrate newlyweds.",
    } as BiText,
  },
  {
    slug: "national-volunteering",
    title: {
      ar: "شراكة المنصة الوطنية للعمل التطوعي",
      en: "National Volunteering Platform Partnership",
    } as BiText,
    status: "ongoing" as const,
    summary: {
      ar: "تسجيل ساعات التطوع لأبناء الأسرة الموثقة رسمياً في المنصة الوطنية للمملكة.",
      en: "Documenting official volunteer hours for family members on Saudi Arabia's National Platform.",
    } as BiText,
    body: {
      ar: "بصفتها كياناً أهلياً مرخصاً تحت رقم (1200758400)، تتيح صندوق التنمية العائلية (آل بوعبيد) توثيق الساعات التطوعية المعتمدة لأبناء الأسرة المشاركين في تنظيم الفعاليات والمبادرات الأهلية.",
      en: "As an NCNP-licensed nonprofit (#1200758400), the organization issues officially accredited volunteer hours for family members serving in civic initiatives.",
    } as BiText,
  },
];

export const achievers = [
  {
    name: {
      ar: "د. خالد بن يوسف بن أحمد بوعبيد",
      en: "Dr. Khaled bin Yousef bin Ahmed Bu Obaid",
    } as BiText,
    field: {
      ar: "القضاء والفقه وإدارة الأعمال",
      en: "Judiciary, Jurisprudence & Business",
    } as BiText,
    achievement: {
      ar: "بكالوريوس من جامعة الإمام محمد بن سعود الإسلامية (1417هـ)، ماجستير من المعهد العالي للقضاء (1431هـ)، ودكتوراه من المعهد العالي للقضاء (1440هـ). رئيس مجلس أمناء الصندوق ورئيس شركة سلسلة الثقة للمقاولات، وله مساهمات بحثية في الفقه الطبي المستجد (نوازل كورونا)",
      en: "BA from Imam Mohammed bin Saud Islamic University (1417H), Master's from the Higher Institute of Judiciary (1431H), and PhD from the Higher Institute of Judiciary (1440H). Chairman of the Board of Trustees and Chairman of Silsilat Al-Thiqa for Contracting, with published research in contemporary medical jurisprudence (COVID-era rulings)",
    } as BiText,
    category: "academic" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-professor.png",
  },
  {
    name: {
      ar: "الضابط عبدالله بن خالد بوعبيد",
      en: "Officer Abdullah bin Khaled Bu Obaid",
    } as BiText,
    field: { ar: "الخدمة الأمنية", en: "Security Service" } as BiText,
    achievement: {
      ar: "بكالوريوس من جامعة الإمام محمد بن سعود (1442هـ)، وتخرج من كلية الملك فهد الأمنية (1443هـ)",
      en: "BA from Imam Mohammed bin Saud University (1442H); graduated King Fahd Security College (1443H)",
    } as BiText,
    category: "military" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-military.png",
  },
  {
    name: { ar: "الضابط ريان بن خالد بوعبيد", en: "Officer Rayan bin Khaled Bu Obaid" } as BiText,
    field: { ar: "الدفاع الجوي", en: "Air Defence" } as BiText,
    achievement: {
      ar: "تخرج من كلية الملك عبدالله للدفاع الجوي (1445هـ)",
      en: "Graduated King Abdullah Air Defence College (1445H)",
    } as BiText,
    category: "military" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-military.png",
  },
  {
    name: { ar: "الأستاذ عبدالله بن يوسف عبداللطيف بوعبيد", en: "Mr. Abdullah bin Yousef Abdullatif Bu Obaid" } as BiText,
    field: { ar: "الإدارة", en: "Administration" } as BiText,
    achievement: {
      ar: "بكالوريوس من جامعة الإمام محمد بن سعود (1432هـ)",
      en: "BA from Imam Mohammed bin Saud University (1432H)",
    } as BiText,
    category: "academic" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-professor.png",
  },
  {
    name: { ar: "الأستاذ محمد بن أحمد بن عبداللطيف بوعبيد", en: "Mr. Mohammed bin Ahmed bin Abdullatif Bu Obaid" } as BiText,
    field: { ar: "إدارة الأعمال", en: "Business Administration" } as BiText,
    achievement: {
      ar: "بكالوريوس إدارة أعمال من جامعة الملك فيصل (تخرج 2017م)",
      en: "BA in Business Administration from King Faisal University (graduated 2017)",
    } as BiText,
    category: "business" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-executive.png",
  },
  {
    name: { ar: "الأستاذ عبداللطيف بن أحمد بن عبداللطيف بوعبيد", en: "Mr. Abdullatif bin Ahmed bin Abdullatif Bu Obaid" } as BiText,
    field: { ar: "نظم المعلومات الإدارية", en: "Management Information Systems" } as BiText,
    achievement: {
      ar: "بكالوريوس في نظم المعلومات الإدارية من جامعة كومنولث الأمريكية، فيرجينيا (تخرج 2013م)",
      en: "BA in Management Information Systems from American Commonwealth University, Virginia (graduated 2013)",
    } as BiText,
    category: "business" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-executive.png",
  },
  {
    name: { ar: "الأستاذ إبراهيم بن أحمد بن عبداللطيف بوعبيد", en: "Mr. Ibrahim bin Ahmed bin Abdullatif Bu Obaid" } as BiText,
    field: { ar: "الإلكترونيات", en: "Electronics" } as BiText,
    achievement: {
      ar: "دبلوم إلكترونيات من الكلية التقنية بالدمام (تخرج 2012م)",
      en: "Diploma in Electronics from the Technical College, Dammam (graduated 2012)",
    } as BiText,
    category: "business" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-executive.png",
  },
  {
    name: { ar: "د. عبدالله بن سعد بوعبيد", en: "Dr. Abdullah bin Saad Bu Obaid" } as BiText,
    field: { ar: "الطب وجراحة القلب", en: "Medicine & Cardiac Surgery" } as BiText,
    achievement: {
      ar: "استشاري جراحة القلب ومدير مركز التميز الطبي",
      en: "Consultant Cardiac Surgeon & Medical Center Director",
    } as BiText,
    category: "medical" as const,
    branch: { ar: "فرع آل سعد", en: "Al Saad Branch" } as BiText,
    image: "/images/achiever-doctor.png",
  },
  {
    name: {
      ar: "أ. د. فاطمة بنت عبدالرحمن بوعبيد",
      en: "Prof. Fatimah bint Abdulrahman Bu Obaid",
    } as BiText,
    field: { ar: "الأكاديميا واللسانيات", en: "Academia & Linguistics" } as BiText,
    achievement: {
      ar: "أستاذة اللسانيات بجامعة الملك فيصل وعضو مجلس البحث العلمي",
      en: "Professor of Linguistics at King Faisal University",
    } as BiText,
    category: "academic" as const,
    branch: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" } as BiText,
    image: "/images/achiever-professor.png",
  },
  {
    name: {
      ar: "العميد م. عبدالعزيز بن صالح بوعبيد",
      en: "Brigadier Eng. Abdulaziz bin Salih Bu Obaid",
    } as BiText,
    field: { ar: "الهندسة والخدمة العسكرية", en: "Engineering & Military Service" } as BiText,
    achievement: {
      ar: "قيادي هندسي سابق وخبير في الاتصالات العسكرية",
      en: "Senior Engineering Leader & Military Communications Expert",
    } as BiText,
    category: "military" as const,
    branch: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" } as BiText,
    image: "/images/achiever-military.png",
  },
  {
    name: { ar: "م. يوسف بن خالد بوعبيد", en: "Eng. Yousef bin Khalid Bu Obaid" } as BiText,
    field: { ar: "قطاع الطاقة والتكنولوجيا", en: "Energy Sector & Technology" } as BiText,
    achievement: {
      ar: "مدير مشروعات في أرامكو السعودية وخبير تحول رقمي",
      en: "Senior Project Manager at Saudi Aramco & DX Specialist",
    } as BiText,
    category: "business" as const,
    branch: { ar: "فرع آل يوسف", en: "Al Yousef Branch" } as BiText,
    image: "/images/achiever-executive.png",
  },
  {
    name: { ar: "د. نورة بنت عبداللطيف بوعبيد", en: "Dr. Nora bint Abdullatif Bu Obaid" } as BiText,
    field: {
      ar: "الخدمة العامة والتنمية الأهلية",
      en: "Public Service & Social Development",
    } as BiText,
    achievement: {
      ar: "مستشارة في وزارة الموارد البشرية والتنمية الاجتماعية",
      en: "Advisor at Ministry of Human Resources & Social Development",
    } as BiText,
    category: "public" as const,
    branch: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" } as BiText,
    image: "/images/achiever-professor.png",
  },
  {
    name: { ar: "أ. خالد بن محمد بوعبيد", en: "Khalid bin Mohammed Bu Obaid" } as BiText,
    field: { ar: "الرياضة والفروسية", en: "Sports & Equestrianism" } as BiText,
    achievement: {
      ar: "بطل وطني في قفز الحواجز وحائز على جوائز خليجية",
      en: "National Show Jumping Champion & Gulf Medalist",
    } as BiText,
    category: "sports" as const,
    branch: { ar: "فرع آل محمد أحمد", en: "Al Mohammed Ahmed Branch" } as BiText,
    image: "/images/achiever-youth.png",
  },
  {
    name: { ar: "أ. مريم بنت عبدالله بوعبيد", en: "Ms. Maryam bint Abdullah Bu Obaid" } as BiText,
    field: { ar: "الأدب والدراسات التاريخية", en: "Literature & Historical Studies" } as BiText,
    achievement: {
      ar: "كاتبة وباحثة مؤلفة لكتب توثيق التراث الأحسائي",
      en: "Author and Historical Researcher specializing in Al-Ahsa Heritage",
    } as BiText,
    category: "academic" as const,
    branch: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" } as BiText,
    image: "/images/achiever-professor.png",
  },
  {
    name: { ar: "د. فيصل بن إبراهيم بوعبيد", en: "Dr. Faisal bin Ibrahim Bu Obaid" } as BiText,
    field: { ar: "الطب الجيني والأورام", en: "Genetics & Oncology" } as BiText,
    achievement: {
      ar: "استشاري الأمراض الجينية وباحث في مستشفى الملك فيصل التخصصي",
      en: "Consultant Medical Geneticist at King Faisal Specialist Hospital",
    } as BiText,
    category: "medical" as const,
    branch: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" } as BiText,
    image: "/images/achiever-doctor.png",
  },
];

export const businesses = [
  {
    id: "biz-1",
    name: {
      ar: "مجموعة بوعبيد للتطوير العقاري والاستثمار",
      en: "Bu Obaid Real Estate Development Group",
    } as BiText,
    category: { ar: "العقارات والمقاولات", en: "Real Estate & Construction" } as BiText,
    description: {
      ar: "تطوير المجمعات السكنية والتجارية وإدارة الأملاك في الأحساء والخبر والرياض.",
      en: "Developing residential & commercial complexes in Al-Ahsa, Khobar, and Riyadh.",
    } as BiText,
    city: { ar: "المبرز / الخبر", en: "Al-Mubarraz / Khobar" } as BiText,
    contact: "+966 13 580 1111",
    website: "https://albouabidrealestate.com",
    ownerBranch: { ar: "فرع آل سعد", en: "Al Saad Branch" } as BiText,
  },
  {
    id: "biz-2",
    name: {
      ar: "شركة بوعبيد للخدمات الهندسية والاستشارات",
      en: "Bu Obaid Engineering & Consulting Co.",
    } as BiText,
    category: { ar: "الهندسة والاستشارات", en: "Engineering & Consulting" } as BiText,
    description: {
      ar: "تصميم المخططات الهندسية الإنشائية، الإشراف على المشاريع، والاستشارات البيئية.",
      en: "Structural design, project supervision, and environmental consulting.",
    } as BiText,
    city: { ar: "الهفوف / الدمام", en: "Hofuf / Dammam" } as BiText,
    contact: "+966 13 830 2222",
    website: "https://albouabid-eng.sa",
    ownerBranch: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" } as BiText,
  },
  {
    id: "biz-3",
    name: {
      ar: "مجمع بوعبيد الطبي التخصصي",
      en: "Bu Obaid Specialized Medical Polyclinic",
    } as BiText,
    category: { ar: "الخدمات الطبية والرعاية", en: "Medical & Healthcare Services" } as BiText,
    description: {
      ar: "عيادات تخصصية في طب الأسنان، الجلدية، والأطفال بإشراف كفاءات طبية من أبناء الأسرة.",
      en: "Specialized polyclinics in dentistry, dermatology, and pediatrics.",
    } as BiText,
    city: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
    contact: "+966 13 588 3333",
    website: "https://albouabid-clinic.sa",
    ownerBranch: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" } as BiText,
  },
  {
    id: "biz-4",
    name: { ar: "مؤسسة بوعبيد للحلول الرقمية والتقنية", en: "Bu Obaid Tech Solutions" } as BiText,
    category: { ar: "التكنولوجيا والبرمجيات", en: "Technology & Software" } as BiText,
    description: {
      ar: "تطوير تطبيقات الويب والهواتف الذكية، الأمن السيبراني، والحول السحابية للمؤسسات.",
      en: "Web and mobile app development, cybersecurity, and enterprise cloud solutions.",
    } as BiText,
    city: { ar: "الرياض / الأحساء", en: "Riyadh / Al-Ahsa" } as BiText,
    contact: "+966 11 450 4444",
    website: "https://albouabid.tech",
    ownerBranch: { ar: "فرع آل يوسف", en: "Al Yousef Branch" } as BiText,
  },
  {
    id: "biz-5",
    name: {
      ar: "مخابز ومطاعم بوعبيد التراثية",
      en: "Bu Obaid Heritage Bakeries & Restaurants",
    } as BiText,
    category: { ar: "الأغذية والضيافة", en: "Food & Hospitality" } as BiText,
    description: {
      ar: "إنتاج الخبز الحساوي الخبز الاحمر التمر، والوجبات الشعبية الأصيلة بأسلوب حديث.",
      en: "Authentic Al-Ahsa red bread with dates and traditional Saudi hospitality.",
    } as BiText,
    city: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
    contact: "+966 13 599 5555",
    website: "https://albouabid-bakery.com",
    ownerBranch: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" } as BiText,
  },
];

export const libraryItems = {
  documents: [
    {
      title: {
        ar: "اللائحة الأساسية لصندوق التنمية العائلية (آل بوعبيد) (PDF)",
        en: "Official Fund Bylaws & Charter (PDF)",
      } as BiText,
      year: 1447,
      kind: "PDF",
      ncnpRef: "Lic. 1200758400",
    },
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
    {
      title: {
        ar: "شهادة ترخيص المنشأة غير الربحية (NCNP)",
        en: "Non-Profit Organization License Certificate (NCNP)",
      } as BiText,
      year: 1447,
      kind: "JPG",
      ncnpRef: "Lic. 1200758400",
      href: "/images/ncnp_license_certificate.jpg",
    },
    {
      title: {
        ar: "إثبات العنوان الوطني الرسمي",
        en: "Official National Address Proof",
      } as BiText,
      year: 1447,
      kind: "JPG",
      ncnpRef: "Saudi Post",
      href: "/images/national_address_proof.jpg",
    },
    {
      title: {
        ar: "خطاب تشكيل مجلس الأمناء (مُحجوبة أرقام الهوية)",
        en: "Board of Trustees Formation Letter (ID numbers redacted)",
      } as BiText,
      year: 1447,
      kind: "JPG",
      ncnpRef: "PTEB031650",
      href: "/images/board_formation_letter.jpg",
    },
    {
      title: {
        ar: "خطاب تفويض إدارة الحسابات البنكية (مُحجوبة أرقام الهوية)",
        en: "Bank Account Signatory Authorization Letter (ID numbers redacted)",
      } as BiText,
      year: 1447,
      kind: "JPG",
      ncnpRef: "No. 79",
      href: "/images/bank_authorization_letter.jpg",
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
