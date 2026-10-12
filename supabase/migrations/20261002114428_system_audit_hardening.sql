-- System audit 2026-10-02 hardening.
-- 1. Public write paths go through server functions (service-role) only, so
--    drop the open anon/authenticated INSERT policies on the public forms.
DROP POLICY IF EXISTS contact_messages_insert_public ON public.contact_messages;
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;
DROP POLICY IF EXISTS newsletter_insert_public ON public.newsletter_subscribers;
DROP POLICY IF EXISTS event_reg_insert ON public.event_registrations;
DROP POLICY IF EXISTS init_reg_insert ON public.initiative_registrations;

-- 2. get_email_statistics is admin-only (self-guarded); remove the default
--    PUBLIC/anon EXECUTE grant.
REVOKE EXECUTE ON FUNCTION public.get_email_statistics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_email_statistics() TO authenticated, service_role;

-- 3. Covering index for the email_logs -> notifications FK.
CREATE INDEX IF NOT EXISTS email_logs_notification_id_idx
  ON public.email_logs (notification_id);

-- 4. DB-backed fixed-window rate limiter shared by all serverless instances.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.rate_limits TO service_role;

-- Returns true when the caller has exceeded p_max hits inside the window.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hits integer;
BEGIN
  INSERT INTO public.rate_limits AS r (key, hits, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE
    SET hits = CASE
          WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN 1
          ELSE r.hits + 1
        END,
        window_start = CASE
          WHEN r.window_start < now() - make_interval(secs => p_window_seconds) THEN now()
          ELSE r.window_start
        END
  RETURNING hits INTO v_hits;

  -- Opportunistic cleanup of stale keys.
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  END IF;

  RETURN v_hits > p_max;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;
