DROP POLICY IF EXISTS "auth read guarantees" ON public.sale_guarantees;
CREATE POLICY "staff read guarantees" ON public.sale_guarantees FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));