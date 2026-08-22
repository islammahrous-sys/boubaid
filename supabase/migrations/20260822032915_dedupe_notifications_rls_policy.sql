-- The live database already had a broad ALL policy for notification ownership.
-- The approval migration installs explicit SELECT/UPDATE/DELETE policies, so
-- drop the broad duplicate to avoid redundant policy execution and accidental
-- future self-insert permission.
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
