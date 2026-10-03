-- Un-does rename_library_nav_add_museum_archive_nav: the Museum Archive
-- Gallery feature is being folded back into the /library page (as a new
-- "Museum Collections" tab) instead of staying a standalone nav destination,
-- so the header goes back to a single combined Archive entry.
delete from public.navigation_items
where menu_id in (select id from public.navigation_menus where code = 'header')
  and url = '/museum/archive';

update public.navigation_items
set label_ar = 'الأرشيف', label_en = 'Archive'
where id = 'fd000000-0000-0000-0000-000000000005';

update public.navigation_items ni
set sort_order = ni.sort_order - 1
from public.navigation_menus nm
where ni.menu_id = nm.id and nm.code = 'header' and ni.sort_order >= 7 and ni.parent_id is null;
