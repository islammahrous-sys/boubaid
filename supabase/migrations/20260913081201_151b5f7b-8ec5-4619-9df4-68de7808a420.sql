ALTER TABLE public.initiatives
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'project';

CREATE OR REPLACE FUNCTION public.validate_initiative_kind()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.kind NOT IN ('project', 'program') THEN
    RAISE EXCEPTION 'Invalid initiative kind';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_initiative_kind_before_write ON public.initiatives;
CREATE TRIGGER validate_initiative_kind_before_write
BEFORE INSERT OR UPDATE ON public.initiatives
FOR EACH ROW EXECUTE FUNCTION public.validate_initiative_kind();

CREATE INDEX IF NOT EXISTS initiatives_kind_sort_idx
  ON public.initiatives (kind, is_published, sort_order);