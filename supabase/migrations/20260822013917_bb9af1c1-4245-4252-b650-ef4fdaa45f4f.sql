ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS link_label_ar text,
  ADD COLUMN IF NOT EXISTS link_label_en text;

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS public_url text;