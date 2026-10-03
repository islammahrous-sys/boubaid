-- Atomic content_sections replace + revision restore.
--
-- Context: the CMS page builder previously saved a page's blocks by running
-- a DELETE followed by a separate INSERT from the application (two distinct
-- PostgREST requests). If the INSERT failed after the DELETE succeeded, the
-- page was left with zero sections and no way to recover except from a
-- revision snapshot read back out by hand. Wrapping both statements inside a
-- single PL/pgSQL function makes them part of one implicit transaction: a
-- failure anywhere inside the function rolls back the whole call, so a page
-- can never be left half-deleted.
--
-- Both functions are SECURITY INVOKER (the default) so they run as the
-- calling (authenticated) role and remain fully subject to the existing RLS
-- policies on content_sections / content_revisions (`*_editor_all`, gated by
-- private.can_edit_content(auth.uid())) -- these functions grant no
-- privilege the caller didn't already have via RLS.

set check_function_bodies = off;

create or replace function public.replace_content_page_sections(
  p_page_id uuid,
  p_sections jsonb
)
returns setof content_sections
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_page_id is null then
    raise exception 'page_id_required';
  end if;

  delete from content_sections where page_id = p_page_id;

  insert into content_sections (page_id, type, sort_order, data, settings, visibility)
  select
    p_page_id,
    (elem->>'type')::text,
    coalesce((elem->>'sort_order')::int, (ord - 1)::int),
    coalesce(elem->'data', '{}'::jsonb),
    coalesce(elem->'settings', '{}'::jsonb),
    coalesce(nullif(elem->>'visibility', '')::visibility_level, 'public'::visibility_level)
  from jsonb_array_elements(coalesce(p_sections, '[]'::jsonb)) with ordinality as t(elem, ord);

  return query select * from content_sections where page_id = p_page_id order by sort_order;
end;
$$;

revoke all on function public.replace_content_page_sections(uuid, jsonb) from public;
grant execute on function public.replace_content_page_sections(uuid, jsonb) to authenticated;

create or replace function public.restore_content_revision(
  p_revision_id uuid
)
returns setof content_sections
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_page_id uuid;
  v_snapshot jsonb;
  v_sections jsonb;
  v_next_version int;
  v_summary text;
  v_actor uuid;
begin
  select content_page_id, snapshot, version
    into v_page_id, v_snapshot, v_next_version
  from content_revisions
  where id = p_revision_id;

  if v_page_id is null then
    raise exception 'revision_not_found';
  end if;

  v_sections := coalesce(v_snapshot->'sections', '[]'::jsonb);
  v_actor := auth.uid();

  delete from content_sections where page_id = v_page_id;

  insert into content_sections (page_id, type, sort_order, data, settings, visibility)
  select
    v_page_id,
    (elem->>'type')::text,
    coalesce((elem->>'sort_order')::int, (ord - 1)::int),
    coalesce(elem->'data', '{}'::jsonb),
    coalesce(elem->'settings', '{}'::jsonb),
    coalesce(nullif(elem->>'visibility', '')::visibility_level, 'public'::visibility_level)
  from jsonb_array_elements(v_sections) with ordinality as t(elem, ord);

  select coalesce(max(version), 0) + 1 into v_next_version
  from content_revisions where content_page_id = v_page_id;

  v_summary := format('Restored from version %s', (select version from content_revisions where id = p_revision_id));

  insert into content_revisions (content_page_id, version, snapshot, change_summary, created_by)
  values (v_page_id, v_next_version, jsonb_build_object('sections', v_sections), v_summary, v_actor);

  return query select * from content_sections where page_id = v_page_id order by sort_order;
end;
$$;

revoke all on function public.restore_content_revision(uuid) from public;
grant execute on function public.restore_content_revision(uuid) to authenticated;
