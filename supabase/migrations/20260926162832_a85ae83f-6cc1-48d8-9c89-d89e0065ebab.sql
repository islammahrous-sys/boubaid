ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS lineage_notes;