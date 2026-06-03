create table if not exists public.brand_guideline_workspaces (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  mode text not null default 'new' check (mode in ('existing', 'new')),
  form jsonb not null default '{}'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  export_format text not null default 'pdf',
  guideline jsonb,
  website_analysis jsonb,
  phase text not null default 'idle' check (phase in ('idle', 'running', 'done')),
  confidence integer not null default 0,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id)
);

create index if not exists brand_guideline_workspaces_company_idx
  on public.brand_guideline_workspaces(company_id, updated_at desc);

alter table public.brand_guideline_workspaces enable row level security;

drop policy if exists brand_guideline_workspaces_select_member on public.brand_guideline_workspaces;
drop policy if exists brand_guideline_workspaces_insert_member on public.brand_guideline_workspaces;
drop policy if exists brand_guideline_workspaces_update_member on public.brand_guideline_workspaces;
drop policy if exists brand_guideline_workspaces_delete_owner on public.brand_guideline_workspaces;

create policy brand_guideline_workspaces_select_member
  on public.brand_guideline_workspaces
  for select
  to authenticated
  using (
    exists (
      select 1 from public.company_members m
      where m.company_id = brand_guideline_workspaces.company_id
        and m.user_id = auth.uid()
    )
  );

create policy brand_guideline_workspaces_insert_member
  on public.brand_guideline_workspaces
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.company_members m
      where m.company_id = brand_guideline_workspaces.company_id
        and m.user_id = auth.uid()
    )
  );

create policy brand_guideline_workspaces_update_member
  on public.brand_guideline_workspaces
  for update
  to authenticated
  using (
    exists (
      select 1 from public.company_members m
      where m.company_id = brand_guideline_workspaces.company_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.company_members m
      where m.company_id = brand_guideline_workspaces.company_id
        and m.user_id = auth.uid()
    )
  );

create policy brand_guideline_workspaces_delete_owner
  on public.brand_guideline_workspaces
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.companies c
      where c.id = brand_guideline_workspaces.company_id
        and c.owner_id = auth.uid()
    )
  );

drop trigger if exists brand_guideline_workspaces_set_updated_at on public.brand_guideline_workspaces;
create trigger brand_guideline_workspaces_set_updated_at
before update on public.brand_guideline_workspaces
for each row execute function public.tg_set_updated_at();