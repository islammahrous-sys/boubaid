
-- Family council review (2026-09-02) — homepage section title/copy adjustments.
-- about_dean:      "كلمة عمادة الأسرة ومجلس الأمناء" -> "كلمة مجلس الأسرة"
-- latest_news:     "المركز الإعلامي وأخبار المجلس"    -> "المركز الإعلامي" (subtitle removed)
-- family_achievers:"من كفاءات الأسرة"                 -> "من كفاءات ومتميزين الأسرة"
-- initiatives_hq:  "مشروع المقر الدائم والمبادرات"     -> "مشروع مقر مجلس الأسرة"
update public.site_settings
set value = jsonb_set(
      value,
      '{sections}',
      (
        select jsonb_agg(
          case
            when elem->>'id' = 'about_dean' then elem || jsonb_build_object(
              'title_ar', 'كلمة مجلس الأسرة',
              'title_en', 'Family Council Address'
            )
            when elem->>'id' = 'latest_news' then elem || jsonb_build_object(
              'title_ar', 'المركز الإعلامي',
              'title_en', 'Media Center',
              'subtitle_ar', '',
              'subtitle_en', ''
            )
            when elem->>'id' = 'family_achievers' then elem || jsonb_build_object(
              'title_ar', 'من كفاءات ومتميزين الأسرة',
              'title_en', 'The Family''s Achievers & Distinguished Members',
              'subtitle_ar', 'أبرز الأعلام والكفاءات والمتميزين الموثقين في سجل تميز الأسرة.'
            )
            when elem->>'id' = 'initiatives_hq' then elem || jsonb_build_object(
              'title_ar', 'مشروع مقر مجلس الأسرة',
              'title_en', 'Family Council Headquarters Project'
            )
            else elem
          end
          order by ord
        )
        from jsonb_array_elements(value->'sections') with ordinality as t(elem, ord)
      )
    ),
    updated_at = now()
where key = 'homepage_sections_config';
