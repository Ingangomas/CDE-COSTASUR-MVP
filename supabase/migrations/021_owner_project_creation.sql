-- Costasur CDE: allow an owner to start an expediente on a property they own.
-- The owner can only create the project and the matching active membership for self.
-- Admin governance remains the only path for assigning other users or roles.

begin;

drop policy if exists projects_admin_or_creator_insert on public.projects;

create policy projects_admin_or_owner_creator_insert
on public.projects
for insert
to authenticated
with check (
  public.is_admin()
  or (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_user_id = (select auth.uid())
        and p.status <> 'archived'
    )
  )
);

drop policy if exists project_members_admin_insert on public.project_members;

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
    and exists (
      select 1
      from public.projects pr
      join public.properties p on p.id = pr.property_id
      where pr.id = project_id
        and p.owner_user_id = (select auth.uid())
        and p.status <> 'archived'
    )
  )
);

create or replace function public.create_owner_project(
  p_property_id uuid,
  p_project_code text,
  p_title text,
  p_project_type text
)
returns public.projects
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_project public.projects;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.properties p
    where p.id = p_property_id
      and p.owner_user_id = (select auth.uid())
      and p.status <> 'archived'
  ) then
    raise exception 'The property is not owned by the authenticated user';
  end if;

  insert into public.projects (
    property_id,
    project_code,
    title,
    project_type,
    created_by
  ) values (
    p_property_id,
    p_project_code,
    p_title,
    p_project_type,
    (select auth.uid())
  )
  returning * into created_project;

  insert into public.project_members (
    project_id,
    user_id,
    membership_role,
    status,
    invited_by
  ) values (
    created_project.id,
    (select auth.uid()),
    'propietario',
    'active',
    (select auth.uid())
  );

  return created_project;
end;
$$;

grant execute on function public.create_owner_project(uuid, text, text, text) to authenticated;
revoke execute on function public.create_owner_project(uuid, text, text, text) from anon;

commit;
