-- Clean up duplicate/redundant legacy RLS policies to maintain a clean, unified policy structure.
DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
DROP POLICY IF EXISTS "Public Read Branches" ON public.branches;
DROP POLICY IF EXISTS "Public Read Initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users Can Insert Contact Messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users Can Subscribe Newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users Can Insert Inquiries" ON public.inquiries;
