
-- Live family statistics for public pages (anon has no direct read on
-- family_members, so this SECURITY DEFINER function is the single source of
-- truth for the "documented members" figures shown on /branches, /family-tree
-- and the homepage).
create or replace function public.family_public_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total',        (select count(*) from public.family_members where deleted_at is null),
    'living',       (select count(*) from public.family_members where deleted_at is null and is_living is true),
    'unassigned',   (select count(*) from public.family_members where deleted_at is null and branch_id is null),
    'generations',  (select coalesce(max(generation), 0) from public.family_members where deleted_at is null),
    'relationships',(select count(*) from public.family_relationships),
    'branch_count', (select count(*) from public.branches),
    'by_branch', (
      select coalesce(jsonb_object_agg(slug, cnt), '{}'::jsonb)
      from (
        select b.slug,
               count(m.id) filter (where m.deleted_at is null) as cnt
        from public.branches b
        left join public.family_members m on m.branch_id = b.id
        group by b.slug
      ) t
    )
  );
$$;

revoke all on function public.family_public_stats() from public;
grant execute on function public.family_public_stats() to anon, authenticated, service_role;
