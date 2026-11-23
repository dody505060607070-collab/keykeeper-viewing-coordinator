DROP POLICY IF EXISTS "read partners" ON public.partners;
CREATE POLICY "staff read all partners" ON public.partners FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "read guarantees" ON public.sale_guarantees;
CREATE POLICY "auth read guarantees" ON public.sale_guarantees FOR SELECT TO authenticated USING (true);