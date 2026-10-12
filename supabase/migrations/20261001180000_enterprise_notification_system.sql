-- ============================================================================
-- Migration: Enterprise Email Notification System & Delivery Architecture
-- ============================================================================

-- 1. Create email_logs table for comprehensive delivery tracking and queuing
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  email_type text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('CRITICAL', 'HIGH', 'NORMAL', 'LOW')),
  language text NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  subject text NOT NULL,
  html_body text,
  text_body text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'cancelled')),
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  error_message text,
  idempotency_key text UNIQUE,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create notification_email_templates table
CREATE TABLE IF NOT EXISTS public.notification_email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  category text NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  subject_template_ar text NOT NULL,
  subject_template_en text NOT NULL,
  body_template_ar text,
  body_template_en text,
  available_variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_priority text NOT NULL DEFAULT 'NORMAL',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_status_priority_sched ON public.email_logs (status, priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs (recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON public.email_logs (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at_desc ON public.email_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs (email_type);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.notification_email_templates (category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.notification_email_templates (is_active);

-- 4. Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_email_templates ENABLE ROW LEVEL SECURITY;

-- Permissions
GRANT SELECT, INSERT, UPDATE ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

GRANT SELECT ON public.notification_email_templates TO authenticated, anon;
GRANT ALL ON public.notification_email_templates TO service_role;

-- Policies for email_logs
DROP POLICY IF EXISTS "email_logs_select_own_or_admin" ON public.email_logs;
CREATE POLICY "email_logs_select_own_or_admin" ON public.email_logs
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "email_logs_admin_write" ON public.email_logs;
CREATE POLICY "email_logs_admin_write" ON public.email_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin', 'super_admin')
    )
  );

-- Policies for notification_email_templates
DROP POLICY IF EXISTS "notification_email_templates_public_read" ON public.notification_email_templates;
CREATE POLICY "notification_email_templates_public_read" ON public.notification_email_templates
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "notification_email_templates_admin_write" ON public.notification_email_templates;
CREATE POLICY "notification_email_templates_admin_write" ON public.notification_email_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role::text IN ('admin', 'super_admin')
    )
  );

-- 5. RPC function to get aggregated email statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_email_statistics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('admin', 'super_admin')
  ) AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'total', count(*),
    'queued', count(*) FILTER (WHERE status = 'queued'),
    'processing', count(*) FILTER (WHERE status = 'processing'),
    'sent', count(*) FILTER (WHERE status = 'sent'),
    'delivered', count(*) FILTER (WHERE status = 'delivered'),
    'bounced', count(*) FILTER (WHERE status = 'bounced'),
    'failed', count(*) FILTER (WHERE status = 'failed'),
    'complained', count(*) FILTER (WHERE status = 'complained'),
    'critical_count', count(*) FILTER (WHERE priority = 'CRITICAL'),
    'high_count', count(*) FILTER (WHERE priority = 'HIGH')
  )
  INTO v_stats
  FROM public.email_logs;

  RETURN coalesce(v_stats, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_statistics() TO authenticated, service_role;
