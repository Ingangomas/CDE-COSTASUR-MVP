-- Costasur CDE: assign the Architecture review team to every new workflow project.

begin;

create or replace function private.assign_architecture_reviewer_on_project()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  architecture_department uuid;
begin
  select id into architecture_department from public.departments where slug = 'arquitectura' and is_active = true limit 1;
  if architecture_department is null then return new; end if;

  insert into public.project_members(project_id, user_id, membership_role, status, department_id, invited_by, approved_by)
  select new.id, p.id, 'revisor', 'active', architecture_department, new.created_by, new.created_by
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id and ur.is_active = true and ur.role_key = 'revision_tecnica'
  where p.status = 'active'
    and ur.department_id = architecture_department
  on conflict (project_id, user_id, membership_role, department_id)
  do update set status = 'active', invited_by = excluded.invited_by, approved_by = excluded.approved_by, updated_at = now();

  return new;
end;
$$;

revoke all on function private.assign_architecture_reviewer_on_project() from public;

drop trigger if exists trg_assign_architecture_reviewer on public.projects;
create trigger trg_assign_architecture_reviewer
after insert on public.projects
for each row execute function private.assign_architecture_reviewer_on_project();

insert into public.user_roles(user_id, role_key, department_id, is_active)
select p.id, 'revision_tecnica', d.id, true
from public.profiles p
cross join public.departments d
where lower(p.email) = 'review.demo@costasur.com'
  and d.slug = 'arquitectura'
  and not exists (
    select 1 from public.user_roles ur
    where ur.user_id = p.id and ur.role_key = 'revision_tecnica' and ur.department_id = d.id
  );

create or replace function public.submit_workflow_review(
  p_project_id uuid,
  p_document_version_id uuid,
  p_workflow_stage text,
  p_decision text,
  p_comment text
)
returns public.projects
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := (select auth.uid());
  project_row public.projects;
  document_row public.documents;
  review_row public.reviews;
  reviewer_allowed boolean := false;
  new_phase text;
  new_status text;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if p_decision not in ('comentado','devuelto','aprobado','rechazado') then raise exception 'Invalid workflow decision'; end if;
  if p_workflow_stage not in ('autorizacion','anteproyecto','planos_tecnicos','legal','inicio_obra') then raise exception 'Invalid workflow stage'; end if;

  select * into project_row from public.projects where id = p_project_id for update;
  if project_row.id is null then raise exception 'Project not found'; end if;

  select d.* into document_row
  from public.documents d
  join public.document_versions dv on dv.document_id = d.id
  where dv.id = p_document_version_id and d.project_id = p_project_id;
  if document_row.id is null then raise exception 'Document version does not belong to project'; end if;

  if p_workflow_stage = 'autorizacion' and document_row.category <> 'autorizacion' then raise exception 'Authorization review requires an authorization document'; end if;
  if p_workflow_stage = 'anteproyecto' and document_row.category <> 'anteproyecto' then raise exception 'Anteproject review requires an anteproject document'; end if;
  if p_workflow_stage = 'planos_tecnicos' and document_row.category not in ('arquitectonico','estructural','electrico','hidrosanitario','climatizacion','memoria_descriptiva') then raise exception 'Technical review requires a technical plan document'; end if;

  reviewer_allowed := public.is_admin();
  if not reviewer_allowed then
    select exists (
      select 1
      from public.project_members pm
      join public.user_roles ur on ur.user_id = caller_id and ur.is_active = true
      where pm.project_id = p_project_id
        and pm.user_id = caller_id
        and pm.status = 'active'
        and pm.membership_role = 'revisor'
        and (
          (p_workflow_stage in ('autorizacion','anteproyecto','planos_tecnicos') and ur.role_key = 'revision_tecnica' and ur.department_id = pm.department_id)
          or (p_workflow_stage = 'legal' and ur.role_key = 'legal' and ur.department_id = pm.department_id)
        )
    ) into reviewer_allowed;
  end if;
  if not reviewer_allowed then raise exception 'The current user is not authorized for this workflow review'; end if;

  insert into public.reviews(project_id, document_version_id, department_id, reviewer_id, decision, comment, workflow_stage)
  select p_project_id, p_document_version_id, d.id, caller_id, p_decision, nullif(trim(p_comment), ''), p_workflow_stage
  from public.departments d
  where d.slug = case when p_workflow_stage in ('autorizacion','anteproyecto','planos_tecnicos') then 'arquitectura' when p_workflow_stage = 'legal' then 'legal' else 'control_obras' end
  returning * into review_row;

  if p_decision = 'aprobado' then
    if p_workflow_stage = 'autorizacion' then
      new_phase := 'anteproyecto';
      new_status := 'en_revision';
      update public.project_members set status = 'active', approved_by = caller_id, updated_at = now()
      where project_id = p_project_id and membership_role = 'arquitecto' and status = 'pending';
    elsif p_workflow_stage = 'anteproyecto' then
      new_phase := 'planos_tecnicos';
      new_status := 'en_revision';
    elsif p_workflow_stage = 'planos_tecnicos' then
      new_phase := 'inicio_obra';
      new_status := 'aprobado';
    else
      new_phase := project_row.phase;
      new_status := project_row.operational_status;
    end if;
  elsif p_decision in ('devuelto','rechazado') then
    new_phase := project_row.phase;
    new_status := 'en_revision';
  else
    new_phase := project_row.phase;
    new_status := project_row.operational_status;
  end if;

  update public.projects
  set phase = new_phase, operational_status = new_status, cde_status = case when p_decision = 'aprobado' then 'shared' else cde_status end, updated_at = now()
  where id = p_project_id
  returning * into project_row;

  return project_row;
end;
$$;

revoke all on function public.submit_workflow_review(uuid, uuid, text, text, text) from public;
revoke all on function public.submit_workflow_review(uuid, uuid, text, text, text) from anon;
grant execute on function public.submit_workflow_review(uuid, uuid, text, text, text) to authenticated;

commit;
