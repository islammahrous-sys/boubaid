import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("about", {
  eyebrow: { ar: "النسب والتاريخ", en: "Lineage & History" } as BiText,
  title: {
    ar: "عمود النسب، ومواطن الاستقرار، ومصادر التوثيق",
    en: "The chain of descent, the places of settlement, and the sources",
  } as BiText,
  subtitle: {
    ar: "تسلسل نسب آل بوعبيد من فرع العبادل من بني تميم، واستقرارهم التاريخي بمدينة المبرز بواحة الأحساء.",
    en: "The descent of Al Bu Obaid from the ʿAbadil of Banu Tamim, and their historic settlement at Al-Mubarraz in the Al-Ahsa oasis.",
  } as BiText,
  imageCaption: {
    ar: "واحة الأحساء — أكبر واحة نخيل في العالم، وموطن استقرار الأسرة منذ قرون.",
    en: "The Al-Ahsa oasis — the largest palm oasis in the world, and the family's home for centuries.",
  } as BiText,

  metaOrigin: { ar: "الأصل", en: "Origin" } as BiText,
  metaOriginValue: { ar: "بنو تميم — العبادل", en: "Banu Tamim — the ʿAbadil" } as BiText,
  metaSeat: { ar: "الموطن", en: "Settlement" } as BiText,
  metaSeatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,
  metaEarliest: { ar: "أقدم وثيقة", en: "Earliest deed" } as BiText,
  metaEarliestValue: { ar: "١١٠٢ هـ", en: "1102 AH" } as BiText,

  narrativeEyebrow: { ar: "أولاً", en: "I" } as BiText,
  narrativeTitle: { ar: "الأصل والانحدار", en: "Origin and descent" } as BiText,
  narrativeP1: {
    ar: "تتجذر الأصول النسبية لأسرة آل بوعبيد في فرع «العبادل» المعروف كذلك بـ«آل العداقل»، وهم أبناء عبد الله بن دارم بن مالك بن حنظلة بن مالك بن زيد مناة بن تميم بن مر. وتُعد تميم إحدى أضخم بطون العرب العدنانية وأصلبها، استقرت في نجد وإقليم البحرين التاريخي والأحساء.",
    en: "The Al Bu Obaid trace their descent to the ʿAbadil — also known as Āl al-ʿAdāqil — the sons of ʿAbd Allāh ibn Dārim ibn Mālik ibn Ḥanẓalah ibn Mālik ibn Zayd Manāt ibn Tamīm ibn Murr. Banu Tamim is among the largest and most durable of the Adnani Arab confederations, settled across Najd, the historic Baḥrayn region, and Al-Ahsa.",
  } as BiText,
  narrativeP2: {
    ar: "ويمتد تسلسل نسب الأسرة صعوداً عبر الآباء والأجداد حتى يلتقي بالجد الجامع عدنان، من ولد نبي الله إسماعيل بن إبراهيم الخليل عليهما السلام. وتلتقي السلالة التميمية بالنسب النبوي الشريف عند الجد المشترك إلياس بن مضر.",
    en: "The chain ascends through the fathers and grandfathers to the common ancestor ʿAdnān, of the progeny of the Prophet Ishmael, son of Abraham. The Tamimi line converges with the Prophetic lineage at the shared ancestor Ilyās ibn Muḍar.",
  } as BiText,

  migrationEyebrow: { ar: "ثانياً", en: "II" } as BiText,
  migrationTitle: {
    ar: "الهجرة والاستقرار بالمبرز",
    en: "Migration and settlement at Al-Mubarraz",
  } as BiText,
  migrationP1: {
    ar: "انتقلت الأسرة عبر محطات تاريخية متتالية من إقليم نجد والحوطة لتستقر في واحة الأحساء الخصبة، وتحديداً في مدينة المبرز، حيث أسهم أبناؤها في الحركة العلمية والتجارية وإقامة الأوقاف الخيرية الموثقة.",
    en: "The family moved through successive stages from Najd and Al-Hawtah to settle in the fertile Al-Ahsa oasis, and specifically at Al-Mubarraz, where its members took part in scholarly and commercial life and established documented charitable endowments.",
  } as BiText,
  migrationP2: {
    ar: "ومن المبرز امتد أبناء الأسرة إلى الدمام والخبر والظهران والرياض وجدة، وإلى قطر والبحرين والكويت، مع بقاء المبرز مرجعاً ومقراً للأسرة ولمنظمتها الأهلية.",
    en: "From Al-Mubarraz the family extended to Dammam, Khobar, Dhahran, Riyadh and Jeddah, and onward to Qatar, Bahrain and Kuwait — while Al-Mubarraz has remained the family's point of reference and the seat of its organisation.",
  } as BiText,

  sourcesEyebrow: { ar: "ثالثاً", en: "III" } as BiText,
  sourcesTitle: { ar: "الشواهد والمصادر", en: "Evidence and sources" } as BiText,
  sourcesP1: {
    ar: "تناول مؤرخون وجغرافيون كلاسيكيون كالهمداني وياقوت الحموي فروع بني تميم والعبادل في شرق الجزيرة العربية. وتشهد الوثائق الشرعية المسجلة سنة ١١٠٢ هـ على حضور كبار الأسرة شهوداً وأوصياء على وقفيات المبرز والأحساء.",
    en: "Classical historians and geographers — al-Hamdānī and Yāqūt al-Ḥamawī among them — recorded the branches of Banu Tamim and the ʿAbadil in eastern Arabia. Sharia court records dated 1102 AH attest to the family's elders standing as witnesses and trustees over endowments at Al-Mubarraz and Al-Ahsa.",
  } as BiText,

  conflictsEyebrow: { ar: "رابعاً", en: "IV" } as BiText,
  conflictsTitle: {
    ar: "الصراعات القبلية والنفوذ في صدر الإسلام",
    en: "Tribal conflicts and early Islamic influence",
  } as BiText,
  conflictsP1: {
    ar: "شهد ما قبل الإسلام معارك حاسمة أعادت تشكيل الخريطة الديموغرافية لشرق الجزيرة، أبرزها «يوم رحرحان الأول» بين بني دارم وبني عامر بن صعصعة، و«يوم رحرحان الثاني» الذي جمع تميماً بأكملها ضد عامر. وأدت التحولات السياسية اللاحقة إلى هجرات داخلية، إذ دخل «العبادل» (ذرية عبدالله بن دارم) في تحالفات قبلية جديدة، فاستقروا في منطقة «الحوطة» (حوطة بني تميم) وأصبح لسلالتهم إمارة على تلك الحاضرة، لتكون نقطة انطلاق لهجرات متعاقبة نحو الشرق.",
    en: "The pre-Islamic era saw decisive battles that reshaped the demographic map of eastern Arabia — chief among them the first and second Yawm Raḥraḥān, which pitted Banu Dārim, and later all of Tamim, against Banu ʿĀmir ibn Ṣaʿṣaʿah. Subsequent political shifts drove internal migrations: the ʿAbadil (descendants of ʿAbd Allāh ibn Dārim) entered new tribal alliances and settled at Al-Ḥawṭah (Ḥawṭat Banu Tamim), where their line held the emirate of that town — a launching point for successive migrations eastward.",
  } as BiText,
  conflictsP2: {
    ar: "وفي فجر الإسلام، برز المنذر بن ساوى بن عبدالله بن زيد بن عبدالله بن دارم — سليل عبدالله بن دارم الجد الجامع للعبادل مباشرة — إذ تلقى رسالة النبي ﷺ يدعوه فيها إلى الإسلام، فأسلم طواعية وأدخل إقليم الأحساء بأكمله في الإسلام دون إراقة دماء. ويدل ارتباط نسب آل بوعبيد بهذه الجغرافية المحددة، وتحت قيادة أبناء عمومتهم المباشرين من بني دارم، على استمرارية بيولوجية وتاريخية وسياسية تمتد لأكثر من أربعة عشر قرناً متصلة في إقليم الأحساء.",
    en: "At the dawn of Islam, Al-Mundhir ibn Sāwā ibn ʿAbd Allāh ibn Zayd ibn ʿAbd Allāh ibn Dārim — a direct descendant of ʿAbd Allāh ibn Dārim, the shared patriarch of the ʿAbadil — received the Prophet's ﷺ letter calling him to Islam. He accepted willingly and brought the whole of Al-Ahsa into Islam without bloodshed. That Al Bu Obaid's lineage traces to this same specific line, under the direct cousins of Banu Dārim, points to a biological, historical, and political continuity spanning more than fourteen unbroken centuries in Al-Ahsa.",
  } as BiText,
  conflictsQuote: {
    ar: "استمرارية بيولوجية وتاريخية وسياسية تمتد لأكثر من أربعة عشر قرناً متصلة في إقليم الأحساء.",
    en: "A biological, historical, and political continuity spanning more than fourteen unbroken centuries in Al-Ahsa.",
  } as BiText,

  economyEyebrow: { ar: "خامساً", en: "V" } as BiText,
  economyTitle: {
    ar: "التوطن الحضري والنسيج الاقتصادي بالمبرز",
    en: "Urban settlement and the economic fabric of Al-Mubarraz",
  } as BiText,
  economyP1: {
    ar: "من أبرز الأدلة المادية الموثقة على هذا التجذر الحضري المبكر وثيقة وقف تاريخية نادرة تعود لعام ١١٠٢ هـ (الموافق تقريباً ١٦٩٠ م)، تتعلق بإثبات وقف خيري باسم رشيد بن مثيني الجحاحفة في مدينة المبرز بالأحساء. وتتضمن قائمة الشهود الموقعين على هذه الوثيقة أسماء صريحة من عائلة «العبدال»، منها: سيف بن سنان بن عبدال، عقيل بن عبدالعزيز بن عبدال، مبارك بن صغير بن عبدال، صقر بن مبارك بن صقر بن عبدال، ومسلم بن درع بن عبدال — إلى جانب المطوع إبراهيم التميمي. ويعكس تكرار اسم «عبدال» في السجلات العدلية لمدينة المبرز في أواخر القرن الحادي عشر الهجري المكانة الاجتماعية والاقتصادية المرموقة التي حظيت بها الأسرة، إذ كان يُشترط في شهود المحاكم الشرعية القديمة العدالة المطلقة والوجاهة والاستقرار الحضري الدائم.",
    en: "Among the most striking physical evidence of this early urban rootedness is a rare historical endowment deed dated 1102 AH (c. 1690 CE), attesting to a charitable waqf in the name of Rashīd ibn Muthannā Al-Jaḥāḥfah in the town of Al-Mubarraz, Al-Ahsa. The list of witnesses signing this deed includes explicit names from the 'ʿAbdāl' family: Sayf ibn Sinān ibn ʿAbdāl, ʿUqayl ibn ʿAbd al-ʿAzīz ibn ʿAbdāl, Mubārak ibn Ṣaghīr ibn ʿAbdāl, Ṣaqr ibn Mubārak ibn Ṣaqr ibn ʿAbdāl, and Muslim ibn Dirʿ ibn ʿAbdāl — alongside Muṭawwiʿ Ibrāhīm Al-Tamīmī. The recurrence of the name 'ʿAbdāl' in Al-Mubarraz's sharia court registers in the late 11th century AH reflects the family's prominent social and economic standing, since witnesses before the old sharia courts were required to hold absolute probity, public standing, and permanent urban residence.",
  } as BiText,
  economyP2: {
    ar: "وقد انخرطت الأسرة مبكراً في اقتصاد واحة الأحساء النابض، من الحرف اليدوية والنسيج إلى التجارة الإقليمية العابرة للحدود، إذ عمل أبناؤها في تجارة الأقمشة المجلوبة عبر قوافل من أسواق الكويت والبصرة في العراق. كما وظّفت الأسرة مؤسسة الزواج الداخلي والخارجي (Endogamy/Exogamy) أداة لتعزيز الاندماج الاجتماعي والتحالفات الاقتصادية، فارتبطت بمصاهرات مع عائلات وازنة في المجتمع الأحسائي كآل الحاج وآل فطيح وآل الموسى والقفيطي والسيد هاشم المكي، في نسيج من العلاقات المؤثرة يعكس صورة أسرة شديدة التماسك.",
    en: "The family engaged early with the vibrant economy of the Al-Ahsa oasis — from handicrafts and weaving to cross-border regional trade, its members dealing in cloth brought by caravan from the markets of Kuwait and Basra in Iraq. The family also used the institution of endogamy and exogamy as a tool for social integration and economic alliance, marrying into prominent families of Al-Ahsa society such as Al-Hajj, Al-Khalif, Al-Musa, Al-Qatifi, and Sayyid Hashim Al-Makki — a network of relationships reflecting a remarkably cohesive family.",
  } as BiText,

  marginNote: {
    ar: "المصادر النسبية المعتمدة في هذه الصفحة مثبتة داخل أقسامها، ومقروءة مع نتائج الدراسة الجينية.",
    en: "The genealogical sources relied on here are cited within each section, and are to be read alongside the results of the genetic study.",
  } as BiText,
  marginNoteLabel: { ar: "ملاحظة", en: "Note" } as BiText,

  chainEyebrow: { ar: "عمود النسب", en: "The chain of descent" } as BiText,
  chainTitle: { ar: "من آل بوعبيد إلى عدنان", en: "From Al Bu Obaid to ʿAdnān" } as BiText,
  chainSub: {
    ar: "يُقرأ العمود من أعلى إلى أسفل، من الأسرة في موطنها اليوم صعوداً إلى الجد الجامع.",
    en: "Read from top to bottom — from the family in its present home ascending to the common ancestor.",
  } as BiText,

  dnaCta: { ar: "نتائج الدراسة الجينية", en: "The genetic study" } as BiText,
  branchesCta: { ar: "الفروع السبعة", en: "The seven branches" } as BiText,
});
