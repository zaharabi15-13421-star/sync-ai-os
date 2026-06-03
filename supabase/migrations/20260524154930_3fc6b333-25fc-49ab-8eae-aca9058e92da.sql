
-- 1. Tighten api_errors RLS: drop NULL-company exposure
DROP POLICY IF EXISTS api_errors_select_member ON public.api_errors;
CREATE POLICY api_errors_select_member ON public.api_errors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = api_errors.company_id AND m.user_id = auth.uid()
    )
  );

-- Ensure new api_errors rows must have a company_id
ALTER TABLE public.api_errors ALTER COLUMN company_id SET NOT NULL;

-- 2. Add DELETE policy for brand_identity (company owners only)
DROP POLICY IF EXISTS brand_identity_delete_owner ON public.brand_identity;
CREATE POLICY brand_identity_delete_owner ON public.brand_identity
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = brand_identity.company_id AND c.owner_id = auth.uid()
    )
  );

-- 3. Lock down SECURITY DEFINER / trigger helper functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
