-- 1. businesses had no public INSERT policy at all, so the public business
--    directory submission form (submitBusinessListing) could never actually
--    insert a row. New public submissions must land unpublished pending
--    admin review (the existing "Admins and editors can manage businesses"
--    policy already covers the review/publish step).
CREATE POLICY "businesses_public_submit" ON public.businesses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_published = false);

-- 2. Notify admins in-app when a new contact message or inquiry arrives.
-- Mirrors the existing notify_admins_of_membership_request pattern.
CREATE OR REPLACE FUNCTION private.notify_admins_of_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT
    ur.user_id,
    'New contact message',
    'New contact message',
    'A new message was submitted via the contact form: ' || left(NEW.subject, 80),
    'A new message was submitted via the contact form: ' || left(NEW.subject, 80),
    'contact_message',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_contact_message ON public.contact_messages;
CREATE TRIGGER trg_notify_admins_contact_message
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION private.notify_admins_of_contact_message();

CREATE OR REPLACE FUNCTION private.notify_admins_of_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT
    ur.user_id,
    'New inquiry',
    'New inquiry',
    'A new inquiry was submitted: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'A new inquiry was submitted: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'inquiry',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin', 'editor', 'content_manager');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admins_inquiry ON public.inquiries;
CREATE TRIGGER trg_notify_admins_inquiry
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION private.notify_admins_of_inquiry();
