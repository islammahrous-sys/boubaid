-- =============================================================================
-- Members-only Archive & Family Development Fund; leadership-only Visual Identity
-- =============================================================================
-- STATUS: PENDING REVIEW — deliberately NOT in supabase/migrations so no
-- Lovable/GitHub sync applies it automatically. Apply only after review, in the
-- Supabase SQL editor (or move into supabase/migrations once approved).
--
-- Council "Pages Access" decision enforced at the database:
--   * galleries / gallery_media (Archive + Museum)      -> approved members
--   * library_items, public collections                 -> everyone
--       committee_charts, committee_documents (used by the public /committees page)
--   * library_items, leadership collections             -> council chair, committee
--       visual_identity, templates,                        chairs (site_settings
--       templates_editable, collaterals                    page_access) and admins
--   * library_items, every other published collection   -> approved members
--       (financials, fund_documents, videos, documents, photographs, recordings, …)
-- Editors keep full access through the existing *_editor_* policies (unchanged).
-- The service role (server-side admin client) bypasses RLS as before.
--
-- Mirrors src/lib/page-access.ts (MEMBER_ROLES, PUBLIC_/LEADERSHIP_LIBRARY_COLLECTIONS).
--
-- KNOWN LIMIT (not solved by RLS): files in PUBLIC storage buckets stay reachable
-- by anyone who has the exact file URL. See section 6 for the storage follow-up.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. PRE-FLIGHT (run first, read-only). Save the output — it is your record of
--    the live policies before the change, and the live DB may differ from the
--    repo's migration history.
-- -----------------------------------------------------------------------------
-- SELECT tablename, policyname, cmd, roles, qual
--   FROM pg_policies
--  WHERE schemaname = 'public' AND tablename IN ('library_items','galleries','gallery_media')
--  ORDER BY tablename, policyname;
--
-- SELECT collection, count(*) FROM public.library_items WHERE is_published GROUP BY 1 ORDER BY 1;
-- SELECT section, count(*) FROM public.galleries GROUP BY 1;
-- SELECT role, count(*) FROM public.user_roles GROUP BY 1 ORDER BY 1;
--
-- Expected public read policies to be replaced (any that exist):
--   library_items : library_public_read, "Public Read Library Items"
--   galleries     : galleries_public_read
--   gallery_media : gallery_media_public_read, gallery_media_read


BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Helpers (SECURITY DEFINER, fixed search_path, no args from the client
--    beyond the caller's own uid)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS private;

-- Approved member = holds a role that is only granted after secretariat
-- approval. Unlike private.is_member(), the 'viewer' role does NOT count.
CREATE OR REPLACE FUNCTION private.is_approved_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('member','admin','super_admin','editor','content_manager','family_manager','treasurer')
  )
$$;

-- Council leadership = admin/super_admin, or an approved member whose account
-- email is in site_settings 'page_access'.leadership_emails (managed from the
-- console: Registration -> Page access).
CREATE OR REPLACE FUNCTION private.is_council_leader(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role::text IN ('admin','super_admin')
    )
    OR (
      private.is_approved_member(_user_id)
      AND EXISTS (
        SELECT 1
        FROM public.site_settings s
        JOIN auth.users u ON u.id = _user_id
        WHERE s.key = 'page_access'
          AND jsonb_typeof(s.value -> 'leadership_emails') = 'array'
          AND lower(u.email) IN (
            SELECT lower(e) FROM jsonb_array_elements_text(s.value -> 'leadership_emails') AS e
          )
      )
    )
$$;

REVOKE ALL ON FUNCTION private.is_approved_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_council_leader(uuid) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_approved_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_council_leader(uuid) TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 2. library_items
-- -----------------------------------------------------------------------------
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS library_public_read ON public.library_items;
DROP POLICY IF EXISTS "Public Read Library Items" ON public.library_items;
DROP POLICY IF EXISTS library_public_collections_read ON public.library_items;
DROP POLICY IF EXISTS library_member_read ON public.library_items;
DROP POLICY IF EXISTS library_leadership_read ON public.library_items;

CREATE POLICY library_public_collections_read ON public.library_items
  FOR SELECT TO anon, authenticated
  USING (is_published AND collection IN ('committee_charts','committee_documents'));

CREATE POLICY library_member_read ON public.library_items
  FOR SELECT TO authenticated
  USING (
    is_published
    AND collection NOT IN ('visual_identity','templates','templates_editable','collaterals')
    AND private.is_approved_member((SELECT auth.uid()))
  );

CREATE POLICY library_leadership_read ON public.library_items
  FOR SELECT TO authenticated
  USING (
    is_published
    AND collection IN ('visual_identity','templates','templates_editable','collaterals')
    AND private.is_council_leader((SELECT auth.uid()))
  );


-- -----------------------------------------------------------------------------
-- 3. galleries (Archive + Museum)
-- -----------------------------------------------------------------------------
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS galleries_public_read ON public.galleries;
DROP POLICY IF EXISTS galleries_member_read ON public.galleries;

CREATE POLICY galleries_member_read ON public.galleries
  FOR SELECT TO authenticated
  USING (
    status = 'published' AND visibility = 'public'
    AND private.is_approved_member((SELECT auth.uid()))
  );


-- -----------------------------------------------------------------------------
-- 4. gallery_media
-- -----------------------------------------------------------------------------
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gallery_media_public_read ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_read ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_member_read ON public.gallery_media;

CREATE POLICY gallery_media_member_read ON public.gallery_media
  FOR SELECT TO authenticated
  USING (
    is_published
    AND private.is_approved_member((SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.galleries g
      WHERE g.id = gallery_media.gallery_id AND g.status = 'published' AND g.visibility = 'public'
    )
  );


-- -----------------------------------------------------------------------------
-- 5. Table grants: anon no longer needs to read gallery tables at all.
--    library_items keeps anon SELECT (public collections only, via RLS).
-- -----------------------------------------------------------------------------
REVOKE SELECT ON public.galleries FROM anon;
REVOKE SELECT ON public.gallery_media FROM anon;

COMMIT;


-- -----------------------------------------------------------------------------
-- 6. STORAGE FOLLOW-UP (review separately — NOT executed by this file)
-- -----------------------------------------------------------------------------
-- Archive photos/videos and fund PDFs are served from storage buckets. If a
-- bucket is marked public, its files are downloadable by URL regardless of RLS.
-- Check:
--   SELECT id, public FROM storage.buckets ORDER BY id;
-- For buckets holding archive/fund files, the robust fix is to make the bucket
-- private and have the site issue short-lived signed URLs to members. That is
-- an application change (signed URLs) and is scheduled as a separate task.


-- =============================================================================
-- 7. VERIFICATION (run after COMMIT; every block is read-only and self-cleaning)
-- =============================================================================
-- 7a. Policies now in place
-- SELECT tablename, policyname, roles, qual FROM pg_policies
--  WHERE schemaname='public' AND tablename IN ('library_items','galleries','gallery_media')
--  ORDER BY 1,2;
--
-- 7b. Anonymous visitor: only committee collections, no galleries
-- BEGIN; SET LOCAL ROLE anon;
--   SELECT collection, count(*) FROM public.library_items GROUP BY 1;   -- expect only committee_charts / committee_documents
--   SELECT count(*) FROM public.gallery_media;                          -- expect: permission denied (grant revoked) -> correct
-- ROLLBACK;
-- BEGIN; SET LOCAL ROLE anon; SELECT count(*) FROM public.galleries; ROLLBACK;  -- expect: permission denied
--
-- 7c. Signed-in NON-member (replace the uuid with an account that has no role)
-- BEGIN; SET LOCAL ROLE authenticated;
--   SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}', true);
--   SELECT collection, count(*) FROM public.library_items GROUP BY 1;   -- expect only committee collections
--   SELECT count(*) FROM public.galleries;                              -- expect 0
-- ROLLBACK;
--
-- 7d. Approved member (replace with a uuid that holds the 'member' role)
-- BEGIN; SET LOCAL ROLE authenticated;
--   SELECT set_config('request.jwt.claims', '{"sub":"<member-uuid>","role":"authenticated"}', true);
--   SELECT collection, count(*) FROM public.library_items GROUP BY 1;   -- expect everything EXCEPT the 4 leadership collections
--   SELECT section, count(*) FROM public.galleries GROUP BY 1;          -- expect archive + museum
-- ROLLBACK;
--
-- 7e. Admin (replace with an admin uuid)
-- BEGIN; SET LOCAL ROLE authenticated;
--   SELECT set_config('request.jwt.claims', '{"sub":"<admin-uuid>","role":"authenticated"}', true);
--   SELECT collection, count(*) FROM public.library_items GROUP BY 1;   -- expect every collection incl. visual_identity
-- ROLLBACK;
--
-- 7f. From the outside (PowerShell, public key only) — must return only committee rows / errors:
--   Invoke-RestMethod "$URL/rest/v1/library_items?select=collection" -Headers @{apikey=$ANON}
--   Invoke-RestMethod "$URL/rest/v1/galleries?select=id"            -Headers @{apikey=$ANON}


-- =============================================================================
-- 8. ROLLBACK (restores the previous public-read behaviour exactly)
-- =============================================================================
-- BEGIN;
--   DROP POLICY IF EXISTS library_public_collections_read ON public.library_items;
--   DROP POLICY IF EXISTS library_member_read            ON public.library_items;
--   DROP POLICY IF EXISTS library_leadership_read        ON public.library_items;
--   CREATE POLICY library_public_read ON public.library_items
--     FOR SELECT TO anon, authenticated USING (is_published);
--
--   DROP POLICY IF EXISTS galleries_member_read ON public.galleries;
--   CREATE POLICY galleries_public_read ON public.galleries
--     FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility = 'public');
--
--   DROP POLICY IF EXISTS gallery_media_member_read ON public.gallery_media;
--   CREATE POLICY gallery_media_public_read ON public.gallery_media
--     FOR SELECT TO anon, authenticated
--     USING (is_published AND EXISTS (SELECT 1 FROM public.galleries g
--            WHERE g.id = gallery_media.gallery_id AND g.status='published' AND g.visibility='public'));
--
--   GRANT SELECT ON public.galleries TO anon;
--   GRANT SELECT ON public.gallery_media TO anon;
--   -- helpers are harmless if left; to remove:
--   -- DROP FUNCTION IF EXISTS private.is_council_leader(uuid);
--   -- DROP FUNCTION IF EXISTS private.is_approved_member(uuid);
-- COMMIT;
-- (If pre-flight showed a "Public Read Library Items" policy, recreate it too:
--   CREATE POLICY "Public Read Library Items" ON public.library_items FOR SELECT USING (is_published = true);)
