-- Costasur CDE: make owner project creation atomic and avoid policy recursion.
-- Authorization is enforced explicitly against auth.uid() and the owned property.

begin;

create or replace function public.create_owner_project(
  p_property_id uuid,
  p_project_code text,
  p_title text,
  p_project_type text
)
returns public.projects
language plpgsql
security definer
set search_path = public, private
as $$
declare
  created_project public.projects;
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.properties p
    where p.id = p_property_id
      and p.owner_user_id = caller_id
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
    caller_id
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
    caller_id,
    'propietario',
    'active',
    caller_id
  );

  return created_project;
end;
$$;

revoke all on function public.create_owner_project(uuid, text, text, text) from public;
revoke all on function public.create_owner_project(uuid, text, text, text) from anon;
grant execute on function public.create_owner_project(uuid, text, text, text) to authenticated;

commit;
