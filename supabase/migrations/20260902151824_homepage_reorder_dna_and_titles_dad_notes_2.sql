
-- Family-council review (round 2, 2026-09-02):
--  * move the DNA / genetic-lineage section directly under "الفروع السبعة"
--  * "المبادرات الجارية" -> "المبادرات والبرامج" (final wording pending)
--  * homepage contact heading -> "تواصل مع رئيس المجلس"
update public.site_settings
set value = jsonb_set(
      value,
      '{sections}',
      (
        select jsonb_agg(
          (
            case elem->>'id'
              when 'dna_preview'      then jsonb_set(elem, '{order}', '4')
              when 'initiatives_hq'   then jsonb_set(elem, '{order}', '5')
              when 'latest_news'      then jsonb_set(elem, '{order}', '6')
              when 'family_achievers' then jsonb_set(elem, '{order}', '7')
              when 'initiatives_list' then jsonb_set(elem, '{order}', '8')
              else elem
            end
          )
          ||
          (
            case elem->>'id'
              when 'initiatives_list' then jsonb_build_object(
                'title_ar', 'المبادرات والبرامج',
                'title_en', 'Initiatives & Programmes'
              )
              when 'contact_inquiry' then jsonb_build_object(
                'title_ar', 'تواصل مع رئيس المجلس',
                'title_en', 'Contact the Council Chairman'
              )
              else '{}'::jsonb
            end
          )
          order by
            case elem->>'id'
              when 'dna_preview'      then 4
              when 'initiatives_hq'   then 5
              when 'latest_news'      then 6
              when 'family_achievers' then 7
              when 'initiatives_list' then 8
              else (elem->>'order')::int
            end
        )
        from jsonb_array_elements(value->'sections') elem
      )
    ),
    updated_at = now()
where key = 'homepage_sections_config';
