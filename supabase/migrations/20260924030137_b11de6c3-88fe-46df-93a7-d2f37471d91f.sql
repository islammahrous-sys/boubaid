DROP POLICY IF EXISTS permissions_read ON public.permissions;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (private.can_manage_users(auth.uid()));
DROP POLICY IF EXISTS role_permissions_read ON public.role_permissions;
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (private.can_manage_users(auth.uid()));

DROP POLICY IF EXISTS content_public_read ON storage.objects;

DROP POLICY IF EXISTS "galleries bucket public read" ON storage.objects;
DROP POLICY IF EXISTS galleries_public_read ON storage.objects;
CREATE POLICY galleries_public_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'galleries' AND private.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS "media public read" ON storage.objects;
CREATE POLICY "media public read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media' AND private.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS site_media_public_read ON storage.objects;
CREATE POLICY site_media_public_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'site-media' AND private.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS family_photos_public_read ON storage.objects;
CREATE POLICY family_photos_public_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'family-photos' AND private.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS docs_public_read_storage ON storage.objects;
CREATE POLICY docs_public_read_storage ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents-public' AND private.can_edit_content(auth.uid()));
DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND (owner = auth.uid() OR private.can_edit_content(auth.uid())));