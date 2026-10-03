INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (VALUES ('admin'::app_role), ('editor'::app_role), ('treasurer'::app_role), ('member'::app_role)) AS r(role)
WHERE u.email = 'admin@alboubaid.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p
SET full_name_ar = COALESCE(p.full_name_ar, 'مشرف المجلس'),
    full_name_en = COALESCE(p.full_name_en, 'Council Admin')
WHERE p.email = 'admin@alboubaid.com';

-- Automatically grant admin roles when admin@alboubaid.com is created
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'admin@alboubaid.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES
      (NEW.id, 'admin'::app_role),
      (NEW.id, 'editor'::app_role),
      (NEW.id, 'treasurer'::app_role),
      (NEW.id, 'member'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.profiles
    SET full_name_ar = COALESCE(full_name_ar, 'مشرف المجلس'),
        full_name_en = COALESCE(full_name_en, 'Council Admin')
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_admin_user_created ON auth.users;
CREATE TRIGGER on_auth_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();
