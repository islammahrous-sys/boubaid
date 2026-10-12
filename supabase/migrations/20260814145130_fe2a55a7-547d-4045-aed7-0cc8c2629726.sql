create or replace function private.is_member(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create policy profiles_select_directory on public.profiles
  for select to authenticated
  using (show_in_directory and private.is_member(auth.uid()));