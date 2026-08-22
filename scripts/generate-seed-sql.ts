import {
  siteMeta,
  branches,
  initiatives,
  achievers,
  libraryItems,
  news,
  dnaInfo,
  boardOfTrustees,
  businesses,
  committees,
  foundingMembers,
  lineageChain,
  hqProject,
  stats,
} from "../src/content/site";
import { familyMembersData } from "../src/content/family-tree";

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function escapeJson(obj: any): string {
  if (obj === null || obj === undefined) return "NULL";
  return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
}

let sql = "BEGIN;\n\n";

// 1. SEED BRANCHES
sql += "-- 1. Branches\n";
const branchMap = new Map<string, string>(); // slug -> uuid
branches.forEach((b: any, idx: number) => {
  const branchId = `b1000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  branchMap.set(b.id, branchId);
  sql += `INSERT INTO public.branches (
    id, slug, name_ar, name_en, description_ar, description_en,
    elder_ar, elder_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '${branchId}',
    ${escapeSql(b.id)},
    ${escapeSql(b.name.ar)},
    ${escapeSql(b.name.en)},
    ${escapeSql(b.description.ar)},
    ${escapeSql(b.description.en)},
    ${escapeSql(b.keyFigures?.[0]?.ar || b.ancestor.ar)},
    ${escapeSql(b.keyFigures?.[0]?.en || b.ancestor.en)},
    true,
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    elder_ar = EXCLUDED.elder_ar,
    elder_en = EXCLUDED.elder_en,
    sort_order = EXCLUDED.sort_order;\n`;
});

// 2. SEED PLACES
sql += "\n-- 2. Places\n";
const placesList = [
  { id: "c1000000-0000-0000-0000-000000000001", name_ar: "مقر الأسرة بحي الحزام الذهبي", name_en: "Family HQ - Al Hizam District", city: "المبرز", address: "شارع الصدفة، حي الحزام الذهبي، المبرز", lat: 25.4167, lng: 49.5833, desc_ar: "المقر العام لصندوق التنمية العائلية بحي الحزام الذهبي بالمبرز." },
  { id: "c1000000-0000-0000-0000-000000000002", name_ar: "واحة الأحساء التاريخية", name_en: "Historic Al-Ahsa Oasis", city: "الأحساء", address: "واحة الأحساء، المنطقة الشرقية", lat: 25.3833, lng: 49.6000, desc_ar: "الموطن التاريخي الموثق لوجود الأسرة منذ سنة 1102 هـ." },
  { id: "c1000000-0000-0000-0000-000000000003", name_ar: "مجلس فرع آل سعد", name_en: "Al-Saad Branch Diwaniya", city: "المبرز", address: "حي الراشدية، المبرز", lat: 25.4200, lng: 49.5800, desc_ar: "ديوانية وملتقى أعيان وأبناء فرع آل سعد." },
  { id: "c1000000-0000-0000-0000-000000000004", name_ar: "مجلس فرع آل محمد", name_en: "Al-Mohammed Branch Diwaniya", city: "المبرز", address: "حي اليحيى، المبرز", lat: 25.4180, lng: 49.5820, desc_ar: "ديوانية وملتقى أعيان وأبناء فرع آل محمد." },
  { id: "c1000000-0000-0000-0000-000000000005", name_ar: "مجلس فرع آل صالح", name_en: "Al-Salih Branch Diwaniya", city: "المبرز", address: "وسط المبرز القديم", lat: 25.4150, lng: 49.5850, desc_ar: "ديوانية وملتقى أعيان وأبناء فرع آل صالح." },
];

placesList.forEach((p) => {
  sql += `INSERT INTO public.places (
    id, name_ar, name_en, country, region, city, address, latitude, longitude, description_ar, created_at, updated_at
  ) VALUES (
    '${p.id}',
    ${escapeSql(p.name_ar)},
    ${escapeSql(p.name_en)},
    'المملكة العربية السعودية',
    'المنطقة الشرقية',
    ${escapeSql(p.city)},
    ${escapeSql(p.address)},
    ${p.lat}, ${p.lng},
    ${escapeSql(p.desc_ar)},
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar;\n`;
});

// 3. SEED FAMILY MEMBERS
sql += "\n-- 3. Family Members\n";
familyMembersData.forEach((m: any, idx: number) => {
  const memberId = `f1000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  const branchUuid = branchMap.get(m.branchId) || branchMap.get("al-saad") || null;
  const firstNameAr = m.name.ar.split(" ")[0] || m.name.ar;
  const firstNameEn = m.name.en?.split(" ")[0] || m.name.en;
  
  sql += `INSERT INTO public.family_members (
    id, slug, first_name_ar, last_name_ar, display_name_ar,
    first_name_en, last_name_en, display_name_en,
    branch_id, generation, gender, is_living,
    biography_ar, biography_en, occupation_ar,
    visibility, status, sort_order, created_at, updated_at
  ) VALUES (
    '${memberId}',
    ${escapeSql(m.id)},
    ${escapeSql(firstNameAr)},
    ${escapeSql("آل بوعبيد")},
    ${escapeSql(m.name.ar)},
    ${escapeSql(firstNameEn)},
    ${escapeSql("Al Bu Obaid")},
    ${escapeSql(m.name.en || m.name.ar)},
    ${branchUuid ? `'${branchUuid}'` : "NULL"},
    ${m.generation},
    'male',
    ${m.generation >= 3},
    ${escapeSql(m.bio.ar)},
    ${escapeSql(m.bio.en)},
    ${escapeSql(m.title?.ar || m.settlement.ar)},
    'public',
    'published',
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    display_name_ar = EXCLUDED.display_name_ar,
    biography_ar = EXCLUDED.biography_ar,
    generation = EXCLUDED.generation;\n`;
});

// 4. SEED ARTICLE CATEGORIES & ARTICLES
sql += "\n-- 4. Article Categories & Articles\n";
const categories = [
  { id: "e1000000-0000-0000-0000-000000000001", slug: "fund-news", name_ar: "أخبار الصندوق والمجلس", name_en: "Fund News", desc_ar: "البيانات الرسمية والقرارات التنظيمية" },
  { id: "e1000000-0000-0000-0000-000000000002", slug: "family-affairs", name_ar: "الشؤون والمناسبات العائلية", name_en: "Family Affairs", desc_ar: "أخبار ولقاءات وتكريم أفراد الأسرة" },
  { id: "e1000000-0000-0000-0000-000000000003", slug: "initiatives-news", name_ar: "مستجدات المبادرات والمشاريع", name_en: "Initiatives News", desc_ar: "تقارير إنجاز المقر الدائم والبرامج" },
];

categories.forEach((cat, idx) => {
  sql += `INSERT INTO public.article_categories (
    id, slug, name_ar, name_en, description_ar, sort_order, created_at
  ) VALUES (
    '${cat.id}',
    ${escapeSql(cat.slug)},
    ${escapeSql(cat.name_ar)},
    ${escapeSql(cat.name_en)},
    ${escapeSql(cat.desc_ar)},
    ${idx + 1},
    now()
  ) ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar;\n`;
});

news.forEach((n: any, idx: number) => {
  const artId = `a1000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  const catId = n.section === "fund" ? categories[0].id : categories[1].id;
  sql += `INSERT INTO public.articles (
    id, slug, category_id, title_ar, title_en, excerpt_ar, excerpt_en,
    content_ar, content_en, status, is_featured, published_at, created_at, updated_at
  ) VALUES (
    '${artId}',
    ${escapeSql(n.slug)},
    '${catId}',
    ${escapeSql(n.title.ar)},
    ${escapeSql(n.title.en)},
    ${escapeSql(n.excerpt?.ar || n.body.ar.slice(0, 150))},
    ${escapeSql(n.excerpt?.en || n.body.en.slice(0, 150))},
    ${escapeSql(n.body.ar)},
    ${escapeSql(n.body.en)},
    'published',
    ${idx === 0},
    now(), now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    content_ar = EXCLUDED.content_ar;\n`;
});

// 5. SEED INITIATIVES
sql += "\n-- 5. Initiatives\n";
initiatives.forEach((init: any, idx: number) => {
  const initId = `a2000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  sql += `INSERT INTO public.initiatives (
    id, slug, status, title_ar, title_en, summary_ar, summary_en,
    body_ar, body_en, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '${initId}',
    ${escapeSql(init.slug)},
    ${escapeSql(init.status)},
    ${escapeSql(init.title.ar)},
    ${escapeSql(init.title.en)},
    ${escapeSql(init.summary.ar)},
    ${escapeSql(init.summary.en)},
    ${escapeSql(init.body?.ar || init.summary.ar)},
    ${escapeSql(init.body?.en || init.summary.en)},
    true,
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    summary_ar = EXCLUDED.summary_ar,
    body_ar = EXCLUDED.body_ar;\n`;
});

// 6. SEED ACHIEVERS
sql += "\n-- 6. Achievers\n";
achievers.forEach((ach: any, idx: number) => {
  const achId = `ac000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  sql += `INSERT INTO public.achievers (
    id, name_ar, name_en, field_ar, field_en, category,
    achievement_ar, achievement_en, branch_ar, branch_en,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    '${achId}',
    ${escapeSql(ach.name.ar)},
    ${escapeSql(ach.name.en)},
    ${escapeSql(ach.field.ar)},
    ${escapeSql(ach.field.en)},
    ${escapeSql(ach.category)},
    ${escapeSql(ach.achievement.ar)},
    ${escapeSql(ach.achievement.en)},
    ${escapeSql(ach.branch?.ar || "الفروع السبعة")},
    ${escapeSql(ach.branch?.en || "Seven Branches")},
    true,
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    achievement_ar = EXCLUDED.achievement_ar;\n`;
});

// 7. SEED LIBRARY ITEMS
sql += "\n-- 7. Library Items\n";
const allDocs = [
  ...(libraryItems.documents || []).map((d: any, i: number) => ({ ...d, collection: "documents", order: i + 1 })),
  ...(libraryItems.photos || []).map((p: any, i: number) => ({ ...p, collection: "photographs", order: i + 20 })),
  ...(libraryItems.videos || []).map((v: any, i: number) => ({ ...v, collection: "recordings", order: i + 40 })),
];

allDocs.forEach((lib: any, idx: number) => {
  const libId = `1b000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  sql += `INSERT INTO public.library_items (
    id, collection, title_ar, title_en, description_ar, description_en,
    year, kind, reference, is_published, sort_order, created_at, updated_at
  ) VALUES (
    '${libId}',
    ${escapeSql(lib.collection)},
    ${escapeSql(lib.title.ar)},
    ${escapeSql(lib.title.en)},
    ${escapeSql(lib.description?.ar || lib.title.ar)},
    ${escapeSql(lib.description?.en || lib.title.en)},
    ${parseInt(lib.year) || 1447},
    ${escapeSql(lib.kind?.ar || lib.collection)},
    ${escapeSql(lib.ncnpRef || `REF-${lib.collection.slice(0, 3).toUpperCase()}-${idx + 1}`)},
    true,
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    title_ar = EXCLUDED.title_ar,
    description_ar = EXCLUDED.description_ar;\n`;
});

// 8. SEED BUSINESSES
sql += "\n-- 8. Businesses\n";
businesses.forEach((biz: any, idx: number) => {
  const bizId = `ba000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  sql += `INSERT INTO public.businesses (
    id, slug, name_ar, name_en, category_ar, category_en,
    city_ar, city_en, description_ar, description_en,
    owner_branch_ar, owner_branch_en, contact, website,
    is_published, sort_order, created_at, updated_at
  ) VALUES (
    '${bizId}',
    ${escapeSql(biz.id)},
    ${escapeSql(biz.name.ar)},
    ${escapeSql(biz.name.en)},
    ${escapeSql(biz.category.ar)},
    ${escapeSql(biz.category.en)},
    ${escapeSql(biz.city.ar)},
    ${escapeSql(biz.city.en)},
    ${escapeSql(biz.description.ar)},
    ${escapeSql(biz.description.en)},
    ${escapeSql(biz.ownerBranch?.ar || "أسرة آل بوعبيد")},
    ${escapeSql(biz.ownerBranch?.en || "Al Bu Obaid Family")},
    ${escapeSql(biz.contact)},
    ${escapeSql(biz.website)},
    true,
    ${idx + 1},
    now(), now()
  ) ON CONFLICT (slug) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    description_ar = EXCLUDED.description_ar;\n`;
});

// 9. SEED NAVIGATION MENUS & ITEMS
sql += "\n-- 9. Navigation Menus & Items\n";
const menuHeaderId = "fa000000-0000-0000-0000-000000000001";
const menuFooterId = "fa000000-0000-0000-0000-000000000002";

sql += `INSERT INTO public.navigation_menus (id, code, name_ar, name_en, created_at)
VALUES 
  ('${menuHeaderId}', 'header', 'القائمة الرئيسية العلوية', 'Main Header Menu', now()),
  ('${menuFooterId}', 'footer', 'قائمة التذييل السفلية', 'Footer Menu', now())
ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar;\n`;

const headerLinks = [
  { label_ar: "الرئيسية", label_en: "Home", url: "/", order: 1 },
  { label_ar: "عن الكيان", label_en: "About", url: "/about", order: 2 },
  { label_ar: "الفروع السبعة", label_en: "Branches", url: "/branches", order: 3 },
  { label_ar: "شجرة الأسرة", label_en: "Family Tree", url: "/family-tree", order: 4 },
  { label_ar: "الدراسة الجينية", label_en: "DNA Studies", url: "/dna", order: 5 },
  { label_ar: "المبادرات", label_en: "Initiatives", url: "/initiatives", order: 6 },
  { label_ar: "سجل المتميزين", label_en: "Achievers", url: "/achievers", order: 7 },
  { label_ar: "المكتبة الرقمية", label_en: "Digital Library", url: "/library", order: 8 },
  { label_ar: "الأخبار", label_en: "News", url: "/news", order: 9 },
  { label_ar: "دليل الأعمال", label_en: "Directory", url: "/directory", order: 10 },
  { label_ar: "الخزينة والمساهمة", label_en: "Contribute", url: "/contribute", order: 11 },
  { label_ar: "تواصل معنا", label_en: "Contact", url: "/contact", order: 12 },
];

headerLinks.forEach((link, idx) => {
  const itemId = `fd000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  sql += `INSERT INTO public.navigation_items (
    id, menu_id, label_ar, label_en, url, type, sort_order, target, visibility, created_at, updated_at
  ) VALUES (
    '${itemId}',
    '${menuHeaderId}',
    ${escapeSql(link.label_ar)},
    ${escapeSql(link.label_en)},
    ${escapeSql(link.url)},
    'custom',
    ${link.order},
    '_self',
    'public',
    now(), now()
  ) ON CONFLICT (id) DO UPDATE SET
    label_ar = EXCLUDED.label_ar,
    url = EXCLUDED.url;\n`;
});

// 10. SEED SITE SETTINGS
sql += "\n-- 10. Site Settings\n";
sql += `INSERT INTO public.site_settings (id, category, key, value, is_public, updated_at)
VALUES 
  (
    '5e000000-0000-0000-0000-000000000001',
    'site_general',
    'site_identity',
    ${escapeJson(siteMeta)},
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000002',
    'dna',
    'dna_studies_data',
    ${escapeJson({
      haplogroup: dnaInfo.haplogroup,
      root_mutation: "J1-M267",
      terminal_mutation: "J-BY37877",
      clade_hierarchy: [
        { mutation: "J1-M267", name_ar: "التحور الجذري الجامع", name_en: "Root Ancestor Mutation" },
        { mutation: "J-P58", name_ar: "التحور السامي", name_en: "Semitic Clade" },
        { mutation: "J-FGC11", name_ar: "الفرع المنهلي القديم", name_en: "Ancient Arabian Branch" },
        { mutation: "J-Z20773", name_ar: "تحور بطون بني تميم", name_en: "Banu Tamim Marker" },
        { mutation: "J-Z20775", name_ar: "تحور بني دارم بن مالك", name_en: "Banu Darim Marker" },
        { mutation: "J-Z20777", name_ar: "تحور العبادل", name_en: "Al-Abadil Marker" },
        { mutation: "J-BY37877", name_ar: "التحور الطرفي لآل بوعبيد", name_en: "Al Bu Obaid Terminal Mutation" }
      ],
      chronology_milestones: [
        { mutation: "J-Z20775", age_years: 1850, date_range: "200 م — العصر الجاهلي", note_ar: "السلف المشترك لفرع دارم من بني تميم" },
        { mutation: "J-Z20777", age_years: 1400, date_range: "600 م — صدر الإسلام", note_ar: "السلف المشترك لفرع العبادل" },
        { mutation: "J-BY37877", age_years: 400, date_range: "1600 م — استقرار الأحساء", note_ar: "التحور الطرفي لأسرة آل بوعبيد" }
      ],
      allied_families: [
        { name_ar: "آل بوعبيد", name_en: "Al Bu Obaid", region_ar: "المبرز، الأحساء", confirmed_samples: 28 },
        { name_ar: "آل عثمان (بني تميم)", name_en: "Al Othman", region_ar: "الأحساء والشرقية", confirmed_samples: 10 },
        { name_ar: "آل بن دروش", name_en: "Al Darwish", region_ar: "الأحساء", confirmed_samples: 6 }
      ],
      country_distributions: [
        { country_ar: "المملكة العربية السعودية", country_en: "Saudi Arabia", samples_count: 78, regions_ar: "الأحساء، الشرقية، الرياض", note_ar: "التكتل الأكبر الموثق" },
        { country_ar: "الكويت", country_en: "Kuwait", samples_count: 10, regions_ar: "مدينة الكويت، حولي", note_ar: "عينات موثقة لفروع الأسرة" },
        { country_ar: "قطر والبحرين", country_en: "Qatar & Bahrain", samples_count: 6, regions_ar: "الدوحة، المنامة", note_ar: "فروع تجارية وتاريخية" }
      ]
    })},
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000003',
    'governance',
    'board_of_trustees',
    ${escapeJson(boardOfTrustees)},
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000004',
    'governance',
    'committees',
    ${escapeJson(committees)},
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000005',
    'governance',
    'founding_members',
    ${escapeJson(foundingMembers)},
    true, now()
  ),
  (
    '5e000000-0000-0000-0000-000000000006',
    'cms_homepage',
    'homepage_sections_config',
    ${escapeJson([
      { id: "hero", name_ar: "القسم الترحيبي والافتتاحية", name_en: "Hero & Welcome", enabled: true, order: 1, title_ar: "صندوق التنمية العائلية (آل بوعبيد)", subtitle_ar: "أسرة عريقة، جذور تميمية، وحضور مؤسسي معاصر." },
      { id: "dean_address", name_ar: "كلمة عميد الأسرة", name_en: "Dean's Address", enabled: true, order: 2, title_ar: "كلمة عميد الأسرة", subtitle_ar: "أحمد بن عبد الله بن صالح آل بوعبيد" },
      { id: "vital_stats", name_ar: "أرقام ومؤشرات الصندوق", name_en: "Vital Statistics", enabled: true, order: 3, title_ar: "أرقام وإحصائيات الكيان الموثقة", subtitle_ar: "ترخيص رسمي، فروع سبعة، ومئات الأفراد" },
      { id: "branches_grid", name_ar: "شبكة الفروع السبعة", name_en: "Seven Branches Grid", enabled: true, order: 4, title_ar: "الفروع السبعة", subtitle_ar: "تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن صالح" },
      { id: "interactive_tree", name_ar: "معاينة شجرة الأسرة", name_en: "Interactive Tree Preview", enabled: true, order: 5, title_ar: "المشجرة التفاعلية المعتمدة", subtitle_ar: "شجرة أنساب رقمية متكاملة" },
      { id: "initiatives_hq", name_ar: "المقر الدائم والمبادرات", name_en: "Headquarters & Initiatives", enabled: true, order: 6, title_ar: "مشروع المقر الدائم والمبادرات", subtitle_ar: "استثمار مستدام يجمع أجيال الأسرة" },
      { id: "news_feed", name_ar: "شريط الأخبار والبيانات", name_en: "News & Bulletins", enabled: true, order: 7, title_ar: "الأخبار والبيانات الرسمية", subtitle_ar: "تصدر عن أمانة المجلس العام" },
      { id: "events_schedule", name_ar: "جدول الفعاليات والملتقيات", name_en: "Events & Gatherings", enabled: true, order: 8, title_ar: "الفعاليات والملتقيات القادمة", subtitle_ar: "حضور ومشاركة أفراد العائلة" },
      { id: "heritage_gallery", name_ar: "معرض التراث والوثائق", name_en: "Heritage & Document Gallery", enabled: true, order: 9, title_ar: "الأرشيف التراثي والمخطوطات", subtitle_ar: "وثائق محاكم شرعية ومخطوطات نادرة" },
      { id: "contact_inquiry", name_ar: "نموذج التواصل السريع", name_en: "Contact & Inquiry", enabled: true, order: 10, title_ar: "تواصل مع أمانة المجلس", subtitle_ar: "نسعد باستقبال استفساراتكم وملاحظاتكم" }
    ])},
    true, now()
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();\n`;

// 11. SEED ANNOUNCEMENTS & EVENTS
sql += "\n-- 11. Announcements & Events\n";
sql += `INSERT INTO public.announcements (
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
) ON CONFLICT (id) DO UPDATE SET title_ar = EXCLUDED.title_ar;\n`;

sql += `INSERT INTO public.events (
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
) ON CONFLICT (slug) DO UPDATE SET title_ar = EXCLUDED.title_ar;\n`;

sql += "\nCOMMIT;\n";

import { writeFileSync } from "fs";
writeFileSync("./scripts/seed_full_db.sql", sql);
console.log("Accurate SQL seed file generated: scripts/seed_full_db.sql");
