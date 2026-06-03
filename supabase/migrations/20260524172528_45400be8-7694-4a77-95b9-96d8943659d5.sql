
-- api_errors: members can insert, owners can delete
CREATE POLICY "api_errors_insert_member" ON public.api_errors
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id = api_errors.company_id AND m.user_id = auth.uid()));

CREATE POLICY "api_errors_delete_owner" ON public.api_errors
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = api_errors.company_id AND c.owner_id = auth.uid()));

-- sync_logs: members can insert, owners can delete
CREATE POLICY "sync_logs_insert_member" ON public.sync_logs
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.company_members m WHERE m.company_id = sync_logs.company_id AND m.user_id = auth.uid()));

CREATE POLICY "sync_logs_delete_owner" ON public.sync_logs
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = sync_logs.company_id AND c.owner_id = auth.uid()));

-- company_members: only company owners can add/remove members
CREATE POLICY "company_members_insert_owner" ON public.company_members
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND c.owner_id = auth.uid()));

CREATE POLICY "company_members_delete_owner" ON public.company_members
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND c.owner_id = auth.uid()));
