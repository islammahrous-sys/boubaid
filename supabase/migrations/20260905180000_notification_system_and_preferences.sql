-- ─────────────────────────────────────────────────────────────
-- Migration: Complete Role-Based Notification System & Preferences
-- ─────────────────────────────────────────────────────────────

-- 1. Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_alerts boolean NOT NULL DEFAULT true,
  family_events boolean NOT NULL DEFAULT true,
  contributions boolean NOT NULL DEFAULT true,
  lineage_updates boolean NOT NULL DEFAULT true,
  articles_news boolean NOT NULL DEFAULT true,
  email_notifications boolean NOT NULL DEFAULT true,
  in_app_notifications boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_notification_preferences_user UNIQUE (user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

DROP POLICY IF EXISTS "notification_preferences_select_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select_own" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notification_preferences_insert_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notification_preferences_update_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 2. Ensure public.notifications has proper performance index
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- 3. Enhance notify_admins_of_membership_request to include family_manager and bilingual text
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
    'طلب انضمام وعضوية جديد',
    'New membership request',
    'تقدم ' || coalesce(NEW.full_name_ar, 'أحد أفراد الأسرة') || ' بطلب توثيق عضوية جديد بحاجة لمراجعة أمانة المجلس.',
    'A new membership verification request was submitted by ' || coalesce(NEW.full_name_en, NEW.full_name_ar, 'a family applicant') || '.',
    'membership',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin', 'family_manager');

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.notify_admins_of_membership_request() FROM PUBLIC, anon, authenticated;

-- 4. Enhance notify_admins_of_inquiry to include content managers and proper bilingual text
CREATE OR REPLACE FUNCTION private.notify_admins_of_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT DISTINCT
    ur.user_id,
    'استفسار جديد وارد',
    'New inquiry received',
    'ورد استفسار جديد: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'A new inquiry was received: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'inquiry',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin', 'editor', 'content_manager');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.notify_admins_of_inquiry() FROM PUBLIC, anon, authenticated;

-- 5. Enhance notify_admins_of_contact_message to include content staff and bilingual text
CREATE OR REPLACE FUNCTION private.notify_admins_of_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT DISTINCT
    ur.user_id,
    'رسالة تواصل جديدة',
    'New contact message',
    'وردت رسالة تواصل جديدة عبر البوابة: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'A new message was submitted via the contact form: ' || left(coalesce(NEW.subject, NEW.message), 80),
    'contact_message',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin', 'editor', 'content_manager');
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.notify_admins_of_contact_message() FROM PUBLIC, anon, authenticated;

-- 6. Trigger to notify admins and family managers on new user registration in profiles
CREATE OR REPLACE FUNCTION private.notify_staff_on_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title_ar, title_en, message_ar, message_en, type, link, is_read)
  SELECT DISTINCT
    ur.user_id,
    'تسجيل حساب جديد',
    'New account registered',
    'انضم مستخدم جديد للمنظومة: ' || coalesce(NEW.full_name_ar, NEW.email, 'عضو جديد'),
    'A new user has registered: ' || coalesce(NEW.full_name_en, NEW.full_name_ar, NEW.email, 'New user'),
    'registration',
    '/admin',
    false
  FROM public.user_roles ur
  WHERE ur.role::text IN ('admin', 'super_admin', 'family_manager')
    AND ur.user_id <> NEW.id;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.notify_staff_on_new_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_staff_on_new_profile ON public.profiles;
CREATE TRIGGER trg_notify_staff_on_new_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.notify_staff_on_new_profile();
