-- notify_admins_of_membership_request() fanned out one notification row per
-- (user, privileged role), so an account holding both `admin` and `super_admin`
-- received two identical "New membership request" notifications for every new
-- request. Deduplicate by distinct user_id.

CREATE OR REPLACE FUNCTION private.notify_admins_of_membership_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT DISTINCT
    ur.user_id,
    'New membership request',
    'New membership request',
    'A new membership request needs secretariat review.',
    'A new membership request needs secretariat review.',
    'membership',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin');

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.notify_admins_of_membership_request() FROM PUBLIC, anon, authenticated;
