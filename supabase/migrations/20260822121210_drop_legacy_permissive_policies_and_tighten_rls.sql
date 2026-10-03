-- Remove legacy duplicate RLS policies that were superseded by properly-scoped
-- policies but never cleaned up, leaving an unconditional "true" path alongside
-- the correct one (permissive policies are OR'd, so the broad one wins).

-- 1. profiles: "Public Read Profiles" (USING true) let anyone read every
--    member's phone/email/lineage_notes regardless of show_in_directory.
--    profiles_select_own / profiles_select_admin / profiles_select_directory
--    already cover every legitimate read path.
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;

-- Redundant exact duplicate of profiles_update_own; drop for consistency.
DROP POLICY IF EXISTS "Users Can Update Own Profile" ON public.profiles;

-- 2. contributions: "Users Can Insert Contributions" (WITH CHECK true) let
--    anyone (including anon) insert a contribution row attributed to any
--    user_id, with any status. contributions_insert_own already enforces
--    user_id = auth.uid() for authenticated inserts.
DROP POLICY IF EXISTS "Users Can Insert Contributions" ON public.contributions;

-- 3. family_members: "Public Read Family Members" (USING deleted_at IS NULL
--    only) exposed draft/family_only/admin_only/private records to anon.
--    family_members_public_read already scopes to
--    visibility='public' AND status='published' AND deleted_at IS NULL.
DROP POLICY IF EXISTS "Public Read Family Members" ON public.family_members;

-- 4. content_sections: public read only checked the section's own
--    visibility, not whether its parent page is actually published/public.
--    A section marked visibility='public' on a draft/deleted page was
--    directly readable via PostgREST. Join back to the parent page.
DROP POLICY IF EXISTS "sections_public_read" ON public.content_sections;
CREATE POLICY "sections_public_read" ON public.content_sections
  FOR SELECT
  TO anon, authenticated
  USING (
    visibility = 'public'::visibility_level
    AND EXISTS (
      SELECT 1 FROM public.content_pages p
      WHERE p.id = content_sections.page_id
        AND p.status = 'published'::record_status
        AND p.visibility = 'public'::visibility_level
        AND p.deleted_at IS NULL
    )
  );

-- 5. Missing data-integrity CHECK/UNIQUE constraints.
ALTER TABLE public.contributions
  ADD CONSTRAINT contributions_amount_positive CHECK (amount > 0);

ALTER TABLE public.events
  ADD CONSTRAINT events_end_after_start CHECK (end_at IS NULL OR start_at IS NULL OR end_at > start_at);

ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_unique_email_per_event UNIQUE (event_id, email);
