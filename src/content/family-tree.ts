import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Documented individuals in the family tree, keyed by generation.
 *
 * Extracted from the route component so the page file stays a page file.
 * The public tree deliberately carries no national ID numbers, contact
 * details, or dates of birth — see the privacy note on the tree page.
 */

export interface FamilyMemberNode {
  id: string;
  name: BiText;
  lineage: BiText;
  generation: 1 | 2 | 3 | 4;
  generationTitle: BiText;
  branchId: string;
  branchName: BiText;
  ancestorName: BiText;
  settlement: BiText;
  title?: BiText;
  bio: BiText;
  relations: {
    father?: BiText;
    childrenCount?: number;
    subBranches?: BiText;
    lineageChain: BiText[];
  };
  keyAchievements?: BiText[];
  isPatriarch?: boolean;
  isBranchFounder?: boolean;
}

export const familyMembersData: FamilyMemberNode[] = [
  // --- GENERATION 1: GRAND PATRIARCHS ---
  {
    id: "gen1-abdullah-darim",
    name: { ar: "الجد الجامع عبد الله بن دارم", en: "Grand Patriarch Abdullah bin Darim" },
    lineage: {
      ar: "عبدالله بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم بن مر",
      en: "Abdullah bin Darim bin Malik bin Hanzala bin Malik bin Zayd Manat bin Tamim",
    },
    generation: 1,
    generationTitle: {
      ar: "الجيل الأول (الجد الجامع الأصلي)",
      en: "Generation 1 (Primary Grand Patriarch)",
    },
    branchId: "root",
    branchName: { ar: "الجذور التميمية العامة (العبادل)", en: "General Tamimi Roots (Al-Abbadel)" },
    ancestorName: {
      ar: "الفرع التميمي الأكبر — العبادل (آل العداقل)",
      en: "Main Tamimi Branch — Al-Abbadel",
    },
    settlement: {
      ar: "نجد، إقليم البحرين التاريخي، والأحساء",
      en: "Najd, Historical Bahrain Region, & Al-Ahsa",
    },
    title: {
      ar: "الجد الجامع الأعلى لفرع العبادل وآل بوعبيد",
      en: "Overall Grand Patriarch of Al-Abbadel & Al Bu Obaid",
    },
    bio: {
      ar: "الجد الجامع الأصلي للقبيلة الذي تنحدر منه سلالة آل بوعبيد من العبادل من بني تميم. يرتبط اسمه بالتاريخ العربي القديم والشجاعة والسيادة القبلية في نجد والشرق العربي.",
      en: "The primary progenitor from whom the Al Bu Obaid family of Banu Tamim directly descends, associated with ancient Arabian tribal lineage, nobility, and leadership.",
    },
    relations: {
      father: { ar: "دارم بن مالك بن حنظلة التميمي", en: "Darim bin Malik bin Hanzala Al-Tamimi" },
      childrenCount: 7,
      subBranches: {
        ar: "بطون العبادل وآل العداقل والسلالات التميمية المرتبطة",
        en: "Al-Abbadel sub-tribes and descendant Tamimi lineages",
      },
      lineageChain: [
        { ar: "عدنان", en: "Adnan" },
        { ar: "مضر", en: "Mudar" },
        { ar: "إلياس", en: "Ilyas" },
        { ar: "تميم", en: "Tamim" },
        { ar: "زيد مناة", en: "Zayd Manat" },
        { ar: "مالك", en: "Malik" },
        { ar: "حنظلة", en: "Hanzala" },
        { ar: "دارم", en: "Darim" },
        { ar: "عبدالله (الجد الجامع)", en: "Abdullah (Grand Patriarch)" },
      ],
    },
    keyAchievements: [
      {
        ar: "الانتساب الأصيل للبيت التميمي والعبادل",
        en: "Authentic ancestry in Banu Tamim and Al-Abbadel",
      },
      {
        ar: "الربط التاريخي الموثق بالمخطوطات والوثائق الشرعية",
        en: "Historic lineage verified by manuscript deeds and legal records",
      },
    ],
    isPatriarch: true,
  },
  {
    id: "gen1-ahmed-salih",
    name: {
      ar: "الجد أحمد بن صالح آل بوعبيد التميمي",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "أحمد بن صالح بن محمد بن عبدالله آل بوعبيد التميمي",
      en: "Ahmed bin Salih bin Mohammed bin Abdullah Al Bu Obaid Al-Tamimi",
    },
    generation: 1,
    generationTitle: {
      ar: "الجيل الأول (رأس سلالة الأحساء)",
      en: "Generation 1 (Ahsa Dynasty Patriarch)",
    },
    branchId: "root",
    branchName: { ar: "شجرة آل بوعبيد بالأحساء", en: "Al Bu Obaid Tree in Al-Ahsa" },
    ancestorName: { ar: "العبادل من بني تميم", en: "Al-Abbadel of Banu Tamim" },
    settlement: { ar: "حي العيوني والمبرز بالأحساء", en: "Al-Oyouni & Al-Mubarraz, Al-Ahsa" },
    title: {
      ar: "الجد الجامع للفروع السبعة المعاصرة",
      en: "Patriarch of the 7 Contemporary Branches",
    },
    bio: {
      ar: "الجد الجامع المباشر الذي تتفرع منه كافة أسر وفروع آل بوعبيد السبعة الموثقة رسمياً في مدينة المبرز بالأحساء، واشتهر بالصلاح وإقامة المساجد والأوقاف الأهلية المسجلة.",
      en: "The direct ancestor from whom all 7 officially documented branches of Al Bu Obaid in Al-Mubarraz descend, renowned for establishing historic community endowments.",
    },
    relations: {
      father: { ar: "صالح بن محمد آل بوعبيد", en: "Salih bin Mohammed Al Bu Obaid" },
      childrenCount: 7,
      subBranches: {
        ar: "الفروع السبعة (سعد، عبدالرحمن، عبدالعزيز، عبداللطيف، عبدالله صالح، محمد أحمد، يوسف)",
        en: "The 7 Branches (Saad, Abdulrahman, Abdulaziz, Abdullatif, Abdullah Salih, Mohammed Ahmed, Yousef)",
      },
      lineageChain: [
        { ar: "عبدالله بن دارم (العبادل)", en: "Abdullah bin Darim" },
        { ar: "محمد آل بوعبيد", en: "Mohammed Al Bu Obaid" },
        { ar: "صالح آل بوعبيد", en: "Salih Al Bu Obaid" },
        { ar: "أحمد بن صالح (الجد المباشر)", en: "Ahmed bin Salih (Ahsa Progenitor)" },
      ],
    },
    keyAchievements: [
      {
        ar: "تأسيس الاستقرار الأسري الدائم بمدينة المبرز",
        en: "Establishing permanent family settlement in Al-Mubarraz",
      },
      {
        ar: "تأصيل الأوقاف الزراعية والعقارية الموثقة بـ 400+ سنة",
        en: "Establishing agricultural and estate endowments verified over 400+ years",
      },
    ],
    isPatriarch: true,
  },

  // --- GENERATION 2: BRANCH FOUNDERS ---
  {
    id: "gen2-saad",
    name: {
      ar: "الجد سعد بن أحمد بن صالح آل بوعبيد",
      en: "Patriarch Saad bin Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "سعد بن أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Saad bin Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-saad",
    branchName: { ar: "فرع آل سعد", en: "Al Saad Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "المبرز بالأحساء، الدمام، الرياض", en: "Al-Mubarraz, Dammam, Riyadh" },
    title: {
      ar: "مؤسس فرع آل سعد (أكبر الفروع عدداً)",
      en: "Founder of Al Saad Branch (Largest Branch)",
    },
    bio: {
      ar: "مؤسس فرع آل سعد، أحد أكبر الفروع ديموغرافياً في الأحساء والمنطقة الشرقية والرياض، تميز رجاله بالحكمة والعمل التجاري وإدارة الأوقاف الأهلية والدور القيادي في مجلس الأسرة.",
      en: "Founder of Al Saad Branch, one of the largest demographic branches, recognized for wisdom, commerce, civic endowments, and family board governance.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 85,
      subBranches: {
        ar: "ذرية سعد بن عبدالعزيز وذرية سعد بن عبدالرحمن",
        en: "Lineages of Saad bin Abdulaziz & Saad bin Abdulrahman",
      },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "سعد بن أحمد (مؤسس الفرع)", en: "Saad bin Ahmed (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "تنمية الأوقاف الأهلية الكبرى بمدينة المبرز",
        en: "Developing key community endowments in Al-Mubarraz",
      },
      { ar: "تأطير مجلس الرعيل الأول للأسرة", en: "Structuring the early family elders council" },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-abdulrahman",
    name: {
      ar: "الجد عبدالرحمن بن أحمد بن صالح آل بوعبيد",
      en: "Patriarch Abdulrahman bin Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "عبدالرحمن بن أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Abdulrahman bin Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-abdulrahman",
    branchName: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: {
      ar: "حي العيوني والمبرز بالأحساء، الخبر، الظهران",
      en: "Al-Oyouni, Al-Mubarraz, Khobar, Dhahran",
    },
    title: {
      ar: "مؤسس فرع آل عبدالرحمن (رعيل العلم والطب)",
      en: "Founder of Al Abdulrahman Branch (Pillars of Medicine & Science)",
    },
    bio: {
      ar: "مؤسس فرع آل عبدالرحمن ذو الثقل الاجتماعي البارز بالأحساء، والمشهور برجالاته في مجالات العلوم والأطباء والهندسة مع وثائق وقفيات تاريخية محفوظة.",
      en: "Founder of Al Abdulrahman Branch, a major social pillar in Al-Ahsa known for academic excellence, medical specialists, and historical endowment deeds.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 72,
      subBranches: {
        ar: "ذرية عبدالله، عيسى، ومحمد",
        en: "Lineages of Abdullah, Isa, and Mohammed",
      },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "عبدالرحمن بن أحمد (مؤسس الفرع)", en: "Abdulrahman bin Ahmed (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "حفظ وتوثيق الصكوك الشرعية والأملاك التاريخية",
        en: "Preserving historical land titles and legal deeds",
      },
      {
        ar: "رفد الأسرة بالنخب العلمية والأكاديمية",
        en: "Enriching the family with academic and medical leaders",
      },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-abdulaziz",
    name: {
      ar: "الجد عبدالعزيز بن أحمد بن صالح آل بوعبيد",
      en: "Patriarch Abdulaziz bin Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "عبدالعزيز بن أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Abdulaziz bin Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-abdulaziz",
    branchName: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: {
      ar: "الأحساء، الرياض، الجبيل الصناعية",
      en: "Al-Ahsa, Riyadh, Jubail Industrial City",
    },
    title: {
      ar: "مؤسس فرع آل عبدالعزيز (قطاع الإدارة والقيادة)",
      en: "Founder of Al Abdulaziz Branch (Administration & Leadership)",
    },
    bio: {
      ar: "مؤسس فرع آل عبدالعزيز، ويمتاز رجالاته بالحضور القوي في الخدمة العسكرية والمدنية والهندسية والإدارة المالية وتطوير برامج التضامن والتكافل الأسري.",
      en: "Founder of Al Abdulaziz Branch, whose members lead in public service, military leadership, engineering, and family solidarity programs.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 64,
      subBranches: { ar: "ذرية محمد، علي، وسعد", en: "Lineages of Mohammed, Ali, and Saad" },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "عبدالعزيز بن أحمد (مؤسس الفرع)", en: "Abdulaziz bin Ahmed (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "تنمية وتوسيع موارد الصندوق التكافلي الأسري",
        en: "Expanding family solidarity fund initiatives",
      },
      {
        ar: "قيادة المشاريع الهندسية والتطويرية",
        en: "Leading key engineering and development ventures",
      },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-abdullatif",
    name: {
      ar: "الجد عبداللطيف بن أحمد بن صالح آل بوعبيد",
      en: "Patriarch Abdullatif bin Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "عبداللطيف بن أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Abdullatif bin Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-abdullatif",
    branchName: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "المبرز القديم بالأحساء، الدمام", en: "Old Al-Mubarraz, Dammam" },
    title: {
      ar: "مؤسس فرع آل عبداللطيف (رواد التوثيق والأنساب)",
      en: "Founder of Al Abdullatif Branch (Genealogy & Historical Archives)",
    },
    bio: {
      ar: "مؤسس فرع آل عبداللطيف، المرتبط بتاريخ المبرز وحي العيوني، والشهير برجال الفقه والتربية والتأريخ ورصد المشجرات التميمية المعتمدة في الخليج العربي.",
      en: "Founder of Al Abdullatif Branch, linked to historic Al-Mubarraz, known for scholars, educators, and leading genealogists in the Arabian Gulf.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 58,
      subBranches: {
        ar: "ذرية خالد، سعود، وعبدالمجيد",
        en: "Lineages of Khalid, Saud, and Abdulmajeed",
      },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "عبداللطيف بن أحمد (مؤسس الفرع)", en: "Abdullatif bin Ahmed (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "توثيق مشجرة النسب التميمي الرسمية بالوثائق",
        en: "Documenting official Tamimi genealogical trees with legal archives",
      },
      {
        ar: "المساهمة في المبادرات التعليمية والأهلية",
        en: "Contributing to local educational and community projects",
      },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-abdullah-salih",
    name: {
      ar: "الجد عبدالله صالح بن محمد آل بوعبيد",
      en: "Patriarch Abdullah Salih bin Mohammed Al Bu Obaid",
    },
    lineage: {
      ar: "عبدالله صالح بن محمد بن صالح آل بوعبيد التميمي",
      en: "Abdullah Salih bin Mohammed Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-abdullah-salih",
    branchName: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" },
    ancestorName: {
      ar: "الجد محمد بن صالح آل بوعبيد",
      en: "Patriarch Mohammed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "حي الحزام الذهبي بالأحساء، الخبر", en: "Al-Hizam Al-Dhahabi, Khobar" },
    title: {
      ar: "مؤسس فرع آل عبدالله صالح (رواد بناء المقر الرئيسي)",
      en: "Founder of Al Abdullah Salih Branch (Family HQ Founders)",
    },
    bio: {
      ar: "مؤسس فرع آل عبدالله صالح، الركيزة الأساسية في الروابط الاجتماعية والتطوعية، وقيادة تأسيس المقر الرئيسي للأسرة بحي الحزام الذهبي بالمبرز.",
      en: "Founder of Al Abdullah Salih Branch, a cornerstone of social bonds, spearheading the design and construction of the official family HQ in Al-Hizam Al-Dhahabi.",
    },
    relations: {
      father: { ar: "محمد بن صالح آل بوعبيد", en: "Mohammed bin Salih Al Bu Obaid" },
      childrenCount: 51,
      subBranches: { ar: "ذرية محمد، أحمد، وسعد", en: "Lineages of Mohammed, Ahmed, and Saad" },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        {
          ar: "عبدالله صالح بن محمد (مؤسس الفرع)",
          en: "Abdullah Salih bin Mohammed (Branch Founder)",
        },
      ],
    },
    keyAchievements: [
      {
        ar: "تطوير وبناء مشروع مقر الأسرة الرئيسي المسجل رسمياً #1200758400",
        en: "Developing official family HQ building under license #1200758400",
      },
      {
        ar: "تعزيز برامج الملتقيات الرمضانية والاجتماعية",
        en: "Fostering annual Ramadan assemblies and community events",
      },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-mohammed-ahmed",
    name: {
      ar: "الجد محمد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Mohammed Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "محمد أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Mohammed Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-mohammed-ahmed",
    branchName: { ar: "فرع آل محمد أحمد", en: "Al Mohammed Ahmed Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "الأحساء، الدمام، الكويت، البحرين", en: "Al-Ahsa, Dammam, Kuwait, Bahrain" },
    title: {
      ar: "مؤسس فرع آل محمد أحمد (رواد التقنية والتحول الرقمي)",
      en: "Founder of Al Mohammed Ahmed Branch (Digital Innovation Pioneers)",
    },
    bio: {
      ar: "مؤسس فرع آل محمد أحمد، الذي يزخر بالعقول التقنية والمالية، وكان له الدور الأبرز في بناء البوابة الرقمية والمشجرة التفاعلية والتواصل الإقليمي بالمملكة والخليج.",
      en: "Founder of Al Mohammed Ahmed Branch, rich in fintech and software talent, instrumental in developing the digital portal and interactive lineage trees.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 48,
      subBranches: {
        ar: "ذرية عبدالعزيز، عبدالله، وعيسى",
        en: "Lineages of Abdulaziz, Abdullah, and Isa",
      },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "محمد أحمد بن صالح (مؤسس الفرع)", en: "Mohammed Ahmed bin Salih (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "تأسيس النظام الرقمي وأتمتة سجلات المشجرة العامة",
        en: "Establishing digital portal and automated genealogical records",
      },
      {
        ar: "ربط الفروع في دول الخليج العربي (الكويت والبحرين)",
        en: "Connecting branch families across Gulf countries",
      },
    ],
    isBranchFounder: true,
  },
  {
    id: "gen2-yousef",
    name: {
      ar: "الجد يوسف بن أحمد بن صالح آل بوعبيد",
      en: "Patriarch Yousef bin Ahmed bin Salih Al Bu Obaid",
    },
    lineage: {
      ar: "يوسف بن أحمد بن صالح بن محمد آل بوعبيد التميمي",
      en: "Yousef bin Ahmed bin Salih Al Bu Obaid",
    },
    generation: 2,
    generationTitle: { ar: "الجيل الثاني (مؤسس فرع)", en: "Generation 2 (Branch Founder)" },
    branchId: "al-yousef",
    branchName: { ar: "فرع آل يوسف", en: "Al Yousef Branch" },
    ancestorName: {
      ar: "الجد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Ahmed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "المبرز بالأحساء، الرياض، الخبر", en: "Al-Mubarraz, Riyadh, Khobar" },
    title: {
      ar: "مؤسس فرع آل يوسف (رواد الأعمال والتنمية والتكافل)",
      en: "Founder of Al Yousef Branch (Business & Social Enterprise)",
    },
    bio: {
      ar: "مؤسس فرع آل يوسف، الذي يشتهر بكفاءاته الاقتصادية وتأسيس المبادرات التجارية والتنموية والمساندة في البرامج الخيرية والتأهيل الأكاديمي للشباب.",
      en: "Founder of Al Yousef Branch, celebrated for business leadership, social enterprise, youth academic sponsorship, and endowment funds.",
    },
    relations: {
      father: { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih Al Bu Obaid" },
      childrenCount: 42,
      subBranches: {
        ar: "ذرية أحمد، عبدالله، وعبدالرحمن",
        en: "Lineages of Ahmed, Abdullah, and Abdulrahman",
      },
      lineageChain: [
        { ar: "أحمد بن صالح آل بوعبيد", en: "Ahmed bin Salih" },
        { ar: "يوسف بن أحمد (مؤسس الفرع)", en: "Yousef bin Ahmed (Branch Founder)" },
      ],
    },
    keyAchievements: [
      {
        ar: "رعاية برامج المتفوقين والمنح الدراسية بالأسرة",
        en: "Sponsoring academic excellence awards and scholarships",
      },
      {
        ar: "تأسيس الشراكات الاستثمارية الوقفية",
        en: "Establishing investment endowment partnerships",
      },
    ],
    isBranchFounder: true,
  },

  // --- GENERATION 3: SUB-LINEAGE HEADS & FATHERS ---
  {
    id: "gen3-saad-abdulaziz",
    name: { ar: "سعد بن عبدالعزيز آل بوعبيد", en: "Saad bin Abdulaziz Al Bu Obaid" },
    lineage: {
      ar: "سعد بن عبدالعزيز بن سعد بن أحمد آل بوعبيد التميمي",
      en: "Saad bin Abdulaziz bin Saad Al Bu Obaid",
    },
    generation: 3,
    generationTitle: {
      ar: "الجيل الثالث (رأس أسرة فرعية)",
      en: "Generation 3 (Sub-Lineage Patriarch)",
    },
    branchId: "al-saad",
    branchName: { ar: "فرع آل سعد", en: "Al Saad Branch" },
    ancestorName: { ar: "الجد سعد بن أحمد آل بوعبيد", en: "Patriarch Saad bin Ahmed Al Bu Obaid" },
    settlement: { ar: "المبرز بالأحساء والرياض", en: "Al-Mubarraz & Riyadh" },
    title: { ar: "رأس ذرية سعد بن عبدالعزيز", en: "Head of Saad bin Abdulaziz Sub-Lineage" },
    bio: {
      ar: "أحد أبرز وجهاء الجيل الثالث بفرع آل سعد، تفرعت منه أسر (عيسى، خالد، وليد، بندر، فيصل، ومانع) وكان له دور مجتمعي بارز في المبرز.",
      en: "Prominent 3rd generation patriarch in Al Saad branch, fathering key family lines including Isa, Khalid, Walid, Bandar, Faisal, and Mana.",
    },
    relations: {
      father: { ar: "عبدالعزيز بن سعد آل بوعبيد", en: "Abdulaziz bin Saad Al Bu Obaid" },
      childrenCount: 6,
      subBranches: {
        ar: "ذرية عيسى، خالد، وليد، بندر، فيصل، مانع",
        en: "Descendants of Isa, Khalid, Walid, Bandar, Faisal, Mana",
      },
      lineageChain: [
        { ar: "الجد سعد بن أحمد", en: "Patriarch Saad bin Ahmed" },
        { ar: "عبدالعزيز بن سعد", en: "Abdulaziz bin Saad" },
        { ar: "سعد بن عبدالعزيز", en: "Saad bin Abdulaziz" },
      ],
    },
    keyAchievements: [
      {
        ar: "توثيق الأفرع الداخلية وتسجيل وثائق ملكيات المبرز",
        en: "Documenting internal sub-branches and Al-Mubarraz properties",
      },
    ],
  },
  {
    id: "gen3-isa-abdulrahman",
    name: { ar: "عيسى بن عبدالرحمن آل بوعبيد", en: "Isa bin Abdulrahman Al Bu Obaid" },
    lineage: {
      ar: "عيسى بن عبدالرحمن بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Isa bin Abdulrahman bin Ahmed Al Bu Obaid",
    },
    generation: 3,
    generationTitle: {
      ar: "الجيل الثالث (رأس أسرة فرعية)",
      en: "Generation 3 (Sub-Lineage Patriarch)",
    },
    branchId: "al-abdulrahman",
    branchName: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" },
    ancestorName: {
      ar: "الجد عبدالرحمن بن أحمد آل بوعبيد",
      en: "Patriarch Abdulrahman bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "حي العيوني بالأحساء والخبر", en: "Al-Oyouni & Khobar" },
    title: { ar: "رأس ذرية عيسى بن عبدالرحمن", en: "Head of Isa bin Abdulrahman Sub-Lineage" },
    bio: {
      ar: "رأس أسرة عريقة بفرع آل عبدالرحمن تنحدر منها ذرية (عبدالعزيز، خالد، ماهر، وصالح)، وله بصمات إيجابية في إصلاح ذات البين وإدارة الأوقاف.",
      en: "Head of a prominent sub-lineage in Al Abdulrahman branch, fathering Abdulaziz, Khalid, Maher, and Salih, active in endowment and community mediation.",
    },
    relations: {
      father: { ar: "عبدالرحمن بن أحمد آل بوعبيد", en: "Abdulrahman bin Ahmed Al Bu Obaid" },
      childrenCount: 4,
      subBranches: {
        ar: "ذرية عبدالعزيز، خالد، ماهر، صالح",
        en: "Descendants of Abdulaziz, Khalid, Maher, Salih",
      },
      lineageChain: [
        { ar: "الجد عبدالرحمن بن أحمد", en: "Patriarch Abdulrahman bin Ahmed" },
        { ar: "عيسى بن عبدالرحمن", en: "Isa bin Abdulrahman" },
      ],
    },
  },
  {
    id: "gen3-mohammed-abdulaziz",
    name: { ar: "محمد بن عبدالعزيز آل بوعبيد", en: "Mohammed bin Abdulaziz Al Bu Obaid" },
    lineage: {
      ar: "محمد بن عبدالعزيز بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Mohammed bin Abdulaziz bin Ahmed Al Bu Obaid",
    },
    generation: 3,
    generationTitle: {
      ar: "الجيل الثالث (رأس أسرة فرعية)",
      en: "Generation 3 (Sub-Lineage Patriarch)",
    },
    branchId: "al-abdulaziz",
    branchName: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" },
    ancestorName: {
      ar: "الجد عبدالعزيز بن أحمد آل بوعبيد",
      en: "Patriarch Abdulaziz bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "المبرز والرياض والجبيل", en: "Al-Mubarraz, Riyadh, Jubail" },
    title: { ar: "رأس ذرية محمد بن عبدالعزيز", en: "Head of Mohammed bin Abdulaziz Sub-Lineage" },
    bio: {
      ar: "شخصية قيادية من الجيل الثالث بشركة أرامكو والقطاع العام، تفرعت منه ذرية (زياد، نبيل، فهد، عبدالرحمن، وحفاظ).",
      en: "A 3rd generation leader in Aramco and the public sector, fathering Ziyad, Nabil, Fahad, Abdulrahman, and Huffaz.",
    },
    relations: {
      father: { ar: "عبدالعزيز بن أحمد آل بوعبيد", en: "Abdulaziz bin Ahmed Al Bu Obaid" },
      childrenCount: 5,
      subBranches: {
        ar: "ذرية زياد، نبيل، فهد، عبدالرحمن، حفاظ",
        en: "Descendants of Ziyad, Nabil, Fahad, Abdulrahman, Huffaz",
      },
      lineageChain: [
        { ar: "الجد عبدالعزيز بن أحمد", en: "Patriarch Abdulaziz bin Ahmed" },
        { ar: "محمد بن عبدالعزيز", en: "Mohammed bin Abdulaziz" },
      ],
    },
  },
  {
    id: "gen3-khalid-abdullatif",
    name: { ar: "خالد بن عبداللطيف آل بوعبيد", en: "Khalid bin Abdullatif Al Bu Obaid" },
    lineage: {
      ar: "خالد بن عبداللطيف بن أحمد بن صالح آل بوعبيد التميمي",
      en: "Khalid bin Abdullatif bin Ahmed Al Bu Obaid",
    },
    generation: 3,
    generationTitle: {
      ar: "الجيل الثالث (رأس أسرة فرعية)",
      en: "Generation 3 (Sub-Lineage Patriarch)",
    },
    branchId: "al-abdullatif",
    branchName: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" },
    ancestorName: {
      ar: "الجد عبداللطيف بن أحمد آل بوعبيد",
      en: "Patriarch Abdullatif bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "المبرز والدمام", en: "Al-Mubarraz & Dammam" },
    title: { ar: "رأس ذرية خالد بن عبداللطيف", en: "Head of Khalid bin Abdullatif Sub-Lineage" },
    bio: {
      ar: "من أعلام الجيل الثالث لفرع آل عبداللطيف، عُرف باهتمامه بتوثيق المخطوطات والتعليم، وتفرعت منه ذرية (عبدالله، ريان، ويوسف).",
      en: "A notable 3rd generation figure in Al Abdullatif branch, dedicated to manuscript preservation and education, fathering Abdullah, Rayan, and Yousef.",
    },
    relations: {
      father: { ar: "عبداللطيف بن أحمد آل بوعبيد", en: "Abdullatif bin Ahmed Al Bu Obaid" },
      childrenCount: 3,
      subBranches: { ar: "ذرية عبدالله، ريان، يوسف", en: "Descendants of Abdullah, Rayan, Yousef" },
      lineageChain: [
        { ar: "الجد عبداللطيف بن أحمد", en: "Patriarch Abdullatif bin Ahmed" },
        { ar: "خالد بن عبداللطيف", en: "Khalid bin Abdullatif" },
      ],
    },
  },

  // --- GENERATION 4+: CONTEMPORARY NOTABLE FIGURES & LEADERS ---
  {
    id: "gen4-sheikh-saad-abdullah",
    name: { ar: "الشيخ سعد بن عبدالله بوعبيد", en: "Sheikh Saad bin Abdullah Bu Obaid" },
    lineage: {
      ar: "سعد بن عبدالله بن سعد بن أحمد آل بوعبيد التميمي",
      en: "Saad bin Abdullah bin Saad Al Bu Obaid",
    },
    generation: 4,
    generationTitle: { ar: "الجيل الرابع (عضو مجلس الأمناء)", en: "Generation 4 (Board Trustee)" },
    branchId: "al-saad",
    branchName: { ar: "فرع آل سعد", en: "Al Saad Branch" },
    ancestorName: { ar: "الجد سعد بن أحمد آل بوعبيد", en: "Patriarch Saad bin Ahmed Al Bu Obaid" },
    settlement: { ar: "المبرز بالأحساء", en: "Al-Mubarraz, Al-Ahsa" },
    title: {
      ar: "عضو مجلس أمناء منظمة التنمية العائلية",
      en: "Trustee — Family Development Organization",
    },
    bio: {
      ar: "شخصية عائلية بارزة وعضو مجلس الأمناء المعتمد برقم #1200758400، له جهود مشهودة في إدارة شؤون الأسرة والأوقاف والتواصل الاجتماعي.",
      en: "Prominent family leader and officially certified Trustee under license #1200758400, leading family governance and endowments.",
    },
    relations: {
      father: { ar: "عبدالله بن سعد آل بوعبيد", en: "Abdullah bin Saad Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد سعد بن أحمد", en: "Patriarch Saad bin Ahmed" },
        { ar: "عبدالله بن سعد", en: "Abdullah bin Saad" },
        { ar: "الشيخ سعد بن عبدالله", en: "Sheikh Saad bin Abdullah" },
      ],
    },
    keyAchievements: [
      {
        ar: "عضوية مجلس الأمناء والحوكمة المؤسسية",
        en: "Board of Trustees membership & corporate governance",
      },
      { ar: "الإشراف على الصندوق الائتماني والوقفي", en: "Overseeing trust and endowment funds" },
    ],
  },
  {
    id: "gen4-dr-abdulrahman-mohammed",
    name: { ar: "د. عبدالرحمن بن محمد بوعبيد", en: "Dr. Abdulrahman bin Mohammed Bu Obaid" },
    lineage: {
      ar: "عبدالرحمن بن محمد بن عبدالرحمن بن أحمد آل بوعبيد التميمي",
      en: "Abdulrahman bin Mohammed bin Abdulrahman Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (أكاديمي وطبيب استشاري)",
      en: "Generation 4 (Academic & Medical Consultant)",
    },
    branchId: "al-abdulrahman",
    branchName: { ar: "فرع آل عبدالرحمن", en: "Al Abdulrahman Branch" },
    ancestorName: {
      ar: "الجد عبدالرحمن بن أحمد آل بوعبيد",
      en: "Patriarch Abdulrahman bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "الظهران والخبر", en: "Dhahran & Khobar" },
    title: {
      ar: "طبيب استشاري وأستاذ مشارك بالقطاع الصحي",
      en: "Consultant Physician & Associate Professor",
    },
    bio: {
      ar: "طبيب استشاري وأكاديمي بارز بالمنطقة الشرقية، يسهم بفاعلية في اللجان العلمية والمبادرات الصحية والتربوية لأسرة آل بوعبيد.",
      en: "Distinguished medical consultant and academic in the Eastern Province, actively contributing to medical and scientific family committees.",
    },
    relations: {
      father: { ar: "محمد بن عبدالرحمن آل بوعبيد", en: "Mohammed bin Abdulrahman Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد عبدالرحمن بن أحمد", en: "Patriarch Abdulrahman bin Ahmed" },
        { ar: "محمد بن عبدالرحمن", en: "Mohammed bin Abdulrahman" },
        { ar: "د. عبدالرحمن بن محمد", en: "Dr. Abdulrahman bin Mohammed" },
      ],
    },
    keyAchievements: [
      {
        ar: "نشر العديد من البحوث الطبية المحكمة",
        en: "Publishing peer-reviewed medical research",
      },
      {
        ar: "رئاسة اللجنة الطبية والتثقيفية بالأسرة",
        en: "Chairing the family health & education committee",
      },
    ],
  },
  {
    id: "gen4-brigadier-abdulaziz-salih",
    name: { ar: "العميد عبدالعزيز بن صالح بوعبيد", en: "Brigadier Abdulaziz bin Salih Bu Obaid" },
    lineage: {
      ar: "عبدالعزيز بن صالح بن عبدالعزيز بن أحمد آل بوعبيد التميمي",
      en: "Abdulaziz bin Salih bin Abdulaziz Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (قيادي عسكري ومدني)",
      en: "Generation 4 (Military & Civic Leader)",
    },
    branchId: "al-abdulaziz",
    branchName: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" },
    ancestorName: {
      ar: "الجد عبدالعزيز بن أحمد آل بوعبيد",
      en: "Patriarch Abdulaziz bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "الرياض والأحساء", en: "Riyadh & Al-Ahsa" },
    title: {
      ar: "عميد متقاعد ورئيس لجنة الأمن والسلامة بالمنظمة",
      en: "Retired Brigadier & Safety Committee Chair",
    },
    bio: {
      ar: "قيادي بالقطاع العسكري والخدمة العامة بالمملكة العربية السعودية، ومساهم فاعل في تنظيم ملتقيات الأسرة السنوية وتطوير حوكمة اللجان.",
      en: "Prominent public service and military leader in Saudi Arabia, actively organizing annual family assemblies and governance committees.",
    },
    relations: {
      father: { ar: "صالح بن عبدالعزيز آل بوعبيد", en: "Salih bin Abdulaziz Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد عبدالعزيز بن أحمد", en: "Patriarch Abdulaziz bin Ahmed" },
        { ar: "صالح بن عبدالعزيز", en: "Salih bin Abdulaziz" },
        { ar: "العميد عبدالعزيز بن صالح", en: "Brigadier Abdulaziz bin Salih" },
      ],
    },
    keyAchievements: [
      {
        ar: "خدمة الوطن بقطاعات الأمن والدفاع",
        en: "Distinguished national security and defense service",
      },
      {
        ar: "إدارة تنظيم الملتقيات الكبرى آل بوعبيد",
        en: "Managing major Al Bu Obaid annual conventions",
      },
    ],
  },
  {
    id: "gen4-sheikh-abdullatif-ibrahim",
    name: { ar: "الشيخ عبداللطيف بن إبراهيم بوعبيد", en: "Sheikh Abdullatif bin Ibrahim Bu Obaid" },
    lineage: {
      ar: "عبداللطيف بن إبراهيم بن عبداللطيف بن أحمد آل بوعبيد التميمي",
      en: "Abdullatif bin Ibrahim bin Abdullatif Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (مؤرخ ونسابة الأسرة)",
      en: "Generation 4 (Historian & Chief Genealogist)",
    },
    branchId: "al-abdullatif",
    branchName: { ar: "فرع آل عبداللطيف", en: "Al Abdullatif Branch" },
    ancestorName: {
      ar: "الجد عبداللطيف بن أحمد آل بوعبيد",
      en: "Patriarch Abdullatif bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "المبرز القديم بالأحساء", en: "Old Al-Mubarraz, Al-Ahsa" },
    title: {
      ar: "المؤرخ والنسابة المعتمد لنسب آل بوعبيد التميمي",
      en: "Certified Historian & Chief Family Genealogist",
    },
    bio: {
      ar: "مؤرخ ونسابة قدير يُعد المرجع الأول في تحقيق وثائق النسب والمشجرة الرسمية وتدقيق الصكوك والمخطوطات التاريخية للأسرة بالخليج العربي.",
      en: "Renowned genealogist and primary authority on authenticating family deeds, historical manuscripts, and certified lineage trees across the Gulf.",
    },
    relations: {
      father: { ar: "إبراهيم بن عبداللطيف آل بوعبيد", en: "Ibrahim bin Abdullatif Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد عبداللطيف بن أحمد", en: "Patriarch Abdullatif bin Ahmed" },
        { ar: "إبراهيم بن عبداللطيف", en: "Ibrahim bin Abdullatif" },
        { ar: "الشيخ عبداللطيف بن إبراهيم", en: "Sheikh Abdullatif bin Ibrahim" },
      ],
    },
    keyAchievements: [
      {
        ar: "تحقيق وإصدار مشجرة آل بوعبيد الرسمية 1447هـ",
        en: "Authoritative publication of the official 1447H Al Bu Obaid Tree poster",
      },
      {
        ar: "توثيق 400+ فرد بالوثائق الشرعية المكتوبة",
        en: "Documenting 400+ individuals with verified legal deeds",
      },
    ],
  },
  {
    id: "gen4-abdullah-salih-chair",
    name: { ar: "أ. عبدالله بن صالح بوعبيد", en: "Mr. Abdullah bin Salih Bu Obaid" },
    lineage: {
      ar: "عبدالله بن صالح بن عبدالله بن محمد آل بوعبيد التميمي",
      en: "Abdullah bin Salih bin Abdullah Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (رئيس لجنة المقر)",
      en: "Generation 4 (HQ Committee Chair)",
    },
    branchId: "al-abdullah-salih",
    branchName: { ar: "فرع آل عبدالله صالح", en: "Al Abdullah Salih Branch" },
    ancestorName: {
      ar: "الجد عبدالله صالح بن محمد آل بوعبيد",
      en: "Patriarch Abdullah Salih bin Mohammed Al Bu Obaid",
    },
    settlement: { ar: "حي الحزام الذهبي بالمبرز", en: "Al-Hizam Al-Dhahabi, Al-Mubarraz" },
    title: { ar: "رئيس لجنة إعمار وتطوير المقر الرئيسي", en: "Chair of HQ Development Committee" },
    bio: {
      ar: "رائد أعمال ورئيس لجنة بناء المقر الرئيسي آل بوعبيد، أشرف على مرحلة التأسيس والتجهيز الهندسي لمبنى المنظمة بالحزام الذهبي.",
      en: "Entrepreneur and Chair of the HQ building project, overseeing the architectural construction of the official family headquarters in Al-Mubarraz.",
    },
    relations: {
      father: { ar: "صالح بن عبدالله آل بوعبيد", en: "Salih bin Abdullah Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد عبدالله صالح بن محمد", en: "Patriarch Abdullah Salih" },
        { ar: "صالح بن عبدالله", en: "Salih bin Abdullah" },
        { ar: "أ. عبدالله بن صالح", en: "Mr. Abdullah bin Salih" },
      ],
    },
    keyAchievements: [
      {
        ar: "قيادة مشروع إنشاء المقر الرئيسي بتمويل وقفي",
        en: "Spearheading official HQ development via endowment funding",
      },
    ],
  },
  {
    id: "gen4-mohammed-ahmed-chair",
    name: { ar: "أ. محمد بن أحمد بوعبيد", en: "Mr. Mohammed bin Ahmed Bu Obaid" },
    lineage: {
      ar: "محمد بن أحمد بن محمد بن صالح آل بوعبيد التميمي",
      en: "Mohammed bin Ahmed bin Mohammed Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (رئيس لجنة التواصل الرقمي)",
      en: "Generation 4 (Digital Media Chair)",
    },
    branchId: "al-mohammed-ahmed",
    branchName: { ar: "فرع آل محمد أحمد", en: "Al Mohammed Ahmed Branch" },
    ancestorName: {
      ar: "الجد محمد أحمد بن صالح آل بوعبيد",
      en: "Patriarch Mohammed Ahmed bin Salih Al Bu Obaid",
    },
    settlement: { ar: "الدمام والأحساء", en: "Dammam & Al-Ahsa" },
    title: { ar: "رئيس لجنة الإعلام والتواصل الرقمي", en: "Media & Digital Communication Chair" },
    bio: {
      ar: "خبير في الإعلام والتحول الرقمي، قاد مبادرة إطلاق البوابة الرقمية التفاعلية والأرشيف الإلكتروني المعتمد لمنظمة التنمية العائلية.",
      en: "Media & digital transformation strategist, leading the launch of the interactive family portal and certified electronic archive.",
    },
    relations: {
      father: { ar: "أحمد بن محمد آل بوعبيد", en: "Ahmed bin Mohammed Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد محمد أحمد بن صالح", en: "Patriarch Mohammed Ahmed" },
        { ar: "أحمد بن محمد", en: "Ahmed bin Mohammed" },
        { ar: "أ. محمد بن أحمد", en: "Mr. Mohammed bin Ahmed" },
      ],
    },
    keyAchievements: [
      {
        ar: "تأسيس المنظومة الرقمية والتطبيق التفاعلي",
        en: "Building the digital ecosystem and interactive apps",
      },
      {
        ar: "ربط أفراد الأسرة بالمملكة ودول الخليج",
        en: "Unifying family members across KSA and Gulf states",
      },
    ],
  },
  {
    id: "gen4-eng-nabil-mohammed",
    name: { ar: "م. نبيل بن محمد بوعبيد", en: "Eng. Nabil bin Mohammed Bu Obaid" },
    lineage: {
      ar: "نبيل بن محمد بن عبدالعزيز بن أحمد آل بوعبيد التميمي",
      en: "Nabil bin Mohammed bin Abdulaziz Al Bu Obaid",
    },
    generation: 4,
    generationTitle: {
      ar: "الجيل الرابع (استشاري هندسي)",
      en: "Generation 4 (Engineering Consultant)",
    },
    branchId: "al-abdulaziz",
    branchName: { ar: "فرع آل عبدالعزيز", en: "Al Abdulaziz Branch" },
    ancestorName: {
      ar: "الجد عبدالعزيز بن أحمد آل بوعبيد",
      en: "Patriarch Abdulaziz bin Ahmed Al Bu Obaid",
    },
    settlement: { ar: "الرياض والجبيل الصناعية", en: "Riyadh & Jubail Industrial City" },
    title: {
      ar: "مستشار هندسي ورئيس لجنة المشاريع",
      en: "Senior Engineering Consultant & Projects Chair",
    },
    bio: {
      ar: "مهندس استشاري يمتلك خبرة طويلة في الهيئات الهندسية والصناعية الكبرى، يشرف على الاستشارات الفنية والأنشطة الطلابية والهندسية بالأسرة.",
      en: "Senior engineering consultant with extensive experience in industrial governance, supervising technical advisory and student mentorship.",
    },
    relations: {
      father: { ar: "محمد بن عبدالعزيز آل بوعبيد", en: "Mohammed bin Abdulaziz Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد عبدالعزيز بن أحمد", en: "Patriarch Abdulaziz bin Ahmed" },
        { ar: "محمد بن عبدالعزيز", en: "Mohammed bin Abdulaziz" },
        { ar: "م. نبيل بن محمد", en: "Eng. Nabil bin Mohammed" },
      ],
    },
  },
  {
    id: "gen4-mana-saad",
    name: { ar: "أ. مانع بن سعد بوعبيد", en: "Mr. Mana bin Saad Bu Obaid" },
    lineage: {
      ar: "مانع بن سعد بن عبدالعزيز بن سعد آل بوعبيد التميمي",
      en: "Mana bin Saad bin Abdulaziz Al Bu Obaid",
    },
    generation: 4,
    generationTitle: { ar: "الجيل الرابع (قيادي مجتمعي)", en: "Generation 4 (Community Leader)" },
    branchId: "al-saad",
    branchName: { ar: "فرع آل سعد", en: "Al Saad Branch" },
    ancestorName: { ar: "الجد سعد بن أحمد آل بوعبيد", en: "Patriarch Saad bin Ahmed Al Bu Obaid" },
    settlement: { ar: "المبرز والدمام", en: "Al-Mubarraz & Dammam" },
    title: {
      ar: "قيادي مجتمعي وعضو لجنة البرامج الاجتماعية",
      en: "Community Leader & Social Programs Member",
    },
    bio: {
      ar: "شخصية مجتمعية نشطة في تنظيم الفعاليات العائلية واللقاءات الدورية وإبراز المبادرات الشبابية والتكافلية بفرع آل سعد والأسرة عامة.",
      en: "Active community figure facilitating family assemblies, youth empowerment initiatives, and social solidarity programs.",
    },
    relations: {
      father: { ar: "سعد بن عبدالعزيز آل بوعبيد", en: "Saad bin Abdulaziz Al Bu Obaid" },
      lineageChain: [
        { ar: "الجد سعد بن أحمد", en: "Patriarch Saad bin Ahmed" },
        { ar: "سعد بن عبدالعزيز", en: "Saad bin Abdulaziz" },
        { ar: "أ. مانع بن سعد", en: "Mr. Mana bin Saad" },
      ],
    },
  },
];
