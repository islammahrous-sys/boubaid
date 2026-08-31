DROP VIEW IF EXISTS public.family_members_public;
DROP VIEW IF EXISTS public.family_relationships_public;

CREATE OR REPLACE FUNCTION public.get_public_family_members()
RETURNS TABLE (
  id uuid,
  first_name_ar text, middle_name_ar text, last_name_ar text, display_name_ar text,
  first_name_en text, middle_name_en text, last_name_en text, display_name_en text,
  slug text, gender gender,
  date_of_birth date, date_of_death date, is_living boolean,
  biography_ar text, biography_en text,
  occupation_ar text, occupation_en text, education_ar text, education_en text,
  birth_place_id uuid, current_place_id uuid, branch_id uuid,
  avatar_path text, cover_path text, generation integer, sort_order integer,
  visibility visibility_level, status record_status,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.first_name_ar, m.middle_name_ar, m.last_name_ar, m.display_name_ar,
    m.first_name_en, m.middle_name_en, m.last_name_en, m.display_name_en,
    m.slug, m.gender,
    CASE WHEN COALESCE(p.show_dob, true) THEN m.date_of_birth END,
    CASE WHEN COALESCE(p.show_dob, true) THEN m.date_of_death END,
    m.is_living,
    CASE WHEN COALESCE(p.show_biography, true) THEN m.biography_ar END,
    CASE WHEN COALESCE(p.show_biography, true) THEN m.biography_en END,
    m.occupation_ar, m.occupation_en, m.education_ar, m.education_en,
    m.birth_place_id, m.current_place_id, m.branch_id,
    m.avatar_path, m.cover_path, m.generation, m.sort_order,
    m.visibility, m.status, m.created_at, m.updated_at
  FROM public.family_members m
  LEFT JOIN public.family_member_privacy p ON p.member_id = m.id
  WHERE m.visibility = 'public'::visibility_level
    AND m.status = 'published'::record_status
    AND m.deleted_at IS NULL
  ORDER BY m.generation, m.sort_order;
$$;

CREATE OR REPLACE FUNCTION public.get_public_family_relationships()
RETURNS TABLE (
  id uuid,
  person_id uuid,
  related_person_id uuid,
  relationship_type relationship_type
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.person_id, r.related_person_id, r.relationship_type
  FROM public.family_relationships r
  JOIN public.family_members a ON a.id = r.person_id
  LEFT JOIN public.family_member_privacy pa ON pa.member_id = a.id
  JOIN public.family_members b ON b.id = r.related_person_id
  LEFT JOIN public.family_member_privacy pb ON pb.member_id = b.id
  WHERE a.visibility = 'public'::visibility_level AND a.status = 'published'::record_status AND a.deleted_at IS NULL
    AND b.visibility = 'public'::visibility_level AND b.status = 'published'::record_status AND b.deleted_at IS NULL
    AND COALESCE(pa.show_relationships, true)
    AND COALESCE(pb.show_relationships, true);
$$;

REVOKE ALL ON FUNCTION public.get_public_family_members() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_family_relationships() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_family_members() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_family_relationships() TO anon, authenticated;