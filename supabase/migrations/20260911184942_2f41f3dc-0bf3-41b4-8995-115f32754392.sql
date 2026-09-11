UPDATE public.services SET title_ar = 'الاستشارات القانونية والتحكيم القانوني الدولي', title_en = 'Legal Consultancy and International Legal Arbitration', updated_at = now() WHERE slug = 'legal-consultancy';

UPDATE public.services SET title_ar = 'الاستشارات المؤسسية وتصميم المواقع الإلكترونية وإنشاؤها', title_en = 'Business Consultancy and Website Creation and Design', updated_at = now() WHERE slug = 'business-development-web-design';

UPDATE public.services SET title_ar = 'تصميم شجرات العائلة', title_en = 'Family Trees Design', updated_at = now() WHERE slug = 'family-tree-design';

UPDATE public.services SET title_ar = 'تصميم شجرات العائلة الإلكترونية والرقمية', title_en = 'Electronic / Digital Family Trees Design', updated_at = now() WHERE slug = 'digital-family-tree';

UPDATE public.services SET sort_order = 5, updated_at = now() WHERE slug = 'al-abadel-bisht';
UPDATE public.services SET sort_order = 6, updated_at = now() WHERE slug = 'al-abadel-oud';

INSERT INTO public.services (slug, category, title_ar, title_en, description_ar, description_en, sort_order, is_published)
VALUES ('purchase-family-tree', 'establishment', 'اقتناء شجرة العائلة', 'Purchasing the Family Tree',
        'إتاحة اقتناء نسخ شجرة العائلة المعتمدة بأحجام وإطارات متعددة عبر متجر الأسرة الرسمي.',
        'Order authorised copies of the family tree in a range of sizes and frames through the official family store.',
        4, true)
ON CONFLICT (slug) DO NOTHING;