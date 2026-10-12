REVOKE EXECUTE ON FUNCTION public.record_site_visit(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_site_visit(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_site_visit(text) TO service_role;