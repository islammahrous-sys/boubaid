CREATE OR REPLACE FUNCTION public.validate_initiative_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.kind NOT IN ('project', 'program', 'competition') THEN
    RAISE EXCEPTION 'Invalid initiative kind';
  END IF;
  RETURN NEW;
END;
$function$;