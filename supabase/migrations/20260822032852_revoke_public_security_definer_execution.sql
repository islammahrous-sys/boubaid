-- Supabase advisors flagged these legacy SECURITY DEFINER helpers as directly
-- executable through the exposed public RPC surface. They are not called by
-- application code, so remove direct public execution while preserving any
-- owner-side database behavior.
REVOKE ALL ON FUNCTION public.handle_admin_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
