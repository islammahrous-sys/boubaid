-- Fix CRITICAL-2: Scope avatar uploads to the user's own folder.
-- The existing avatars_user_insert policy allowed any authenticated user to upload to
-- any path in the avatars bucket. This tightens it so a user can only write to
-- a folder named after their own user ID, preventing one user from overwriting
-- another user's avatar.
DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
CREATE POLICY "avatars_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
