-- 1. Gallery media: drop the blanket public read that overrode the scoped policy.
DROP POLICY IF EXISTS "gallery_media_read" ON public.gallery_media;

-- 2. Family relationships: scope reads to the visibility of the linked members.
DROP POLICY IF EXISTS "family_rel_read" ON public.family_relationships;

CREATE POLICY "family_rel_public_read" ON public.family_relationships
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members m
      WHERE m.id = family_relationships.person_id
        AND m.visibility = 'public'::visibility_level
        AND m.status = 'published'::record_status
        AND m.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.family_members m
      WHERE m.id = family_relationships.related_person_id
        AND m.visibility = 'public'::visibility_level
        AND m.status = 'published'::record_status
        AND m.deleted_at IS NULL
    )
  );

CREATE POLICY "family_rel_family_read" ON public.family_relationships
  FOR SELECT TO authenticated
  USING (
    private.is_member(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.family_members m
      WHERE m.id = family_relationships.person_id
        AND m.visibility = ANY (ARRAY['public'::visibility_level, 'family_only'::visibility_level])
        AND m.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.family_members m
      WHERE m.id = family_relationships.related_person_id
        AND m.visibility = ANY (ARRAY['public'::visibility_level, 'family_only'::visibility_level])
        AND m.deleted_at IS NULL
    )
  );

CREATE POLICY "family_rel_admin_read" ON public.family_relationships
  FOR SELECT TO authenticated
  USING (private.can_manage_family(auth.uid()));

-- 3. Audit logs: only staff may write, and only as themselves.
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND (
      private.can_edit(auth.uid())
      OR private.can_edit_content(auth.uid())
      OR private.can_manage_family(auth.uid())
      OR private.can_manage_users(auth.uid())
      OR private.can_treasury(auth.uid())
      OR private.can_view_inquiries(auth.uid())
    )
  );