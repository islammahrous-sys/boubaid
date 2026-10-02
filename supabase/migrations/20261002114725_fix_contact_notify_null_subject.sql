-- The contact form's subject is optional; NULL subject made the admin
-- notification's message NULL and the whole insert failed (NOT NULL).
CREATE OR REPLACE FUNCTION private.notify_admins_of_contact_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT
    ur.user_id,
    'New contact message',
    'New contact message',
    'A new message was submitted via the contact form: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'A new message was submitted via the contact form: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'contact_message',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin');
  RETURN NEW;
END;
$function$;
