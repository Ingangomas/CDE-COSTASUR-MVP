-- Costasur CDE: automatic project visibility for Control de Obras.
-- Ensures the department can see and resolve requests on every active project.

begin;

create or replace function private.assign_control_obras_members(target_project_id uuid, inviter_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.project_members(
    project_id,
    user_id,
    membership_role,
    department_id,
    status,
    invited_by,
    approved_by
  )
  select
    target_project_id,
    ur.user_id,
    'control_obras',
    ur.department_id,
    'active',
    inviter_id,
    inviter_id
  from public.user_roles ur
  where ur.role_key = 'control_obras'
    and ur.is_active = true
    and not exists (
      select 1
      from public.project_members pm
      where pm.project_id = target_project_id
        and pm.user_id = ur.user_id
        and pm.membership_role = 'control_obras'
        and pm.department_id is not distinct from ur.department_id
    );
end;
$$;

revoke all on function private.assign_control_obras_members(uuid, uuid) from public;
revoke all on function private.assign_control_obras_members(uuid, uuid) from anon;

create or replace function private.trg_assign_control_obras_members()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assign_control_obras_members(new.id, new.created_by);
  return new;
end;
$$;

revoke all on function private.trg_assign_control_obras_members() from public;
revoke all on function private.trg_assign_control_obras_members() from anon;

drop trigger if exists trg_assign_control_obras_members on public.projects;
create trigger trg_assign_control_obras_members
after insert on public.projects
for each row execute function private.trg_assign_control_obras_members();

-- Backfill existing non-archived projects so the current CDE is immediately operable.
do $$
declare
  project_row record;
  inviter_id uuid;
begin
  select p.id into inviter_id
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  where ur.role_key = 'admin_general'
    and ur.is_active = true
  order by p.created_at asc
  limit 1;

  for project_row in
    select id
    from public.projects
    where cde_status <> 'archive'
  loop
    perform private.assign_control_obras_members(project_row.id, inviter_id);
  end loop;
end $$;

commit;
