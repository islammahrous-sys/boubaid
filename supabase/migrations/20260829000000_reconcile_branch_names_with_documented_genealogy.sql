-- Reconcile the `branches` table with the family's documented genealogy.
--
-- The interactive tree (src/content/family-tree.ts — full founder records with
-- patrilineal chains), the branch register (src/content/site.ts), the homepage
-- and every branch selector all describe the seven branches as descending from
-- Sa'd, Abdulrahman, Abdulaziz, Abdullatif, Abdullah Salih, Mohammed Ahmed and
-- Yousef. Three rows in this table had been seeded with different names
-- (al-mohammed / al-salih / al-ibrahim), which made /branches render ten cards
-- and left the console + family-tree branch filter disagreeing with the public
-- site. Rename those three rows to the documented branches.
--
-- The primary key (`id`) is left unchanged, so every `family_members.branch_id`
-- foreign key stays valid — only `slug`, the bilingual name, the description and
-- the elder change. Idempotent: each statement is a no-op if already applied.

UPDATE public.branches SET
  slug = 'al-abdulrahman',
  name_ar = 'فرع آل عبدالرحمن',
  name_en = 'Al Abdulrahman Branch',
  description_ar = 'فرع ذو ثقل اجتماعي وتاريخي بارز في المبرز والمنطقة الشرقية، يزخر بالنخب الأكاديمية والطبية والهندسية، وتعود وثائقهم الشرعية وأوقافهم إلى حقب تاريخية عريقة مسجلة في سجلات الأحساء.',
  description_en = 'A prominent social and historical pillar in Al-Mubarraz and the Eastern Province, boasting top academic, medical, and engineering talent with ancient registered endowment deeds.',
  elder_ar = 'د. عبدالرحمن بن محمد بوعبيد (أكاديمي وطبيب)',
  elder_en = 'Dr. Abdulrahman bin Mohammed Bu Obaid',
  updated_at = now()
WHERE id = 'b1000000-0000-0000-0000-000000000002';

UPDATE public.branches SET
  slug = 'al-abdulaziz',
  name_ar = 'فرع آل عبدالعزيز',
  name_en = 'Al Abdulaziz Branch',
  description_ar = 'يمتاز هذا الفرع الأصيل بحضوره القوي في قطاعات الخدمة العامة والهندسة والإدارة المالية، وله إسهامات فاعلة في إدارة المبادرات العائلية وصندوق الأسرة الوقفية وبرامج التواصل المشترك.',
  description_en = 'Distinguished by strong leadership in public service, engineering, and financial management, actively driving family endowment initiatives and inter-branch programs.',
  elder_ar = 'العميد عبدالعزيز بن صالح بوعبيد',
  elder_en = 'Brigadier Abdulaziz bin Salih Bu Obaid',
  updated_at = now()
WHERE id = 'b1000000-0000-0000-0000-000000000003';

UPDATE public.branches SET
  slug = 'al-abdullatif',
  name_ar = 'فرع آل عبداللطيف',
  name_en = 'Al Abdullatif Branch',
  description_ar = 'يُعتبر هذا الفرع أيقونة أكاديمية ومهنية حديثة في تاريخ الأسرة، فقد أثمر شخصيات بارزة حصدت أعلى المراتب، ويرأس منه حالياً رئيس مجلس أمناء الصندوق، كما يضم قيادات أمنية وعسكرية شابة متميزة.',
  description_en = 'A modern academic and professional icon in the family history; this branch has produced figures who reached the highest ranks, including the organisation''s current Chairman of the Board of Trustees, alongside distinguished young security and military leaders.',
  elder_ar = 'د. خالد بن يوسف بن أحمد بوعبيد (رئيس مجلس الأمناء)',
  elder_en = 'Dr. Khaled bin Yousef bin Ahmed Bu Obaid (Chairman, Board of Trustees)',
  updated_at = now()
WHERE id = 'b1000000-0000-0000-0000-000000000004';

-- `profiles.branch_slug` / `membership_requests.branch_slug` are free text that
-- stored whatever the (now-corrected) selector offered. Repoint any rows still
-- carrying the old slugs.
UPDATE public.profiles            SET branch_slug = 'al-abdulrahman' WHERE branch_slug = 'al-mohammed';
UPDATE public.profiles            SET branch_slug = 'al-abdulaziz'   WHERE branch_slug = 'al-salih';
UPDATE public.profiles            SET branch_slug = 'al-abdullatif'  WHERE branch_slug = 'al-ibrahim';
UPDATE public.membership_requests SET branch_slug = 'al-abdulrahman' WHERE branch_slug = 'al-mohammed';
UPDATE public.membership_requests SET branch_slug = 'al-abdulaziz'   WHERE branch_slug = 'al-salih';
UPDATE public.membership_requests SET branch_slug = 'al-abdullatif'  WHERE branch_slug = 'al-ibrahim';
