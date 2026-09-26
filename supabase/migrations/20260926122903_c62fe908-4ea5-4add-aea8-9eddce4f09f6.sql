DELETE FROM public.navigation_items WHERE url IN ('/initiatives','/programs');
UPDATE public.navigation_items SET label_ar='المركز الإعلامي', label_en='Media Centre' WHERE url='/news';
UPDATE public.navigation_items SET label_ar='جائزة آل بوعبيد للتفوق العلمي والتميز', label_en='Al Bu Obaid Award for Academic Excellence and Distinction' WHERE url='/achievers';
INSERT INTO public.navigation_items (menu_id, parent_id, label_ar, label_en, url, sort_order, target, type, visibility)
SELECT 'fa000000-0000-0000-0000-000000000001', NULL, 'مجالس أسر الأحساء', 'Al-Ahsa Family Councils', '/ahsa-family-councils', 19, '_self', 'custom', 'public'
WHERE NOT EXISTS (SELECT 1 FROM public.navigation_items WHERE url='/ahsa-family-councils');
UPDATE public.galleries SET sort_order = sort_order + 1 WHERE section='archive' AND parent_id IS NULL AND slug <> 'archive-documents-manuscripts' AND NOT EXISTS (SELECT 1 FROM public.galleries WHERE slug='archive-documents-manuscripts');
INSERT INTO public.galleries (slug, title_ar, title_en, description_ar, description_en, section, status, visibility, sort_order)
SELECT 'archive-documents-manuscripts', 'الوثائق والمخطوطات', 'Documents & Manuscripts',
 'الوثائق التاريخية والمخطوطات الخاصة بأسرة آل بوعبيد.', 'Historical documents and manuscripts of the Al Bu Obaid family.',
 'archive', 'published', 'public', 4
WHERE NOT EXISTS (SELECT 1 FROM public.galleries WHERE slug='archive-documents-manuscripts');