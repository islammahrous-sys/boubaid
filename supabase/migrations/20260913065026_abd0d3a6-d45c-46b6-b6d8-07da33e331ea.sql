ALTER TABLE public.achievers
  ADD COLUMN section text NOT NULL DEFAULT 'excellence_award',
  ADD COLUMN award_year text;

CREATE OR REPLACE FUNCTION public.validate_achiever_roll_section()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.section NOT IN ('family_competency', 'excellence_award') THEN
    RAISE EXCEPTION 'Invalid Roll of Honor section';
  END IF;

  IF NEW.section = 'excellence_award' AND (NEW.award_year IS NULL OR btrim(NEW.award_year) = '') THEN
    RAISE EXCEPTION 'Excellence Award records require an award year';
  END IF;

  IF NEW.section = 'family_competency' THEN
    NEW.award_year := NULL;
  ELSE
    NEW.award_year := btrim(NEW.award_year);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_achiever_roll_section_before_write
BEFORE INSERT OR UPDATE ON public.achievers
FOR EACH ROW
EXECUTE FUNCTION public.validate_achiever_roll_section();

CREATE INDEX achievers_section_year_sort_idx
  ON public.achievers (section, award_year, sort_order);