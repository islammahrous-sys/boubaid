REVOKE EXECUTE ON FUNCTION public.family_public_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.family_public_stats() TO service_role;