-- 1. avatars_user_write allowed ANY authenticated user to overwrite/delete ANY
--    other member's avatar object (no ownership check at all, unlike every
--    other user-writable bucket in this schema, e.g. receipts). Split the
--    single ALL policy into scoped insert/update/delete: any authenticated
--    user may upload a new object (Storage sets `owner` to auth.uid()
--    automatically), but modifying/removing an existing object now requires
--    actually owning it.
DROP POLICY IF EXISTS "avatars_user_write" ON storage.objects;

CREATE POLICY "avatars_user_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_user_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "avatars_user_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

-- 2. The `content` bucket's own code comment (content-media.server.ts) states
--    "Media for CMS rows lives in the private `content` bucket... reads are
--    served as signed URLs... so no storage-level policies are needed" -- but
--    the bucket was actually created with public=true, so the signed-URL
--    access control was silently bypassable via the public object endpoint.
--    Flip it to private to match the design the code already assumes.
UPDATE storage.buckets SET public = false WHERE id = 'content';
