BEGIN;

-- 1. Branches
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000001',
    'al-saad',
    'فرع آل سعد',
    'Al Saad Branch',
    'أحد أعرق وأكبر فروع الأسرة تاريخياً في المبرز بالأحساء، يتميز بامتداده الديموغرافي الواسع وبروز كفاءاته في القيادة الإدارية والقطاعات الاقتصادية والوقفيات الأهلية، مع إسهامات مشهودة في دعم مجلس الأسرة والتنمية المجتمعية.',
    'One of the largest and most historic branches settled in Al-Mubarraz, Al-Ahsa, distinguished by its widespread demographic reach and leadership in civic endowments, economic sectors, and family governance.',
    'الشيخ سعد بن عبدالله بوعبيد (عضو مجلس الأمناء)',
    'Sheikh Saad bin Abdullah Bu Obaid (Trustee)',
    true,
    1,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000002',
    'al-abdulrahman',
    'فرع آل عبدالرحمن',
    'Al Abdulrahman Branch',
    'فرع ذو ثقل اجتماعي وتاريخي بارز في المبرز والمنطقة الشرقية، يزخر بالنخب الأكاديمية والطبية والهندسية، وتعود وثائقهم الشرعية وأوقافهم إلى حقب تاريخية عريقة مسجلة في سجلات الأحساء.',
    'A prominent social and historical pillar in Al-Mubarraz and the Eastern Province, boasting top academic, medical, and engineering talent with ancient registered endowment deeds.',
    'د. عبدالرحمن بن محمد بوعبيد (أكاديمي وطبيب)',
    'Dr. Abdulrahman bin Mohammed Bu Obaid',
    true,
    2,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000003',
    'al-abdulaziz',
    'فرع آل عبدالعزيز',
    'Al Abdulaziz Branch',
    'يمتاز هذا الفرع الأصيل بحضوره القوي في قطاعات الخدمة العامة والهندسة والإدارة المالية، وله إسهامات فاعلة في إدارة المبادرات العائلية وصندوق الأسرة الوقفية وبرامج التواصل المشترك.',
    'Distinguished by strong leadership in public service, engineering, and financial management, actively driving family endowment initiatives and inter-branch programs.',
    'العميد عبدالعزيز بن صالح بوعبيد',
    'Brigadier Abdulaziz bin Salih Bu Obaid',
    true,
    3,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000004',
    'al-abdullatif',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    'يُعتبر هذا الفرع أيقونة أكاديمية ومهنية حديثة في تاريخ الأسرة، فقد أثمر شخصيات بارزة حصدت أعلى المراتب، ويرأس منه حالياً رئيس مجلس أمناء الصندوق، كما يضم قيادات أمنية وعسكرية شابة متميزة.',
    'A modern academic and professional icon in the family''s history, this branch has produced figures who reached the highest ranks — including the organisation''s current Chairman of the Board of Trustees — alongside distinguished young security and military leaders.',
    'د. خالد بن يوسف بن أحمد بوعبيد (رئيس مجلس الأمناء)',
    'Dr. Khaled bin Yousef bin Ahmed Bu Obaid (Chairman, Board of Trustees)',
    true,
    4,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000005',
    'al-abdullah-salih',
    'فرع آل عبدالله صالح',
    'Al Abdullah Salih Branch',
    'يمثل ركيزة أساسية في الروابط العائلية، ويشتهر رجاله بالعطاء الاجتماعي والمبادرات الإنسانية والتواجد المؤثر في المحافل واللجان التنظيمية، وقيادة مشروع المقر الرئيسي للأسرة في حي الحزام الذهبي.',
    'A cornerstone of family cohesion, known for social philanthropy, civic leadership, and spearheading the family''s official headquarters development in Al-Hizam Al-Dhahabi.',
    'أ. عبدالله بن صالح بوعبيد (رئيس لجنة المقر)',
    'Mr. Abdullah bin Salih Bu Obaid (HQ Chair)',
    true,
    5,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000006',
    'al-mohammed-ahmed',
    'فرع آل محمد أحمد',
    'Al Mohammed Ahmed Branch',
    'فرع يتميز بالعطاء العلمي والثقافي، وبروز كفاءاته الشابة في قطاعات التقنية والتطوير المؤسسي والقطاع المالي في المملكة ودول الخليج، مع اهتمام خاص بالتوثيق الرقمي والمشجرة التفاعلية.',
    'Distinguished by scientific and cultural enrichment, with vibrant young talent leading in technology, corporate development, finance, and digital genealogical preservation.',
    'أ. محمد بن أحمد بوعبيد (لجنة التواصل)',
    'Mr. Mohammed bin Ahmed Bu Obaid (Communication Chair)',
    true,
    6,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;
INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'b1000000-0000-0000-0000-000000000007',
    'al-yousef',
    'فرع آل يوسف',
    'Al Yousef Branch',
    'فرع ينبض بالحيوية والطموح، يضم طاقات شبابية قيادية متميزة في التكنولوجيا وريادة الأعمال والاستثمار، وإسهامات بارزة في الإعلام والأنشطة الرياضية والتنظيم اللوجستي لاجتماعات الأسرة في الأحساء والمملكة.',
    'A dynamic and ambitious branch featuring young leaders in technology, entrepreneurship, venture capital, media, sports, and logistical management of family reunions.',
    'أ. يوسف بن محمد بوعبيد (رائد أعمال)',
    'Mr. Yousef bin Mohammed Bu Obaid (Entrepreneur)',
    true,
    7,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;

-- 2. Places
INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    'c1000000-0000-0000-0000-000000000001',
    'مقر الأسرة بحي الحزام الذهبي',
    'Family HQ - Al Hizam District',
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    'المبرز',
    'شارع الصدفة، حي الحزام الذهبي، المبرز',
    25.4167, 49.5833,
    'المقر العام لصندوق التنمية العائلية بحي الحزام الذهبي بالمبرز.',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    'c1000000-0000-0000-0000-000000000002',
    'واحة الأحساء التاريخية',
    'Historic Al-Ahsa Oasis',
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    'الأحساء',
    'واحة الأحساء، المنطقة الشرقية',
    25.3833, 49.6,
    'الموطن التاريخي الموثق لوجود الأسرة منذ سنة 1102 هـ.',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    'c1000000-0000-0000-0000-000000000003',
    'مجلس فرع آل سعد',
    'Al-Saad Branch Diwaniya',
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    'المبرز',
    'حي الراشدية، المبرز',
    25.42, 49.58,
    'ديوانية وملتقى أعيان وأبناء فرع آل سعد.',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    'c1000000-0000-0000-0000-000000000004',
    'مجلس فرع آل محمد',
    'Al-Mohammed Branch Diwaniya',
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    'المبرز',
    'حي اليحيى، المبرز',
    25.418, 49.582,
    'ديوانية وملتقى أعيان وأبناء فرع آل محمد.',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    'c1000000-0000-0000-0000-000000000005',
    'مجلس فرع آل صالح',
    'Al-Salih Branch Diwaniya',
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    'المبرز',
    'وسط المبرز القديم',
    25.415, 49.585,
    'ديوانية وملتقى أعيان وأبناء فرع آل صالح.',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;

-- 3. Family Members
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000001',
    'gen1-abdullah-darim',
    'الجد',
    'آل بوعبيد',
    'الجد الجامع عبد الله بن دارم',
    'Grand',
    'Al Bu Obaid',
    'Grand Patriarch Abdullah bin Darim',
    'b1000000-0000-0000-0000-000000000001',
    1,
    'male',
    false,
    'الجد الجامع الأصلي للقبيلة الذي تنحدر منه سلالة آل بوعبيد من العبادل من بني تميم. يرتبط اسمه بالتاريخ العربي القديم والشجاعة والسيادة القبلية في نجد والشرق العربي.',
    'The primary progenitor from whom the Al Bu Obaid family of Banu Tamim directly descends, associated with ancient Arabian tribal lineage, nobility, and leadership.',
    'الجد الجامع الأعلى لفرع العبادل وآل بوعبيد',
    'public',
    'published',
    1,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000002',
    'gen1-ahmed-salih',
    'الجد',
    'آل بوعبيد',
    'الجد أحمد بن صالح آل بوعبيد التميمي',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000001',
    1,
    'male',
    false,
    'الجد الجامع المباشر الذي تتفرع منه كافة أسر وفروع آل بوعبيد السبعة الموثقة رسمياً في مدينة المبرز بالأحساء، واشتهر بالصلاح وإقامة المساجد والأوقاف الأهلية المسجلة.',
    'The direct ancestor from whom all 7 officially documented branches of Al Bu Obaid in Al-Mubarraz descend, renowned for establishing historic community endowments.',
    'الجد الجامع للفروع السبعة المعاصرة',
    'public',
    'published',
    2,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000003',
    'gen2-saad',
    'الجد',
    'آل بوعبيد',
    'الجد سعد بن أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Saad bin Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000001',
    2,
    'male',
    false,
    'مؤسس فرع آل سعد، أحد أكبر الفروع ديموغرافياً في الأحساء والمنطقة الشرقية والرياض، تميز رجاله بالحكمة والعمل التجاري وإدارة الأوقاف الأهلية والدور القيادي في مجلس الأسرة.',
    'Founder of Al Saad Branch, one of the largest demographic branches, recognized for wisdom, commerce, civic endowments, and family board governance.',
    'مؤسس فرع آل سعد (أكبر الفروع عدداً)',
    'public',
    'published',
    3,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000004',
    'gen2-abdulrahman',
    'الجد',
    'آل بوعبيد',
    'الجد عبدالرحمن بن أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Abdulrahman bin Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000002',
    2,
    'male',
    false,
    'مؤسس فرع آل عبدالرحمن ذو الثقل الاجتماعي البارز بالأحساء، والمشهور برجالاته في مجالات العلوم والأطباء والهندسة مع وثائق وقفيات تاريخية محفوظة.',
    'Founder of Al Abdulrahman Branch, a major social pillar in Al-Ahsa known for academic excellence, medical specialists, and historical endowment deeds.',
    'مؤسس فرع آل عبدالرحمن (رعيل العلم والطب)',
    'public',
    'published',
    4,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000005',
    'gen2-abdulaziz',
    'الجد',
    'آل بوعبيد',
    'الجد عبدالعزيز بن أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Abdulaziz bin Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000003',
    2,
    'male',
    false,
    'مؤسس فرع آل عبدالعزيز، ويمتاز رجالاته بالحضور القوي في الخدمة العسكرية والمدنية والهندسية والإدارة المالية وتطوير برامج التضامن والتكافل الأسري.',
    'Founder of Al Abdulaziz Branch, whose members lead in public service, military leadership, engineering, and family solidarity programs.',
    'مؤسس فرع آل عبدالعزيز (قطاع الإدارة والقيادة)',
    'public',
    'published',
    5,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000006',
    'gen2-abdullatif',
    'الجد',
    'آل بوعبيد',
    'الجد عبداللطيف بن أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Abdullatif bin Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000004',
    2,
    'male',
    false,
    'مؤسس فرع آل عبداللطيف، المرتبط بتاريخ المبرز وحي العيوني، والشهير برجال الفقه والتربية والتأريخ ورصد المشجرات التميمية المعتمدة في الخليج العربي.',
    'Founder of Al Abdullatif Branch, linked to historic Al-Mubarraz, known for scholars, educators, and leading genealogists in the Arabian Gulf.',
    'مؤسس فرع آل عبداللطيف (رواد التوثيق والأنساب)',
    'public',
    'published',
    6,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000007',
    'gen2-abdullah-salih',
    'الجد',
    'آل بوعبيد',
    'الجد عبدالله صالح بن محمد آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Abdullah Salih bin Mohammed Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000005',
    2,
    'male',
    false,
    'مؤسس فرع آل عبدالله صالح، الركيزة الأساسية في الروابط الاجتماعية والتطوعية، وقيادة تأسيس المقر الرئيسي للأسرة بحي الحزام الذهبي بالمبرز.',
    'Founder of Al Abdullah Salih Branch, a cornerstone of social bonds, spearheading the design and construction of the official family HQ in Al-Hizam Al-Dhahabi.',
    'مؤسس فرع آل عبدالله صالح (رواد بناء المقر الرئيسي)',
    'public',
    'published',
    7,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000008',
    'gen2-mohammed-ahmed',
    'الجد',
    'آل بوعبيد',
    'الجد محمد أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Mohammed Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000006',
    2,
    'male',
    false,
    'مؤسس فرع آل محمد أحمد، الذي يزخر بالعقول التقنية والمالية، وكان له الدور الأبرز في بناء البوابة الرقمية والمشجرة التفاعلية والتواصل الإقليمي بالمملكة والخليج.',
    'Founder of Al Mohammed Ahmed Branch, rich in fintech and software talent, instrumental in developing the digital portal and interactive lineage trees.',
    'مؤسس فرع آل محمد أحمد (رواد التقنية والتحول الرقمي)',
    'public',
    'published',
    8,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000009',
    'gen2-yousef',
    'الجد',
    'آل بوعبيد',
    'الجد يوسف بن أحمد بن صالح آل بوعبيد',
    'Patriarch',
    'Al Bu Obaid',
    'Patriarch Yousef bin Ahmed bin Salih Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000007',
    2,
    'male',
    false,
    'مؤسس فرع آل يوسف، الذي يشتهر بكفاءاته الاقتصادية وتأسيس المبادرات التجارية والتنموية والمساندة في البرامج الخيرية والتأهيل الأكاديمي للشباب.',
    'Founder of Al Yousef Branch, celebrated for business leadership, social enterprise, youth academic sponsorship, and endowment funds.',
    'مؤسس فرع آل يوسف (رواد الأعمال والتنمية والتكافل)',
    'public',
    'published',
    9,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000010',
    'gen3-saad-abdulaziz',
    'سعد',
    'آل بوعبيد',
    'سعد بن عبدالعزيز آل بوعبيد',
    'Saad',
    'Al Bu Obaid',
    'Saad bin Abdulaziz Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000001',
    3,
    'male',
    true,
    'أحد أبرز وجهاء الجيل الثالث بفرع آل سعد، تفرعت منه أسر (عيسى، خالد، وليد، بندر، فيصل، ومانع) وكان له دور مجتمعي بارز في المبرز.',
    'Prominent 3rd generation patriarch in Al Saad branch, fathering key family lines including Isa, Khalid, Walid, Bandar, Faisal, and Mana.',
    'رأس ذرية سعد بن عبدالعزيز',
    'public',
    'published',
    10,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000011',
    'gen3-isa-abdulrahman',
    'عيسى',
    'آل بوعبيد',
    'عيسى بن عبدالرحمن آل بوعبيد',
    'Isa',
    'Al Bu Obaid',
    'Isa bin Abdulrahman Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000002',
    3,
    'male',
    true,
    'رأس أسرة عريقة بفرع آل عبدالرحمن تنحدر منها ذرية (عبدالعزيز، خالد، ماهر، وصالح)، وله بصمات إيجابية في إصلاح ذات البين وإدارة الأوقاف.',
    'Head of a prominent sub-lineage in Al Abdulrahman branch, fathering Abdulaziz, Khalid, Maher, and Salih, active in endowment and community mediation.',
    'رأس ذرية عيسى بن عبدالرحمن',
    'public',
    'published',
    11,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000012',
    'gen3-mohammed-abdulaziz',
    'محمد',
    'آل بوعبيد',
    'محمد بن عبدالعزيز آل بوعبيد',
    'Mohammed',
    'Al Bu Obaid',
    'Mohammed bin Abdulaziz Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000003',
    3,
    'male',
    true,
    'شخصية قيادية من الجيل الثالث بشركة أرامكو والقطاع العام، تفرعت منه ذرية (زياد، نبيل، فهد، عبدالرحمن، وحفاظ).',
    'A 3rd generation leader in Aramco and the public sector, fathering Ziyad, Nabil, Fahad, Abdulrahman, and Huffaz.',
    'رأس ذرية محمد بن عبدالعزيز',
    'public',
    'published',
    12,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000013',
    'gen3-khalid-abdullatif',
    'خالد',
    'آل بوعبيد',
    'خالد بن عبداللطيف آل بوعبيد',
    'Khalid',
    'Al Bu Obaid',
    'Khalid bin Abdullatif Al Bu Obaid',
    'b1000000-0000-0000-0000-000000000004',
    3,
    'male',
    true,
    'من أعلام الجيل الثالث لفرع آل عبداللطيف، عُرف باهتمامه بتوثيق المخطوطات والتعليم، وتفرعت منه ذرية (عبدالله، ريان، ويوسف).',
    'A notable 3rd generation figure in Al Abdullatif branch, dedicated to manuscript preservation and education, fathering Abdullah, Rayan, and Yousef.',
    'رأس ذرية خالد بن عبداللطيف',
    'public',
    'published',
    13,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000014',
    'gen4-sheikh-saad-abdullah',
    'الشيخ',
    'آل بوعبيد',
    'الشيخ سعد بن عبدالله بوعبيد',
    'Sheikh',
    'Al Bu Obaid',
    'Sheikh Saad bin Abdullah Bu Obaid',
    'b1000000-0000-0000-0000-000000000001',
    4,
    'male',
    true,
    'شخصية عائلية بارزة وعضو مجلس الأمناء المعتمد برقم #1200758400، له جهود مشهودة في إدارة شؤون الأسرة والأوقاف والتواصل الاجتماعي.',
    'Prominent family leader and officially certified Trustee under license #1200758400, leading family governance and endowments.',
    'عضو مجلس أمناء صندوق التنمية العائلية',
    'public',
    'published',
    14,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000015',
    'gen4-dr-abdulrahman-mohammed',
    'د.',
    'آل بوعبيد',
    'د. عبدالرحمن بن محمد بوعبيد',
    'Dr.',
    'Al Bu Obaid',
    'Dr. Abdulrahman bin Mohammed Bu Obaid',
    'b1000000-0000-0000-0000-000000000002',
    4,
    'male',
    true,
    'طبيب استشاري وأكاديمي بارز بالمنطقة الشرقية، يسهم بفاعلية في اللجان العلمية والمبادرات الصحية والتربوية لأسرة آل بوعبيد.',
    'Distinguished medical consultant and academic in the Eastern Province, actively contributing to medical and scientific family committees.',
    'طبيب استشاري وأستاذ مشارك بالقطاع الصحي',
    'public',
    'published',
    15,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000016',
    'gen4-brigadier-abdulaziz-salih',
    'العميد',
    'آل بوعبيد',
    'العميد عبدالعزيز بن صالح بوعبيد',
    'Brigadier',
    'Al Bu Obaid',
    'Brigadier Abdulaziz bin Salih Bu Obaid',
    'b1000000-0000-0000-0000-000000000003',
    4,
    'male',
    true,
    'قيادي بالقطاع العسكري والخدمة العامة بالمملكة العربية السعودية، ومساهم فاعل في تنظيم ملتقيات الأسرة السنوية وتطوير حوكمة اللجان.',
    'Prominent public service and military leader in Saudi Arabia, actively organizing annual family assemblies and governance committees.',
    'عميد متقاعد ورئيس لجنة الأمن والسلامة بالصندوق',
    'public',
    'published',
    16,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000017',
    'gen4-sheikh-abdullatif-ibrahim',
    'الشيخ',
    'آل بوعبيد',
    'الشيخ عبداللطيف بن إبراهيم بوعبيد',
    'Sheikh',
    'Al Bu Obaid',
    'Sheikh Abdullatif bin Ibrahim Bu Obaid',
    'b1000000-0000-0000-0000-000000000004',
    4,
    'male',
    true,
    'مؤرخ ونسابة قدير يُعد المرجع الأول في تحقيق وثائق النسب والمشجرة الرسمية وتدقيق الصكوك والمخطوطات التاريخية للأسرة بالخليج العربي.',
    'Renowned genealogist and primary authority on authenticating family deeds, historical manuscripts, and certified lineage trees across the Gulf.',
    'المؤرخ والنسابة المعتمد لنسب آل بوعبيد التميمي',
    'public',
    'published',
    17,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000018',
    'gen4-abdullah-salih-chair',
    'أ.',
    'آل بوعبيد',
    'أ. عبدالله بن صالح بوعبيد',
    'Mr.',
    'Al Bu Obaid',
    'Mr. Abdullah bin Salih Bu Obaid',
    'b1000000-0000-0000-0000-000000000005',
    4,
    'male',
    true,
    'رائد أعمال ورئيس لجنة بناء المقر الرئيسي آل بوعبيد، أشرف على مرحلة التأسيس والتجهيز الهندسي لمبنى الصندوق بالحزام الذهبي.',
    'Entrepreneur and Chair of the HQ building project, overseeing the architectural construction of the official family headquarters in Al-Mubarraz.',
    'رئيس لجنة إعمار وتطوير المقر الرئيسي',
    'public',
    'published',
    18,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000019',
    'gen4-mohammed-ahmed-chair',
    'أ.',
    'آل بوعبيد',
    'أ. محمد بن أحمد بوعبيد',
    'Mr.',
    'Al Bu Obaid',
    'Mr. Mohammed bin Ahmed Bu Obaid',
    'b1000000-0000-0000-0000-000000000006',
    4,
    'male',
    true,
    'خبير في الإعلام والتحول الرقمي، قاد مبادرة إطلاق البوابة الرقمية التفاعلية والأرشيف الإلكتروني المعتمد لصندوق التنمية العائلية.',
    'Media & digital transformation strategist, leading the launch of the interactive family portal and certified electronic archive.',
    'رئيس لجنة الإعلام والتواصل الرقمي',
    'public',
    'published',
    19,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000020',
    'gen4-eng-nabil-mohammed',
    'م.',
    'آل بوعبيد',
    'م. نبيل بن محمد بوعبيد',
    'Eng.',
    'Al Bu Obaid',
    'Eng. Nabil bin Mohammed Bu Obaid',
    'b1000000-0000-0000-0000-000000000003',
    4,
    'male',
    true,
    'مهندس استشاري يمتلك خبرة طويلة في الهيئات الهندسية والصناعية الكبرى، يشرف على الاستشارات الفنية والأنشطة الطلابية والهندسية بالأسرة.',
    'Senior engineering consultant with extensive experience in industrial governance, supervising technical advisory and student mentorship.',
    'مستشار هندسي ورئيس لجنة المشاريع',
    'public',
    'published',
    20,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;
INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    'f1000000-0000-0000-0000-000000000021',
    'gen4-mana-saad',
    'أ.',
    'آل بوعبيد',
    'أ. مانع بن سعد بوعبيد',
    'Mr.',
    'Al Bu Obaid',
    'Mr. Mana bin Saad Bu Obaid',
    'b1000000-0000-0000-0000-000000000001',
    4,
    'male',
    true,
    'شخصية مجتمعية نشطة في تنظيم الفعاليات العائلية واللقاءات الدورية وإبراز المبادرات الشبابية والتكافلية بفرع آل سعد والأسرة عامة.',
    'Active community figure facilitating family assemblies, youth empowerment initiatives, and social solidarity programs.',
    'قيادي مجتمعي وعضو لجنة البرامج الاجتماعية',
    'public',
    'published',
    21,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;

-- 4. Article Categories & Articles
INSERT INTO public.article_categories (
    id, slug, name_ar, name_en, description_ar, sort_order, created_at
  ) VALUES (
    'e1000000-0000-0000-0000-000000000001',
    'fund-news',
    'أخبار الصندوق والمجلس',
    'Fund News',
    'البيانات الرسمية والقرارات التنظيمية',
    1,
    now()
  ) ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar;
INSERT INTO public.article_categories (
    id, slug, name_ar, name_en, description_ar, sort_order, created_at
  ) VALUES (
    'e1000000-0000-0000-0000-000000000002',
    'family-affairs',
    'الشؤون والمناسبات العائلية',
    'Family Affairs',
    'أخبار ولقاءات وتكريم أفراد الأسرة',
    2,
    now()
  ) ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar;
INSERT INTO public.article_categories (
    id, slug, name_ar, name_en, description_ar, sort_order, created_at
  ) VALUES (
    'e1000000-0000-0000-0000-000000000003',
    'initiatives-news',
    'مستجدات المبادرات والمشاريع',
    'Initiatives News',
    'تقارير إنجاز المقر الدائم والبرامج',
    3,
    now()
  ) ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar;
INSERT INTO public.articles (
    id, slug, category_id, title_ar, title_en, excerpt_ar, excerpt_en,
    content_ar, content_en, status, is_featured, published_at, created_at, updated_at
  ) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'ncnp-license-issuance',
    'e1000000-0000-0000-0000-000000000001',
    'صدور الترخيص الرسمي لصندوق التنمية العائلية (آل بوعبيد) برقم (1200758400)',
    'Official NCNP License No. 1200758400 Issued for Al Bu Obaid Family Fund',
    'تكللت الجهود الصادقة لأبناء الأسرة بتحصيل الاعتماد الرسمي من المركز الوطني لتنمية القطاع غير الربحي، مما ينقل أعمال الصندوق إلى المأسسة الكاملة.',
    'The sincere efforts of family members culminated in receiving official NCNP licensing, establishing full institutional governance.',
    'في خطوة تاريخية مباركة، أعلن مجلس الأمناء عن استلام الترخيص الرسمي الصادر من المركز الوطني لتنمية القطاع غير الربحي تحت رقم (1200758400) وتاريخ 20 صفر 1447 هـ (الموافق 14 أغسطس 2025 م). يأتي هذا الانجاز ليعزز مبادئ الشفافية والامتثال الزكوي والمالي وفق مستهدفات رؤية المملكة 2030، وليوفر مظلة نظامية معتمدة لجميع مبادرات الأسرة وبرامجها التنموية بالأحساء والمنطقة الشرقية.',
    'In a landmark achievement, the Board of Trustees announced the receipt of NCNP License #1200758400 dated 20 Safar 1447H (August 14, 2025). This milestone strengthens transparency, financial audit compliance, and zakat regulations aligned with Saudi Vision 2030, offering an accredited framework for all family initiatives.',
    'published',
    true,
    now(), now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    content_ar = EXCLUDED.content_ar;
INSERT INTO public.articles (
    id, slug, category_id, title_ar, title_en, excerpt_ar, excerpt_en,
    content_ar, content_en, status, is_featured, published_at, created_at, updated_at
  ) VALUES (
    'a1000000-0000-0000-0000-000000000002',
    'hq-land-hizam-dhahabi',
    'e1000000-0000-0000-0000-000000000001',
    'استكمال إجراءات أرض المقر الدائم بحي الحزام الذهبي بالمبرز',
    'Finalizing Acquisition Procedures for Headquarters Land in Al-Hizam Al-Dhahabi',
    'استثمار عقاري استراتيجي يوفر مقراً جامعاً لكافة الفروع السبعة ومرافق ثقافية واجتماعية متكاملة.',
    'A strategic capital expenditure securing a permanent home for all 7 branches with comprehensive cultural facilities.',
    'أنهت لجنة المقر والتطوير العقاري إجراءات الشراء وتوثيق أرض المقر الدائم الواقعة في حي الحزام الذهبي بمدينة المبرز بمحافظة الأحساء. وتمثل هذه الأرض الركيزة الأساسية لبناء ديوان الأسرة والمجمع الثقافي الاجتماعي، وتم تمويل المشروع من خلال القروض الحسنة المساهمة وااشتراكات الصندوق المعتمدة.',
    'The Headquarters & Real Estate Committee finalized deed procedures for the permanent site in Al-Hizam Al-Dhahabi district, Al-Mubarraz. Funded through interest-free shareholder loans and subscription funds, the site will house the main assembly hall and cultural complex.',
    'published',
    false,
    now(), now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    content_ar = EXCLUDED.content_ar;
INSERT INTO public.articles (
    id, slug, category_id, title_ar, title_en, excerpt_ar, excerpt_en,
    content_ar, content_en, status, is_featured, published_at, created_at, updated_at
  ) VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'excellence-award-1447',
    'e1000000-0000-0000-0000-000000000002',
    'فتح باب الترشح لجائزة آل بوعبيد للتفوق العلمي والتميز المهني',
    'Nominations Open for Al Bu Obaid Academic & Professional Excellence Award',
    'التكريم السنوي للطلاب والطالبات الحاصلين على مرتبة الشرف والأطباء والمهندسين وأصحاب الابتكارات.',
    'Annual ceremony honoring students with first-class honors, medical doctors, engineers, and innovators.',
    'أعلنت لجنة الأنشطة والبرامج عن بدء استقبال طلبات الترشح لـ ''جائزة آل بوعبيد للتفوق العلمي'' في دورته الجديدة. تهدف الجائزة إلى تشجيع التحصيل الأكاديمي المتميز في المراحل الجامعية والدراسات العليا وتكريم حملة الدكتوراة والماجستير والكفاءات الوطنية المبدعة من أبناء الأسرة.',
    'The Activities Committee launched nominations for the annual Academic Excellence Award. The prize celebrates high-achieving undergraduates, postgraduate scholars, PhD holders, and outstanding innovators across all 7 family branches.',
    'published',
    false,
    now(), now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    content_ar = EXCLUDED.content_ar;
INSERT INTO public.articles (
    id, slug, category_id, title_ar, title_en, excerpt_ar, excerpt_en,
    content_ar, content_en, status, is_featured, published_at, created_at, updated_at
  ) VALUES (
    'a1000000-0000-0000-0000-000000000004',
    'ramadan-quiz-series',
    'e1000000-0000-0000-0000-000000000002',
    'انطلاق المسابقة الثقافية الرمضانية التفاعلية عبر مجتمعات واتساب الأسرة',
    'Launch of the Interactive Ramadan Cultural Competition on WhatsApp',
    'مسابقة اليومية تهدف لتثقيف الجيل الجديد بتاريخ الأسرة ونسبها التميمي وسير أعلامها.',
    'Daily quiz series educating youth on family heritage, Tamimi lineage, and historic figures.',
    'تواصل اللجنة الإعلامية إقامة المسابقة الثقافية الرمضانية اليومية عبر القناة الرسمية للأسرة في واتساب. وتتضمن الأسئلة مسابقات في حفظ القرآن الكريم، وتاريخ الأحساء والمبرز، وتوثيق السيرة التاريخية لأعلام آل بوعبيد، مع رصد جوائز تشجيعية للفائزين.',
    'The Media Committee continues the daily Ramadan cultural quiz via the family''s official WhatsApp channel. Questions cover Quranic memorization, Al-Ahsa history, Tamimi heritage, and biographies of family ancestors, with prizes awarded to youth winners.',
    'published',
    false,
    now(), now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    content_ar = EXCLUDED.content_ar;

-- 5. Initiatives
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000001',
    'excellence-award',
    'ongoing',
    'جائزة آل بوعبيد للتفوق العلمي والتميز',
    'Academic & Professional Excellence Award',
    'برنامج سنوي لتكريم المتفوقين دراسياً وحملة الشهادات العليا والكفاءات الوطنية.',
    'Annual program honoring high achievers, postgraduate degree holders, and civic leaders.',
    'تسعى الجائزة لمكافأة الجهد الأكاديمي والبحثي لأبناء وبنات الأسرة في كافة المراحل الجامعية، وتشمل دروعاً تذكارية ومكافآت تشجيعية تُسلَّم في حفل الملتقى السنوي بحضور عميد الأسرة وأعضاء مجلس الأمناء.',
    'The award celebrates academic and research excellence across all 7 branches. Winners receive honorary shields and financial grants during the annual family assembly.',
    true,
    1,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000002',
    'headquarters',
    'ongoing',
    'مشروع المقر الدائم (حي الحزام الذهبي)',
    'Permanent HQ Land Project (Al-Hizam Al-Dhahabi)',
    'تأسيس ديوان الأسرة والمجمع الاجتماعي والثقافي على أرض مملوكة بالكامل للصندوق.',
    'Establishing the main assembly hall and cultural complex on fully-owned organization land.',
    'مشروع استراتيجي بمدينة المبرز يضم قاعات للمناسبات، ومكتبة رقمية لأرشيف الوثائق التاريخية، ومقر الإدارة للجان الخمس. يتم التمويل بحوكمة عالية عبر القروض الحسنة المساهمة والاشتراكات المعتمدة.',
    'A strategic capital development in Al-Mubarraz housing assembly halls, archival library, and administrative offices for the 5 committees, managed under strict NCNP financial compliance.',
    true,
    2,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000003',
    'ramadan-quiz',
    'ongoing',
    'مسابقة رمضان الثقافية عبر واتساب',
    'Ramadan Cultural Quiz on WhatsApp',
    'منافسات ثقافية ودينية يومية تجمع أبناء الأسرة في كافة مناطق المملكة والخليج.',
    'Daily cultural and religious quizzes connecting family members across KSA and the Gulf.',
    'برنامج تفاعلي يُدار عبر مجتمعات الواتساب الرسمية لتعزيز التواصل بين الناشئة وكبار الأسرة، ويركز على التاريخ الإسلامي والنسب التميمي والمعارف العامة.',
    'An interactive digital program managed via official WhatsApp channels fostering intergenerational connection and knowledge of Tamimi history.',
    true,
    3,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000004',
    'youth-training',
    'upcoming',
    'برنامج تطوير مهارات الشباب والناشئة',
    'Youth Skills & Capacity Building Workshop',
    'ورش عمل تخصصية في الإرشاد المهني، والذكاء الاصطناعي، وريادة الأعمال.',
    'Specialized workshops in career mentorship, AI skills, and entrepreneurship.',
    'ينظم البرنامج جلسات إرشاد مهني يقدمها نخبة من الأطباء والمهندسين ورجال الأعمال من أبناء الأسرة لتوجيه الطلاب والخرّيجين الجدد نحو الفرص الوظيفية والريادية الواعدة.',
    'Offers mentorship sessions led by senior physicians, engineers, and corporate executives from the family to guide students and graduates toward promising careers.',
    true,
    4,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000005',
    'eid-gatherings',
    'ongoing',
    'الملتقى السنوي واحتفالات العيدين',
    'Annual Assembly & Eid Celebrations',
    'لقاءات معايدة تجمع الفروع السبعة في الأحساء والشرقية والرياض ودول الخليج.',
    'Festive gatherings bringing together all 7 branches in Al-Ahsa, Eastern Province, Riyadh, and Gulf states.',
    'تُقام احتفالات العيد سنوياً برعاية عميد الأسرة ومجلس الأمناء لتجديد أواصر الرحمة والصلة، وتكريم رواد الأسرة والترحيب بالمواليد والعرسان الجدد.',
    'Annual Eid celebrations hosted under the patronage of the Family Dean to strengthen kinship ties, welcome newborns, and celebrate newlyweds.',
    true,
    5,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;
INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    'a2000000-0000-0000-0000-000000000006',
    'national-volunteering',
    'ongoing',
    'شراكة المنصة الوطنية للعمل التطوعي',
    'National Volunteering Platform Partnership',
    'تسجيل ساعات التطوع لأبناء الأسرة الموثقة رسمياً في المنصة الوطنية للمملكة.',
    'Documenting official volunteer hours for family members on Saudi Arabia''s National Platform.',
    'بصفتها كياناً أهلياً مرخصاً تحت رقم (1200758400)، تتيح صندوق التنمية العائلية (آل بوعبيد) توثيق الساعات التطوعية المعتمدة لأبناء الأسرة المشاركين في تنظيم الفعاليات والمبادرات الأهلية.',
    'As an NCNP-licensed nonprofit (#1200758400), the organization issues officially accredited volunteer hours for family members serving in civic initiatives.',
    true,
    6,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;

-- 6. Achievers
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000001',
    'د. خالد بن يوسف بن أحمد بوعبيد',
    'Dr. Khaled bin Yousef bin Ahmed Bu Obaid',
    'القضاء والفقه وإدارة الأعمال',
    'Judiciary, Jurisprudence & Business',
    'academic',
    'بكالوريوس من جامعة الإمام محمد بن سعود الإسلامية (1417هـ)، ماجستير من المعهد العالي للقضاء (1431هـ)، ودكتوراه من المعهد العالي للقضاء (1440هـ). رئيس مجلس أمناء الصندوق ورئيس شركة سلسلة الثقة للمقاولات، وله مساهمات بحثية في الفقه الطبي المستجد (نوازل كورونا)',
    'BA from Imam Mohammed bin Saud Islamic University (1417H), Master''s from the Higher Institute of Judiciary (1431H), and PhD from the Higher Institute of Judiciary (1440H). Chairman of the Board of Trustees and Chairman of Silsilat Al-Thiqa for Contracting, with published research in contemporary medical jurisprudence (COVID-era rulings)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    1,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000002',
    'الضابط عبدالله بن خالد بوعبيد',
    'Officer Abdullah bin Khaled Bu Obaid',
    'الخدمة الأمنية',
    'Security Service',
    'military',
    'بكالوريوس من جامعة الإمام محمد بن سعود (1442هـ)، وتخرج من كلية الملك فهد الأمنية (1443هـ)',
    'BA from Imam Mohammed bin Saud University (1442H); graduated King Fahd Security College (1443H)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    2,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000003',
    'الضابط ريان بن خالد بوعبيد',
    'Officer Rayan bin Khaled Bu Obaid',
    'الدفاع الجوي',
    'Air Defence',
    'military',
    'تخرج من كلية الملك عبدالله للدفاع الجوي (1445هـ)',
    'Graduated King Abdullah Air Defence College (1445H)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    3,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000004',
    'الأستاذ عبدالله بن يوسف عبداللطيف بوعبيد',
    'Mr. Abdullah bin Yousef Abdullatif Bu Obaid',
    'الإدارة',
    'Administration',
    'academic',
    'بكالوريوس من جامعة الإمام محمد بن سعود (1432هـ)',
    'BA from Imam Mohammed bin Saud University (1432H)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    4,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000005',
    'الأستاذ محمد بن أحمد بن عبداللطيف بوعبيد',
    'Mr. Mohammed bin Ahmed bin Abdullatif Bu Obaid',
    'إدارة الأعمال',
    'Business Administration',
    'business',
    'بكالوريوس إدارة أعمال من جامعة الملك فيصل (تخرج 2017م)',
    'BA in Business Administration from King Faisal University (graduated 2017)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    5,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000006',
    'الأستاذ عبداللطيف بن أحمد بن عبداللطيف بوعبيد',
    'Mr. Abdullatif bin Ahmed bin Abdullatif Bu Obaid',
    'نظم المعلومات الإدارية',
    'Management Information Systems',
    'business',
    'بكالوريوس في نظم المعلومات الإدارية من جامعة كومنولث الأمريكية، فيرجينيا (تخرج 2013م)',
    'BA in Management Information Systems from American Commonwealth University, Virginia (graduated 2013)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    6,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000007',
    'الأستاذ إبراهيم بن أحمد بن عبداللطيف بوعبيد',
    'Mr. Ibrahim bin Ahmed bin Abdullatif Bu Obaid',
    'الإلكترونيات',
    'Electronics',
    'business',
    'دبلوم إلكترونيات من الكلية التقنية بالدمام (تخرج 2012م)',
    'Diploma in Electronics from the Technical College, Dammam (graduated 2012)',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    7,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000008',
    'د. عبدالله بن سعد بوعبيد',
    'Dr. Abdullah bin Saad Bu Obaid',
    'الطب وجراحة القلب',
    'Medicine & Cardiac Surgery',
    'medical',
    'استشاري جراحة القلب ومدير مركز التميز الطبي',
    'Consultant Cardiac Surgeon & Medical Center Director',
    'فرع آل سعد',
    'Al Saad Branch',
    true,
    8,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000009',
    'أ. د. فاطمة بنت عبدالرحمن بوعبيد',
    'Prof. Fatimah bint Abdulrahman Bu Obaid',
    'الأكاديميا واللسانيات',
    'Academia & Linguistics',
    'academic',
    'أستاذة اللسانيات بجامعة الملك فيصل وعضو مجلس البحث العلمي',
    'Professor of Linguistics at King Faisal University',
    'فرع آل عبدالرحمن',
    'Al Abdulrahman Branch',
    true,
    9,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000010',
    'العميد م. عبدالعزيز بن صالح بوعبيد',
    'Brigadier Eng. Abdulaziz bin Salih Bu Obaid',
    'الهندسة والخدمة العسكرية',
    'Engineering & Military Service',
    'military',
    'قيادي هندسي سابق وخبير في الاتصالات العسكرية',
    'Senior Engineering Leader & Military Communications Expert',
    'فرع آل عبدالعزيز',
    'Al Abdulaziz Branch',
    true,
    10,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000011',
    'م. يوسف بن خالد بوعبيد',
    'Eng. Yousef bin Khalid Bu Obaid',
    'قطاع الطاقة والتكنولوجيا',
    'Energy Sector & Technology',
    'business',
    'مدير مشروعات في أرامكو السعودية وخبير تحول رقمي',
    'Senior Project Manager at Saudi Aramco & DX Specialist',
    'فرع آل يوسف',
    'Al Yousef Branch',
    true,
    11,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000012',
    'د. نورة بنت عبداللطيف بوعبيد',
    'Dr. Nora bint Abdullatif Bu Obaid',
    'الخدمة العامة والتنمية الأهلية',
    'Public Service & Social Development',
    'public',
    'مستشارة في وزارة الموارد البشرية والتنمية الاجتماعية',
    'Advisor at Ministry of Human Resources & Social Development',
    'فرع آل عبداللطيف',
    'Al Abdullatif Branch',
    true,
    12,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000013',
    'أ. خالد بن محمد بوعبيد',
    'Khalid bin Mohammed Bu Obaid',
    'الرياضة والفروسية',
    'Sports & Equestrianism',
    'sports',
    'بطل وطني في قفز الحواجز وحائز على جوائز خليجية',
    'National Show Jumping Champion & Gulf Medalist',
    'فرع آل محمد أحمد',
    'Al Mohammed Ahmed Branch',
    true,
    13,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000014',
    'أ. مريم بنت عبدالله بوعبيد',
    'Ms. Maryam bint Abdullah Bu Obaid',
    'الأدب والدراسات التاريخية',
    'Literature & Historical Studies',
    'academic',
    'كاتبة وباحثة مؤلفة لكتب توثيق التراث الأحسائي',
    'Author and Historical Researcher specializing in Al-Ahsa Heritage',
    'فرع آل عبدالله صالح',
    'Al Abdullah Salih Branch',
    true,
    14,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;
INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ac000000-0000-0000-0000-000000000015',
    'د. فيصل بن إبراهيم بوعبيد',
    'Dr. Faisal bin Ibrahim Bu Obaid',
    'الطب الجيني والأورام',
    'Genetics & Oncology',
    'medical',
    'استشاري الأمراض الجينية وباحث في مستشفى الملك فيصل التخصصي',
    'Consultant Medical Geneticist at King Faisal Specialist Hospital',
    'فرع آل عبدالرحمن',
    'Al Abdulrahman Branch',
    true,
    15,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;

-- 7. Library Items
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000001',
    'documents',
    'اللائحة الأساسية لصندوق التنمية العائلية (آل بوعبيد) (PDF)',
    'Official Fund Bylaws & Charter (PDF)',
    'اللائحة الأساسية لصندوق التنمية العائلية (آل بوعبيد) (PDF)',
    'Official Fund Bylaws & Charter (PDF)',
    1447,
    'documents',
    'Lic. 1200758400',
    true,
    1,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000002',
    'documents',
    'وثيقة النسب والتقرير الجيني (J-Z20773 / J-Z20777)',
    'Lineage & Y-DNA Scientific Study (J-Z20773 / J-Z20777)',
    'وثيقة النسب والتقرير الجيني (J-Z20773 / J-Z20777)',
    'Lineage & Y-DNA Scientific Study (J-Z20773 / J-Z20777)',
    1446,
    'documents',
    'Genealogy Archive',
    true,
    2,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000003',
    'documents',
    'الشجرة الجينية للتحور J-Z20777 — الإصدار الأول (لوحة مصورة)',
    'Haplogroup Chart for the J-Z20777 Mutation — 1st Edition (plate)',
    'الشجرة الجينية للتحور J-Z20777 — الإصدار الأول (لوحة مصورة)',
    'Haplogroup Chart for the J-Z20777 Mutation — 1st Edition (plate)',
    1447,
    'documents',
    'DNA Archive',
    true,
    3,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000004',
    'documents',
    'الشجرة الجينية الكاملة (من J-Z20775) — الإصدار الثاني المنقّح',
    'Full Haplogroup Chart (from J-Z20775) — 2nd Revised Edition',
    'الشجرة الجينية الكاملة (من J-Z20775) — الإصدار الثاني المنقّح',
    'Full Haplogroup Chart (from J-Z20775) — 2nd Revised Edition',
    1447,
    'documents',
    'DNA Archive',
    true,
    4,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000005',
    'documents',
    'اللوحة الرسمية المصورة لشجرة أسرة آل بوعبيد — الإصدار الأول',
    'Official Pictorial Family Tree Plate — First Edition',
    'اللوحة الرسمية المصورة لشجرة أسرة آل بوعبيد — الإصدار الأول',
    'Official Pictorial Family Tree Plate — First Edition',
    1447,
    'documents',
    'IP-Registered',
    true,
    5,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000006',
    'documents',
    'التقرير المالي والحوكمة المعتمد دورة 1447هـ',
    'Approved Governance & Financial Audit Report 1447H',
    'التقرير المالي والحوكمة المعتمد دورة 1447هـ',
    'Approved Governance & Financial Audit Report 1447H',
    1447,
    'documents',
    'Audit Certificate',
    true,
    6,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000007',
    'documents',
    'مخطط مشروع المقر الدائم بحي الحزام الذهبي',
    'Permanent HQ Architectural Masterplan (Al-Hizam Al-Dhahabi)',
    'مخطط مشروع المقر الدائم بحي الحزام الذهبي',
    'Permanent HQ Architectural Masterplan (Al-Hizam Al-Dhahabi)',
    1447,
    'documents',
    'Engineering Spec',
    true,
    7,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000008',
    'documents',
    'شهادة ترخيص المنشأة غير الربحية (NCNP)',
    'Non-Profit Organization License Certificate (NCNP)',
    'شهادة ترخيص المنشأة غير الربحية (NCNP)',
    'Non-Profit Organization License Certificate (NCNP)',
    1447,
    'documents',
    'Lic. 1200758400',
    true,
    8,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000009',
    'documents',
    'إثبات العنوان الوطني الرسمي',
    'Official National Address Proof',
    'إثبات العنوان الوطني الرسمي',
    'Official National Address Proof',
    1447,
    'documents',
    'Saudi Post',
    true,
    9,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000010',
    'documents',
    'خطاب تشكيل مجلس الأمناء (مُحجوبة أرقام الهوية)',
    'Board of Trustees Formation Letter (ID numbers redacted)',
    'خطاب تشكيل مجلس الأمناء (مُحجوبة أرقام الهوية)',
    'Board of Trustees Formation Letter (ID numbers redacted)',
    1447,
    'documents',
    'PTEB031650',
    true,
    10,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000011',
    'documents',
    'خطاب تفويض إدارة الحسابات البنكية (مُحجوبة أرقام الهوية)',
    'Bank Account Signatory Authorization Letter (ID numbers redacted)',
    'خطاب تفويض إدارة الحسابات البنكية (مُحجوبة أرقام الهوية)',
    'Bank Account Signatory Authorization Letter (ID numbers redacted)',
    1447,
    'documents',
    'No. 79',
    true,
    11,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000012',
    'photographs',
    'تسلم ترخيص NCNP رقم 1200758400',
    'Receiving Official NCNP License #1200758400',
    'تسلم ترخيص NCNP رقم 1200758400',
    'Receiving Official NCNP License #1200758400',
    1447,
    'photographs',
    'REF-PHO-12',
    true,
    12,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000013',
    'photographs',
    'الملتقى السنوي العام لأبناء الأسرة بالمبرز',
    'Annual Family Assembly in Al-Mubarraz',
    'الملتقى السنوي العام لأبناء الأسرة بالمبرز',
    'Annual Family Assembly in Al-Mubarraz',
    1447,
    'photographs',
    'REF-PHO-13',
    true,
    13,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000014',
    'photographs',
    'حفل تكريم المتميزين والحاصلين على الدكتوراة',
    'Academic Excellence Awards Ceremony',
    'حفل تكريم المتميزين والحاصلين على الدكتوراة',
    'Academic Excellence Awards Ceremony',
    1446,
    'photographs',
    'REF-PHO-14',
    true,
    14,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000015',
    'photographs',
    'معايدة عيد الفطر المبارك بحضور عميد الأسرة',
    'Eid Al-Fitr Reception with the Family Dean',
    'معايدة عيد الفطر المبارك بحضور عميد الأسرة',
    'Eid Al-Fitr Reception with the Family Dean',
    1447,
    'photographs',
    'REF-PHO-15',
    true,
    15,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000016',
    'recordings',
    'كلمة عميد الأسرة الشيخ سعد بوعبيد بمناسبة إشهار الصندوق',
    'Address by Family Dean Sheikh Saad Bu Obaid on NCNP Licensing',
    'كلمة عميد الأسرة الشيخ سعد بوعبيد بمناسبة إشهار الصندوق',
    'Address by Family Dean Sheikh Saad Bu Obaid on NCNP Licensing',
    1447,
    'recordings',
    'REF-REC-16',
    true,
    16,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000017',
    'recordings',
    'العرض التعريفي بمشروع أرض المقر بحي الحزام الذهبي',
    'Video Tour of Headquarters Land Project in Al-Hizam Al-Dhahabi',
    'العرض التعريفي بمشروع أرض المقر بحي الحزام الذهبي',
    'Video Tour of Headquarters Land Project in Al-Hizam Al-Dhahabi',
    1447,
    'recordings',
    'REF-REC-17',
    true,
    17,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '1b000000-0000-0000-0000-000000000018',
    'recordings',
    'وثائقي: تاريخ آل بوعبيد ونسبهم التميمي في الأحساء',
    'Documentary: History of Al Bu Obaid & Tamimi Descent in Al-Ahsa',
    'وثائقي: تاريخ آل بوعبيد ونسبهم التميمي في الأحساء',
    'Documentary: History of Al Bu Obaid & Tamimi Descent in Al-Ahsa',
    1446,
    'recordings',
    'REF-REC-18',
    true,
    18,
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;

-- 8. Businesses
INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ba000000-0000-0000-0000-000000000001',
    'biz-1',
    'مجموعة بوعبيد للتطوير العقاري والاستثمار',
    'Bu Obaid Real Estate Development Group',
    'العقارات والمقاولات',
    'Real Estate & Construction',
    'المبرز / الخبر',
    'Al-Mubarraz / Khobar',
    'تطوير المجمعات السكنية والتجارية وإدارة الأملاك في الأحساء والخبر والرياض.',
    'Developing residential & commercial complexes in Al-Ahsa, Khobar, and Riyadh.',
    'فرع آل سعد',
    'Al Saad Branch',
    '+966 13 580 1111',
    'https://albouabidrealestate.com',
    true,
    1,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ba000000-0000-0000-0000-000000000002',
    'biz-2',
    'شركة بوعبيد للخدمات الهندسية والاستشارات',
    'Bu Obaid Engineering & Consulting Co.',
    'الهندسة والاستشارات',
    'Engineering & Consulting',
    'الهفوف / الدمام',
    'Hofuf / Dammam',
    'تصميم المخططات الهندسية الإنشائية، الإشراف على المشاريع، والاستشارات البيئية.',
    'Structural design, project supervision, and environmental consulting.',
    'فرع آل عبدالعزيز',
    'Al Abdulaziz Branch',
    '+966 13 830 2222',
    'https://albouabid-eng.sa',
    true,
    2,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ba000000-0000-0000-0000-000000000003',
    'biz-3',
    'مجمع بوعبيد الطبي التخصصي',
    'Bu Obaid Specialized Medical Polyclinic',
    'الخدمات الطبية والرعاية',
    'Medical & Healthcare Services',
    'المبرز، الأحساء',
    'Al-Mubarraz, Al-Ahsa',
    'عيادات تخصصية في طب الأسنان، الجلدية، والأطفال بإشراف كفاءات طبية من أبناء الأسرة.',
    'Specialized polyclinics in dentistry, dermatology, and pediatrics.',
    'فرع آل عبدالرحمن',
    'Al Abdulrahman Branch',
    '+966 13 588 3333',
    'https://albouabid-clinic.sa',
    true,
    3,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ba000000-0000-0000-0000-000000000004',
    'biz-4',
    'مؤسسة بوعبيد للحلول الرقمية والتقنية',
    'Bu Obaid Tech Solutions',
    'التكنولوجيا والبرمجيات',
    'Technology & Software',
    'الرياض / الأحساء',
    'Riyadh / Al-Ahsa',
    'تطوير تطبيقات الويب والهواتف الذكية، الأمن السيبراني، والحول السحابية للمؤسسات.',
    'Web and mobile app development, cybersecurity, and enterprise cloud solutions.',
    'فرع آل يوسف',
    'Al Yousef Branch',
    '+966 11 450 4444',
    'https://albouabid.tech',
    true,
    4,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;
INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    'ba000000-0000-0000-0000-000000000005',
    'biz-5',
    'مخابز ومطاعم بوعبيد التراثية',
    'Bu Obaid Heritage Bakeries & Restaurants',
    'الأغذية والضيافة',
    'Food & Hospitality',
    'المبرز، الأحساء',
    'Al-Mubarraz, Al-Ahsa',
    'إنتاج الخبز الحساوي الخبز الاحمر التمر، والوجبات الشعبية الأصيلة بأسلوب حديث.',
    'Authentic Al-Ahsa red bread with dates and traditional Saudi hospitality.',
    'فرع آل عبدالله صالح',
    'Al Abdullah Salih Branch',
    '+966 13 599 5555',
    'https://albouabid-bakery.com',
    true,
    5,
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;

-- 9. Navigation Menus & Items
INSERT INTO public.navigation_menus (id, code, name_ar, name_en, created_at)
VALUES 
  ('fa000000-0000-0000-0000-000000000001', 'header', 'القائمة الرئيسية العلوية', 'Main Header Menu', now()),
  ('fa000000-0000-0000-0000-000000000002', 'footer', 'قائمة التذييل السفلية', 'Footer Menu', now())
ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000001',
    'fa000000-0000-0000-0000-000000000001',
    'الرئيسية',
    'Home',
    '/',
    'custom',
    1,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000002',
    'fa000000-0000-0000-0000-000000000001',
    'عن الكيان',
    'About',
    '/about',
    'custom',
    2,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000003',
    'fa000000-0000-0000-0000-000000000001',
    'الفروع السبعة',
    'Branches',
    '/branches',
    'custom',
    3,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000004',
    'fa000000-0000-0000-0000-000000000001',
    'شجرة الأسرة',
    'Family Tree',
    '/family-tree',
    'custom',
    4,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000005',
    'fa000000-0000-0000-0000-000000000001',
    'الدراسة الجينية',
    'DNA Studies',
    '/dna',
    'custom',
    5,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000006',
    'fa000000-0000-0000-0000-000000000001',
    'المبادرات',
    'Initiatives',
    '/initiatives',
    'custom',
    6,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000007',
    'fa000000-0000-0000-0000-000000000001',
    'سجل المتميزين',
    'Achievers',
    '/achievers',
    'custom',
    7,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000008',
    'fa000000-0000-0000-0000-000000000001',
    'المكتبة الرقمية',
    'Digital Library',
    '/library',
    'custom',
    8,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000009',
    'fa000000-0000-0000-0000-000000000001',
    'الأخبار',
    'News',
    '/news',
    'custom',
    9,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000010',
    'fa000000-0000-0000-0000-000000000001',
    'دليل الأعمال',
    'Directory',
    '/directory',
    'custom',
    10,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000011',
    'fa000000-0000-0000-0000-000000000001',
    'الخزينة والمساهمة',
    'Contribute',
    '/contribute',
    'custom',
    11,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;
INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    'fd000000-0000-0000-0000-000000000012',
    'fa000000-0000-0000-0000-000000000001',
    'تواصل معنا',
    'Contact',
    '/contact',
    'custom',
    12,
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;

-- 10. Site Settings
INSERT INTO public.site_settings (id, category, key, value, is_public, updated_at)
VALUES 
  (
    '5e000000-0000-0000-0000-000000000001',
    'site_general',
    'site_identity',
    '{"officialName":{"ar":"صندوق التنمية العائلية (آل بوعبيد)","en":"Al-Boabid Family Development Fund"},"shortName":{"ar":"آل بوعبيد","en":"Al-Boabid"},"tagline":{"ar":"أسرة عريقة، جذور تميمية، وحضور مؤسسي معاصر.","en":"An ancient family, Tamimi roots, and a contemporary institutional presence."},"ncnpLicense":"1200758400","ncnpAuthority":{"ar":"المركز الوطني لتنمية القطاع غير الربحي","en":"National Center for Nonprofit Sector (NCNP)"},"unifiedNationalNumber":"7051186638","licenseIssued":"2025-08-14","licenseExpiry":"2029-08-14","legalBasis":{"ar":"المرسوم الملكي رقم م/8 وتاريخ 19/2/1437هـ (نظام الجمعيات والمؤسسات الأهلية)","en":"Royal Decree No. M/8 dated 19/02/1437H (Law of Associations and Civil Institutions)"},"foundedHijri":"20 صفر 1447","foundedGregorian":"14 أغسطس 2025","headquarters":{"ar":"حي الحزام الذهبي، المبرز، محافظة الأحساء، المملكة العربية السعودية","en":"Al-Hizam Al-Dhahabi District, Al-Mubarraz, Al-Ahsa Governorate, KSA"},"nationalAddress":{"shortAddress":"FMDF7959","buildingNo":"7959","street":{"ar":"الصدفة","en":"Al Sudfa"},"district":{"ar":"حي الحزام الذهبي","en":"Al Hizam Adh Dhahabi District"},"secondaryNo":"3411","postalCode":"36422","city":{"ar":"المبرز","en":"Al Mubarraz"},"country":{"ar":"المملكة العربية السعودية","en":"Kingdom of Saudi Arabia"},"full":{"ar":"مبنى 7959، شارع الصدفة، حي الحزام الذهبي 3411، الرمز البريدي 36422، المبرز، المملكة العربية السعودية (العنوان المختصر: FMDF7959)","en":"Building 7959, Al Sudfa Street, Al Hizam Adh Dhahabi Dist. 3411, Postal Code 36422, Al Mubarraz, Kingdom of Saudi Arabia (Short Address: FMDF7959)"}},"domain":"albouabidfamily.com","sallaStoreUrl":"https://albouabidfamily.com/القسط-الشهري/c1360847582","contact":{"phone":"+966 13 580 0000","email":"contact@albouabidfamily.com","whatsapp":"https://chat.whatsapp.com/albouabidfamily","telegram":"https://t.me/albouabidfamily","x":"https://x.com/albouabidfamily","instagram":"https://instagram.com/albouabidfamily","youtube":"https://youtube.com/@albouabidfamily"}}'::jsonb,
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000002',
    'dna',
    'dna_studies_data',
    '{"haplogroup":"J-BY37877","root_mutation":"J1-M267","terminal_mutation":"J-BY37877","clade_hierarchy":[{"mutation":"J1-M267","name_ar":"التحور الجذري الجامع","name_en":"Root Ancestor Mutation"},{"mutation":"J-P58","name_ar":"التحور السامي","name_en":"Semitic Clade"},{"mutation":"J-FGC11","name_ar":"الفرع المنهلي القديم","name_en":"Ancient Arabian Branch"},{"mutation":"J-Z20773","name_ar":"تحور بطون بني تميم","name_en":"Banu Tamim Marker"},{"mutation":"J-Z20775","name_ar":"تحور بني دارم بن مالك","name_en":"Banu Darim Marker"},{"mutation":"J-Z20777","name_ar":"تحور العبادل","name_en":"Al-Abadil Marker"},{"mutation":"J-BY37877","name_ar":"التحور الطرفي لآل بوعبيد","name_en":"Al Bu Obaid Terminal Mutation"}],"chronology_milestones":[{"mutation":"J-Z20775","age_years":1850,"date_range":"200 م — العصر الجاهلي","note_ar":"السلف المشترك لفرع دارم من بني تميم"},{"mutation":"J-Z20777","age_years":1400,"date_range":"600 م — صدر الإسلام","note_ar":"السلف المشترك لفرع العبادل"},{"mutation":"J-BY37877","age_years":400,"date_range":"1600 م — استقرار الأحساء","note_ar":"التحور الطرفي لأسرة آل بوعبيد"}],"allied_families":[{"name_ar":"آل بوعبيد","name_en":"Al Bu Obaid","region_ar":"المبرز، الأحساء","confirmed_samples":28},{"name_ar":"آل عثمان (بني تميم)","name_en":"Al Othman","region_ar":"الأحساء والشرقية","confirmed_samples":10},{"name_ar":"آل بن دروش","name_en":"Al Darwish","region_ar":"الأحساء","confirmed_samples":6}],"country_distributions":[{"country_ar":"المملكة العربية السعودية","country_en":"Saudi Arabia","samples_count":78,"regions_ar":"الأحساء، الشرقية، الرياض","note_ar":"التكتل الأكبر الموثق"},{"country_ar":"الكويت","country_en":"Kuwait","samples_count":10,"regions_ar":"مدينة الكويت، حولي","note_ar":"عينات موثقة لفروع الأسرة"},{"country_ar":"قطر والبحرين","country_en":"Qatar & Bahrain","samples_count":6,"regions_ar":"الدوحة، المنامة","note_ar":"فروع تجارية وتاريخية"}]}'::jsonb,
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000003',
    'governance',
    'board_of_trustees',
    '[{"role":{"ar":"عميد الأسرة (المنصب التقليدي)","en":"Family Dean (Traditional Office)"},"name":{"ar":"الأستاذ سعد بن عبدالرحمن بن علي بوعبيد","en":"Mr. Saad bin Abdulrahman bin Ali Bu Obaid"},"bio":{"ar":"يحتفظ بمنصب «عميد الأسرة» العرفي، ويمثل استمرارية «رأس المال الرمزي» الذي يوازن بين الحوكمة الإدارية الحديثة الملتزمة بتعليمات الدولة والمكانة الاجتماعية المتوارثة التي تضمن التماسك الروحي وولاء الأسرة الممتدة.","en":"Holds the customary office of Family Dean, embodying the family''s continuing ''symbolic capital'' — a deliberate balance between modern, state-compliant administrative governance and the inherited social standing that secures the extended family''s spiritual cohesion and loyalty."}},{"role":{"ar":"رئيس مجلس الأمناء","en":"Chairman, Board of Trustees"},"name":{"ar":"د. خالد بن يوسف بن أحمد بوعبيد","en":"Dr. Khaled bin Yousef bin Ahmed Bu Obaid"},"bio":{"ar":"حاصل على الدكتوراه من المعهد العالي للقضاء، وله خبرة في الفقه والقضاء وإدارة الشركات. يرأس مؤسسات فاعلة مثل شركة «سلسلة الثقة للمقاولات»، وله مساهمات بحثية في الفقه الطبي المستجد (فقه نوازل كورونا). يتولى القيادة العليا والإشراف على الامتثال للائحة الأساسية.","en":"Holds a PhD from the Higher Institute of Judiciary, with expertise in jurisprudence, the judiciary, and corporate management. He chairs active enterprises such as Silsilat Al-Thiqa for Contracting, and has published research in contemporary medical jurisprudence (COVID-era rulings). Holds senior leadership of the board and oversees compliance with the bylaws."}},{"role":{"ar":"نائب رئيس مجلس الأمناء","en":"Vice Chairman, Board of Trustees"},"name":{"ar":"الأستاذ حسين بن عبدالله بن حسين بوعبيد","en":"Mr. Hussein bin Abdullah bin Hussein Bu Obaid"},"bio":{"ar":"يقدم المساندة القيادية ويضمن سير العمليات الإدارية والمبادرات الاجتماعية، وأحد ثلاثة مفوضين رئيسيين يشترط توقيعهم المشترك على المعاملات المالية الحساسة.","en":"Provides leadership support and ensures the smooth running of administrative operations and social initiatives; one of three principal signatories whose joint signature is required for sensitive financial transactions."}},{"role":{"ar":"عضو مجلس الأمناء","en":"Board Trustee"},"name":{"ar":"الأستاذ عبدالرحمن بن عبدالعزيز بن عبدالرحمن بوعبيد","en":"Mr. Abdulrahman bin Abdulaziz bin Abdulrahman Bu Obaid"},"bio":{"ar":"يتولى الإشراف ضمن الدائرة المصغرة المخوّلة باتخاذ القرارات المالية والاستراتيجية، وأحد الموقّعين الثلاثة على التفويض البنكي الدقيق للصندوق.","en":"Oversees decisions within the small executive circle authorised to take financial and strategic decisions, and is one of three signatories on the fund''s bank authorisation."}},{"role":{"ar":"عضو مجلس الأمناء","en":"Board Trustee"},"name":{"ar":"الأستاذ عبدالله بن سعود بن عبدالعزيز بوعبيد","en":"Mr. Abdullah bin Saud bin Abdulaziz Bu Obaid"},"bio":{"ar":"يشارك في التوجيه الاستراتيجي للصندوق وتطوير مواردها.","en":"Participates in the organisation''s strategic direction and resource development."}}]'::jsonb,
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000004',
    'governance',
    'committees',
    '[{"id":"comm","name":{"ar":"لجنة التواصل والخدمة الاجتماعية","en":"Communication & Social Services Committee"},"desc":{"ar":"تتولى تنظيم الملتقيات السنوية، متابعة المناسبات الأهلية، وتقديم الدعم الاجتماعي والتكافل بين أبناء الأسرة.","en":"Organizes annual assemblies, monitors family occasions, and provides social solidarity support."},"lead":{"ar":"الأستاذ عبدالله بن عبدالعزيز بن عبدالرحمن بوعبيد","en":"Mr. Abdullah bin Abdulaziz bin Abdulrahman Bu Obaid"}},{"id":"finance","name":{"ar":"لجنة الشؤون المالية والادخار","en":"Finance & Endowment Committee"},"desc":{"ar":"تُشرف على الميزانية المعتمدة، الاشتراكات الشهرية، الحسابات المستقلة للزكاة والصُّندُوق، والتخطيط الاستثماري الوقفي.","en":"Oversees the approved budget, monthly subscriptions, dedicated zakat accounts, and endowment planning."},"lead":{"ar":"الأستاذ عبدالرحمن بن صالح بن علي بوعبيد","en":"Mr. Abdulrahman bin Salih bin Ali Bu Obaid"}},{"id":"hq","name":{"ar":"لجنة المقر والتطوير العقاري","en":"Headquarters & Real Estate Committee"},"desc":{"ar":"مسؤولة عن متابعة أرض مشروع المقر الدائم بحي الحزام الذهبي بالمبرز، والتصاميم الهندسية ومراحل الإنشاء والتطوير.","en":"Responsible for managing the headquarters land project in Al-Hizam Al-Dhahabi district, engineering designs, and construction."},"lead":{"ar":"الأستاذ رياض بن عبدالعزيز بن أحمد بوعبيد","en":"Mr. Riyadh bin Abdulaziz bin Ahmed Bu Obaid"}},{"id":"activities","name":{"ar":"لجنة الأنشطة والبرامج","en":"Activities & Youth Programs Committee"},"desc":{"ar":"تنظم جائزة التفوق العلمي، مسابقة رمضان الثقافية عبر واتساب، الدورات التدريبية للشباب واللقاءات الرياضية.","en":"Organizes the Academic Excellence Award, Ramadan WhatsApp quiz, youth skills workshops, and sports events."},"lead":{"ar":"الأستاذ صالح بن عبدالعزيز بن عبدالله بوعبيد","en":"Mr. Saleh bin Abdulaziz bin Abdullah Bu Obaid"}},{"id":"media","name":{"ar":"اللجنة الإعلامية والتوثيق","en":"Media & Documentation Committee"},"desc":{"ar":"إدارة البوابة الرقمية، حسابات التواصل الاجتماعي، التوثيق التاريخي والجيني، وتصميم إصدارات الأسرة.","en":"Manages the web platform, official social channels, historical/DNA archives, and family publications."},"lead":{"ar":"الأستاذ عامر بن أحمد بن إبراهيم بوعبيد","en":"Mr. Amer bin Ahmed bin Ibrahim Bu Obaid"}}]'::jsonb,
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000005',
    'governance',
    'founding_members',
    '[{"ar":"الأستاذ رياض بن عبدالعزيز بن أحمد بوعبيد","en":"Mr. Riyadh bin Abdulaziz bin Ahmed Bu Obaid"},{"ar":"الأستاذ صالح بن عبدالعزيز بن عبدالله بوعبيد","en":"Mr. Saleh bin Abdulaziz bin Abdullah Bu Obaid"},{"ar":"الأستاذ صالح بن محمد بن يوسف بوعبيد","en":"Mr. Saleh bin Mohammed bin Yousef Bu Obaid"},{"ar":"الأستاذ عبدالرحمن بن صالح بن علي بوعبيد","en":"Mr. Abdulrahman bin Salih bin Ali Bu Obaid"},{"ar":"الأستاذ عبدالله بن عبدالعزيز بن عبدالرحمن بوعبيد","en":"Mr. Abdullah bin Abdulaziz bin Abdulrahman Bu Obaid"},{"ar":"الأستاذ عامر بن أحمد بن إبراهيم بوعبيد","en":"Mr. Amer bin Ahmed bin Ibrahim Bu Obaid"}]'::jsonb,
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000006',
    'cms_homepage',
    'homepage_sections_config',
    '[{"id":"hero","name_ar":"القسم الترحيبي والافتتاحية","name_en":"Hero & Welcome","enabled":true,"order":1,"title_ar":"صندوق التنمية العائلية (آل بوعبيد)","subtitle_ar":"أسرة عريقة، جذور تميمية، وحضور مؤسسي معاصر."},{"id":"dean_address","name_ar":"كلمة عميد الأسرة","name_en":"Dean''s Address","enabled":true,"order":2,"title_ar":"كلمة عميد الأسرة","subtitle_ar":"أحمد بن عبد الله بن صالح آل بوعبيد"},{"id":"vital_stats","name_ar":"أرقام ومؤشرات الصندوق","name_en":"Vital Statistics","enabled":true,"order":3,"title_ar":"أرقام وإحصائيات الكيان الموثقة","subtitle_ar":"ترخيص رسمي، فروع سبعة، ومئات الأفراد"},{"id":"branches_grid","name_ar":"شبكة الفروع السبعة","name_en":"Seven Branches Grid","enabled":true,"order":4,"title_ar":"الفروع السبعة","subtitle_ar":"تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن صالح"},{"id":"interactive_tree","name_ar":"معاينة شجرة الأسرة","name_en":"Interactive Tree Preview","enabled":true,"order":5,"title_ar":"المشجرة التفاعلية المعتمدة","subtitle_ar":"شجرة أنساب رقمية متكاملة"},{"id":"initiatives_hq","name_ar":"المقر الدائم والمبادرات","name_en":"Headquarters & Initiatives","enabled":true,"order":6,"title_ar":"مشروع المقر الدائم والمبادرات","subtitle_ar":"استثمار مستدام يجمع أجيال الأسرة"},{"id":"news_feed","name_ar":"شريط الأخبار والبيانات","name_en":"News & Bulletins","enabled":true,"order":7,"title_ar":"الأخبار والبيانات الرسمية","subtitle_ar":"تصدر عن أمانة المجلس العام"},{"id":"events_schedule","name_ar":"جدول الفعاليات والملتقيات","name_en":"Events & Gatherings","enabled":true,"order":8,"title_ar":"الفعاليات والملتقيات القادمة","subtitle_ar":"حضور ومشاركة أفراد العائلة"},{"id":"heritage_gallery","name_ar":"معرض التراث والوثائق","name_en":"Heritage & Document Gallery","enabled":true,"order":9,"title_ar":"الأرشيف التراثي والمخطوطات","subtitle_ar":"وثائق محاكم شرعية ومخطوطات نادرة"},{"id":"contact_inquiry","name_ar":"نموذج التواصل السريع","name_en":"Contact & Inquiry","enabled":true,"order":10,"title_ar":"تواصل مع أمانة المجلس","subtitle_ar":"نسعد باستقبال استفساراتكم وملاحظاتكم"}]'::jsonb,
    true, now()
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- 11. Announcements & Events
INSERT INTO public.announcements (
  id, title_ar, title_en, message_ar, message_en, type, priority, start_at, end_at, status, created_at, updated_at
) VALUES (
  'ad000000-0000-0000-0000-000000000001',
  'فتح باب استقبال مساهمات الصندوق السنوية والمشروع الدائم',
  'Annual Fund Contributions & Permanent HQ Drive',
  'تعلن أمانة المجلس العام عن بدء استقبال الاشتراكات السنوية وتبرعات مشروع المقر الدائم عبر الحساب البنكي الرسمي.',
  'The General Secretariat announces the opening of annual contributions for the permanent headquarters project.',
  'info',
  'high',
  now(),
  now() + interval '90 days',
  'active',
  now(), now()
) ON CONFLICT (id) DO UPDATE SET title_ar = EXCLUDED.title_ar;
INSERT INTO public.events (
  id, slug, title_ar, title_en, description_ar, start_at, end_at, status, registration_enabled, max_attendees, created_at, updated_at
) VALUES (
  'ee000000-0000-0000-0000-000000000001',
  'annual-assembly-1447',
  'الملتقى السنوي العام لأسرة آل بوعبيد وحفل تكريم المتميزين',
  'Annual Family Assembly & Honours Gala',
  'اللقاء الدوري السنوي الجامع لكافة أبناء وبنات الفروع السبعة مع حفل جائزة التفوق العلمي والمهني.',
  now() + interval '30 days',
  now() + interval '30 days 4 hours',
  'published',
  true,
  500,
  now(), now()
) ON CONFLICT (slug) DO UPDATE SET title_ar = EXCLUDED.title_ar;

COMMIT;
