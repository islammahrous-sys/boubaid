-- Museum Archive Gallery feature: extends the existing galleries /
-- gallery_media / media_assets tables (Collection -> Images) instead of
-- introducing a parallel schema. These three tables were created directly
-- against the live project and never got a tracked CREATE TABLE migration
-- (unlike library_items and friends in 20260822000000_core_schema_baseline.sql),
-- so this migration cannot assume their current RLS/grant state. Every
-- statement below is written to be safe to (re)apply regardless of what's
-- already live: ENABLE ROW LEVEL SECURITY is idempotent, and every policy is
-- dropped-and-recreated rather than assumed absent.

-- ============ gallery_media: per-image publish flag ============
-- The admin UI needs to unpublish a single image within an otherwise
-- published collection without pulling the whole gallery offline.
ALTER TABLE public.gallery_media ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery_sort ON public.gallery_media(gallery_id, sort_order);

-- ============ idempotent-import tracking ============
-- Nullable everywhere else; only the Museum Archive import script sets
-- these, letting a re-run find the already-imported collection/image by
-- Drive id instead of by (mutable) title and skip re-uploading it.
ALTER TABLE public.galleries ADD COLUMN IF NOT EXISTS source_drive_folder_id text UNIQUE;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS source_drive_file_id text UNIQUE;

-- ============ grants ============
GRANT SELECT ON public.galleries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.galleries TO authenticated;
GRANT ALL ON public.galleries TO service_role;

GRANT SELECT ON public.gallery_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_media TO authenticated;
GRANT ALL ON public.gallery_media TO service_role;

GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

-- ============ RLS: galleries ============
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS galleries_public_read ON public.galleries;
DROP POLICY IF EXISTS galleries_editor_read ON public.galleries;
DROP POLICY IF EXISTS galleries_editor_insert ON public.galleries;
DROP POLICY IF EXISTS galleries_editor_update ON public.galleries;
DROP POLICY IF EXISTS galleries_editor_delete ON public.galleries;

CREATE POLICY galleries_public_read ON public.galleries FOR SELECT TO anon, authenticated
  USING (status = 'published' AND visibility = 'public');
CREATE POLICY galleries_editor_read ON public.galleries FOR SELECT TO authenticated
  USING (private.can_edit(auth.uid()));
CREATE POLICY galleries_editor_insert ON public.galleries FOR INSERT TO authenticated
  WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY galleries_editor_update ON public.galleries FOR UPDATE TO authenticated
  USING (private.can_edit(auth.uid())) WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY galleries_editor_delete ON public.galleries FOR DELETE TO authenticated
  USING (private.can_edit(auth.uid()));

DROP TRIGGER IF EXISTS galleries_set_updated_at ON public.galleries;
CREATE TRIGGER galleries_set_updated_at BEFORE UPDATE ON public.galleries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RLS: gallery_media ============
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gallery_media_public_read ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_editor_read ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_editor_insert ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_editor_update ON public.gallery_media;
DROP POLICY IF EXISTS gallery_media_editor_delete ON public.gallery_media;

-- An image is publicly visible only when both the link row and its parent
-- gallery are published/public -- an unpublished or member-only gallery must
-- not leak its images via a direct gallery_media query.
CREATE POLICY gallery_media_public_read ON public.gallery_media FOR SELECT TO anon, authenticated
  USING (
    is_published AND EXISTS (
      SELECT 1 FROM public.galleries g
      WHERE g.id = gallery_media.gallery_id AND g.status = 'published' AND g.visibility = 'public'
    )
  );
CREATE POLICY gallery_media_editor_read ON public.gallery_media FOR SELECT TO authenticated
  USING (private.can_edit(auth.uid()));
CREATE POLICY gallery_media_editor_insert ON public.gallery_media FOR INSERT TO authenticated
  WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY gallery_media_editor_update ON public.gallery_media FOR UPDATE TO authenticated
  USING (private.can_edit(auth.uid())) WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY gallery_media_editor_delete ON public.gallery_media FOR DELETE TO authenticated
  USING (private.can_edit(auth.uid()));

-- ============ RLS: media_assets ============
-- media_assets rows back objects in already-public storage buckets (media,
-- site-media, galleries) -- the object bytes are fetchable by direct URL
-- regardless of table RLS, so gating SELECT here would only break the
-- PostgREST embed (gallery_media -> media_assets) the public gallery page
-- needs without adding real confidentiality. Writes stay editor-only.
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS media_assets_public_read ON public.media_assets;
DROP POLICY IF EXISTS media_assets_editor_insert ON public.media_assets;
DROP POLICY IF EXISTS media_assets_editor_update ON public.media_assets;
DROP POLICY IF EXISTS media_assets_editor_delete ON public.media_assets;

CREATE POLICY media_assets_public_read ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY media_assets_editor_insert ON public.media_assets FOR INSERT TO authenticated
  WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY media_assets_editor_update ON public.media_assets FOR UPDATE TO authenticated
  USING (private.can_edit(auth.uid())) WITH CHECK (private.can_edit(auth.uid()));
CREATE POLICY media_assets_editor_delete ON public.media_assets FOR DELETE TO authenticated
  USING (private.can_edit(auth.uid()));

-- ============ storage bucket: galleries ============
-- Referenced by MediaLibrary.tsx's bucket picker already; ensure it actually
-- exists and carries the same public-read / editor-write shape as `media`.
INSERT INTO storage.buckets (id, name, public)
VALUES ('galleries', 'galleries', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "galleries bucket public read" ON storage.objects;
DROP POLICY IF EXISTS "galleries bucket editor write" ON storage.objects;
DROP POLICY IF EXISTS "galleries bucket editor update" ON storage.objects;
DROP POLICY IF EXISTS "galleries bucket editor delete" ON storage.objects;

CREATE POLICY "galleries bucket public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'galleries');
CREATE POLICY "galleries bucket editor write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'galleries' AND private.can_edit(auth.uid()));
CREATE POLICY "galleries bucket editor update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'galleries' AND private.can_edit(auth.uid()));
CREATE POLICY "galleries bucket editor delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'galleries' AND private.can_edit(auth.uid()));
