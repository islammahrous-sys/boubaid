import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Faithful transcription of the authoritative family document
 * «العمق التاريخي والامتداد القبلي» — the single source for the
 * "History and Roots" page (/about).
 *
 * Arabic is the authoritative text and is reproduced verbatim, including
 * every source citation, quotation, table row, genetic identifier and
 * caption. English is a professional rendering of the same structure.
 *
 * Images live in the existing Supabase `site-media` bucket (public), so the
 * page keeps using the site's established media architecture rather than
 * local development paths.
 */

const MEDIA = "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media";

export const historyMedia = {
  geneticChart: `${MEDIA}/history/genetic-chart-j-z20773.jpg`,
  bigYChart: `${MEDIA}/history/bigy-haplogroup-chart.png`,
  riddaMap: `${MEDIA}/history/ridda-battles-map.png`,
  waqfDocument: `${MEDIA}/history/mubarraz-waqf-document-1102h.png`,
  tamimMap: `${MEDIA}/history/banu-tamim-settlements-map.png`,
  visualGenealogy: `${MEDIA}/lineage/al-bu-obaid-visual-genealogy.png`,
  officialPlate: `${MEDIA}/official/family-tree-plate-1447.jpg`,
};

export type HistoryBlock =
  | { kind: "para"; text: BiText }
  | { kind: "subheading"; text: BiText }
  | { kind: "quote"; text: BiText }
  | { kind: "source"; text: BiText; url?: string }
  | { kind: "figure"; src: string; caption: BiText; portrait?: boolean }
  | { kind: "list"; items: BiText[] }
  | { kind: "poem"; lines: [string, string][] }
  | { kind: "table"; columns: BiText[]; rows: BiText[][] };

export type HistorySection = {
  id: string;
  label: BiText;
  eyebrow: BiText;
  title: BiText;
  blocks: HistoryBlock[];
};

export const historySections: HistorySection[] = [
  {
    id: "depth",
    label: { ar: "العمق التاريخي", en: "Historical depth" },
    eyebrow: { ar: "أولاً", en: "I" },
    title: {
      ar: "العمق التاريخي والامتداد القبلي",
      en: "Historical depth and tribal extension",
    },
    blocks: [
      {
        kind: "para",
        text: {
          ar: "تتجذر الأصول النسبية لأسرة آل بوعبيد في أعماق البنية القبلية العربية، حيث ينحدرون من فرع «العبادل»، وهم أبناء عبد الله بن دارم، والذي يُعد من البطون الكبرى والنخبة الأرستقراطية المؤثرة في قبيلة بني تميم العريقة. يمتد التسلسل النسبي الموثق للأسرة صعودًا إلى: عبد الله بن زيد بن عبد الله بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم بن مر. ويستمر هذا الاتصال النسبي الموغل في القدم حتى يلتقي مع الجد الأكبر عدنان، من ذرية نبي الله إسماعيل بن إبراهيم الخليل عليهما السلام.",
          en: "The lineage of the Al Bu Obaid family is rooted deep in the Arab tribal structure. They descend from the ʿAbadil branch — the sons of ʿAbd Allāh ibn Dārim — one of the major and most influential aristocratic houses of the ancient tribe of Banu Tamim. The family's documented chain of descent ascends to: ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Mālik ibn Zayd Manāt ibn Tamīm ibn Murr, and continues upward until it meets the great ancestor ʿAdnān, of the progeny of the Prophet Ishmael son of Abraham, peace be upon them.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقد استوطن أجداد الأسرة شرق الجزيرة العربية وواحة الأحساء قديمًا، منتقلين من النمط البدوي الرعوي إلى الاستقرار الحضري والتجاري المبكر، وهو ما يفسر تمركزهم الديموغرافي الحالي في محافظة الأحساء.",
          en: "The family's forefathers settled eastern Arabia and the Al-Ahsa oasis in early times, moving from a bedouin pastoral pattern to early urban and commercial settlement — which explains their present demographic concentration in the Al-Ahsa governorate.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "الالتقاء بالنسب النبوي الشريف ومكانة «قومنا»",
          en: "Convergence with the Prophetic lineage and the standing of “our people”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "تكتسب السلالة الدارمية التميمية أهمية دينية وتاريخية بالغة من خلال الالتقاء النسبي المباشر مع النبي محمد ﷺ عند الجد المشترك «إلياس بن مضر». فبينما يتسلسل نسب النبي ﷺ عبر (مدركة بن إلياس)، يتسلسل نسب بني تميم عبر (طابخة بن إلياس). وهذا الانتماء العدناني المشترك هو ما يفسر الإشارات الواضحة في النصوص الإسلامية الكلاسيكية التي تمنح بني تميم مكانة رفيعة.",
          en: "The Dārimī–Tamīmī line carries profound religious and historical significance through its direct genealogical convergence with the Prophet Muhammad ﷺ at the shared ancestor Ilyās ibn Muḍar. While the Prophet's lineage descends through Mudrikah ibn Ilyās, the lineage of Banu Tamim descends through Ṭābikhah ibn Ilyās. This shared Adnani affiliation explains the explicit references in the classical Islamic sources that accord Banu Tamim a lofty standing.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقد تجلى هذا الارتباط الوثيق في الحديث النبوي الشريف الموثق في الصحاح؛ فعن أبي هريرة رضي الله عنه قال: (ما زلت أحب بني تميم منذ ثلاث سمعتهن من رسول الله ﷺ… فلما جيء بصدقاتهم قال رسول الله ﷺ:",
          en: "This close bond appears in the authenticated Prophetic tradition recorded in the canonical collections. Abū Hurayrah (may God be pleased with him) said: “I have never ceased to love Banu Tamim since three things I heard from the Messenger of God ﷺ… and when their alms were brought, the Messenger of God ﷺ said:",
        },
      },
      {
        kind: "quote",
        text: { ar: "هذه صدقات قومنا", en: "“These are the alms of our people.”" },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإمام البخاري، «الجامع المسند الصحيح (صحيح البخاري)»، كتاب العتق، باب أفراد، حديث رقم (2543) / والإمام مسلم، «صحيح مسلم»، كتاب فضائل الصحابة، باب فضائل بني تميم، حديث رقم (2525)).",
          en: "(Source: al-Bukhārī, Ṣaḥīḥ al-Bukhārī, Book of Manumission, ḥadīth no. 2543; and Muslim, Ṣaḥīḥ Muslim, Book of the Virtues of the Companions, chapter on the virtues of Banu Tamim, ḥadīth no. 2525.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "إن وصف النبي ﷺ لهم بـ «قومنا» يُعدُّ وسامًا تاريخيًّا يثبت اعتزازه ﷺ بقرابة الدم والجد المشترك.",
          en: "The Prophet's description of them as “our people” is a historical badge of honour affirming his ﷺ regard for the bond of blood and the shared ancestor.",
        },
      },
    ],
  },
  {
    id: "historical-data",
    label: { ar: "المعطيات التاريخية", en: "Historical data" },
    eyebrow: { ar: "ثانياً", en: "II" },
    title: {
      ar: "المعطيات التاريخية والجينية والتوفيق بينها — أولًا: المعطيات التاريخية",
      en: "Historical and genetic evidence, and their reconciliation — I: the historical evidence",
    },
    blocks: [
      {
        kind: "para",
        text: {
          ar: "تذكر المصادر التاريخية والبلدانية أن ديار بني تميم في الجاهلية امتدت على نطاق واسع من نجد، شملت الأقاليم الواقعة بين البصرة واليمامة، وانتشرت منازلهم بين وادي الباطن ووادي حنيفة، مع حضور بارز في الدهناء وهضبة نجد. وقد عُرفوا بالتنقل الموسمي بين هذه المواطن تبعًا لموارد الماء والكلأ.",
          en: "The historical and geographical sources record that the lands of Banu Tamim in the pre-Islamic era extended broadly across Najd, covering the regions between Basra and al-Yamāmah, with their dwellings spread between Wādī al-Bāṭin and Wādī Ḥanīfah and a marked presence in al-Dahnāʾ and the Najd plateau. They were known for seasonal movement between these habitats in accordance with water and pasture.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: تاريخ ابن خلدون، الجزء الثاني / ص: 377، ومعجم البلدان، لياقوت الحموي، (2/ 390).",
          en: "(Source: Tārīkh Ibn Khaldūn, vol. 2, p. 377; and Yāqūt al-Ḥamawī, Muʿjam al-Buldān, 2/390.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ومع مرور العصور، توسع انتشار بني تميم خارج نجد، وأصبحت مساكنهم تشمل مناطق واسعة من المملكة العربية السعودية؛ فإلى جانب ما ذكر من وجود لبني تميم في نجد، ذكرت المصادر أيضًا وجود هذه القبيلة في مناطق خارجها؛ منها: الأحساء، والمبرز، والجبيل، والدمام، على الساحل الشرقي للمملكة العربية السعودية، بل وصل وجودهم خارج المملكة والجزيرة العربية، فاستوطنوا في الإمارات العربية المتحدة، والعراق، وقطر، وبلاد فارس.",
          en: "Over the centuries the presence of Banu Tamim expanded beyond Najd, and their dwellings came to cover wide areas of the Kingdom of Saudi Arabia. Alongside their presence in Najd, the sources also record the tribe in Al-Ahsa, Al-Mubarraz, Al-Jubail and Dammam on the Kingdom's eastern coast — and indeed beyond the Kingdom and the Arabian Peninsula, settling in the United Arab Emirates, Iraq, Qatar and Persia.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: تاريخ ابن خلدون، الجزء الثاني / ص: 377، ومعجم البلدان، لياقوت الحموي، (2/ 390).",
          en: "(Source: Tārīkh Ibn Khaldūn, vol. 2, p. 377; and Yāqūt al-Ḥamawī, Muʿjam al-Buldān, 2/390.)",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "ذكر نسب العبادل (عبدلي) في كتب التاريخ",
          en: "The ʿAbadil (ʿAbdalī) lineage in the historical literature",
        },
      },
      {
        kind: "para",
        text: {
          ar: "أقدم المصادر التي ذكرت نسبة أبناء عبد الله بن دارم بـ(عبدلي)، كان ما ذكره الأصفهاني (ت: 356هـ)، في كتابه «الأغاني»، حيث أورد قصة المنقري الذي كان يهدي الشاعر بشار بن برد كل عام أضحية من الأضاحي التي كان أهل البصرة يسمنونها سنة وأكثر ويبعث معها بألف درهم. قال: فأمر وكيله في بعض السنين أن يجريه على رسمه فاشترى له نعجة كبيرة غير سمينة وسرق باقي الثمن، وهنا وصف الأصفهاني النعجة بقوله: «وكانت نعجة عبدلية من نعاج عبد الله بن دارم».",
          en: "The earliest source to attribute the sons of ʿAbd Allāh ibn Dārim with the nisbah “ʿAbdalī” is al-Iṣfahānī (d. 356 AH) in Kitāb al-Aghānī. He relates the account of al-Minqarī, who each year sent the poet Bashshār ibn Burd a sacrificial animal from those the people of Basra fattened for a year or more, together with a thousand dirhams. In one year his agent bought a large but lean ewe and stole the remainder of the price; al-Iṣfahānī describes the animal saying: “It was an ʿAbdalī ewe, of the ewes of ʿAbd Allāh ibn Dārim.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الأغاني، لأبي الفرج الأصفهاني، المجلد الثالث، ص: 225).",
          en: "(Source: Abū al-Faraj al-Iṣfahānī, al-Aghānī, vol. 3, p. 225.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وفيما ذكره الأصفهاني دليل على قدم لقب العبادل، وانتسابهم إلى عبد الله بن دارم.",
          en: "Al-Iṣfahānī's account is evidence of the antiquity of the ʿAbadil designation and of their descent from ʿAbd Allāh ibn Dārim.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "آل بوعبيد جزء من العبادل",
          en: "Al Bu Obaid as part of the ʿAbadil",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ذكر عبد القادر فياض خرشوف في كتابه «قبيلة تميم في الجاهلية والإسلام» ما نصه: «ومن بني عبد الله بن دارم آل بوعبيد، وهم ممن سكن هجر، وقدِموا البصرة مع عبد القيس، وكان لهم دور في سقي الهجريين، واستقر ذكرهم في تاريخ البحرين والأحساء».",
          en: "ʿAbd al-Qādir Fayyāḍ writes in Qabīlat Tamīm fī al-Jāhiliyyah wa-al-Islām: “Among the Banu ʿAbd Allāh ibn Dārim are Āl Bū ʿUbayd, who dwelt in Hajar, came to Basra with ʿAbd al-Qays, had a role in the irrigation of the Hajarīs, and whose mention became established in the history of Baḥrayn and Al-Ahsa.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: قبيلة تميم في الجاهلية والإسلام، عبدالقادر فياض حرفوش، ص: 132).",
          en: "(Source: ʿAbd al-Qādir Fayyāḍ Ḥarfūsh, Qabīlat Tamīm fī al-Jāhiliyyah wa-al-Islām, p. 132.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وهذا دليل يثبت أن أسرة آل بوعبيد تنتمي إلى جذور عبدلية، دارمية، تميمية.",
          en: "This is evidence establishing that the Al Bu Obaid family belongs to ʿAbdalī, Dārimī, Tamīmī roots.",
        },
      },
    ],
  },
  {
    id: "genetic-data",
    label: { ar: "المعطيات الجينية", en: "Genetic evidence" },
    eyebrow: { ar: "ثالثاً", en: "III" },
    title: {
      ar: "المعطيات الطبية — علم الأنساب الجيني (DNA) والتحليل الفيلوجيني",
      en: "The medical evidence — genetic genealogy (DNA) and phylogenetic analysis",
    },
    blocks: [
      {
        kind: "para",
        text: {
          ar: "يمثل دمج علم الأنساب الجيني (Genetic Genealogy) والتحليل الفيلوجيني المتقدم ثورة منهجية حولت المرويات الشفهية التاريخية لأسرة آل بوعبيد وقبيلة بني تميم إلى بيانات بيولوجية تجريبية قاطعة، متطابقة بشكل مذهل مع الجغرافيا التاريخية.",
          en: "The integration of genetic genealogy with advanced phylogenetic analysis represents a methodological revolution that has converted the oral historical narratives of the Al Bu Obaid family and the tribe of Banu Tamim into conclusive empirical biological data, aligning remarkably with the historical geography.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "العمق التطوري والالتقاء الجيني مع قبائل الحجاز (J-Z20775)",
          en: "Evolutionary depth and genetic convergence with the tribes of the Hijaz (J-Z20775)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "تندرج البصمة الجينية للأسرة تحت الهابلوغروب السامي الأكبر (J1). وتكشف المخططات الجينية الحديثة عن مفاجأة أنثروبولوجية بالغة الأهمية عند التحور الجد (J-Z20775) والذي يُقدر عمره بحوالي 1650 سنة. عند هذه العتبة الزمنية، يشكل هذا التحور نقطة الالتقاء الكبرى بين أسلاف الفروع التميمية الشرقية، وبين أسلاف قبائل حيوية استقرت في الحجاز وغرب الجزيرة العربية (مثل فروع من قبيلة مزينة من حرب، وقبيلة صبح، والعوازم). يوثق هذا التحور مرحلة التوسع التدريجي للقبائل العربية قبل هجراتها الكبرى.",
          en: "The family's genetic signature falls under the greater Semitic haplogroup J1. Modern phylogenetic charts reveal an anthropological finding of the first importance at the ancestral mutation J-Z20775, whose age is estimated at about 1,650 years. At this chronological threshold the mutation forms the major convergence point between the ancestors of the eastern Tamimi branches and the ancestors of vigorous tribes that settled the Hijaz and western Arabia (such as branches of Muzaynah of Ḥarb, the tribe of Ṣubḥ, and al-ʿAwāzim). The mutation documents the phase of gradual expansion of the Arab tribes before their great migrations.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "البصمة الجينية لآل بوعبيد (J-Z20773) والتسلسل الزمني للتحورات",
          en: "The Al Bu Obaid genetic signature (J-Z20773) and the chronology of the mutations",
        },
      },
      {
        kind: "para",
        text: {
          ar: "أثبتت الفحوصات المخبرية المتقدمة لأسرة آل بوعبيد في الأحساء انتماءهم القاطع للسلالة والتحور المحوري (J-Z20773)، وهو الخط الجيني المطابق لنتائج قبيلة بني تميم وفرع بني دارم.",
          en: "Advanced laboratory testing of the Al Bu Obaid family in Al-Ahsa has conclusively established their affiliation to the pivotal lineage and mutation J-Z20773 — the genetic line matching the results of the tribe of Banu Tamim and the branch of Banu Dārim.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "يوضح الجدول التالي التسلسل الزمني المقدر (بعمر الجد الجامع - TMRCA) ومقارنته مع الأحداث التاريخية الكبرى الموثقة في أمهات الكتب:",
          en: "The following table sets out the estimated chronology (by the age of the most recent common ancestor — TMRCA) alongside the major historical events documented in the principal sources:",
        },
      },
      {
        kind: "table",
        columns: [
          { ar: "التحور الجيني (SNP)", en: "Genetic mutation (SNP)" },
          { ar: "عمر الجد الجامع", en: "Age of the common ancestor" },
          {
            ar: "السياق التاريخي والأنثروبولوجي الموازي",
            en: "Parallel historical and anthropological context",
          },
          {
            ar: "المصادر والمراجع التاريخية والتوثيق الأكاديمي",
            en: "Historical sources, references and academic documentation",
          },
        ],
        rows: [
          [
            { ar: "J-Z20775", en: "J-Z20775" },
            { ar: "~ 1650 سنة", en: "~ 1,650 years" },
            {
              ar: "نقطة الالتقاء الكبرى للقبائل. يتزامن مع حملات الملك الساساني «سابور الثاني» (ذو الأكتاف) التي أحدثت إزاحات ديموغرافية كبرى للقبائل العربية من نجد والحجاز، مما مهد للهجرات.",
              en: "The major tribal convergence point. Contemporaneous with the campaigns of the Sasanian king Shāpūr II (Dhū al-Aktāf), which caused major demographic displacements of the Arab tribes from Najd and the Hijaz, paving the way for the migrations.",
            },
            {
              ar: "العلامة د. جواد علي، «المفصل في تاريخ العرب قبل الإسلام»، الجزء الرابع، الفصل الحادي والأربعون (الساسانيون والعرب)، ص 15-20.",
              en: "Dr Jawād ʿAlī, al-Mufaṣṣal fī Tārīkh al-ʿArab qabla al-Islām, vol. 4, ch. 41 (The Sasanians and the Arabs), pp. 15–20.",
            },
          ],
          [
            { ar: "J-Z20773", en: "J-Z20773" },
            { ar: "~ 1550 سنة", en: "~ 1,550 years" },
            {
              ar: "التحور الأب لآل بوعبيد والعبادل. يتزامن تشكله مع الهجرة التميمية العظمى شرقًا نحو إقليم البحرين (الأحساء)، واستقرارهم التدريجي والانتقال للنمط الحضري.",
              en: "The parent mutation of Al Bu Obaid and the ʿAbadil. Its formation coincides with the great Tamimi migration eastward toward the Baḥrayn region (Al-Ahsa) and their gradual settlement and shift to urban life.",
            },
            {
              ar: "الحسن الهمداني، «صفة جزيرة العرب»، تحقيق محمد بن علي الأكوع، باب «صفة البحرين واليمامة»، ص 280-282 (توثيق ديار بني تميم في الجرعاء والستار).",
              en: "al-Ḥasan al-Hamdānī, Ṣifat Jazīrat al-ʿArab, ed. Muḥammad ibn ʿAlī al-Akwaʿ, chapter “Description of Baḥrayn and al-Yamāmah”, pp. 280–282 (documenting the lands of Banu Tamim at al-Jarʿāʾ and al-Sitār).",
            },
          ],
          [
            { ar: "J-Z20776", en: "J-Z20776" },
            { ar: "~ 1350 سنة", en: "~ 1,350 years" },
            {
              ar: "بداية التفرع الديموغرافي داخل إقليم البحرين التاريخي بعد الاستقرار الأولي وازدهار النشاط التجاري والزراعي.",
              en: "The beginning of demographic branching within the historic Baḥrayn region after initial settlement and the flourishing of commercial and agricultural activity.",
            },
            {
              ar: "ياقوت الحموي، «معجم البلدان»، المجلد الأول، باب الباء والحاء (البحرين)، ص 346.",
              en: "Yāqūt al-Ḥamawī, Muʿjam al-Buldān, vol. 1, entry “al-Baḥrayn”, p. 346.",
            },
          ],
          [
            { ar: "J-Z20774", en: "J-Z20774" },
            { ar: "~ 1325 سنة", en: "~ 1,325 years" },
            {
              ar: "الجيل السابق مباشرة لظهور الإسلام. يمثل حقبة زعامات هجر قبل الفتح (كعهد المنذر بن ساوى) ويمثل التكتل الحيوي السابق للانفجار الديموغرافي.",
              en: "The generation immediately preceding the advent of Islam. It represents the era of the leaderships of Hajar before the conquest (such as the age of al-Mundhir ibn Sāwā) and the vital clustering that preceded the demographic expansion.",
            },
            {
              ar: "ابن حجر العسقلاني، «الإصابة في تمييز الصحابة»، المجلد السادس، حرف الميم (ترجمة المنذر بن ساوى)، ص 146.",
              en: "Ibn Ḥajar al-ʿAsqalānī, al-Iṣābah fī Tamyīz al-Ṣaḥābah, vol. 6, letter mīm (entry on al-Mundhir ibn Sāwā), p. 146.",
            },
          ],
          [
            { ar: "J-Z20777", en: "J-Z20777" },
            { ar: "~ 1300 سنة", en: "~ 1,300 years" },
            {
              ar: "يتزامن هذا التحور الفرعي البارز بدقة مع بزوغ فجر الإسلام وبداية الفتوحات الإسلامية الكبرى وخروج أبناء القبيلة للأمصار كقادة وجنود.",
              en: "This prominent sub-mutation coincides precisely with the dawn of Islam, the beginning of the great Islamic conquests, and the departure of the tribe's sons to the garrison cities as commanders and soldiers.",
            },
            {
              ar: "أحمد بن يحيى البلاذري، «فتوح البلدان»، تحقيق رضوان محمد رضوان، فصل «فتوح السواد» وفصل «فتوح خراسان»، ص 240 و ص 395.",
              en: "Aḥmad ibn Yaḥyā al-Balādhurī, Futūḥ al-Buldān, ed. Riḍwān Muḥammad Riḍwān, chapters “The conquests of al-Sawād” and “The conquests of Khurāsān”, pp. 240 and 395.",
            },
          ],
          [
            { ar: "J-Z20778", en: "J-Z20778" },
            { ar: "~ 1200 سنة", en: "~ 1,200 years" },
            {
              ar: "فترة العصر الأموي وتمدد القبائل. يضم هذا الفرع عائلات تميمية بالإضافة لخطوط مغربية قديمة، مما يعكس موجات هجرة الجيوش الإسلامية نحو المغرب الأقصى.",
              en: "The Umayyad period and the expansion of the tribes. This branch includes Tamimi families as well as old Maghrebi lines, reflecting the migration waves of the Islamic armies toward the far Maghreb.",
            },
            {
              ar: "ابن عذاري المراكشي، «البيان المُغرب في أخبار الأندلس والمغرب»، الجزء الأول، باب «دخول العرب أفريقية والمغرب»، ص 35-38.",
              en: "Ibn ʿIdhārī al-Marrākushī, al-Bayān al-Mughrib fī Akhbār al-Andalus wa-al-Maghrib, vol. 1, chapter “The entry of the Arabs into Ifrīqiyah and the Maghreb”, pp. 35–38.",
            },
          ],
          [
            { ar: "J-Z57621", en: "J-Z57621" },
            { ar: "~ 1000 سنة", en: "~ 1,000 years" },
            {
              ar: "يتزامن مع العصر العباسي، وهي فترة شهدت الأحساء خلالها تقلبات جيوسياسية (كحقبة القرامطة)، مما دفع العائلات للتكتل والترسخ بأسماء الفخوذ والبطون لحماية مكتسباتها.",
              en: "Coincides with the Abbasid era, a period in which Al-Ahsa witnessed geopolitical upheavals (such as the Qarmatian age), driving families to cluster and entrench themselves under clan and sub-clan names to protect their gains.",
            },
            {
              ar: "محمد بن عبد الله الأحسائي، «تحفة المستفيد بتاريخ الأحساء في القديم والجديد»، الجزء الأول، فصل «دولة القرامطة في البحرين»، ص 85-90.",
              en: "Muḥammad ibn ʿAbd Allāh al-Aḥsāʾī, Tuḥfat al-Mustafīd bi-Tārīkh al-Aḥsāʾ fī al-Qadīm wa-al-Jadīd, vol. 1, chapter “The Qarmatian state in Baḥrayn”, pp. 85–90.",
            },
          ],
          [
            { ar: "J-Z54623", en: "J-Z54623" },
            { ar: "~ 950 سنة", en: "~ 950 years" },
            {
              ar: "تفرعات لاحقة مهدت لنشوء الكيانات العائلية المعاصرة. تتزامن مع نشأة الإمارة «العيونية» في الأحساء والتي أعادت الاستقرار والتجارة للمنطقة.",
              en: "Later branchings that paved the way for the emergence of contemporary family entities. Coincides with the rise of the ʿUyūnid emirate in Al-Ahsa, which restored stability and trade to the region.",
            },
            {
              ar: "د. عبد الرحمن المديرس، «الدولة العيونية في البحرين»، الباب الأول، الفصل الثاني (نشأة الدولة العيونية)، ص 45-52.",
              en: "Dr ʿAbd al-Raḥmān al-Mudayris, al-Dawlah al-ʿUyūniyyah fī al-Baḥrayn, part 1, ch. 2 (The rise of the ʿUyūnid state), pp. 45–52.",
            },
          ],
          [
            { ar: "J-BY37877", en: "J-BY37877" },
            { ar: "~ 900 سنة", en: "~ 900 years" },
            {
              ar: "عقدة الانفجار الديموغرافي الخليجي. ازدهار تجاري غير مسبوق في شرق الجزيرة أدى لطفرة سكانية هائلة، ويضم هذا التحور الكثيف مئات العينات لأبرز عائلات الخليج العربي.",
              en: "The node of the Gulf demographic expansion. Unprecedented commercial prosperity in eastern Arabia produced an immense population surge; this dense mutation includes hundreds of samples from the most prominent families of the Arabian Gulf.",
            },
            {
              ar: "ج. ج. لوريمر، «دليل الخليج»، القسم الجغرافي، الجزء الأول، باب «الأحساء» وباب «قطر»، ص 120-125 (توثيق الحواضر والنشاط التجاري).",
              en: "J. G. Lorimer, Gazetteer of the Persian Gulf, Geographical Section, vol. 1, entries “al-Aḥsāʾ” and “Qatar”, pp. 120–125 (documenting the urban centres and commercial activity).",
            },
          ],
        ],
      },
      {
        kind: "para",
        text: {
          ar: "ومن خلال الدراسات الجينية لقبيلة بني تميم تبين أن السلف j-z20775 ولد على الأرجح حوالي عام 200م تقريبًا.",
          en: "The genetic studies of the tribe of Banu Tamim indicate that the ancestor J-Z20775 was most probably born around 200 CE.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: (آل بوعبيد) — الأحساء، البوابة الرسمية لأسرة آل بوعبيد، على الرابط: https://alboabid-heritage-hub.lovable.app)",
          en: "(Source: Al Bu Obaid — Al-Ahsa, the official portal of the Al Bu Obaid family: https://alboabid-heritage-hub.lovable.app)",
        },
        url: "https://alboabid-heritage-hub.lovable.app",
      },
      {
        kind: "figure",
        src: historyMedia.geneticChart,
        caption: {
          ar: "رسم بياني لتشكل السلالة الأبوية j-z20773 عام 200م.",
          en: "Chart of the formation of the paternal lineage J-Z20773 in the year 200 CE.",
        },
      },
      {
        kind: "figure",
        src: historyMedia.bigYChart,
        portrait: true,
        caption: {
          ar: "رسم بياني يوضح أن الذين يخضعون لاختبار Big Y من المجموعة الفردانية سلفًا جينيًّا أحدث.",
          en: "Chart showing that those tested with Big Y from the haplogroup share a more recent genetic ancestor.",
        },
      },
      {
        kind: "subheading",
        text: { ar: "التحليل والتوفيق", en: "Analysis and reconciliation" },
      },
      {
        kind: "para",
        text: {
          ar: "من خلال دراسة الحقائق التاريخية لقبيلة بني تميم فإنه يتأكد انتسابهم إلى تميم بن مرّ بن أُدّ بن طابخة بن إلياس بن مُضَر بن نزار بن معد بن عدنان، والذي تؤكد الدراسات الجينية أنه ولد حوالي 200م.",
          en: "A study of the historical record of Banu Tamim confirms their descent from Tamīm ibn Murr ibn Udd ibn Ṭābikhah ibn Ilyās ibn Muḍar ibn Nizār ibn Maʿadd ibn ʿAdnān, whom the genetic studies confirm to have been born around 200 CE.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وللمقارنة والتوفيق بين هذه الحقائق لا بد أن تجرى الدراسة على إحدى الشخصيات التاريخية التميمية الموثوقة تاريخًا ونسبًا؛ لذا فقد كانت شخصية المنذر بن ساوى من هذه الشخصيات.",
          en: "To compare and reconcile these facts, the study must be applied to a Tamimi historical figure reliably documented in both history and lineage; the figure of al-Mundhir ibn Sāwā is such a person.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ونسبه هو: المنذر بن ساوى بن الأخنس بن بيان بن عمرو بن عبد الله بن زيد بن عبد الله بن دارم بن مالك بن حنظلة بن زيد مناة بن تميم، والذي توفي عام 11هـ، أي في عام 633م.",
          en: "His lineage is: al-Mundhir ibn Sāwā ibn al-Akhnas ibn Bayān ibn ʿAmr ibn ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Zayd Manāt ibn Tamīm. He died in 11 AH, that is in 633 CE.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الأعلام للزركلي الجزء السابع ص: 293).",
          en: "(Source: al-Ziriklī, al-Aʿlām, vol. 7, p. 293.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وعند قراءة نسب المنذر بن ساوى نجد أنه في النسب الرقم (13) وصولًا إلى تميم بن مرّ، الجد الجامع لهذه القبيلة.",
          en: "Reading the lineage of al-Mundhir ibn Sāwā, he stands at position 13 in the chain up to Tamīm ibn Murr, the common ancestor of the tribe.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "واستنادًا إلى الفرضية التاريخية القائلة: بأنه يتعاقب في القرن الواحد تقريبًا (3) أجيال.",
          en: "Relying on the historical premise that roughly three generations succeed one another in a single century:",
        },
      },
      {
        kind: "para",
        text: {
          ar: "فإنه باستطاعتنا أن نحدد القرون الفاصلة بين المنذر بن ساوى، وبين تميم بن مرّ (الجد الجامع لقبيلة بني تميم) وذلك من خلال قسمة عدد الأجيال (13) على الفرضية التاريخية (3)، سنجد أن الناتج هو (4.33) قرون، وهي الفاصل بين المنذر بن ساوى وتميم بن مرّ.",
          en: "We can determine the centuries separating al-Mundhir ibn Sāwā from Tamīm ibn Murr (the common ancestor of Banu Tamim) by dividing the number of generations (13) by the historical premise (3), giving 4.33 centuries as the interval between them.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وهذا يأخذنا إلى نتيجة حتمية، وهي أن تميم بن مرّ ولد في عام 200م.",
          en: "This leads to an inevitable conclusion: that Tamīm ibn Murr was born in the year 200 CE.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وهي نتيجة تؤيد ما ذهب إليه المؤرخون، ومع نتيجة التحليل الجيني؛ التي تقول: إن السلف ولد في حوالي عام 218م، ويقرب إلى 200م.",
          en: "This result supports the view of the historians and agrees with the outcome of the genetic analysis, which places the ancestor's birth at about 218 CE, approximating to 200 CE.",
        },
      },
    ],
  },
  {
    id: "figures",
    label: { ar: "شخصيات تميمية", en: "Tamimi figures" },
    eyebrow: { ar: "رابعاً", en: "IV" },
    title: { ar: "شخصيات تاريخية تميمية", en: "Tamimi historical figures" },
    blocks: [
      {
        kind: "subheading",
        text: {
          ar: "المنذر بن ساوى حاكم الأحساء والعهد الإسلامي",
          en: "Al-Mundhir ibn Sāwā, ruler of Al-Ahsa, and the Islamic era",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ارتبط استيطان الأسرة القديم في إقليم البحرين (واحة الأحساء الحالية) بشخصية قيادية فذة، وهو المنذر بن ساوى بن عبد الله بن زيد بن عبد الله بن دارم التميمي (سليل مباشر لعبد الله بن دارم الجد الجامع للعبادل). كان المنذر حاكم إقليم هجر والأحساء قُبيل الفتح الإسلامي.",
          en: "The family's ancient settlement in the Baḥrayn region (today's Al-Ahsa oasis) is bound to an outstanding leader: al-Mundhir ibn Sāwā ibn ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim al-Tamīmī, a direct descendant of ʿAbd Allāh ibn Dārim, the common ancestor of the ʿAbadil. Al-Mundhir governed the region of Hajar and Al-Ahsa shortly before the Islamic conquest.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: ياقوت الحموي، «معجم البلدان»، المجلد الثاني، باب الهاء والجيم (هجر)، ص 212)",
          en: "(Source: Yāqūt al-Ḥamawī, Muʿjam al-Buldān, vol. 2, entry “Hajar”, p. 212.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وعندما أرسل النبي ﷺ الصحابي العلاء بن الحضرمي بكتاب يدعوه فيه للإسلام، استجاب المنذر فورًا وأسلم، وأسهم في دخول طائفةٍ من أهل المنطقة في دين الإسلام طوعًا وبصورة سلمية.",
          en: "When the Prophet ﷺ sent the Companion al-ʿAlāʾ ibn al-Ḥaḍramī with a letter calling him to Islam, al-Mundhir responded at once and embraced Islam, and contributed to a body of the region's people entering the religion willingly and peacefully.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الحافظ ابن حجر العسقلاني، «الإصابة في تمييز الصحابة»، المجلد السادس، حرف الميم، ترجمة رقم (8193)، ص 146).",
          en: "(Source: Ibn Ḥajar al-ʿAsqalānī, al-Iṣābah fī Tamyīz al-Ṣaḥābah, vol. 6, letter mīm, entry no. 8193, p. 146.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "يثبت هذا دلالة قاطعة على استمرارية تاريخية وسياسية لفرع بني دارم في إقليم الأحساء تمتد لأكثر من أربعة عشر قرنًا متصلة.",
          en: "This establishes conclusive evidence of a historical and political continuity of the Banu Dārim branch in the Al-Ahsa region extending more than fourteen unbroken centuries.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "كتاب النبي ﷺ إلى المنذر بن ساوى وإسلامه",
          en: "The Prophet's ﷺ letter to al-Mundhir ibn Sāwā and his acceptance of Islam",
        },
      },
      {
        kind: "para",
        text: {
          ar: "أرسل النبي ﷺ كتابًا إلى المنذر بن ساوى، جاء فيه:",
          en: "The Prophet ﷺ sent a letter to al-Mundhir ibn Sāwā, in which he said:",
        },
      },
      {
        kind: "quote",
        text: {
          ar: "بسم الله الرحمن الرحيم، من محمد رسول الله إلى المنذر بن ساوي، سلام عليك، فإني أحمد إليك الله الذي لا إله إلا هو، وأشهد أن لا إله إلا الله وأن محمدا عبده ورسوله، أما بعد: فإني أذكرك الله عز وجل، فإنه من ينصح فإنما ينصح لنفسه، فإنه من يطع رسلي ويتبع أمرهم فقد أطاعني، ومن نصح لهم فقد نصح لي، وإن رسلي قد أثنوا عليك خيرا، وإني قد شفعتك في قومك، فاترك للمسلمين ما أسلموا عليه، وعفوت عن أهل الذنوب، فاقبل منهم، وإنك مهما تصلح فلن نعزلك عن عملك، ومن أقام على يهودية أو مجوسية فعليه الجزية",
          en: "“In the name of God, the Most Merciful, the Compassionate. From Muhammad the Messenger of God to al-Mundhir ibn Sāwā. Peace be upon you. I praise to you God, beside whom there is no deity, and I bear witness that there is no deity but God and that Muhammad is His servant and Messenger. I remind you of God Almighty, for whoever counsels sincerely counsels his own soul; whoever obeys my envoys and follows their command has obeyed me, and whoever counsels them has counselled me. My envoys have spoken well of you, and I have granted you intercession for your people. Leave to the Muslims what they have accepted Islam upon. I have pardoned the people of offences, so accept from them; and as long as you act rightly we shall not remove you from your office. Whoever persists in Judaism or Zoroastrianism must pay the jizyah.”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "فأسلم المنذر، وأقره النبي ﷺ في ولايته للبحرين.",
          en: "Al-Mundhir embraced Islam, and the Prophet ﷺ confirmed him in his governorship of Baḥrayn.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصادر: عيون الأثر، لابن سيد الناس (الجزء الثاني/ص: 334)، وإعلام السائلين عن كتب سيد المرسلين، لابن طولون ص: 60، والرحيق المختوم، للمباركفوري ص: 327).",
          en: "(Sources: Ibn Sayyid al-Nās, ʿUyūn al-Athar, vol. 2, p. 334; Ibn Ṭūlūn, Iʿlām al-Sāʾilīn ʿan Kutub Sayyid al-Mursalīn, p. 60; al-Mubārakfūrī, al-Raḥīq al-Makhtūm, p. 327.)",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "المصاهرة مع الإمام علي بن أبي طالب (السيدة ليلى الدارمية)",
          en: "The marriage tie with Imam ʿAlī ibn Abī Ṭālib (Laylā al-Dārimiyyah)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "في عهد الخلافة الراشدة، توثقت العلاقة بين أهل البيت وفرع بني دارم بشكل استثنائي. فقد تزوج أمير المؤمنين الخليفة علي بن أبي طالب رضي الله عنه من السيدة ليلى بنت مسعود الدارمية، وأنجبت له ولدين (أبو بكر وعبيد الله) استشهدا دفاعًا عن عائلتهما في كربلاء والمذار.",
          en: "In the era of the Rightly Guided Caliphate, the relationship between the Prophet's household and the Banu Dārim branch was exceptionally close: the Commander of the Faithful ʿAlī ibn Abī Ṭālib married Laylā bint Masʿūd al-Dārimiyyah, who bore him two sons, Abū Bakr and ʿUbayd Allāh, both of whom were martyred in defence of their family at Karbala and al-Madhār.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإمام الطبري، «تاريخ الرسل والملوك»، المجلد الخامس، أحداث سنة 40 هـ (ذكر أسماء نساء علي بن أبي طالب)، ص 153).",
          en: "(Source: al-Ṭabarī, Tārīkh al-Rusul wa-al-Mulūk, vol. 5, events of the year 40 AH (the names of the wives of ʿAlī ibn Abī Ṭālib), p. 153.)",
        },
      },
      {
        kind: "subheading",
        text: { ar: "ليلى بنت مسعود الدارمية", en: "Laylā bint Masʿūd al-Dārimiyyah" },
      },
      {
        kind: "para",
        text: {
          ar: "هي: ليلى بنت مسعود بن خالد بن مالك بن ربعي بن سلمى بن جندل بن نهشل بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم.",
          en: "She is Laylā bint Masʿūd ibn Khālid ibn Mālik ibn Ribʿī ibn Salmā ibn Jandal ibn Nahshal ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Mālik ibn Zayd Manāt ibn Tamīm.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ذكرها ابن سعد في طبقاته، وقال إنها أنجبت لأمير المؤمنين علي بن أبي طالب رضي الله عنه، عبيد الله، وأبا بكر، وقال: «وعبيد الله بن علي قتله المختار ابن أبي عبيد بالمذار. وأبو بكر بن علي قتل مع الحسين ولا عقب لهما».",
          en: "Ibn Saʿd mentions her in his Ṭabaqāt, stating that she bore ʿUbayd Allāh and Abū Bakr to the Commander of the Faithful ʿAlī ibn Abī Ṭālib, and he said: “ʿUbayd Allāh ibn ʿAlī was killed by al-Mukhtār ibn Abī ʿUbayd at al-Madhār, and Abū Bakr ibn ʿAlī was killed with al-Ḥusayn; neither left issue.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الطبقات الكبرى، لابن سعد الجزء الخامس/ص: 88).",
          en: "(Source: Ibn Saʿd, al-Ṭabaqāt al-Kubrā, vol. 5, p. 88.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقد تُوج هذا التحالف الوثيق بالرسالة الشهيرة التي وجهها الإمام علي بن أبي طالب إلى واليه على البصرة عبد الله بن عباس، حيث دافع بقوة عن بني تميم مزكيًا إياهم بقوله:",
          en: "This close alliance was crowned by the famous letter of Imam ʿAlī ibn Abī Ṭālib to his governor of Basra, ʿAbd Allāh ibn ʿAbbās, in which he defended Banu Tamim strongly and commended them, saying:",
        },
      },
      {
        kind: "quote",
        text: {
          ar: "وإن بني تميم لم يغب لهم نجم إلا طلع لهم آخر… وإن لهم بنا رحمًا ماسة، وقرابة خاصة، نحن مأجورون على صلتها، ومأزورون على قطيعتها",
          en: "“No star of Banu Tamim has ever set but another has risen for them… They have with us a close bond of kinship and a particular relation: we are rewarded for maintaining it and blameworthy for severing it.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الشريف الرضي، كتاب «نهج البلاغة»، قسم الرسائل، رسالة رقم (18)، ص 373)",
          en: "(Source: al-Sharīf al-Raḍī, Nahj al-Balāghah, section of letters, letter no. 18, p. 373.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "مما يشكل أسمى تزكية علمية وروحية لنسب بني دارم وتميم ومكانتهم في التاريخ الإسلامي.",
          en: "This constitutes the highest scholarly and spiritual commendation of the lineage of Banu Dārim and Tamim and of their standing in Islamic history.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وبعد وفاة أمير المؤمنين علي بن أبي طالب رضي الله عنه، تزوجت ليلى بنت مسعود بعبد الله بن جعفر بن أبي طالب، وأنجبت له: يحيى وهارون وصالح الأكبر، وموسى، وأم محمد وكانت عند يزيد بن معاوية بن أبي سفيان.",
          en: "After the death of the Commander of the Faithful ʿAlī ibn Abī Ṭālib, Laylā bint Masʿūd married ʿAbd Allāh ibn Jaʿfar ibn Abī Ṭālib and bore him Yaḥyā, Hārūn, Ṣāliḥ the elder, Mūsā, and Umm Muḥammad, who was married to Yazīd ibn Muʿāwiyah ibn Abī Sufyān.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: تاريخ دمشق، لابن عساكر (الجزء 70/ ص: 261).",
          en: "(Source: Ibn ʿAsākir, Tārīkh Dimashq, vol. 70, p. 261.)",
        },
      },
    ],
  },
  {
    id: "symbols",
    label: { ar: "رموز وبطولات", en: "Emblems & valour" },
    eyebrow: { ar: "خامساً", en: "V" },
    title: {
      ar: "رموز وبطولات من الجذور التميمية",
      en: "Emblems and feats of valour from the Tamimi roots",
    },
    blocks: [
      {
        kind: "subheading",
        text: { ar: "القعقاع بن عمرو التميمي", en: "Al-Qaʿqāʿ ibn ʿAmr al-Tamīmī" },
      },
      {
        kind: "para",
        text: {
          ar: "باعتبار أسرة آل بوعبيد امتدادًا أصيلًا للدوحة التميمية العريقة، فإنها ترتبط نسبًا وتاريخًا بواحدٍ من أعظم الرموز والفرسان في التاريخ الإسلامي؛ وهو القائد الفذ القعقاع بن عمرو التميمي.",
          en: "As an authentic extension of the ancient Tamimi house, the Al Bu Obaid family is bound in lineage and history to one of the greatest emblems and horsemen of Islamic history: the outstanding commander al-Qaʿqāʿ ibn ʿAmr al-Tamīmī.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "لقد كان القعقاع أيقونةً للشجاعة والإقدام، وترك بصمات لا تُمحى في الفتوحات الإسلامية الكبرى، لا سيما في معركتي «القادسية» و«اليرموك».",
          en: "Al-Qaʿqāʿ was an icon of courage and resolve, leaving indelible marks on the great Islamic conquests, particularly at the battles of al-Qādisiyyah and al-Yarmūk.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإمام الطبري، تاريخ الرسل والملوك).",
          en: "(Source: al-Ṭabarī, Tārīkh al-Rusul wa-al-Mulūk.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقد بلغ من عظيم أثره وقوة بأسه أن قال عنه الخليفة أبو بكر الصديق رضي الله عنه مقولته الشهيرة:",
          en: "So great was his impact and might that the Caliph Abū Bakr al-Ṣiddīq said of him his famous words:",
        },
      },
      {
        kind: "quote",
        text: {
          ar: "لَصَوْتُ القَعْقَاعِ في الجَيْشِ خَيْرٌ مِنْ أَلْفِ رَجُلٍ",
          en: "“The voice of al-Qaʿqāʿ in the army is better than a thousand men.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: ابن حجر العسقلاني، الإصابة في تمييز الصحابة / وابن الأثير، أسد الغابة في معرفة الصحابة).",
          en: "(Source: Ibn Ḥajar al-ʿAsqalānī, al-Iṣābah fī Tamyīz al-Ṣaḥābah; and Ibn al-Athīr, Usd al-Ghābah fī Maʿrifat al-Ṣaḥābah.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "إن استحضار سيرة القعقاع بن عمرو في تاريخ أسرة آل بوعبيد ليس مجرد سردٍ لأمجاد الماضي، بل هو تذكير للأجيال الحالية والقادمة بأن «الجينات» التي تجري في عروقهم تحمل إرثًا من المبادرة، والقيادة، والتأثير الحاسم في اللحظات التاريخية. وهي دعوة صريحة لأبناء الأسرة ليكونوا «كصوت القعقاع»؛ مؤثرين، ومبادرين، وأصحاب أثرٍ عميق في مجالاتهم العلمية والمهنية وفي خدمة وطنهم ومجتمعهم.",
          en: "Recalling the life of al-Qaʿqāʿ ibn ʿAmr within the history of the Al Bu Obaid family is not merely a recital of past glories; it reminds present and future generations that the heritage running in their veins is one of initiative, leadership and decisive influence at historical moments. It is an explicit call for the family's sons and daughters to be “as the voice of al-Qaʿqāʿ” — influential, enterprising, and of deep impact in their scholarly and professional fields and in the service of nation and society.",
        },
      },
      { kind: "subheading", text: { ar: "نسبه", en: "His lineage" } },
      {
        kind: "para",
        text: {
          ar: "القعقاع بن عمرو التميمي، أخو عاصم، كان من الشجعان الفرسان، قيل: إن عمر بن الخطاب كتب إلى سعد: أيّ فارس كان أفرس في القادسيّة؟ قال: فكتب إليه: إني لم أر مثل القعقاع بن عمرو؛ حمل في يوم ثلاثين حملة، يقتل في كل حملة بطلًا.",
          en: "Al-Qaʿqāʿ ibn ʿAmr al-Tamīmī, brother of ʿĀṣim, was among the bravest of horsemen. It is related that ʿUmar ibn al-Khaṭṭāb wrote to Saʿd asking which horseman was the finest at al-Qādisiyyah, and Saʿd replied: “I have not seen the like of al-Qaʿqāʿ ibn ʿAmr; he charged thirty times in a single day, killing a champion in every charge.”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقيل: استمد خالد بن الوليد أبا بكر لما حاصر الحيرة فأمدّه بالقعقاع بن عمرو، وقال: لا يهزم جيش فيه القعقاع، وهو الّذي غنم في فتح المدائن أدراع كسرى، وكان فيها درع هرقل ودرع لخاقان، ودرع للنعمان وسيفه وسيف كسرى، فأرسلها سعد إلى عمر.",
          en: "It is said that when Khālid ibn al-Walīd besieged al-Ḥīrah he sought reinforcement from Abū Bakr, who sent him al-Qaʿqāʿ ibn ʿAmr saying: “An army in which al-Qaʿqāʿ is present will not be defeated.” It was he who took as spoil at the conquest of al-Madāʾin the coats of mail of Khosrow, among them the mail of Heraclius, of the Khāqān and of al-Nuʿmān, with his sword and the sword of Khosrow — which Saʿd sent to ʿUmar.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وذكر: أنه قطع مشفر الفيل الأعظم يوم القادسية، فكان هَزْمُهم.",
          en: "It is also related that he severed the trunk of the great elephant on the day of al-Qādisiyyah, which brought about their rout.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإصابة في تمييز الصحابة الجزء الخامس / ص: 342-344).",
          en: "(Source: al-Iṣābah fī Tamyīz al-Ṣaḥābah, vol. 5, pp. 342–344.)",
        },
      },
      {
        kind: "subheading",
        text: { ar: "مشاركته في حروب الردة", en: "His part in the Wars of Apostasy" },
      },
      {
        kind: "para",
        text: {
          ar: "كان للقعقاع بن عمرو دور كبير في حروب الردة، فقد أرسله الخليفة أبو بكر الصديق؛ للإغارة على علقمة بن علاثة العامري، عندما ارتد وعسكر بجوار المدينة استعدادًا للهجوم عليها، وعندما وصلت سرية القعقاع، فر علقمة تاركًا أهله فأخذهم القعقاع إلى أبي بكر، فأنكروا أنهم على ما عليه علقمة، فقبل منهم أبو بكر ذلك، ثم عاد علقمة بعد ذلك فأسلم فقبل منه الصديق إسلامه، وعفا عنه.",
          en: "Al-Qaʿqāʿ ibn ʿAmr had a major role in the Wars of Apostasy. The Caliph Abū Bakr al-Ṣiddīq dispatched him to raid ʿAlqamah ibn ʿUlāthah al-ʿĀmirī when he apostatised and encamped near Medina preparing to attack it. When al-Qaʿqāʿ's detachment arrived, ʿAlqamah fled leaving his household behind; al-Qaʿqāʿ brought them to Abū Bakr and they disavowed ʿAlqamah's position, which Abū Bakr accepted from them. ʿAlqamah later returned and embraced Islam, and al-Ṣiddīq accepted his Islam and pardoned him.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإصابة في تمييز الصحابة الجزء الرابع / ص: 458).",
          en: "(Source: al-Iṣābah fī Tamyīz al-Ṣaḥābah, vol. 4, p. 458.)",
        },
      },
      {
        kind: "figure",
        src: historyMedia.riddaMap,
        caption: {
          ar: "خارطة المعارك ضد المرتدين",
          en: "Map of the campaigns against the apostates",
        },
      },
      {
        kind: "subheading",
        text: { ar: "مشاركته في فتوح العراق", en: "His part in the conquests of Iraq" },
      },
      {
        kind: "para",
        text: {
          ar: "كان للقعقاع بن عمرو التميمي دور بارز في فتوح العراق فقد شارك في عدد كبير من معاركها، من ذلك: معركة ذات السلاسل، ومعركة الحصيد، وفتح الحيرة، ومعركة المصبخ، وكان من أكثر ما اشتهر به هو يوم القادسية، واستخلفه خالد بن الوليد على الحيرة بعد فتحها.",
          en: "Al-Qaʿqāʿ ibn ʿAmr al-Tamīmī had a prominent role in the conquests of Iraq, taking part in a great many of its battles: Dhāt al-Salāsil, al-Ḥaṣīd, the conquest of al-Ḥīrah, and al-Maṣbakh. He was best known for the day of al-Qādisiyyah, and Khālid ibn al-Walīd appointed him over al-Ḥīrah after its conquest.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وسيذكر التاريخ للقعقاع أنه ضرب الرقم القياسي في عدد المعارك التي خاضها وسجل فيها صفحات مشرقة، منها إحدى عشرة وقعة شهيرة غير المعارك الصغيرة وهو القائد الوحيد الذى قاتل فى معارك الفتح الإسلامي الثلاثة الحاسمة (القادسية واليرموك ونهاوند) وكان يعتبر بحق في القادسية قائد الميدان الفعلي.",
          en: "History records that al-Qaʿqāʿ set the record for the number of battles he fought and in which he wrote luminous pages — eleven famous engagements aside from the minor ones. He is the only commander to have fought in the three decisive battles of the Islamic conquest (al-Qādisiyyah, al-Yarmūk and Nahāwand), and was rightly regarded at al-Qādisiyyah as the actual field commander.",
        },
      },
      {
        kind: "subheading",
        text: { ar: "القعقاع شاعر الفتوح", en: "Al-Qaʿqāʿ, poet of the conquests" },
      },
      {
        kind: "para",
        text: {
          ar: "لم تخل معركة من المعارك التي شارك فيها القعقاع بن عمرو التميمي، إلا وقد خلدها في شعره، ليس ذلك فحسب، بل كان للقعقاع شعر يعبر فيه عن استعداده لبذل روحه في سبيل نصرة دين الإسلام، ومن ذلك:",
          en: "There was no battle in which al-Qaʿqāʿ ibn ʿAmr al-Tamīmī took part that he did not immortalise in his verse; more than that, he composed poetry expressing his readiness to give his soul in support of the religion of Islam, such as:",
        },
      },
      {
        kind: "poem",
        lines: [
          ["أناضل عن دين عظيم وهبته", "عطاء مقل مهجتي وحياتيا"],
          ["فممتثل لله أسلم وجهه", "يقول أنا وحدي سأحمي دينيا"],
          ["بظهري ببطني بالذراع بمقلتي", "بجنبي بعظم الصدر حتى التراقيا"],
        ],
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: إيماض البرق في خلق سيد الخلق صلى وسلم عليه الحق، علي بن نايف الشحود ص: 37).",
          en: "(Source: ʿAlī ibn Nāyif al-Shaḥūd, Īmāḍ al-Barq fī Khalq Sayyid al-Khalq, p. 37.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وذكر ابن حجر شعر القعقاع فخرًا بكونه جنديًّا من جنود سيف الله فقال:",
          en: "Ibn Ḥajar records al-Qaʿqāʿ's verse in pride at being a soldier of the Sword of God:",
        },
      },
      {
        kind: "poem",
        lines: [
          ["ولقد شهدت البرق برق تهامة", "يهدي المناقب راكبا لغبار"],
          ["في جند سيف اللَّه سيف محمّد", "والسّابقين لسنّة الأحرار"],
        ],
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الإصابة في تمييز الصحابة، لابن حجر، الجزء الخامس/ ص: 343).",
          en: "(Source: Ibn Ḥajar, al-Iṣābah fī Tamyīz al-Ṣaḥābah, vol. 5, p. 343.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ومن أشعاره في وصف الوقائع:",
          en: "And from his verse describing the engagements:",
        },
      },
      {
        kind: "poem",
        lines: [
          ["كم من أب لي قد ورثت فعاله", "جمّ المكارم بحره تيّار"],
          ["ورث المكارم عن أبيه وجده", "فبنا بناءهم له استنصار"],
          ["فبنيت مجدهم وما هدّمته", "وبنيّ بعدي إن بقوا عمّار"],
          ["ما زال منّا في الحروب مروّس", "ملك يغير وخلفه جرّار"],
          ["بطل اللقاء إذا الثغور توكّلت", "عند الثغور مجرّب مظفار"],
          ["وغداة فحل قد رأوني معلما", "والخيل تنحط والبلاد أطوار"],
          ["يفدى بلائي عندها متكلّف", "سلس المياسر عوده خوّار"],
          ["سلس المياسر ما تسامى مأقطا", "عند الرهان معير عيّار"],
          ["ما زالت الخيل العراب تدوسهم", "في حوم فحل والحتا موّار"],
          ["حتى رميت سراتهم عن أسرهم", "في ردعة ما بعدها استمرار"],
          ["يوم الرداع فعند فحل ساعة", "وخز الرماح عليم مدرار"],
          ["ولقد أثرنا في الرداع جموعهم", "طرّا ونحوي تسم الأبصار"],
        ],
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: تاريخ مدينة دمشق، لابن عساكر، الجزء الثاني/ ص: 107).",
          en: "(Source: Ibn ʿAsākir, Tārīkh Madīnat Dimashq, vol. 2, p. 107.)",
        },
      },
      {
        kind: "para",
        text: { ar: "وقوله في معركة الحصيد:", en: "And his verse on the battle of al-Ḥaṣīd:" },
      },
      {
        kind: "poem",
        lines: [
          ["ألم ينه عنا حي فارس أننا", "منعناهم من حيهم بالصوارم"],
          ["وإنا أناس قد نعود خيلنا", "لقاء الأعادي بالحتوف الفواطم"],
        ],
      },
      { kind: "para", text: { ar: "إلى أن قال:", en: "Until he said:" } },
      {
        kind: "poem",
        lines: [
          ["تركنا حصيدًا لا أنيس يجره", "وقد شقيت أربابه بالأعاجم"],
          ["ألا أبلغا أسماء أن خليلها", "قضى وطرًا من روزبي الأعاجم"],
          ["غداة صبحنا في حصيد جموعهم", "بهندية تفري فراخ الجماجم"],
        ],
      },
      {
        kind: "para",
        text: {
          ar: "إلى غير ذلك من الأشعار التي تصف، وتصور تلك المعارك التي كان له فيها مشاركة ونصيب.",
          en: "And so with other verses describing and depicting the battles in which he had a part and a share.",
        },
      },
      {
        kind: "subheading",
        text: { ar: "الأحنف بن قيس التميمي", en: "Al-Aḥnaf ibn Qays al-Tamīmī" },
      },
      {
        kind: "para",
        text: {
          ar: "الأمير الكبير، العالم النبيل، أبو بحر التميمي، أحد من يضرب بحلمه وسؤدده المثل، كان من قادة جيش علي يوم صفين، وكان له مشاركة في فتوحات الشرق الإسلامي، توفي سنة (72هـ)، وقيل غير ذلك.",
          en: "The great commander and noble scholar Abū Baḥr al-Tamīmī, whose forbearance and eminence became proverbial. He was among the commanders of ʿAlī's army at Ṣiffīn and took part in the conquests of the Islamic east. He died in 72 AH, though other dates are given.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: سير أعلام النبلاء، للذهبي الجزء الرابع / ص: 86).",
          en: "(Source: al-Dhahabī, Siyar Aʿlām al-Nubalāʾ, vol. 4, p. 86.)",
        },
      },
      { kind: "subheading", text: { ar: "نسبه", en: "His lineage" } },
      {
        kind: "para",
        text: {
          ar: "هو: أبو بحر؛ الضحاك بن قيس بن معاوية بن حصين بن عبادة بن النزال بن مرة ابن عبيد بن الحارث بن عمرو بن كعب بن سعد بن زيد مناة بن تميم التميمي المعروف بالأحنف، وقيل اسمه صخر.",
          en: "He is Abū Baḥr, al-Ḍaḥḥāk ibn Qays ibn Muʿāwiyah ibn Ḥuṣayn ibn ʿUbādah ibn al-Nazzāl ibn Murrah ibn ʿUbayd ibn al-Ḥārith ibn ʿAmr ibn Kaʿb ibn Saʿd ibn Zayd Manāt ibn Tamīm al-Tamīmī, known as al-Aḥnaf; some say his name was Ṣakhr.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: وفيات الأعيان، لابن خلكان، الجزء الثاني / ص: 499)",
          en: "(Source: Ibn Khallikān, Wafayāt al-Aʿyān, vol. 2, p. 499.)",
        },
      },
      {
        kind: "subheading",
        text: { ar: "مشاركته في الفتوح", en: "His part in the conquests" },
      },
      {
        kind: "para",
        text: {
          ar: "تذكر المصادر أنه كان للأحنف بن قيس دوره في الفتوحات الإسلامية، منها: قاسان والتيمرة، أما دوره الأبرز فقد كان في عمليات الفتوح في خراسان، فكان أحد قاداته، وفتح على يديه مرو الروذ، وقاشان.",
          en: "The sources record that al-Aḥnaf ibn Qays had his role in the Islamic conquests, among them Qāsān and al-Taymarah; his most prominent role was in the operations in Khurāsān, where he was one of the commanders, and Marw al-Rūdh and Qāshān were conquered at his hands.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: المجتمعات الإسلامية في القرن الأول الهجري (نشأتها، مقوماتها، تطورها اللغوي والأدبي)، ص:204-205).",
          en: "(Source: al-Mujtamaʿāt al-Islāmiyyah fī al-Qarn al-Awwal al-Hijrī, pp. 204–205.)",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "حلمه وحكمته وقوله الحق",
          en: "His forbearance, wisdom, and speaking of the truth",
        },
      },
      {
        kind: "para",
        text: {
          ar: "كان الأحنف بن قيس من أحلم الناس، وله أقوال في ذلك منها: قوله عندما سئل عن الحلم ما هو فقال: «هو الذل مع الصبر».",
          en: "Al-Aḥnaf ibn Qays was among the most forbearing of people. Asked what forbearance is, he said: “It is humility joined with patience.”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وكان يقول إذا عجب الناس من حلمه: «إني لأجد ما تجدون، ولكني صبور».",
          en: "When people marvelled at his forbearance he would say: “I feel what you feel, but I am patient.”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقال: «وجدت الحلم أنصر لي من الرجال».",
          en: "And he said: “I have found forbearance to give me more victory than men do.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: وفيات الأعيان، لابن خلكان، الجزء الثاني / ص: 501).",
          en: "(Source: Ibn Khallikān, Wafayāt al-Aʿyān, vol. 2, p. 501.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ومن حكمته ما رواه هشام بن عقبة أخو ذي الرمة الشاعر المشهور قال: شهدت الأحنف بن قيس وقد جاء إلى قوم يتكلمون في دم، احكموا، فقالوا: نحكم بديتين. قال: ذلك لكم، فلما سكتوا قال: أنا أعطيكم ما سألتم غير أني قائل لكم شيئًا، إن لله عز وجل قضى بدية واحدة، وإن النبي ﷺ قضى بدية واحدة، وأنتم اليوم طالبون، وأخشى أن تكونوا غدًا مطلوبين، فلا يرضى الناس منكم إلا بمثل ما سننتم لأنفسكم، فقالوا: فردها إلى دية واحدة؛ فحمد الله وأثنى عليه وركب.",
          en: "Of his wisdom is what Hishām ibn ʿUqbah, brother of the famous poet Dhū al-Rummah, related: “I witnessed al-Aḥnaf ibn Qays come to a people disputing over a case of blood. He said: ‘Give your judgement.’ They said: ‘We judge two blood-monies.’ He said: ‘That is yours.’ When they fell silent he said: ‘I grant you what you asked, but let me say something to you. God Almighty decreed a single blood-money, and the Prophet ﷺ decreed a single blood-money. Today you are the claimants, and I fear that tomorrow you may be the ones claimed against; then people will accept from you nothing but the like of what you have made a precedent for yourselves.’ They said: ‘Return it to a single blood-money.’ He praised God, commended Him, and rode away.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: وفيات الأعيان، لابن خلكان، الجزء الثاني / ص: 501).",
          en: "(Source: Ibn Khallikān, Wafayāt al-Aʿyān, vol. 2, p. 501.)",
        },
      },
      {
        kind: "subheading",
        text: { ar: "مواقفه في قول الحق", en: "His stands in speaking the truth" },
      },
      {
        kind: "para",
        text: {
          ar: "من ذلك: أن معاوية بن أبي سفيان بينا هو جالس وعنده وجوه الناس فيهم الأحنف بن قيس إذ دخل رجل من أهل الشام فقام خطيبًا، فكان آخر كلامه أن سب عليًا رضي الله عنه، فأطرق الناس، وتكلم الأحنف فقال: يا أمير المؤمنين، إن هذا القائل آنفًا لو يعلم أن رضاك في لعن المرسلين لفعل؛ فاتق الله ودع عنك عليًا فقد لقي ربه وأفرد في قبره وخلا بعمله، وكان والله المبرز سيفه، الطاهر ثوبه، الميمون نقيبته، العظيم مصيبته. فقال معاوية: يا أحنف لقد أغضيت العين عن القذى وقلت فيما ترى، وايم الله لتصعدن المنبر ولتلعننه طوعًا أو كرهًا. فقال له الأحنف: يا أمير المؤمنين، إن تعفني فهو خير لك وإن تجبرني فو الله لا تجري به شفتاي أبدًا. قال: قم فاصعد، قال الأحنف: أما والله مع ذلك لأنصفنك في القول والفعل، قال: وما أنت قائل يا أحنف إن أنصفتني قال: أصعد المنبر فأحمد الله تعالى بما هو أهله وأصلي على نبيه ﷺ ثم أقول: أيها الناس، إن أمير المؤمنين معاوية أمرني أن ألعن عليًّا، ألا وإن عليًّا ومعاوية اقتتلا واختلفا فادعى كل منهما أنه مبغيٌّ عليه وعلى فئته، فإذا دعوت فأمنوا رحمكم [الله]، ثم أقول: اللهم العن أنت وملائكتك وأنبياؤك وجميع خلقك الباغي منهما على صاحبه، والعن الفئة الباغية لعنًا كثيرًا، أمنوا رحمكم الله؛ يا معاوية لا أزيد على هذا حرفًا، ولا أنقص منه حرفًا، ولو كان فيه ذهاب نفسي. فقال معاوية: إذن نعفيك أبا بحر.",
          en: "Among them: while Muʿāwiyah ibn Abī Sufyān was seated with the notables of the people, al-Aḥnaf ibn Qays among them, a man of Syria entered and rose to speak, ending his words by reviling ʿAlī. The people lowered their heads, and al-Aḥnaf spoke: “Commander of the Faithful, had this speaker known that your favour lay in cursing the messengers he would have done so. Fear God and leave ʿAlī be, for he has met his Lord, been laid alone in his grave, and left with his deeds. By God, he was foremost of sword, pure of garment, blessed of nature, and grievous of loss.” Muʿāwiyah said: “Al-Aḥnaf, you have closed your eye to the speck and said what you see; by God, you shall ascend the pulpit and curse him, willingly or unwillingly.” Al-Aḥnaf replied: “Commander of the Faithful, if you excuse me it is better for you; and if you compel me, by God my lips shall never utter it.” He said: “Rise and ascend.” Al-Aḥnaf said: “By God, even so I shall be fair to you in word and deed.” He said: “And what will you say, Aḥnaf, if you are fair to me?” He said: “I shall ascend the pulpit, praise God as He deserves and invoke blessings upon His Prophet ﷺ, then say: O people, the Commander of the Faithful Muʿāwiyah has ordered me to curse ʿAlī. Know that ʿAlī and Muʿāwiyah fought and differed, each claiming wrong was done to him and to his party. When I make the supplication, say Amen, may God have mercy upon you. Then I shall say: O God, curse — You, Your angels, Your prophets and all Your creation — whichever of the two wronged his fellow, and curse the wrongdoing party with abundant cursing. Say Amen, may God have mercy upon you. Muʿāwiyah, I shall add to this not one letter, nor take from it one letter, though it cost me my life.” Muʿāwiyah said: “Then we excuse you, Abū Baḥr.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: وفيات الأعيان، لابن خلكان، الجزء الثاني / ص: 504).",
          en: "(Source: Ibn Khallikān, Wafayāt al-Aʿyān, vol. 2, p. 504.)",
        },
      },
    ],
  },
  {
    id: "mubarraz",
    label: { ar: "التوطن بالمبرز", en: "Settlement at Al-Mubarraz" },
    eyebrow: { ar: "سادساً", en: "VI" },
    title: {
      ar: "التوطن الحضري في مدينة المبرز",
      en: "Urban settlement in the city of Al-Mubarraz",
    },
    blocks: [
      {
        kind: "para",
        text: {
          ar: "تُثبت السجلات العدلية التجذر الحضري للأسرة في مدينة المبرز بالأحساء. من أبرز الأدلة وثيقة وقف تعود لعام (1102 هـ / 1690 م) لرشيد بن مثيني الجحاحفة، والتي تضمنت أسماء شهود حال من عائلة «عبدل» (مثل سلطان بن درع بن عبدل، وعقيل بن عبد العزيز بن عبدل)، مما يعكس المكانة الاجتماعية المرموقة للأسرة كشهود عدل ذوي استقرار حضري دائم.",
          en: "The judicial registers establish the family's urban rootedness in the city of Al-Mubarraz in Al-Ahsa. Among the most prominent proofs is an endowment deed dated 1102 AH / 1690 CE for Rashīd ibn Muthaynī al-Jaḥāḥfah, which includes the names of attesting witnesses from the ʿAbdal family (such as Sulṭān ibn Dirʿ ibn ʿAbdal and ʿUqayl ibn ʿAbd al-ʿAzīz ibn ʿAbdal), reflecting the family's distinguished social standing as witnesses of probity with permanent urban residence.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وهذه الوثيقة تعد شاهدًا تاريخيًّا على وجود هذه الأسر واستقرارها في المنطقة، كما تمثل قرينة على موطن أجداد هذه الأسرة.",
          en: "This deed is a historical witness to the presence and settlement of these families in the region, and evidence of the homeland of the family's forefathers.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: العبادل بنو عبدالله بن دارم أهل حوطة بني تميم، لعبدالله آل تويم ص: 20).",
          en: "(Source: ʿAbd Allāh Āl Tuwaym, al-ʿAbādil Banū ʿAbd Allāh ibn Dārim Ahl Ḥawṭat Banī Tamīm, p. 20.)",
        },
      },
      {
        kind: "figure",
        src: historyMedia.waqfDocument,
        caption: {
          ar: "وثيقة تثبت وجود العبادل في مدينة المبرز",
          en: "A deed establishing the presence of the ʿAbadil in the city of Al-Mubarraz",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ويرجح المؤرخون أن انتشار بني تميم في مناطق واسعة من شرق الجزيرة العربية قديم، ويُقدَّر بنحو القرن الثالث الميلادي، ويؤيد ذلك ما ورد في المصادر من ذكر حملة سابور الفارسي على القبائل العربية في شرق الجزيرة، ومنهم بنو تميم.",
          en: "Historians consider it most likely that the spread of Banu Tamim across wide areas of eastern Arabia is ancient, estimated at around the third century CE. This is supported by the sources' mention of the campaign of the Persian Shāpūr against the Arab tribes of eastern Arabia, Banu Tamim among them.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: تاريخ الرسل والملوك، للطبري، الجزء الثاني /ص: 56)، والكامل في التاريخ، لابن الأثير، الجزء الأول/ص: 394).",
          en: "(Source: al-Ṭabarī, Tārīkh al-Rusul wa-al-Mulūk, vol. 2, p. 56; and Ibn al-Athīr, al-Kāmil fī al-Tārīkh, vol. 1, p. 394.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ولهذا الرأي ما يؤيده من كلام المؤرخين، حيث إننا عند تحليل كلام ابن الأثير، عند ذكره أحداث سنة ثمان وثلاثين، ومن ذلك قوله: «فلمّا وصل ابن الحضرميّ إلى البصرة نزل في بني تميمٍ».",
          en: "This view finds support in the words of the historians: analysing Ibn al-Athīr's account of the events of the year 38, he says: “When Ibn al-Ḥaḍramī reached Basra he lodged among Banu Tamim.”",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: الكامل في التاريخ، لابن الأثير، الجزء الثاني/ ص: 711)",
          en: "(Source: Ibn al-Athīr, al-Kāmil fī al-Tārīkh, vol. 2, p. 711.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وكلام ابن الأثير هذا له دلالة واضحة على أن بني تميم كانوا قد استوطنوا البصرة، أي أنهم قد انتشروا خارج الجزيرة العربية.",
          en: "Ibn al-Athīr's words clearly indicate that Banu Tamim had settled Basra — that is, they had spread beyond the Arabian Peninsula.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ومن دلائل ذلك ما ذكره البلاذري في فتوح البلدان، وهو ما ذكره من خبر فتح البحرين (هجر)، فقال: «وكانت أرض البحرين من مملكة الفرس، وكان بها خلق كثير منَ العرب من عَبْد القيس، وبكر بْن وائل وتميم مقيمين في باديتها وكان على العرب بها من قبل الفرس عَلَى عهد رَسُول اللَّهِ ﷺ المنذر بْن ساوَى أحد بني عَبْد اللَّهِ بْن زيد بْن عَبْد اللَّهِ بْن دارم بْن مَالِك بْن حنظلة».",
          en: "Among the proofs is what al-Balādhurī records in Futūḥ al-Buldān concerning the conquest of Baḥrayn (Hajar): “The land of Baḥrayn belonged to the kingdom of the Persians. In it were a great many Arabs of ʿAbd al-Qays, Bakr ibn Wāʾil and Tamim, dwelling in its desert; and over the Arabs there, on behalf of the Persians in the time of the Messenger of God ﷺ, was al-Mundhir ibn Sāwā, one of the Banu ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim ibn Mālik ibn Ḥanẓalah.”",
        },
      },
      {
        kind: "para",
        text: {
          ar: "والبلاذري هنا لا يقصد بالبحرين، ما هو معروف الآن من بلاد البحرين، بل يقصد إقليم البحرين التاريخي الذي كان يمتد في شرقي الجزيرة العربية، وكانت هَجَر قصبته ومن أبرز حواضره، وهي واقعة ضمن منطقة الأحساء الحالية.",
          en: "By “Baḥrayn” al-Balādhurī does not mean the present-day country of Bahrain, but the historic Baḥrayn region extending across eastern Arabia, of which Hajar was the capital and among its most prominent urban centres, lying within today's Al-Ahsa region.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: فتوح البلدان، للبلاذري، ص: 85).",
          en: "(Source: al-Balādhurī, Futūḥ al-Buldān, p. 85.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "والمصنفات في بني تميم توضح خريطة هجراتهم، والتي من ضمنها استقرارهم في هجر (الأحساء)، حيث أشار آل تويم في كتابه «العبادل» أن قبيلة تميم سكنت منذ القدم رقعة واسعة من جزيرة العرب، توزعت فيها بطون القبيلة وفروعها، بسبب ضخامة عددها، ووفرة بطونها، وعشائرها، ودفاعها عما تحت يدها من أرض، وامتازت الأماكن التي سكنتها قبيلة تميم بالسعة، وتنوع التضاريس… وسكن بنو دارم أواسط بلاد تميم، ينتقلون فيها حيث الماء والمرعى لإبلهم وأغنامهم، ويمكن تقسيم الأماكن التي نزلها بنو دارم إلى ثلاث مجموعات متقاربة؛ يبرين وهجر والبيضة، والصمان وطويلع والجرباء والوريعة والقرعاء وثبرة واللصافة والرمادة وكاظمة، وزرود وعاقل وأشيقر وأبان ورامة ومنعج والقمراء.",
          en: "The works devoted to Banu Tamim map their migrations, including their settlement at Hajar (Al-Ahsa). Āl Tuwaym notes in his book al-ʿAbādil that the tribe of Tamim has since antiquity inhabited a wide expanse of the Arabian Peninsula, across which its clans and branches were distributed owing to its great numbers, the abundance of its clans and kin groups, and its defence of the land it held. The places Tamim inhabited were marked by their breadth and varied terrain… Banu Dārim dwelt in the central lands of Tamim, moving within them wherever there was water and pasture for their camels and sheep. The places at which Banu Dārim encamped may be divided into three neighbouring groups: Yabrīn, Hajar and al-Bayḍah; al-Ṣammān, Ṭuwaylaʿ, al-Jarbāʾ, al-Wurayʿah, al-Qarʿāʾ, Thabrah, al-Liṣāfah, al-Ramādah and Kāẓimah; and Zarūd, ʿĀqil, Ushayqir, Abān, Rāmah, Munʿij and al-Qamrāʾ.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: العبادل بنو عبدالله بن دارم أهل حوطة بني تميم، لعبدالله آل تويم، ص: 129).",
          en: "(Source: ʿAbd Allāh Āl Tuwaym, al-ʿAbādil Banū ʿAbd Allāh ibn Dārim Ahl Ḥawṭat Banī Tamīm, p. 129.)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "ومن ذلك ما ذكره الشيخ حمد الجاسر من أن بطونًا من بني تميم — ومنهم بنو دارم — هاجروا إلى الأحساء واستقرّوا فيها.",
          en: "Among this is Shaykh Ḥamad al-Jāsir's statement that clans of Banu Tamim — Banu Dārim among them — migrated to Al-Ahsa and settled there.",
        },
      },
      {
        kind: "source",
        text: {
          ar: "(المصدر: جمهرة أنساب الأسر المتحضرة في نجد للعلامة حمد الجاسر، الجزء الثاني /535).",
          en: "(Source: Ḥamad al-Jāsir, Jamharat Ansāb al-Usar al-Mutaḥaḍḍirah fī Najd, vol. 2, p. 535.)",
        },
      },
      {
        kind: "figure",
        src: historyMedia.tamimMap,
        caption: {
          ar: "خارطة توضح مساكن بني تميم ومنها الأحساء",
          en: "A map showing the dwellings of Banu Tamim, including Al-Ahsa",
        },
      },
    ],
  },
  {
    id: "distribution",
    label: { ar: "التوزيع الجغرافي", en: "Geographic distribution" },
    eyebrow: { ar: "سابعاً", en: "VII" },
    title: {
      ar: "التوزيع الجغرافي والتحالفات القبلية الجينية",
      en: "Geographic distribution and genetic tribal alliances",
    },
    blocks: [
      {
        kind: "para",
        text: {
          ar: "توفر الخرائط الجينية للتحورات المتفرعة من (Z20777) و(BY37877) إثباتًا علميًا لظاهرة الزواج الداخلي (Endogamy) التي حافظت على التمركز الإقليمي للأسرة في دول الخليج العربي.",
          en: "The genetic maps of the mutations branching from Z20777 and BY37877 provide scientific proof of the phenomenon of endogamy, which preserved the family's regional concentration in the states of the Arabian Gulf.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "يوضح الجدول التالي التوزيع الجغرافي الديموغرافي للتحورات المترابطة:",
          en: "The following table sets out the demographic and geographic distribution of the related mutations:",
        },
      },
      {
        kind: "table",
        columns: [
          { ar: "النطاق الجغرافي", en: "Geographic scope" },
          { ar: "تردد العينات الجينية", en: "Frequency of genetic samples" },
          {
            ar: "الدلالة الأنثروبولوجية وأبرز العائلات",
            en: "Anthropological significance and principal families",
          },
        ],
        rows: [
          [
            { ar: "المملكة العربية السعودية", en: "Kingdom of Saudi Arabia" },
            {
              ar: "28 عينة (Z20773) / 19 عينة (Z20777)",
              en: "28 samples (Z20773) / 19 samples (Z20777)",
            },
            {
              ar: "تركز كثيف في المنطقة الشرقية (الأحساء والمبرز) ونجد. يعكس المعقل التاريخي الأول وهجرة العبادل. يضم (آل بوعبيد، آل درويش، السمحان).",
              en: "Dense concentration in the Eastern Province (Al-Ahsa and Al-Mubarraz) and Najd, reflecting the first historical stronghold and the migration of the ʿAbadil. Includes Al Bu Obaid, Al Darwish and Al Samhan.",
            },
          ],
          [
            { ar: "دولة قطر", en: "State of Qatar" },
            {
              ar: "78 عينة (Z20773) / 77 عينة (Z20777) - تردد 7%",
              en: "78 samples (Z20773) / 77 samples (Z20777) — frequency 7%",
            },
            {
              ar: "تشكل المركز الديموغرافي الأكبر للتحور المعاصر. تضم عائلات تميمية مرموقة مثل الكواري (فرع J-ZS9361)، المهندي، البوعينين، الخيارين.",
              en: "The largest demographic centre of the contemporary mutation. Includes prominent Tamimi families such as Al Kuwari (branch J-ZS9361), Al Mohannadi, Al Buainain and Al Khayarin.",
            },
          ],
          [
            { ar: "مملكة البحرين", en: "Kingdom of Bahrain" },
            {
              ar: "10 عينات (Z20773) / 10 عينات (Z20777) - تردد 1%",
              en: "10 samples (Z20773) / 10 samples (Z20777) — frequency 1%",
            },
            {
              ar: "امتداد جغرافي وبيولوجي طبيعي للوجود الديموغرافي في إقليم البحرين التاريخي الملاصق لواحة الأحساء. تضم (المعاودة، بوشقر).",
              en: "A natural geographic and biological extension of the demographic presence in the historic Baḥrayn region adjoining the Al-Ahsa oasis. Includes Al Maawda and Bushaqar.",
            },
          ],
          [
            { ar: "دولة الكويت", en: "State of Kuwait" },
            { ar: "6 عينات مسجلة لكل تحور", en: "6 recorded samples for each mutation" },
            {
              ar: "تعكس هجرات ناتجة عن النشاط التجاري المزدهر والتواصل البيني على طول ساحل الخليج العربي (النعيمي، الدخيل، الفرح).",
              en: "Reflects migrations arising from flourishing commercial activity and interconnection along the Arabian Gulf coast (Al Nuaimi, Al Dakhil, Al Farah).",
            },
          ],
          [
            { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
            {
              ar: "4 عينات (Z20773) / 3 عينات (Z20777)",
              en: "4 samples (Z20773) / 3 samples (Z20777)",
            },
            {
              ar: "تجمعات ناتجة عن تحالفات قبلية وهجرات ساحلية لعائلات كالنعيمي، السويدي، والمزروعي.",
              en: "Clusters arising from tribal alliances and coastal migrations of families such as Al Nuaimi, Al Suwaidi and Al Mazrouei.",
            },
          ],
          [
            { ar: "سلطنة عمان", en: "Sultanate of Oman" },
            { ar: "عينة واحدة مسجلة", en: "One recorded sample" },
            {
              ar: "تشير إلى امتداد جغرافي محدود نحو الجنوب الشرقي لشبه الجزيرة العربية عبر قوافل التجارة.",
              en: "Indicates a limited geographic extension toward the south-east of the Arabian Peninsula via trade caravans.",
            },
          ],
          [
            { ar: "المملكة المغربية", en: "Kingdom of Morocco" },
            { ar: "8 عينات (بتردد 1%)", en: "8 samples (frequency 1%)" },
            {
              ar: "مفاجأة أنثروبولوجية ترتبط بالفتوحات الإسلامية. تم توثيقها عبر خطين جينيين (Z59600) للعبادلة والحراكتة، و(Z220778) لأولاد الشرقي والخلط.",
              en: "An anthropological surprise linked to the Islamic conquests, documented through two genetic lines: Z59600 for the ʿAbādilah and al-Ḥarākitah, and Z220778 for Awlād al-Sharqī and al-Khalṭ.",
            },
          ],
        ],
      },
      {
        kind: "subheading",
        text: {
          ar: "مسارات التجارة التاريخية (البصرة)",
          en: "Historic trade routes (Basra)",
        },
      },
      {
        kind: "para",
        text: {
          ar: "بالتوازي مع هذا التوزيع الساحلي، كشفت التحليلات الجينية الدقيقة (كالخط الجيني J-FT252050) عن ارتباطات تميمية واضحة تصل إلى البصرة في العراق مع عوائل مثل الكنعان. يطابق هذا علميًا خطوط التجارة التاريخية لأسرة آل بوعبيد في جلب الأقمشة والمواد التجارية من حواضر العراق.",
          en: "In parallel with this coastal distribution, fine-grained genetic analysis (such as the line J-FT252050) has revealed clear Tamimi connections reaching Basra in Iraq with families such as Al Kanaan. This corresponds scientifically to the historic trade routes of the Al Bu Obaid family in bringing textiles and merchandise from the urban centres of Iraq.",
        },
      },
      {
        kind: "subheading",
        text: {
          ar: "المواءمة الاستراتيجية مع رؤية المملكة 2030",
          en: "Strategic alignment with Saudi Vision 2030",
        },
      },
      {
        kind: "para",
        text: {
          ar: "لم تكتفِ أسرة آل بوعبيد بالركون إلى إرثها التاريخي والجيني، بل سعت بشكل استباقي لتأطير كيانها الاجتماعي ليتواءم مع مستهدفات التنمية المستدامة في «رؤية المملكة 2030»، وتحديدًا هدف «تعظيم الأثر المجتمعي للقطاع غير الربحي».",
          en: "The Al Bu Obaid family has not been content to rest on its historical and genetic heritage; it has proactively framed its social entity to align with the sustainable-development targets of Saudi Vision 2030, and specifically the objective of maximising the social impact of the non-profit sector.",
        },
      },
      {
        kind: "para",
        text: {
          ar: "وقد تجلى هذا التحول المؤسسي في:",
          en: "This institutional shift is evident in:",
        },
      },
      {
        kind: "list",
        items: [
          {
            ar: "التأطير القانوني: الانتقال من المجالس العرفية إلى كيان مؤسسي مسجل رسميًا (صندوق التنمية العائلية).",
            en: "Legal framing: the move from customary councils to a formally registered institutional entity (the Family Development Fund).",
          },
          {
            ar: "الحوكمة المالية: الالتزام الصارم بالمعايير الدولية للتقارير المالية (IFRS) للمنشآت الصغيرة، وتطبيق سياسات مكافحة غسل الأموال، وفصل حسابات الزكاة.",
            en: "Financial governance: strict adherence to the International Financial Reporting Standards (IFRS) for small entities, the application of anti-money-laundering policies, and the separation of zakat accounts.",
          },
          {
            ar: "التكامل المجتمعي: إنشاء حسابات نشطة في المنصة الوطنية للعمل التطوعي لدعم المبادرات الوطنية كإفطار صائم ودعم المحتاجين.",
            en: "Community integration: establishing active accounts on the National Volunteer Platform to support national initiatives such as iftar for fasting people and support for those in need.",
          },
          {
            ar: "دعم ريادة الأعمال: تعزيز الاقتصاد الدائري الداخلي عبر حصر ودعم المشاريع التجارية التي يمتلكها شباب وشابات الأسرة، مما يسهم في رفع التنافسية الاقتصادية المحلية.",
            en: "Support for entrepreneurship: strengthening the internal circular economy by mapping and supporting businesses owned by the family's young men and women, contributing to local economic competitiveness.",
          },
        ],
      },
    ],
  },
];
