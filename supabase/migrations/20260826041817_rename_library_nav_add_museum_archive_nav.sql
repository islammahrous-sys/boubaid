-- Was serving as the single "Archive" entry pointing at /library. The
-- Museum Archive Gallery feature now owns the "Archive" label/URL, so this
-- becomes the plain Library entry, and a new item takes the freed-up label.
update public.navigation_items
set label_ar = 'المكتبة الرقمية', label_en = 'Digital Library'
where id = 'fd000000-0000-0000-0000-000000000005';

update public.navigation_items ni
set sort_order = ni.sort_order + 1
from public.navigation_menus nm
where ni.menu_id = nm.id and nm.code = 'header' and ni.sort_order >= 6 and ni.parent_id is null;

insert into public.navigation_items (menu_id, label_ar, label_en, url, type, parent_id, sort_order, visibility)
select nm.id, 'الأرشيف', 'Archive', '/museum/archive', 'link', null, 6, 'public'
from public.navigation_menus nm
where nm.code = 'header';
