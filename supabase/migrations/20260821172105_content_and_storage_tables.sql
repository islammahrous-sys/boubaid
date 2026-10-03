-- ============ helper: editor-or-admin ============
create or replace function private.can_edit(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create or replace function private.can_treasury(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','treasurer'))
$$;

-- ============ news_posts ============
create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null default 'fund',
  title_ar text not null,
  title_en text,
  excerpt_ar text,
  excerpt_en text,
  body_ar text,
  body_en text,
  hijri_date text,
  gregorian_date text,
  cover_path text,
  is_published boolean not null default false,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.news_posts to anon;
grant select, insert, update, delete on public.news_posts to authenticated;
grant all on public.news_posts to service_role;
alter table public.news_posts enable row level security;
create policy news_public_read on public.news_posts for select to anon, authenticated using (is_published);
create policy news_editor_read on public.news_posts for select to authenticated using (private.can_edit(auth.uid()));
create policy news_editor_insert on public.news_posts for insert to authenticated with check (private.can_edit(auth.uid()));
create policy news_editor_update on public.news_posts for update to authenticated using (private.can_edit(auth.uid())) with check (private.can_edit(auth.uid()));
create policy news_editor_delete on public.news_posts for delete to authenticated using (private.can_edit(auth.uid()));
create trigger news_posts_set_updated_at before update on public.news_posts for each row execute function public.set_updated_at();

-- ============ initiatives ============
create table public.initiatives (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'ongoing',
  title_ar text not null,
  title_en text,
  summary_ar text,
  summary_en text,
  body_ar text,
  body_en text,
  cover_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.initiatives to anon;
grant select, insert, update, delete on public.initiatives to authenticated;
grant all on public.initiatives to service_role;
alter table public.initiatives enable row level security;
create policy initiatives_public_read on public.initiatives for select to anon, authenticated using (is_published);
create policy initiatives_editor_read on public.initiatives for select to authenticated using (private.can_edit(auth.uid()));
create policy initiatives_editor_insert on public.initiatives for insert to authenticated with check (private.can_edit(auth.uid()));
create policy initiatives_editor_update on public.initiatives for update to authenticated using (private.can_edit(auth.uid())) with check (private.can_edit(auth.uid()));
create policy initiatives_editor_delete on public.initiatives for delete to authenticated using (private.can_edit(auth.uid()));
create trigger initiatives_set_updated_at before update on public.initiatives for each row execute function public.set_updated_at();

-- ============ achievers ============
create table public.achievers (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  field_ar text,
  field_en text,
  achievement_ar text,
  achievement_en text,
  category text not null default 'academic',
  branch_ar text,
  branch_en text,
  image_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.achievers to anon;
grant select, insert, update, delete on public.achievers to authenticated;
grant all on public.achievers to service_role;
alter table public.achievers enable row level security;
create policy achievers_public_read on public.achievers for select to anon, authenticated using (is_published);
create policy achievers_editor_read on public.achievers for select to authenticated using (private.can_edit(auth.uid()));
create policy achievers_editor_insert on public.achievers for insert to authenticated with check (private.can_edit(auth.uid()));
create policy achievers_editor_update on public.achievers for update to authenticated using (private.can_edit(auth.uid())) with check (private.can_edit(auth.uid()));
create policy achievers_editor_delete on public.achievers for delete to authenticated using (private.can_edit(auth.uid()));
create trigger achievers_set_updated_at before update on public.achievers for each row execute function public.set_updated_at();

-- ============ library_items ============
create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null default 'documents',
  title_ar text not null,
  title_en text,
  description_ar text,
  description_en text,
  year integer,
  kind text,
  reference text,
  file_path text,
  external_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.library_items to anon;
grant select, insert, update, delete on public.library_items to authenticated;
grant all on public.library_items to service_role;
alter table public.library_items enable row level security;
create policy library_public_read on public.library_items for select to anon, authenticated using (is_published);
create policy library_editor_read on public.library_items for select to authenticated using (private.can_edit(auth.uid()));
create policy library_editor_insert on public.library_items for insert to authenticated with check (private.can_edit(auth.uid()));
create policy library_editor_update on public.library_items for update to authenticated using (private.can_edit(auth.uid())) with check (private.can_edit(auth.uid()));
create policy library_editor_delete on public.library_items for delete to authenticated using (private.can_edit(auth.uid()));
create trigger library_items_set_updated_at before update on public.library_items for each row execute function public.set_updated_at();

-- ============ branches ============
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text,
  description_ar text,
  description_en text,
  elder_ar text,
  elder_en text,
  image_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.branches to anon;
grant select, insert, update, delete on public.branches to authenticated;
grant all on public.branches to service_role;
alter table public.branches enable row level security;
create policy branches_public_read on public.branches for select to anon, authenticated using (is_published);
create policy branches_editor_read on public.branches for select to authenticated using (private.can_edit(auth.uid()));
create policy branches_editor_insert on public.branches for insert to authenticated with check (private.can_edit(auth.uid()));
create policy branches_editor_update on public.branches for update to authenticated using (private.can_edit(auth.uid())) with check (private.can_edit(auth.uid()));
create policy branches_editor_delete on public.branches for delete to authenticated using (private.can_edit(auth.uid()));
create trigger branches_set_updated_at before update on public.branches for each row execute function public.set_updated_at();

-- ============ contributions ============
create type contribution_status as enum ('pending','verified','rejected');

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contributor_name text not null,
  email text,
  phone text,
  amount numeric(12,2) not null,
  currency text not null default 'SAR',
  method text not null default 'bank_transfer',
  purpose text,
  reference text,
  receipt_path text,
  status contribution_status not null default 'pending',
  review_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.contributions to authenticated;
grant all on public.contributions to service_role;
alter table public.contributions enable row level security;
create policy contributions_insert_own on public.contributions for insert to authenticated with check (user_id = auth.uid());
create policy contributions_select_own on public.contributions for select to authenticated using (user_id = auth.uid());
create policy contributions_select_treasury on public.contributions for select to authenticated using (private.can_treasury(auth.uid()));
create policy contributions_update_treasury on public.contributions for update to authenticated using (private.can_treasury(auth.uid())) with check (private.can_treasury(auth.uid()));
create trigger contributions_set_updated_at before update on public.contributions for each row execute function public.set_updated_at();

-- ============ storage buckets ============
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false) on conflict (id) do nothing;

-- ============ storage object policies ============
create policy "media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media editor write" on storage.objects for insert to authenticated with check (bucket_id = 'media' and private.can_edit(auth.uid()));
create policy "media editor update" on storage.objects for update to authenticated using (bucket_id = 'media' and private.can_edit(auth.uid()));
create policy "media editor delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and private.can_edit(auth.uid()));

create policy "receipts owner read" on storage.objects for select to authenticated using (bucket_id = 'receipts' and (owner = auth.uid() or private.can_treasury(auth.uid())));
create policy "receipts owner write" on storage.objects for insert to authenticated with check (bucket_id = 'receipts' and owner = auth.uid());
