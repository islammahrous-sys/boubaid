-- Membership approval must be atomic: an approved request and its member role
-- are created together, or neither change is committed.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text,
  message_ar text NOT NULL,
  message_en text,
  type text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION private.review_membership_request_as_admin(
  p_request_id uuid,
  p_status text,
  p_review_note text,
  p_actor_id uuid
)
RETURNS public.membership_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request public.membership_requests;
BEGIN
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid membership review status';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_actor_id
      AND role::text IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Administrative privileges required';
  END IF;

  SELECT *
  INTO v_request
  FROM public.membership_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership request not found';
  END IF;

  IF v_request.status::text <> 'pending' THEN
    RAISE EXCEPTION 'Membership request has already been reviewed';
  END IF;

  IF p_status = 'approved' AND v_request.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (v_request.user_id, 'member'::public.app_role, p_actor_id)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  UPDATE public.membership_requests
  SET status = p_status::public.request_status,
      review_note = NULLIF(trim(p_review_note), ''),
      reviewed_by = p_actor_id,
      reviewed_at = now(),
      updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  IF v_request.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title_ar,
      title_en,
      message_ar,
      message_en,
      type,
      link,
      is_read
    )
    VALUES (
      v_request.user_id,
      CASE WHEN p_status = 'approved' THEN 'Membership approved' ELSE 'Membership request reviewed' END,
      CASE WHEN p_status = 'approved' THEN 'Membership approved' ELSE 'Membership request reviewed' END,
      CASE WHEN p_status = 'approved'
        THEN 'Your membership has been approved. Member services and your digital ID are now available.'
        ELSE 'Your membership request has been reviewed. Check your account for the status and secretariat note.'
      END,
      CASE WHEN p_status = 'approved'
        THEN 'Your membership has been approved. Member services and your digital ID are now available.'
        ELSE 'Your membership request has been reviewed. Check your account for the status and secretariat note.'
      END,
      'membership',
      '/account',
      false
    );
  END IF;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION private.review_membership_request_as_admin(uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.review_membership_request_as_admin(uuid, text, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.review_membership_request_as_admin(
  p_request_id uuid,
  p_status text,
  p_review_note text,
  p_actor_id uuid
)
RETURNS public.membership_requests
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.review_membership_request_as_admin($1, $2, $3, $4);
$$;

REVOKE ALL ON FUNCTION public.review_membership_request_as_admin(uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_membership_request_as_admin(uuid, text, text, uuid) TO service_role;

-- Let administrators see a new application without relying on email delivery.
CREATE OR REPLACE FUNCTION private.notify_admins_of_membership_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT
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

DROP TRIGGER IF EXISTS membership_request_notify_admins ON public.membership_requests;
CREATE TRIGGER membership_request_notify_admins
  AFTER INSERT ON public.membership_requests
  FOR EACH ROW EXECUTE FUNCTION private.notify_admins_of_membership_request();

REVOKE ALL ON FUNCTION private.notify_admins_of_membership_request() FROM PUBLIC, anon, authenticated;
