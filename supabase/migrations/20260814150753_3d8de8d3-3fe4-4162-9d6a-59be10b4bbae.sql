insert into public.user_roles (user_id, role)
values ('95144f18-653f-4dad-85af-a052603e0e37', 'admin'),
       ('95144f18-653f-4dad-85af-a052603e0e37', 'editor'),
       ('95144f18-653f-4dad-85af-a052603e0e37', 'treasurer'),
       ('95144f18-653f-4dad-85af-a052603e0e37', 'member')
on conflict (user_id, role) do nothing;

update public.profiles
set full_name_ar = 'مدير تجريبي — أمانة المجلس'
where id = '95144f18-653f-4dad-85af-a052603e0e37';