create table if not exists public.editor_workspaces (
  site_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.editor_workspaces enable row level security;

create policy if not exists "editor_workspaces_select"
on public.editor_workspaces
for select
using (
  exists (
    select 1
    from public.super_admins sa
    where sa.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.site_admins s
    where s.user_id = auth.uid()
      and s.site_id = editor_workspaces.site_id
  )
);

create policy if not exists "editor_workspaces_upsert"
on public.editor_workspaces
for insert
with check (
  exists (
    select 1
    from public.super_admins sa
    where sa.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.site_admins s
    where s.user_id = auth.uid()
      and s.site_id = editor_workspaces.site_id
  )
);

create policy if not exists "editor_workspaces_update"
on public.editor_workspaces
for update
using (
  exists (
    select 1
    from public.super_admins sa
    where sa.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.site_admins s
    where s.user_id = auth.uid()
      and s.site_id = editor_workspaces.site_id
  )
)
with check (
  exists (
    select 1
    from public.super_admins sa
    where sa.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.site_admins s
    where s.user_id = auth.uid()
      and s.site_id = editor_workspaces.site_id
  )
);
