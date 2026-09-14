ALTER TABLE public.galleries
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'museum',
  ADD COLUMN IF NOT EXISTS parent_id uuid NULL REFERENCES public.galleries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS galleries_section_idx ON public.galleries (section);
CREATE INDEX IF NOT EXISTS galleries_parent_id_idx ON public.galleries (parent_id);