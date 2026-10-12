-- 1. Permissions & RBAC
CREATE TABLE IF NOT EXISTS public.permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, permission_id)
);

-- Enhance profiles table with extra fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Riyadh';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status public.user_status DEFAULT 'ACTIVE';

-- 2. Places
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  region TEXT,
  city TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description_ar TEXT,
  description_en TEXT,
  media_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name_ar TEXT NOT NULL,
  middle_name_ar TEXT,
  last_name_ar TEXT NOT NULL,
  display_name_ar TEXT,
  first_name_en TEXT,
  middle_name_en TEXT,
  last_name_en TEXT,
  display_name_en TEXT,
  slug TEXT NOT NULL UNIQUE,
  gender public.gender NOT NULL DEFAULT 'male',
  date_of_birth DATE,
  date_of_death DATE,
  is_living BOOLEAN NOT NULL DEFAULT true,
  biography_ar TEXT,
  biography_en TEXT,
  occupation_ar TEXT,
  occupation_en TEXT,
  education_ar TEXT,
  education_en TEXT,
  birth_place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  current_place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  avatar_path TEXT,
  cover_path TEXT,
  generation INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  status public.record_status NOT NULL DEFAULT 'published',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS family_members_slug_idx ON public.family_members (slug);
CREATE INDEX IF NOT EXISTS family_members_branch_idx ON public.family_members (branch_id);
CREATE INDEX IF NOT EXISTS family_members_generation_idx ON public.family_members (generation);

-- 4. Family Relationships
CREATE TABLE IF NOT EXISTS public.family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  related_person_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relationship_type public.relationship_type NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_not_self CHECK (person_id <> related_person_id),
  UNIQUE (person_id, related_person_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS family_rel_person_idx ON public.family_relationships (person_id);
CREATE INDEX IF NOT EXISTS family_rel_related_idx ON public.family_relationships (related_person_id);

-- 5. Family Member Privacy
CREATE TABLE IF NOT EXISTS public.family_member_privacy (
  member_id UUID PRIMARY KEY REFERENCES public.family_members(id) ON DELETE CASCADE,
  show_dob BOOLEAN NOT NULL DEFAULT true,
  show_contact BOOLEAN NOT NULL DEFAULT false,
  show_biography BOOLEAN NOT NULL DEFAULT true,
  show_relationships BOOLEAN NOT NULL DEFAULT true,
  private_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Family History Entries
CREATE TABLE IF NOT EXISTS public.family_history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  date TEXT,
  date_end TEXT,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  media_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Content Pages & Page Builder Blocks
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  slug_ar TEXT,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  featured_media_path TEXT,
  status public.record_status NOT NULL DEFAULT 'draft',
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  template TEXT NOT NULL DEFAULT 'default',
  seo_title_ar TEXT,
  seo_title_en TEXT,
  seo_description_ar TEXT,
  seo_description_en TEXT,
  canonical_url TEXT,
  no_index BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_sections_page_idx ON public.content_sections (page_id, sort_order);

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_page_id UUID NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Navigation Menus & Items
CREATE TABLE IF NOT EXISTS public.navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.navigation_menus(id) ON DELETE CASCADE,
  label_ar TEXT NOT NULL,
  label_en TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  target TEXT NOT NULL DEFAULT '_self',
  icon TEXT,
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Articles, Categories, Tags
CREATE TABLE IF NOT EXISTS public.article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  slug_ar TEXT,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  featured_media_path TEXT,
  category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.record_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  seo_title_ar TEXT,
  seo_title_en TEXT,
  seo_description_ar TEXT,
  seo_description_en TEXT,
  canonical_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.article_tag_relations (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.article_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 10. Events & Registrations
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  cover_path TEXT,
  registration_enabled BOOLEAN NOT NULL DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'published',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  attendees_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  message_ar TEXT NOT NULL,
  message_en TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  priority TEXT NOT NULL DEFAULT 'normal',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'published',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Media Assets, Galleries, Documents
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL DEFAULT 'media',
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  original_file_name TEXT,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration NUMERIC,
  alt_text_ar TEXT,
  alt_text_en TEXT,
  caption_ar TEXT,
  caption_en TEXT,
  copyright TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  cover_media_path TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  caption_ar TEXT,
  caption_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  file_path TEXT,
  category TEXT NOT NULL DEFAULT 'governance',
  visibility public.visibility_level NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'published',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Inquiries & Inquiry Notes
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Notifications & Site Settings
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  message_ar TEXT NOT NULL,
  message_en TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'general',
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Comprehensive Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON public.audit_logs (entity_type, entity_id);

-- Attach updated_at triggers
CREATE TRIGGER places_set_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER family_members_set_updated_at BEFORE UPDATE ON public.family_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER family_relationships_set_updated_at BEFORE UPDATE ON public.family_relationships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER family_history_entries_set_updated_at BEFORE UPDATE ON public.family_history_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER content_pages_set_updated_at BEFORE UPDATE ON public.content_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER content_sections_set_updated_at BEFORE UPDATE ON public.content_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER navigation_items_set_updated_at BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER articles_set_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER announcements_set_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER media_assets_set_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER galleries_set_updated_at BEFORE UPDATE ON public.galleries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER inquiries_set_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
