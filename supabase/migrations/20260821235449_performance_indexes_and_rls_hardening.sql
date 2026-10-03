-- 1. High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_family_members_branch_id ON public.family_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_family_members_living ON public.family_members(is_living) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON public.articles(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_initiatives_active ON public.initiatives(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(status, priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON public.membership_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.contributions(status, created_at DESC);

-- 2. Ensure RLS is Enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent Public & Authenticated RLS Policies
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Branches" ON public.branches;
CREATE POLICY "Public Read Branches" ON public.branches FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Family Members" ON public.family_members;
CREATE POLICY "Public Read Family Members" ON public.family_members FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public Read Initiatives" ON public.initiatives;
CREATE POLICY "Public Read Initiatives" ON public.initiatives FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (status IN ('active', 'published'));

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
