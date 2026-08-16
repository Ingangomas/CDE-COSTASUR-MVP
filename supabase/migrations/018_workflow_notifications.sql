-- Costasur CDE: persistent notifications for operational workflow changes.
-- Trigger functions live in the non-exposed private schema.

create or replace function private.notify_contractor_request_status()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  status_label text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  status_label := case new.status
    when 'submitted' then 'enviada'
    when 'in_review' then 'en revisión'
    when 'scheduled' then 'programada'
    when 'approved' then 'aprobada'
    when 'rejected' then 'rechazada'
    when 'completed' then 'completada'
    when 'cancelled' then 'cancelada'
    else new.status
  end;

  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select distinct recipients.user_id,
         new.project_id,
         'contractor_request_status',
         'Actualización de solicitud de obra',
         format('La solicitud %s cambió a estado %s.', new.request_type, status_label)
  from (
    select new.requested_by as user_id
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

create or replace function private.notify_review_decision()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  decision_label text;
begin
  if tg_op = 'UPDATE' and old.decision is not distinct from new.decision and old.comment is not distinct from new.comment then
    return new;
  end if;

  decision_label := case new.decision
    when 'aprobado' then 'aprobada'
    when 'rechazado' then 'rechazada'
    when 'devuelto' then 'devuelta para corrección'
    when 'comentado' then 'comentada'
    else 'pendiente'
  end;

  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select distinct pm.user_id,
         new.project_id,
         'review_decision',
         'Actualización de revisión documental',
         format('Una revisión departamental fue %s.', decision_label)
  from public.project_members pm
  where pm.project_id = new.project_id
    and pm.status = 'active'
    and pm.user_id <> new.reviewer_id;

  return new;
end;
$$;

revoke all on function private.notify_contractor_request_status() from public;
revoke all on function private.notify_contractor_request_status() from anon;
revoke all on function private.notify_contractor_request_status() from authenticated;
revoke all on function private.notify_review_decision() from public;
revoke all on function private.notify_review_decision() from anon;
revoke all on function private.notify_review_decision() from authenticated;

drop trigger if exists contractor_request_status_notification on public.contractor_requests;
create trigger contractor_request_status_notification
after update of status on public.contractor_requests
for each row when (old.status is distinct from new.status)
execute function private.notify_contractor_request_status();

drop trigger if exists review_decision_notification on public.reviews;
create trigger review_decision_notification
after insert or update of decision, comment on public.reviews
for each row execute function private.notify_review_decision();
