-- 1. Public family members view honouring family_member_privacy flags
CREATE OR REPLACE VIEW public.family_members_public
WITH (security_invoker = off) AS
SELECT
  m.id,
  m.first_name_ar, m.middle_name_ar, m.last_name_ar, m.display_name_ar,
  m.first_name_en, m.middle_name_en, m.last_name_en, m.display_name_en,
  m.slug, m.gender,
  CASE WHEN COALESCE(p.show_dob, true) THEN m.date_of_birth END AS date_of_birth,
  CASE WHEN COALESCE(p.show_dob, true) THEN m.date_of_death END AS date_of_death,
  m.is_living,
  CASE WHEN COALESCE(p.show_biography, true) THEN m.biography_ar END AS biography_ar,
  CASE WHEN COALESCE(p.show_biography, true) THEN m.biography_en END AS biography_en,
  m.occupation_ar, m.occupation_en, m.education_ar, m.education_en,
  m.birth_place_id, m.current_place_id, m.branch_id,
  m.avatar_path, m.cover_path, m.generation, m.sort_order,
  m.visibility, m.status, m.created_at, m.updated_at
FROM public.family_members m
LEFT JOIN public.family_member_privacy p ON p.member_id = m.id
WHERE m.visibility = 'public'::visibility_level
  AND m.status = 'published'::record_status
  AND m.deleted_at IS NULL;

GRANT SELECT ON public.family_members_public TO anon, authenticated;

-- 2. Public relationships view honouring show_relationships
CREATE OR REPLACE VIEW public.family_relationships_public
WITH (security_invoker = off) AS
SELECT r.id, r.person_id, r.related_person_id, r.relationship_type, r.created_at
FROM public.family_relationships r
JOIN public.family_members a ON a.id = r.person_id
LEFT JOIN public.family_member_privacy pa ON pa.member_id = a.id
JOIN public.family_members b ON b.id = r.related_person_id
LEFT JOIN public.family_member_privacy pb ON pb.member_id = b.id
WHERE a.visibility = 'public'::visibility_level AND a.status = 'published'::record_status AND a.deleted_at IS NULL
  AND b.visibility = 'public'::visibility_level AND b.status = 'published'::record_status AND b.deleted_at IS NULL
  AND COALESCE(pa.show_relationships, true)
  AND COALESCE(pb.show_relationships, true);

GRANT SELECT ON public.family_relationships_public TO anon, authenticated;

-- 3. Remove unrestricted anonymous access to the base tables
DROP POLICY IF EXISTS family_members_public_read ON public.family_members;
CREATE POLICY family_members_public_read ON public.family_members
  FOR SELECT TO authenticated
  USING (visibility = 'public'::visibility_level
         AND status = 'published'::record_status
         AND deleted_at IS NULL);

DROP POLICY IF EXISTS family_rel_public_read ON public.family_relationships;
CREATE POLICY family_rel_public_read ON public.family_relationships
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.family_members m
            WHERE m.id = family_relationships.person_id
              AND m.visibility = 'public'::visibility_level
              AND m.status = 'published'::record_status
              AND m.deleted_at IS NULL)
    AND EXISTS (SELECT 1 FROM public.family_members m
            WHERE m.id = family_relationships.related_person_id
              AND m.visibility = 'public'::visibility_level
              AND m.status = 'published'::record_status
              AND m.deleted_at IS NULL)
  );

REVOKE SELECT ON public.family_members FROM anon;
REVOKE SELECT ON public.family_relationships FROM anon;

-- 4. Scope media metadata reads to media used by published public content
DROP POLICY IF EXISTS media_assets_public_read ON public.media_assets;
DROP POLICY IF EXISTS media_public_read ON public.media_assets;

CREATE POLICY media_assets_published_read ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gallery_media gm
      JOIN public.galleries g ON g.id = gm.gallery_id
      WHERE gm.media_asset_id = media_assets.id
        AND gm.is_published
        AND g.status = 'published'
        AND g.visibility = 'public'::visibility_level
    )
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.media_asset_id = media_assets.id
        AND d.status = 'published'
        AND d.visibility = 'public'::visibility_level
    )
  );