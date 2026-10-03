
-- Private bucket for certificates attached to public achiever nominations.
-- Files are written server-side by submitAchieverNomination via the
-- service-role client (which bypasses RLS); anon/authenticated get no write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nomination-docs',
  'nomination-docs',
  false,
  10485760, -- 10 MB
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Console reviewers (content editors / secretariat) can read the files.
drop policy if exists "nomination_docs_staff_read" on storage.objects;
create policy "nomination_docs_staff_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'nomination-docs' and private.can_edit_content(auth.uid()));
