-- Costasur CDE: avoid RLS recursion while an owner creates the initial membership.
-- The helper is private and is not exposed through the public API schema.

begin;

create or replace function private.is_owner_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.projects pr
    join public.properties p on p.id = pr.property_id
    where pr.id = target_project_id
      and p.owner_user_id = (select auth.uid())
      and p.status <> 'archived'
  );
$$;

revoke all on function private.is_owner_project(uuid) from public;
revoke all on function private.is_owner_project(uuid) from anon;
grant execute on function private.is_owner_project(uuid) to authenticated;

drop policy if exists project_members_admin_or_owner_self_insert on public.project_members;

create policy project_members_admin_or_owner_self_insert
on public.project_members
for insert
to authenticated
with check (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and membership_role = 'propietario'
    and status = 'active'
    and invited_by = (select auth.uid())
    and private.is_owner_project(project_id)
  )
);

commit;
