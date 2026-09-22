CREATE TABLE public.site_visit_counters (
  key text PRIMARY KEY DEFAULT 'main',
  total_count bigint NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_visit_counters_key_check CHECK (key = 'main')
);

GRANT SELECT ON public.site_visit_counters TO anon, authenticated;
GRANT ALL ON public.site_visit_counters TO service_role;

ALTER TABLE public.site_visit_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site visit counter"
ON public.site_visit_counters
FOR SELECT
TO anon, authenticated
USING (key = 'main');

CREATE POLICY "Service role can manage site visit counter"
ON public.site_visit_counters
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE public.site_visit_sessions (
  visit_key text PRIMARY KEY,
  last_counted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.site_visit_sessions TO service_role;

ALTER TABLE public.site_visit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage site visit sessions"
ON public.site_visit_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

INSERT INTO public.site_visit_counters (key, total_count)
VALUES ('main', 0)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.record_site_visit(p_visit_key text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_now timestamp with time zone := now();
  v_existing timestamp with time zone;
  v_total bigint;
BEGIN
  IF p_visit_key IS NULL OR length(trim(p_visit_key)) < 16 THEN
    RAISE EXCEPTION 'visit_key_required';
  END IF;

  INSERT INTO public.site_visit_counters (key, total_count)
  VALUES ('main', 0)
  ON CONFLICT (key) DO NOTHING;

  SELECT last_counted_at
    INTO v_existing
  FROM public.site_visit_sessions
  WHERE visit_key = p_visit_key
  FOR UPDATE;

  IF v_existing IS NULL THEN
    INSERT INTO public.site_visit_sessions (visit_key, last_counted_at, created_at)
    VALUES (p_visit_key, v_now, v_now);

    UPDATE public.site_visit_counters
    SET total_count = total_count + 1,
        updated_at = v_now
    WHERE key = 'main'
    RETURNING total_count INTO v_total;
  ELSIF v_existing < v_now - interval '30 minutes' THEN
    UPDATE public.site_visit_sessions
    SET last_counted_at = v_now
    WHERE visit_key = p_visit_key;

    UPDATE public.site_visit_counters
    SET total_count = total_count + 1,
        updated_at = v_now
    WHERE key = 'main'
    RETURNING total_count INTO v_total;
  ELSE
    SELECT total_count INTO v_total
    FROM public.site_visit_counters
    WHERE key = 'main';
  END IF;

  RETURN coalesce(v_total, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_site_visit(text) TO anon, authenticated, service_role;

CREATE TRIGGER site_visit_counters_set_updated_at
BEFORE UPDATE ON public.site_visit_counters
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();