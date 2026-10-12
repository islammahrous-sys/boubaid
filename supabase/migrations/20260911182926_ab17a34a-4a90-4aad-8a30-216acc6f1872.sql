CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('family', 'establishment')),
  title_ar text NOT NULL,
  title_en text,
  description_ar text,
  description_en text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published services" ON public.services FOR SELECT TO anon, authenticated USING (is_published = true OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'content_manager'::public.app_role)));
CREATE POLICY "Content staff can create services" ON public.services FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'content_manager'::public.app_role)));
CREATE POLICY "Content staff can update services" ON public.services FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'content_manager'::public.app_role))) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'content_manager'::public.app_role)));
CREATE POLICY "Content staff can delete services" ON public.services FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin'::public.app_role, 'super_admin'::public.app_role, 'content_manager'::public.app_role)));
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.documents ADD COLUMN service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;
CREATE INDEX documents_service_id_idx ON public.documents(service_id);
INSERT INTO public.services (slug, category, title_ar, title_en, sort_order) VALUES
('business-development-web-design', 'establishment', 'تطوير الأعمال وتصميم وإنشاء المواقع الإلكترونية', 'Business Development and Website Design', 1),
('family-tree-design', 'establishment', 'تصميم شجرة العائلة', 'Family Tree Design', 2),
('digital-family-tree', 'establishment', 'شجرة العائلة الرقمية', 'Digital Family Tree', 3),
('al-abadel-bisht', 'establishment', 'العبادل للبشوت', 'Al-Abadel Bisht', 4),
('al-abadel-oud', 'establishment', 'العبادل للعود', 'Al-Abadel Oud', 5),
('legal-consultancy', 'family', 'الاستشارات القانونية والأحكام القضائية المحلية والدولية', 'Legal Consultancy and Domestic & International Judgments', 1),
('accounting-services', 'family', 'الخدمات المحاسبية', 'Accounting Services', 2),
('english-language-education', 'family', 'تعليم اللغة الإنجليزية', 'English Language Education', 3);