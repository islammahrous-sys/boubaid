-- Wrap auth.uid()/auth.role()/auth.jwt() in (select ...) inside public RLS
-- policies so Postgres evaluates them once per statement (initplan) instead of
-- once per row. Semantics are unchanged. Clears the auth_rls_initplan advisor.
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    new_qual := regexp_replace(r.qual, '(?<!select )auth\.(uid|role|jwt)\(\)', '(select auth.\1())', 'gi');
    new_check := regexp_replace(r.with_check, '(?<!select )auth\.(uid|role|jwt)\(\)', '(select auth.\1())', 'gi');

    IF new_qual IS DISTINCT FROM r.qual OR new_check IS DISTINCT FROM r.with_check THEN
      stmt := format('ALTER POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
      IF new_qual IS NOT NULL THEN
        stmt := stmt || format(' USING (%s)', new_qual);
      END IF;
      IF new_check IS NOT NULL THEN
        stmt := stmt || format(' WITH CHECK (%s)', new_check);
      END IF;
      EXECUTE stmt;
    END IF;
  END LOOP;
END
$$;
