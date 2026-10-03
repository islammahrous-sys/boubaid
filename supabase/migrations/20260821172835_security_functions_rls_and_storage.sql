-- ==========================================
-- Security Definier Authorization Functions
-- ==========================================

CREATE OR REPLACE FUNCTION private.has_permission(_user_id UUID, _permission_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id AND rp.permission_id = _permission_id
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.can_manage_family(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin', 'family_manager')
  );
$$;

CREATE OR REPLACE FUNCTION private.can_manage_users(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION private.can_view_inquiries(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin', 'editor', 'content_manager')
  );
$$;

-- Grant execute to authenticated & service_role
GRANT EXECUTE ON FUNCTION private.has_permission(UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_family(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_manage_users(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_view_inquiries(UUID) TO authenticated, service_role;

-- ==========================================
-- Enable RLS on all newly created tables
-- ==========================================

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_member_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.permissions, public.role_permissions, public.places, public.family_members, public.family_relationships, public.family_history_entries, public.content_pages, public.content_sections, public.navigation_menus, public.navigation_items, public.article_categories, public.article_tags, public.articles, public.article_tag_relations, public.events, public.announcements, public.media_assets, public.galleries, public.gallery_media, public.documents, public.site_settings TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.permissions, public.role_permissions, public.places, public.family_members, public.family_relationships, public.family_member_privacy, public.family_history_entries, public.content_pages, public.content_sections, public.content_revisions, public.navigation_menus, public.navigation_items, public.article_categories, public.article_tags, public.articles, public.article_tag_relations, public.events, public.event_registrations, public.announcements, public.media_assets, public.galleries, public.gallery_media, public.documents, public.inquiries, public.inquiry_notes, public.notifications, public.site_settings, public.audit_logs TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ==========================================
-- Policies on Tables
-- ==========================================

-- Permissions & Roles
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_write ON public.role_permissions FOR ALL TO authenticated USING (private.can_manage_users(auth.uid())) WITH CHECK (private.can_manage_users(auth.uid()));

-- Places
CREATE POLICY places_read ON public.places FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY places_write ON public.places FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Family Members
CREATE POLICY family_members_public_read ON public.family_members FOR SELECT TO anon, authenticated USING (visibility = 'public' AND status = 'published' AND deleted_at IS NULL);
CREATE POLICY family_members_family_read ON public.family_members FOR SELECT TO authenticated USING (visibility IN ('public', 'family_only') AND deleted_at IS NULL AND private.is_member(auth.uid()));
CREATE POLICY family_members_admin_read ON public.family_members FOR SELECT TO authenticated USING (private.can_manage_family(auth.uid()));
CREATE POLICY family_members_admin_write ON public.family_members FOR ALL TO authenticated USING (private.can_manage_family(auth.uid())) WITH CHECK (private.can_manage_family(auth.uid()));

-- Family Relationships
CREATE POLICY family_rel_read ON public.family_relationships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY family_rel_write ON public.family_relationships FOR ALL TO authenticated USING (private.can_manage_family(auth.uid())) WITH CHECK (private.can_manage_family(auth.uid()));

-- Family Member Privacy
CREATE POLICY family_privacy_admin ON public.family_member_privacy FOR ALL TO authenticated USING (private.can_manage_family(auth.uid())) WITH CHECK (private.can_manage_family(auth.uid()));

-- Family History
CREATE POLICY family_history_read ON public.family_history_entries FOR SELECT TO anon, authenticated USING (visibility = 'public');
CREATE POLICY family_history_admin ON public.family_history_entries FOR ALL TO authenticated USING (private.can_manage_family(auth.uid())) WITH CHECK (private.can_manage_family(auth.uid()));

-- Content Pages & Sections
CREATE POLICY pages_public_read ON public.content_pages FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility = 'public' AND deleted_at IS NULL);
CREATE POLICY pages_editor_all ON public.content_pages FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

CREATE POLICY sections_public_read ON public.content_sections FOR SELECT TO anon, authenticated USING (visibility = 'public');
CREATE POLICY sections_editor_all ON public.content_sections FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

CREATE POLICY revisions_editor_all ON public.content_revisions FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Navigation
CREATE POLICY nav_read ON public.navigation_menus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY nav_write ON public.navigation_menus FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));
CREATE POLICY nav_items_read ON public.navigation_items FOR SELECT TO anon, authenticated USING (visibility = 'public');
CREATE POLICY nav_items_write ON public.navigation_items FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Articles, Categories, Tags
CREATE POLICY art_cat_read ON public.article_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY art_cat_write ON public.article_categories FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));
CREATE POLICY art_tag_read ON public.article_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY art_tag_write ON public.article_tags FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));
CREATE POLICY art_tag_rel_read ON public.article_tag_relations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY art_tag_rel_write ON public.article_tag_relations FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

CREATE POLICY articles_public_read ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY articles_editor_all ON public.articles FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Events & Registrations
CREATE POLICY events_public_read ON public.events FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY events_editor_all ON public.events FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

CREATE POLICY event_reg_insert ON public.event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY event_reg_user_read ON public.event_registrations FOR SELECT TO authenticated USING (registered_by = auth.uid() OR private.can_edit_content(auth.uid()));
CREATE POLICY event_reg_admin_update ON public.event_registrations FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Announcements
CREATE POLICY ann_public_read ON public.announcements FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY ann_editor_all ON public.announcements FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Media Assets & Galleries
CREATE POLICY media_public_read ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY media_editor_write ON public.media_assets FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

CREATE POLICY galleries_public_read ON public.galleries FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility = 'public');
CREATE POLICY galleries_editor_all ON public.galleries FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));
CREATE POLICY gallery_media_read ON public.gallery_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY gallery_media_write ON public.gallery_media FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Documents
CREATE POLICY docs_public_read ON public.documents FOR SELECT TO anon, authenticated USING (status = 'published' AND visibility = 'public');
CREATE POLICY docs_family_read ON public.documents FOR SELECT TO authenticated USING (status = 'published' AND visibility = 'family_only' AND private.is_member(auth.uid()));
CREATE POLICY docs_admin_all ON public.documents FOR ALL TO authenticated USING (private.can_edit_content(auth.uid())) WITH CHECK (private.can_edit_content(auth.uid()));

-- Inquiries & Inquiry Notes
CREATE POLICY inquiries_public_insert ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY inquiries_admin_all ON public.inquiries FOR ALL TO authenticated USING (private.can_view_inquiries(auth.uid())) WITH CHECK (private.can_view_inquiries(auth.uid()));

CREATE POLICY inquiry_notes_admin ON public.inquiry_notes FOR ALL TO authenticated USING (private.can_view_inquiries(auth.uid())) WITH CHECK (private.can_view_inquiries(auth.uid()));

-- Notifications
CREATE POLICY notifications_own ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Site Settings
CREATE POLICY site_settings_public ON public.site_settings FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY site_settings_admin ON public.site_settings FOR ALL TO authenticated USING (private.can_manage_users(auth.uid())) WITH CHECK (private.can_manage_users(auth.uid()));

-- Audit Logs
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (private.can_manage_users(auth.uid()));
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ==========================================
-- Storage Buckets & Policies
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('family-photos', 'family-photos', true),
  ('site-media', 'site-media', true),
  ('galleries', 'galleries', true),
  ('documents-public', 'documents-public', true),
  ('documents-private', 'documents-private', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "family_photos_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'family-photos');
CREATE POLICY "family_photos_editor_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'family-photos' AND private.can_manage_family(auth.uid()));
CREATE POLICY "family_photos_editor_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'family-photos' AND private.can_manage_family(auth.uid()));
CREATE POLICY "family_photos_editor_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'family-photos' AND private.can_manage_family(auth.uid()));

CREATE POLICY "site_media_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY "site_media_editor_write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'site-media' AND private.can_edit_content(auth.uid())) WITH CHECK (bucket_id = 'site-media' AND private.can_edit_content(auth.uid()));

CREATE POLICY "galleries_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'galleries');
CREATE POLICY "galleries_editor_write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'galleries' AND private.can_edit_content(auth.uid())) WITH CHECK (bucket_id = 'galleries' AND private.can_edit_content(auth.uid()));

CREATE POLICY "docs_public_read_storage" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'documents-public');
CREATE POLICY "docs_public_write_storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents-public' AND private.can_edit_content(auth.uid())) WITH CHECK (bucket_id = 'documents-public' AND private.can_edit_content(auth.uid()));

CREATE POLICY "docs_priv_read_storage" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents-private' AND private.can_edit_content(auth.uid()));
CREATE POLICY "docs_priv_write_storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents-private' AND private.can_edit_content(auth.uid())) WITH CHECK (bucket_id = 'documents-private' AND private.can_edit_content(auth.uid()));

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "avatars_user_write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

-- Seed Standard Permissions
INSERT INTO public.permissions (id, name, description, category) VALUES
  ('dashboard.view', 'View Dashboard', 'Access administrative overview', 'dashboard'),
  ('users.read', 'View Users', 'View system users and status', 'users'),
  ('users.create', 'Create Users', 'Invite and create users', 'users'),
  ('users.update', 'Update Users', 'Update user profiles and status', 'users'),
  ('users.delete', 'Delete Users', 'Disable or delete users', 'users'),
  ('users.roles', 'Manage Roles', 'Assign and manage user roles', 'users'),
  ('family.read', 'View Family', 'View family members and records', 'family'),
  ('family.create', 'Create Family Member', 'Add new family members', 'family'),
  ('family.update', 'Update Family Member', 'Edit family records', 'family'),
  ('family.delete', 'Delete Family Member', 'Archive or delete members', 'family'),
  ('family.export', 'Export Family Data', 'Export members and trees', 'family'),
  ('family.import', 'Import Family Data', 'Import members and trees via CSV', 'family'),
  ('family.relationships', 'Manage Relationships', 'Link parent, child, and spouse records', 'family'),
  ('content.read', 'View Content', 'View CMS pages and sections', 'content'),
  ('content.create', 'Create Content', 'Create CMS pages and blocks', 'content'),
  ('content.update', 'Update Content', 'Edit CMS pages and blocks', 'content'),
  ('content.review', 'Review Content', 'Submit or review content', 'content'),
  ('content.publish', 'Publish Content', 'Publish pages and revisions', 'content'),
  ('content.delete', 'Delete Content', 'Archive or delete pages', 'content'),
  ('articles.read', 'View Articles', 'View articles list', 'articles'),
  ('articles.create', 'Create Article', 'Write new articles', 'articles'),
  ('articles.update', 'Update Article', 'Edit existing articles', 'articles'),
  ('articles.publish', 'Publish Article', 'Publish and schedule articles', 'articles'),
  ('articles.delete', 'Delete Article', 'Archive or delete articles', 'articles'),
  ('events.read', 'View Events', 'View events and calendar', 'events'),
  ('events.create', 'Create Event', 'Create new events', 'events'),
  ('events.update', 'Update Event', 'Edit events', 'events'),
  ('events.delete', 'Delete Event', 'Cancel or delete events', 'events'),
  ('media.read', 'View Media', 'Browse media assets', 'media'),
  ('media.upload', 'Upload Media', 'Upload photos and documents', 'media'),
  ('media.update', 'Update Media', 'Edit metadata and captions', 'media'),
  ('media.delete', 'Delete Media', 'Delete media assets', 'media'),
  ('galleries.read', 'View Galleries', 'Browse photo galleries', 'galleries'),
  ('galleries.create', 'Create Gallery', 'Create photo galleries', 'galleries'),
  ('galleries.update', 'Update Gallery', 'Edit albums and sort order', 'galleries'),
  ('galleries.delete', 'Delete Gallery', 'Delete galleries', 'galleries'),
  ('documents.read', 'View Documents', 'Access document library', 'documents'),
  ('documents.upload', 'Upload Documents', 'Upload public or private documents', 'documents'),
  ('documents.delete', 'Delete Documents', 'Remove documents', 'documents'),
  ('navigation.read', 'View Navigation', 'View menus', 'navigation'),
  ('navigation.update', 'Update Navigation', 'Reorder and edit menu items', 'navigation'),
  ('settings.read', 'View Settings', 'View site configuration', 'settings'),
  ('settings.update', 'Update Settings', 'Update site configuration', 'settings'),
  ('inquiries.read', 'View Inquiries', 'View contact messages and inquiries', 'inquiries'),
  ('inquiries.update', 'Update Inquiries', 'Change status and write internal notes', 'inquiries'),
  ('notifications.read', 'View Notifications', 'Access notifications center', 'notifications'),
  ('audit.read', 'View Audit Logs', 'Inspect system audit trails', 'audit')
ON CONFLICT (id) DO NOTHING;

-- Map Super Admin & Admin to all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin'::app_role, id FROM public.permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Map Family Manager
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'family_manager'::app_role, id FROM public.permissions
WHERE category IN ('family', 'dashboard', 'media')
ON CONFLICT DO NOTHING;

-- Map Content Manager & Editor
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'content_manager'::app_role, id FROM public.permissions
WHERE category IN ('content', 'articles', 'events', 'media', 'galleries', 'documents', 'navigation', 'dashboard')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'editor'::app_role, id FROM public.permissions
WHERE category IN ('content', 'articles', 'events', 'media', 'galleries', 'documents', 'dashboard')
  AND id NOT IN ('content.publish', 'articles.publish')
ON CONFLICT DO NOTHING;

-- Map Viewer
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer'::app_role, id FROM public.permissions
WHERE id LIKE '%.read' OR id = 'dashboard.view'
ON CONFLICT DO NOTHING;
