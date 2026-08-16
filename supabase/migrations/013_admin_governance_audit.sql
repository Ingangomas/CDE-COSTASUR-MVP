-- Costasur CDE: audit administrator governance mutations
create or replace function public.audit_admin_governance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entity_id uuid;
  metadata jsonb;
begin
  entity_id := coalesce((to_jsonb(new)->>'id')::uuid, (to_jsonb(old)->>'id')::uuid);
  metadata := jsonb_build_object(
    'operation', TG_OP,
    'table', TG_TABLE_NAME,
    'new', case when TG_OP in ('INSERT','UPDATE') then to_jsonb(new) else null end,
    'old', case when TG_OP in ('UPDATE','DELETE') then to_jsonb(old) else null end
  );
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), lower(TG_OP), TG_TABLE_NAME, entity_id, metadata);
  return coalesce(new, old);
end;
$$;

drop trigger if exists audit_profiles_governance on public.profiles;
create trigger audit_profiles_governance
after update of status on public.profiles
for each row execute function public.audit_admin_governance();

drop trigger if exists audit_user_roles_governance on public.user_roles;
create trigger audit_user_roles_governance
after insert or update or delete on public.user_roles
for each row execute function public.audit_admin_governance();

drop trigger if exists audit_project_members_governance on public.project_members;
create trigger audit_project_members_governance
after insert or update or delete on public.project_members
for each row execute function public.audit_admin_governance();
