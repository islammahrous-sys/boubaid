CREATE TABLE public.council_committees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.council_committees TO anon, authenticated;
GRANT ALL ON public.council_committees TO service_role;

ALTER TABLE public.council_committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active council committees"
ON public.council_committees
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage council committees"
ON public.council_committees
FOR ALL
TO authenticated
USING (private.can_manage_users(auth.uid()))
WITH CHECK (private.can_manage_users(auth.uid()));

CREATE TRIGGER council_committees_set_updated_at
BEFORE UPDATE ON public.council_committees
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS request_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_inquiries_request_metadata_committee_slug
ON public.inquiries ((request_metadata->>'committee_slug'));

CREATE INDEX IF NOT EXISTS idx_inquiries_source
ON public.inquiries (source);