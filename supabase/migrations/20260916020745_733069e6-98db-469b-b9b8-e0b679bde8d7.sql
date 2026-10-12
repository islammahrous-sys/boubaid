-- Business listing submissions now go exclusively through the rate-limited,
-- schema-validated `submitBusinessListing` server function (service role),
-- so the direct anon/authenticated INSERT path is no longer needed.
drop policy if exists "businesses_public_submit" on public.businesses;

-- Private buckets: complete the write rules so owners/staff can correct
-- their own uploads instead of leaving update/delete unpoliced.
create policy "receipts owner update"
  on storage.objects for update to authenticated
  using (bucket_id = 'receipts' and (owner = auth.uid() or private.can_treasury(auth.uid())))
  with check (bucket_id = 'receipts' and (owner = auth.uid() or private.can_treasury(auth.uid())));

create policy "receipts staff delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and private.can_treasury(auth.uid()));

create policy "nomination_docs_staff_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'nomination-docs' and (private.has_permission(auth.uid(), 'cms.manage') or private.has_permission(auth.uid(), 'admin.all')));