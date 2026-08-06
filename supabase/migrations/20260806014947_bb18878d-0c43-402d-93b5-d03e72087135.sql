-- Internal helpers live outside the exposed API schema so they cannot be
-- called directly by visitors or signed-in users; policies still use them.
CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION private.can_edit_content(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'editor')
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_edit_content(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_edit_content(UUID) TO authenticated, service_role;

-- Repoint every policy at the private helpers.
DROP POLICY "profiles_select_admin" ON public.profiles;
DROP POLICY "profiles_update_admin" ON public.profiles;
DROP POLICY "user_roles_select_admin" ON public.user_roles;
DROP POLICY "membership_requests_select_admin" ON public.membership_requests;
DROP POLICY "membership_requests_update_admin" ON public.membership_requests;
DROP POLICY "contact_messages_select_admin" ON public.contact_messages;
DROP POLICY "contact_messages_update_admin" ON public.contact_messages;
DROP POLICY "newsletter_select_admin" ON public.newsletter_subscribers;
DROP POLICY "audit_log_select_admin" ON public.audit_log;

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_select_admin" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "membership_requests_select_admin" ON public.membership_requests
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "membership_requests_update_admin" ON public.membership_requests
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "contact_messages_select_admin" ON public.contact_messages
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact_messages_update_admin" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "newsletter_select_admin" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_log_select_admin" ON public.audit_log
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION public.has_role(UUID, public.app_role);
DROP FUNCTION public.can_edit_content(UUID);

-- Trigger functions do not need to be callable by API roles: Postgres checks
-- EXECUTE when the trigger is created, not on every fire.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;