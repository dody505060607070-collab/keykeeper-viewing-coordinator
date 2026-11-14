DROP POLICY IF EXISTS "staff manage employee goals" ON public.employee_goals;
DROP POLICY IF EXISTS "staff read employee goals" ON public.employee_goals;
CREATE POLICY "staff read employee goals" ON public.employee_goals FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR public.has_perm(auth.uid(),'employees','view') OR public.has_perm(auth.uid(),'employees','manage'));
CREATE POLICY "staff manage employee goals" ON public.employee_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_perm(auth.uid(),'employees','manage'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_perm(auth.uid(),'employees','manage'));

DROP POLICY IF EXISTS "public submit supply request" ON public.supply_requests;
CREATE POLICY "public submit supply request" ON public.supply_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND admin_notes IS NULL AND assigned_to IS NULL AND contact_id IS NULL
    AND char_length(coalesce(full_name,'')) BETWEEN 1 AND 200 AND char_length(coalesce(phone,'')) BETWEEN 6 AND 30);

DROP POLICY IF EXISTS "public submit listing request" ON public.listing_requests;
CREATE POLICY "public submit listing request" ON public.listing_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND admin_notes IS NULL AND assigned_to IS NULL AND contact_id IS NULL AND property_id IS NULL
    AND char_length(coalesce(full_name,'')) BETWEEN 1 AND 200 AND char_length(coalesce(phone,'')) BETWEEN 6 AND 30);

DROP POLICY IF EXISTS "staff read price offers" ON public.price_offers;
DROP POLICY IF EXISTS "staff update price offers" ON public.price_offers;
DROP POLICY IF EXISTS "staff delete price offers" ON public.price_offers;
CREATE POLICY "staff read price offers" ON public.price_offers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update price offers" ON public.price_offers FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete price offers" ON public.price_offers FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff read maintenance" ON public.maintenance_requests;
DROP POLICY IF EXISTS "staff update maintenance" ON public.maintenance_requests;
DROP POLICY IF EXISTS "staff delete maintenance" ON public.maintenance_requests;
DROP POLICY IF EXISTS "staff write maintenance" ON public.maintenance_requests;
CREATE POLICY "staff read maintenance" ON public.maintenance_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update maintenance" ON public.maintenance_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "staff delete maintenance" ON public.maintenance_requests FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write maintenance" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "read services" ON public.services;

DROP POLICY IF EXISTS "kill_switch_public_read" ON public.site_kill_switch;
CREATE POLICY "kill_switch_public_read" ON public.site_kill_switch FOR SELECT TO anon, authenticated USING (id = 1);

DROP POLICY IF EXISTS "anyone read settings" ON public.app_settings;
DROP POLICY IF EXISTS "auth read settings public" ON public.app_settings;
CREATE POLICY "staff read settings" ON public.app_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "public can upload listing request media" ON storage.objects;
DROP POLICY IF EXISTS "public upload listing request media" ON storage.objects;
CREATE POLICY "public upload listing request media" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'listing-request-media' AND (storage.foldername(name))[1] = 'public'
    AND owner_id IS NOT DISTINCT FROM (select auth.uid()::text)
    AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp']));