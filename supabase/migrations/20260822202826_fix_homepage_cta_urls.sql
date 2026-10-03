-- upcoming_events and latest_news homepage sections had cta_url pointing at
-- /content (the admin-only CMS editor route) instead of the real public
-- destination pages that now exist for both.
update site_settings
set value = jsonb_set(
  jsonb_set(
    value,
    '{sections}',
    (
      select jsonb_agg(
        case
          when elem->>'id' = 'upcoming_events' then jsonb_set(elem, '{cta_url}', '"/events"')
          when elem->>'id' = 'latest_news' then jsonb_set(elem, '{cta_url}', '"/news"')
          else elem
        end
      )
      from jsonb_array_elements(value->'sections') as elem
    )
  ),
  '{updated_at}',
  to_jsonb(now())
)
where category = 'homepage_sections_config' or key = 'homepage_sections_config';
