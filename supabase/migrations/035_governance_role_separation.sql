-- CDE Costasur: dedicated governance role.
-- Additive migration: preserves all existing policies and workflows.

begin;

alter table public.user_roles drop constraint if exists user_roles_role_key_check;
alter table public.user_roles
  add constraint user_roles_role_key_check
  check (role_key in (
    'admin_general','gobernanza','propietario','arquitecto','contratista',
    'revision_tecnica','control_obras','legal','electrica','hidrosanitaria',
    'paisajismo','mensura','seguridad'
  ));

create or replace function public.is_governance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key = 'gobernanza'
      and ur.is_active = true
  );
$$;

revoke all on function public.is_governance() from public;
grant execute on function public.is_governance() to authenticated;

update public.profiles
set display_name = 'Gobernanza', status = 'active', is_demo = true, updated_at = now()
where email = 'gobernanza@costasur.com';

insert into public.user_roles (user_id, role_key, department_id, is_active, granted_by)
select p.id, 'gobernanza', null, true,
       (select id from public.profiles where email = 'admin.demo@costasur.com' limit 1)
from public.profiles p
where p.email = 'gobernanza@costasur.com'
on conflict (user_id, role_key, department_id) do update
set is_active = true, granted_at = now();

-- Additive policies. Existing admin policies remain in place so current
-- project creation, workflow transitions and emergency operations do not change.
create policy profiles_governance_read
  on public.profiles for select to authenticated
  using (public.is_governance());

create policy user_roles_governance_read
  on public.user_roles for select to authenticated
  using (public.is_governance());

create policy project_members_governance_read
  on public.project_members for select to authenticated
  using (public.is_governance());

create policy profiles_governance_update
  on public.profiles for update to authenticated
  using (public.is_governance())
  with check (public.is_governance());

create policy user_roles_governance_insert
  on public.user_roles for insert to authenticated
  with check (public.is_governance());

create policy user_roles_governance_update
  on public.user_roles for update to authenticated
  using (public.is_governance())
  with check (public.is_governance());

create policy user_roles_governance_delete
  on public.user_roles for delete to authenticated
  using (public.is_governance());

create policy project_members_governance_insert
  on public.project_members for insert to authenticated
  with check (public.is_governance());

create policy project_members_governance_update
  on public.project_members for update to authenticated
  using (public.is_governance())
  with check (public.is_governance());

create policy project_members_governance_delete
  on public.project_members for delete to authenticated
  using (public.is_governance());

create policy properties_governance_update
  on public.properties for update to authenticated
  using (public.is_governance())
  with check (public.is_governance());

insert into public.audit_events (actor_id, action, entity_type, entity_id, metadata)
select p.id, 'role_assigned', 'user_role', ur.id,
       jsonb_build_object('role_key','gobernanza','source','035_governance_role_separation')
from public.profiles p
join public.user_roles ur on ur.user_id = p.id and ur.role_key = 'gobernanza'
where p.email = 'gobernanza@costasur.com'
  and not exists (
    select 1 from public.audit_events ae
    where ae.actor_id = p.id
      and ae.entity_id = ur.id
      and ae.action = 'role_assigned'
  );

commit;
