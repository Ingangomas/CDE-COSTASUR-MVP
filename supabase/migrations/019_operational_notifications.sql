-- Costasur CDE: notifications for incidents, licenses, and project status changes.

create or replace function private.notify_incident_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  event_title text;
  event_body text;
begin
  event_title := case when tg_op = 'INSERT' then 'Nueva incidencia registrada' else 'Actualización de incidencia' end;
  event_body := format('%s: %s', new.severity, new.title);

  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select distinct recipients.user_id,
         new.project_id,
         'incident_update',
         event_title,
         event_body
  from (
    select new.reporter_id as user_id
    union
    select new.assigned_to
    union
    select ur.user_id
    from public.user_roles ur
    where ur.role_key in ('admin_general', 'control_obras')
      and ur.is_active = true
  ) recipients
  where recipients.user_id is not null;

  return new;
end;
$$;

create or replace function private.notify_license_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select distinct pm.user_id,
         new.project_id,
         'license_update',
         'Actualización de licencia',
         format('La licencia %s está en estado %s.', new.license_number, new.status)
  from public.project_members pm
  where pm.project_id = new.project_id
    and pm.status = 'active'
    and pm.membership_role in ('propietario', 'control_obras')
  union
  select ur.user_id,
         new.project_id,
         'license_update',
         'Actualización de licencia',
         format('La licencia %s está en estado %s.', new.license_number, new.status)
  from public.user_roles ur
  where ur.role_key = 'admin_general'
    and ur.is_active = true;

  return new;
end;
$$;

create or replace function private.notify_project_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.operational_status is not distinct from new.operational_status
     and old.progress_percent is not distinct from new.progress_percent
     and old.financial_progress_percent is not distinct from new.financial_progress_percent then
    return new;
  end if;

  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select distinct pm.user_id,
         new.id,
         'project_status_update',
         'Actualización del expediente',
         format('El proyecto %s tiene avance físico de %s%% y estado %s.', new.project_code, new.progress_percent, new.operational_status)
  from public.project_members pm
  where pm.project_id = new.id
    and pm.status = 'active'
    and pm.user_id <> coalesce((select auth.uid()), '00000000-0000-0000-0000-000000000000'::uuid);

  return new;
end;
$$;

revoke all on function private.notify_incident_change() from public;
revoke all on function private.notify_incident_change() from anon;
revoke all on function private.notify_incident_change() from authenticated;
revoke all on function private.notify_license_change() from public;
revoke all on function private.notify_license_change() from anon;
revoke all on function private.notify_license_change() from authenticated;
revoke all on function private.notify_project_status_change() from public;
revoke all on function private.notify_project_status_change() from anon;
revoke all on function private.notify_project_status_change() from authenticated;

drop trigger if exists incident_notification on public.incidents;
create trigger incident_notification
after insert or update of status, severity, title on public.incidents
for each row execute function private.notify_incident_change();

drop trigger if exists license_notification on public.licenses;
create trigger license_notification
after insert or update of status, license_number on public.licenses
for each row execute function private.notify_license_change();

drop trigger if exists project_status_notification on public.projects;
create trigger project_status_notification
after update of operational_status, progress_percent, financial_progress_percent on public.projects
for each row execute function private.notify_project_status_change();
