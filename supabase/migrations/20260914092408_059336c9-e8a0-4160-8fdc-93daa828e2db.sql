DROP POLICY IF EXISTS "Admins and editors can manage businesses" ON public.businesses;
CREATE POLICY "Admins and editors can manage businesses"
ON public.businesses FOR ALL TO authenticated
USING (private.has_permission(auth.uid(), 'cms.manage') OR private.has_permission(auth.uid(), 'admin.all'))
WITH CHECK (private.has_permission(auth.uid(), 'cms.manage') OR private.has_permission(auth.uid(), 'admin.all'));