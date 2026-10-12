update public.galleries set status = 'published' where source_drive_folder_id is not null and status != 'published';
