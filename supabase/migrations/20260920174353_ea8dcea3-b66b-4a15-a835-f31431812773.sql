DELETE FROM public.businesses WHERE true;

DELETE FROM public.news_posts WHERE true;

INSERT INTO public.news_posts (
  slug, section, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en,
  hijri_date, gregorian_date, is_published, published_at, sort_order
) VALUES (
  'authorisation-renewal-2026',
  'fund',
  'تجديد التفويض بإدارة الحسابات البنكية لعام 2026',
  'Renewal of the Bank Accounts Management Authorisation for 2026',
  'اعتماد تجديد خطاب التفويض بإدارة الحسابات البنكية لصندوق التنمية العائلية (آل بوعبيد) لعام 2026، وهو منشور ضمن الشهادات والتصاديق.',
  'The renewal of the bank accounts management authorisation letter for Al Bu Obaid Family Development Fund for 2026 has been approved and published under Certificates & Attestations.',
  'يعلن مجلس أسرة آل بوعبيد عن اعتماد تجديد خطاب التفويض الخاص بإدارة الحسابات البنكية للصندوق لعام 2026، استكمالًا لمتطلبات الحوكمة المالية والامتثال النظامي. ويتيح هذا التجديد استمرار إدارة الحسابات البنكية المعتمدة وفق الضوابط المقررة، مع حجب أرقام الهوية في الخطاب المنشور. ويمكن الاطلاع على الخطاب الرسمي ضمن قسم الشهادات والتصاديق في صفحة صندوق التنمية العائلية.',
  'The Al Bu Obaid Family Council announces the approval of the renewal of the Fund''s bank accounts management authorisation letter for 2026, in line with financial governance and regulatory compliance requirements. The renewal allows the continued management of the approved bank accounts under the established controls, with ID numbers redacted in the published letter. The official letter is available in the Certificates & Attestations section of the Family Development Fund page.',
  '1447',
  '2026',
  true,
  now(),
  1
);