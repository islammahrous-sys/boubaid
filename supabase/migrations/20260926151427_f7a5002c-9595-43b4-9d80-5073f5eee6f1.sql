DELETE FROM public.navigation_items
WHERE url = '/competitions'
   OR lower(trim(coalesce(label_en, ''))) IN ('competitions & awards', 'competitions and awards')
   OR regexp_replace(trim(coalesce(label_ar, '')), '\s+', '', 'g') = 'المسابقاتوالجوائز';