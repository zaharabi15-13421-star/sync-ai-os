
-- 1) brand_guideline_files: tighten UPDATE WITH CHECK so guideline_id must belong to the user
DROP POLICY IF EXISTS brand_guideline_files_update_own ON public.brand_guideline_files;
CREATE POLICY brand_guideline_files_update_own
  ON public.brand_guideline_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.brand_guidelines g
      WHERE g.id = brand_guideline_files.guideline_id
        AND g.user_id = auth.uid()
    )
  );

-- Also tighten INSERT so a new row's guideline_id must belong to the user
DROP POLICY IF EXISTS brand_guideline_files_insert_own ON public.brand_guideline_files;
CREATE POLICY brand_guideline_files_insert_own
  ON public.brand_guideline_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.brand_guidelines g
      WHERE g.id = brand_guideline_files.guideline_id
        AND g.user_id = auth.uid()
    )
  );

-- 2) company_members: add restrictive UPDATE policy — only the company owner can update,
--    and role changes go through service_role / admin paths. Prevent self role escalation.
CREATE POLICY company_members_update_owner
  ON public.company_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_members.company_id
        AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_members.company_id
        AND c.owner_id = auth.uid()
    )
  );

-- 3) google_connections: RLS enabled but no policies — table is currently unreachable
--    by authenticated users (service_role only). Add explicit policies so company
--    owners can read non-secret metadata while keeping writes owner-scoped.
--    Refresh tokens remain in encrypted columns and should still be accessed
--    server-side via supabaseAdmin; RLS here is defense in depth.
CREATE POLICY google_connections_select_owner
  ON public.google_connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connections.company_id
        AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY google_connections_modify_owner
  ON public.google_connections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connections.company_id
        AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = google_connections.company_id
        AND c.owner_id = auth.uid()
    )
  );
