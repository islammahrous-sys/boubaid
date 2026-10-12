-- Lets a visitor express interest in / join a published initiative,
-- mirroring the event_registrations pattern: open INSERT, owner-or-editor
-- SELECT, editor-only ALL for review/status changes.
create table public.initiative_registrations (
  id uuid primary key default gen_random_uuid(),
  initiative_id uuid not null references public.initiatives(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'new',
  registered_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint initiative_registrations_unique_email_per_initiative unique (initiative_id, email)
);

alter table public.initiative_registrations enable row level security;

create policy "init_reg_insert" on public.initiative_registrations
  for insert to anon, authenticated
  with check (true);

create policy "init_reg_user_read" on public.initiative_registrations
  for select to authenticated
  using (registered_by = auth.uid() or private.can_edit(auth.uid()));

create policy "init_reg_admin_update" on public.initiative_registrations
  for all to authenticated
  using (private.can_edit(auth.uid()));
