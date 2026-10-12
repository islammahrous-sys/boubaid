-- 1. Covering indexes on unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_initiative_registrations_registered_by 
ON public.initiative_registrations (registered_by);

CREATE INDEX IF NOT EXISTS idx_services_created_by 
ON public.services (created_by);

-- 2. Safely drop unused legacy audit_log table (active logging uses public.audit_logs)
DROP TABLE IF EXISTS public.audit_log CASCADE;
