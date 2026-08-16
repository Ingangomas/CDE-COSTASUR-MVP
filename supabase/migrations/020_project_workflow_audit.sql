-- Costasur CDE: persist project status and progress changes in workflow_events.

create or replace function private.record_project_workflow_event()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.phase is not distinct from new.phase
     and old.cde_status is not distinct from new.cde_status
     and old.operational_status is not distinct from new.operational_status
     and old.progress_percent is not distinct from new.progress_percent
     and old.financial_progress_percent is not distinct from new.financial_progress_percent then
    return new;
  end if;

  insert into public.workflow_events (
    project_id,
    actor_id,
    actor_role,
    event_type,
    from_state,
    to_state,
    entity_type,
    entity_id,
    comment,
    metadata
  ) values (
    new.id,
    (select auth.uid()),
    case when (select auth.uid()) is null then 'system' else 'authenticated' end,
    'project_update',
    old.operational_status,
    new.operational_status,
    'projects',
    new.id,
    'Actualización automática del estado o avance del expediente.',
    jsonb_build_object(
      'phase_before', old.phase,
      'phase_after', new.phase,
      'cde_status_before', old.cde_status,
      'cde_status_after', new.cde_status,
      'progress_before', old.progress_percent,
      'progress_after', new.progress_percent,
      'financial_progress_before', old.financial_progress_percent,
      'financial_progress_after', new.financial_progress_percent
    )
  );

  return new;
end;
$$;

revoke all on function private.record_project_workflow_event() from public;
revoke all on function private.record_project_workflow_event() from anon;
revoke all on function private.record_project_workflow_event() from authenticated;

drop trigger if exists project_workflow_audit on public.projects;
create trigger project_workflow_audit
after update of phase, cde_status, operational_status, progress_percent, financial_progress_percent on public.projects
for each row execute function private.record_project_workflow_event();
