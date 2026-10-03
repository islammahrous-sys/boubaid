-- Fix CRITICAL-1: Drop legacy overly-permissive anonymous upload/update policies on site-media.
-- The proper editor-scoped policy (site_media_editor_write) already exists and correctly
-- restricts writes to users with the can_edit_content capability. These two legacy policies
-- bypass that entirely and allow any anonymous caller to insert or update objects.
DROP POLICY IF EXISTS "Allow public uploads to site-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to site-media" ON storage.objects;
