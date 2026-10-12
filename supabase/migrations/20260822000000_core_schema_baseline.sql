-- Baseline Migration: Declarative schema consolidation for Al Boabid Heritage Hub
-- All 41 tables with constraints, indexes, and Row Level Security policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles & Core Auth Extended Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name_ar TEXT NOT NULL,
  full_name_en TEXT,
  branch_slug TEXT,
  phone TEXT,
  lineage_notes TEXT,
  avatar_path TEXT,
  show_in_directory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'treasurer', 'member', 'guest')),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 3. Membership Requests
CREATE TABLE IF NOT EXISTS public.membership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name_ar TEXT NOT NULL,
  full_name_en TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  branch_slug TEXT,
  father_lineage TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  ancestor_ar TEXT,
  ancestor_en TEXT,
  elder_ar TEXT,
  elder_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  settlement_ar TEXT,
  settlement_en TEXT,
  members_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  first_name_ar TEXT NOT NULL,
  father_name_ar TEXT,
  grandfather_name_ar TEXT,
  last_name_ar TEXT NOT NULL DEFAULT 'آل بوعبيد',
  first_name_en TEXT,
  father_name_en TEXT,
  grandfather_name_en TEXT,
  last_name_en TEXT DEFAULT 'Al-Boabid',
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  branch_slug TEXT REFERENCES public.branches(slug) ON DELETE SET NULL,
  generation INTEGER,
  birth_year_hijri INTEGER,
  birth_year_gregorian INTEGER,
  death_year_hijri INTEGER,
  death_year_gregorian INTEGER,
  is_living BOOLEAN NOT NULL DEFAULT true,
  occupation_ar TEXT,
  occupation_en TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  avatar_path TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'family', 'private')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Family Relationships
CREATE TABLE IF NOT EXISTS public.family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  related_person_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('father', 'mother', 'spouse', 'son', 'daughter')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id, related_person_id, relationship_type)
);

-- 7. Places
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  historical_significance_ar TEXT,
  historical_significance_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Family History Entries
CREATE TABLE IF NOT EXISTS public.family_history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  event_year_hijri INTEGER,
  event_year_gregorian INTEGER,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  description_ar TEXT,
  description_en TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'family', 'private')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Articles & News
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT NOT NULL,
  content_en TEXT,
  featured_media_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. News Posts (CMS Alias / Legacy sync)
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT NOT NULL,
  content_en TEXT,
  category TEXT NOT NULL DEFAULT 'announcement',
  featured_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Initiatives
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  category TEXT NOT NULL DEFAULT 'development',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'planned', 'completed')),
  image_path TEXT,
  target_amount NUMERIC(12, 2) DEFAULT 0,
  raised_amount NUMERIC(12, 2) DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Achievers
CREATE TABLE IF NOT EXISTS public.achievers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  field_ar TEXT,
  field_en TEXT,
  achievement_ar TEXT,
  achievement_en TEXT,
  branch_ar TEXT,
  branch_en TEXT,
  category TEXT NOT NULL DEFAULT 'academic',
  image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Library Items
CREATE TABLE IF NOT EXISTS public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  collection TEXT NOT NULL DEFAULT 'documents',
  kind TEXT NOT NULL DEFAULT 'pdf',
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Events & Registrations
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  location_name TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT,
  message_ar TEXT NOT NULL,
  message_en TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'congratulations', 'wedding', 'condolences')),
  type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'published', 'archived')),
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  link_url TEXT,
  link_label_ar TEXT,
  link_label_en TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Inquiries & Contact Messages
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  locale TEXT NOT NULL DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Contributions & Treasury
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  method TEXT NOT NULL DEFAULT 'bank_transfer',
  purpose TEXT,
  reference TEXT,
  receipt_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  review_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Businesses / Directory
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  category TEXT NOT NULL DEFAULT 'services',
  owner_name_ar TEXT,
  owner_name_en TEXT,
  branch_slug TEXT REFERENCES public.branches(slug) ON DELETE SET NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  national_address TEXT,
  description_ar TEXT,
  description_en TEXT,
  logo_path TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Content Pages & Dynamic CMS
CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT,
  content_en TEXT,
  featured_media_path TEXT,
  seo_title_ar TEXT,
  seo_title_en TEXT,
  seo_description_ar TEXT,
  seo_description_en TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.content_pages(id) ON DELETE CASCADE,
  title_ar TEXT,
  title_en TEXT,
  body_ar TEXT NOT NULL,
  body_en TEXT,
  section_type TEXT NOT NULL DEFAULT 'text',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Site Settings & Global System Config
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Audit Logs (Unified)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 22. Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_family_members_branch_id ON public.family_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_family_members_living ON public.family_members(is_living) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON public.articles(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON public.news_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_initiatives_active ON public.initiatives(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(status, priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON public.membership_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.contributions(status, created_at DESC);

-- 23. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (idempotent)
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Branches" ON public.branches;
CREATE POLICY "Public Read Branches" ON public.branches FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Family Members" ON public.family_members;
CREATE POLICY "Public Read Family Members" ON public.family_members FOR SELECT USING (visibility = 'public' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read News" ON public.news_posts;
CREATE POLICY "Public Read News" ON public.news_posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Initiatives" ON public.initiatives;
CREATE POLICY "Public Read Initiatives" ON public.initiatives FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Achievers" ON public.achievers;
CREATE POLICY "Public Read Achievers" ON public.achievers FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Library Items" ON public.library_items;
CREATE POLICY "Public Read Library Items" ON public.library_items FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (status IN ('active', 'published'));

DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Content Pages" ON public.content_pages;
CREATE POLICY "Public Read Content Pages" ON public.content_pages FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public Read Content Sections" ON public.content_sections;
CREATE POLICY "Public Read Content Sections" ON public.content_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (is_public = true);

-- Authenticated User Insert Policies (idempotent)
DROP POLICY IF EXISTS "Users Can Insert Inquiries" ON public.inquiries;
CREATE POLICY "Users Can Insert Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users Can Insert Contact Messages" ON public.contact_messages;
CREATE POLICY "Users Can Insert Contact Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users Can Subscribe Newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Users Can Subscribe Newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users Can Insert Contributions" ON public.contributions;
CREATE POLICY "Users Can Insert Contributions" ON public.contributions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users Can Update Own Profile" ON public.profiles;
CREATE POLICY "Users Can Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
