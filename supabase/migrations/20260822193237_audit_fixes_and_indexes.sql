-- 20260822050000_audit_fixes_and_indexes.sql
-- Performance Indexes & RLS Optimization

-- 1. Foreign Key Covering Indexes
CREATE INDEX IF NOT EXISTS idx_achievers_created_by ON public.achievers(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_article_tag_relations_tag_id ON public.article_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_by ON public.articles(created_by);
CREATE INDEX IF NOT EXISTS idx_articles_updated_by ON public.articles(updated_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_branches_created_by ON public.branches(created_by);
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON public.businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_contact_messages_submitted_by ON public.contact_messages(submitted_by);
CREATE INDEX IF NOT EXISTS idx_content_pages_author_id ON public.content_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_content_pages_created_by ON public.content_pages(created_by);
CREATE INDEX IF NOT EXISTS idx_content_pages_updated_by ON public.content_pages(updated_by);
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_page_id ON public.content_revisions(content_page_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created_by ON public.content_revisions(created_by);
CREATE INDEX IF NOT EXISTS idx_contributions_reviewed_by ON public.contributions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_media_asset_id ON public.documents(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_event_registrations_registered_by ON public.event_registrations(registered_by);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_place_id ON public.events(place_id);
CREATE INDEX IF NOT EXISTS idx_events_updated_by ON public.events(updated_by);
CREATE INDEX IF NOT EXISTS idx_family_history_entries_place_id ON public.family_history_entries(place_id);
CREATE INDEX IF NOT EXISTS idx_family_members_birth_place_id ON public.family_members(birth_place_id);
CREATE INDEX IF NOT EXISTS idx_family_members_current_place_id ON public.family_members(current_place_id);
CREATE INDEX IF NOT EXISTS idx_family_members_created_by ON public.family_members(created_by);
CREATE INDEX IF NOT EXISTS idx_family_members_updated_by ON public.family_members(updated_by);
CREATE INDEX IF NOT EXISTS idx_galleries_created_by ON public.galleries(created_by);
CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery_id ON public.gallery_media(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_media_asset_id ON public.gallery_media(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_initiatives_created_by ON public.initiatives(created_by);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON public.inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_id ON public.inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_author_id ON public.inquiry_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_library_items_created_by ON public.library_items(created_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON public.media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_membership_requests_reviewed_by ON public.membership_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_navigation_items_menu_id ON public.navigation_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON public.navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_created_by ON public.news_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON public.user_roles(granted_by);

-- 2. RLS InitPlan Optimization (Wrap auth.uid() in SELECT)
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS membership_requests_select_own ON public.membership_requests;
CREATE POLICY membership_requests_select_own ON public.membership_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS membership_requests_insert_own ON public.membership_requests;
CREATE POLICY membership_requests_insert_own ON public.membership_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
