-- 1. Announcements: canonical 'published' status only for public reads
UPDATE public.announcements SET status = 'published' WHERE status = 'active';

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
DROP POLICY IF EXISTS ann_public_read ON public.announcements;
CREATE POLICY ann_public_read ON public.announcements
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- 2. Avatars storage: enforce per-user folder ownership on all writes
DROP POLICY IF EXISTS avatars_user_write ON storage.objects;
DROP POLICY IF EXISTS avatars_user_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_user_update ON storage.objects;
DROP POLICY IF EXISTS avatars_user_delete ON storage.objects;

CREATE POLICY avatars_user_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY avatars_user_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY avatars_user_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- 3. SECURITY DEFINER helpers: remove PUBLIC/anon execute, keep authenticated + service_role
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prosecdef AND n.nspname IN ('public', 'private')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %I.%I(%s) FROM PUBLIC, anon',
                   fn.nspname, fn.proname, fn.args);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION private.can_edit_content(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_family(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_users(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_view_inquiries(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_permission(uuid, text) TO authenticated, service_role;