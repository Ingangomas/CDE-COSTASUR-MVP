-- Costasur CDE: isolate privileged RLS helpers in a non-exposed schema.
-- Public wrappers remain SECURITY INVOKER for policy compatibility; they cannot
-- escalate privileges and only delegate to the private SECURITY DEFINER helpers.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role_key = 'admin_general'
      and ur.is_active = true
  );
$$;

create or replace function private.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role_key = required_role
      and ur.is_active = true
  );
$$;

create or replace function private.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select (select private.is_admin()) or exists (
    select 1 from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = (select auth.uid())
      and pm.status = 'active'
  );
$$;

create or replace function private.can_review_department(target_project_id uuid, target_department_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select (select private.is_admin()) or exists (
    select 1
    from public.project_members pm
    join public.user_roles ur on ur.user_id = (select auth.uid()) and ur.is_active = true
    where pm.project_id = target_project_id
      and pm.department_id = target_department_id
      and pm.status = 'active'
      and pm.user_id = (select auth.uid())
      and pm.membership_role in ('revisor','control_obras')
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_admin() from anon;
revoke all on function private.has_role(text) from public;
revoke all on function private.has_role(text) from anon;
revoke all on function private.can_access_project(uuid) from public;
revoke all on function private.can_access_project(uuid) from anon;
revoke all on function private.can_review_department(uuid, uuid) from public;
revoke all on function private.can_review_department(uuid, uuid) from anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.has_role(text) to authenticated;
grant execute on function private.can_access_project(uuid) to authenticated;
grant execute on function private.can_review_department(uuid, uuid) to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, private
as $$ select private.is_admin(); $$;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security invoker
set search_path = public, private
as $$ select private.has_role(required_role); $$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, private
as $$ select private.can_access_project(target_project_id); $$;

create or replace function public.can_review_department(target_project_id uuid, target_department_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, private
as $$ select private.can_review_department(target_project_id, target_department_id); $$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.can_review_department(uuid, uuid) to authenticated;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_role(text) from anon;
revoke execute on function public.can_access_project(uuid) from anon;
revoke execute on function public.can_review_department(uuid, uuid) from anon;
