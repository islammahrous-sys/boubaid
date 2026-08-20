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