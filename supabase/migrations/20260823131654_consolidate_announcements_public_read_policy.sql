-- Two overlapping public SELECT policies existed on announcements
-- ("Public Read Announcements": status IN ('active','published'), and
-- "ann_public_read": status = 'published' only) that happened to combine
-- (permissive policies OR together) into the correct behavior matching
-- what getPublicAnnouncements actually queries (status.eq.active OR
-- status.eq.published) -- but as two separate, drifting policy
-- definitions rather than one canonical source of truth. Consolidated
-- into a single policy with no change in actual access.
DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
DROP POLICY IF EXISTS "ann_public_read" ON public.announcements;

CREATE POLICY "ann_public_read" ON public.announcements
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'published'));
