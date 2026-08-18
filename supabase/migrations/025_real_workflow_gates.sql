-- Costasur CDE: workflow gates for authorization, architecture, technical plans and start of work.
-- This migration preserves existing records and makes the workflow transitions explicit.

begin;

alter table public.reviews
  add column if not exists workflow_stage text;

update public.reviews
set workflow_stage = case
  when workflow_stage is not null then workflow_stage
  else 'legacy'
end
where workflow_stage is null;

alter table public.reviews
  drop constraint if exists reviews_workflow_stage_check;

alter table public.reviews
  add constraint reviews_workflow_stage_check
  check (workflow_stage in ('autorizacion','anteproyecto','planos_tecnicos','legal','inicio_obra','legacy'));

create index if not exists idx_reviews_workflow_stage
  on public.reviews(project_id, workflow_stage, decision, created_at desc);

create or replace function public.create_owner_project_workflow(
  p_property_id uuid,
  p_project_code text,
  p_title text,
  p_project_type text,
  p_architect_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := (select auth.uid());
  project_row public.projects;
  architect_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1 from public.properties p
    where p.id = p_property_id
      and p.owner_user_id = caller_id
      and p.status <> 'archived'
  ) then
    raise exception 'The property is not owned by the authenticated user';
  end if;

  if nullif(trim(p_architect_email), '') is null then
    raise exception 'An architect email is required to start the workflow';
  end if;

  select p.id into architect_id
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  where lower(p.email) = lower(trim(p_architect_email))
    and p.status = 'active'
    and ur.role_key = 'arquitecto'
    and ur.is_active = true
  limit 1;

  if architect_id is null then
    raise exception 'The selected architect is not an active Costasur architect';
  end if;

  insert into public.projects (property_id, project_code, title, project_type, phase, cde_status, operational_status, created_by)
  values (p_property_id, trim(p_project_code), trim(p_title), p_project_type, 'autorizacion_inicial', 'wip', 'en_revision', caller_id)
  returning * into project_row;

  insert into public.project_members (project_id, user_id, membership_role, status, invited_by)
  values (project_row.id, caller_id, 'propietario', 'active', caller_id)
  on conflict (project_id, user_id, membership_role, department_id)
  do update set status = 'active', invited_by = excluded.invited_by, updated_at = now();

  insert into public.project_members (project_id, user_id, membership_role, status, invited_by)
  values (project_row.id, architect_id, 'arquitecto', 'pending', caller_id)
  on conflict (project_id, user_id, membership_role, department_id)
  do update set status = 'pending', invited_by = excluded.invited_by, updated_at = now();

  return jsonb_build_object('project', to_jsonb(project_row), 'architect_id', architect_id);
end;
$$;

revoke all on function public.create_owner_project_workflow(uuid, text, text, text, text) from public;
revoke all on function public.create_owner_project_workflow(uuid, text, text, text, text) from anon;
grant execute on function public.create_owner_project_workflow(uuid, text, text, text, text) to authenticated;

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
  department_row public.departments;
  review_row public.reviews;
  required_role text;
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

  required_role := case when p_workflow_stage in ('autorizacion','anteproyecto') then 'revision_tecnica' else null end;
  reviewer_allowed := public.is_admin();
  if not reviewer_allowed then
    select exists (
      select 1 from public.project_members pm
      join public.user_roles ur on ur.user_id = caller_id and ur.is_active = true
      where pm.project_id = p_project_id
        and pm.user_id = caller_id
        and pm.status = 'active'
        and pm.membership_role in ('revisor','control_obras')
        and (
          (p_workflow_stage in ('autorizacion','anteproyecto') and ur.role_key in ('revision_tecnica','arquitecto'))
          or (p_workflow_stage = 'planos_tecnicos' and ur.role_key in ('revision_tecnica','electrica','hidrosanitaria','paisajismo','mensura','seguridad','arquitecto'))
          or (p_workflow_stage = 'legal' and ur.role_key = 'legal')
        )
    ) into reviewer_allowed;
  end if;
  if not reviewer_allowed then raise exception 'The current user is not authorized for this workflow review'; end if;

  insert into public.reviews(project_id, document_version_id, department_id, reviewer_id, decision, comment, workflow_stage)
  select p_project_id, p_document_version_id, d.id, caller_id, p_decision, nullif(trim(p_comment), ''), p_workflow_stage
  from public.departments d
  where d.slug = case when p_workflow_stage in ('autorizacion','anteproyecto','planos_tecnicos') then 'revision_tecnica' when p_workflow_stage = 'legal' then 'legal' else 'control_obras' end
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
    elsif p_workflow_stage = 'legal' then
      new_phase := project_row.phase;
      new_status := project_row.operational_status;
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

create or replace function public.authorize_contractor_for_project(
  p_project_id uuid,
  p_contractor_email text
)
returns public.project_members
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := (select auth.uid());
  contractor_id uuid;
  project_row public.projects;
  member_row public.project_members;
begin
  select * into project_row from public.projects where id = p_project_id;
  if project_row.id is null then raise exception 'Project not found'; end if;
  if not exists (select 1 from public.properties p where p.id = project_row.property_id and p.owner_user_id = caller_id) then raise exception 'Only the property owner can authorize the contractor'; end if;
  if project_row.phase <> 'inicio_obra' then raise exception 'Technical plans must be approved before authorizing a contractor'; end if;

  select p.id into contractor_id from public.profiles p join public.user_roles ur on ur.user_id = p.id where lower(p.email) = lower(trim(p_contractor_email)) and p.status = 'active' and ur.role_key = 'contratista' and ur.is_active = true limit 1;
  if contractor_id is null then raise exception 'The selected contractor is not an active Costasur contractor'; end if;

  insert into public.project_members(project_id, user_id, membership_role, status, invited_by, approved_by)
  values(p_project_id, contractor_id, 'contratista', 'active', caller_id, caller_id)
  on conflict(project_id, user_id, membership_role, department_id)
  do update set status = 'active', invited_by = excluded.invited_by, approved_by = excluded.approved_by, updated_at = now()
  returning * into member_row;

  return member_row;
end;
$$;

revoke all on function public.authorize_contractor_for_project(uuid, text) from public;
revoke all on function public.authorize_contractor_for_project(uuid, text) from anon;
grant execute on function public.authorize_contractor_for_project(uuid, text) to authenticated;

create or replace function public.create_contractor_request(
  p_project_id uuid,
  p_request_type text,
  p_requested_date date,
  p_description text
)
returns public.contractor_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := (select auth.uid());
  project_row public.projects;
  request_row public.contractor_requests;
begin
  if not exists (select 1 from public.project_members where project_id = p_project_id and user_id = caller_id and membership_role = 'contratista' and status = 'active') then raise exception 'The contractor is not authorized for this project'; end if;
  select * into project_row from public.projects where id = p_project_id;
  if project_row.id is null then raise exception 'Project not found'; end if;
  if p_request_type = 'inicio_obra' and project_row.phase <> 'inicio_obra' then raise exception 'The project is not ready for a start-of-work request'; end if;

  insert into public.contractor_requests(project_id, requested_by, request_type, requested_date, description, status)
  values(p_project_id, caller_id, p_request_type, p_requested_date, nullif(trim(p_description), ''), 'submitted')
  returning * into request_row;
  return request_row;
end;
$$;

revoke all on function public.create_contractor_request(uuid, text, date, text) from public;
revoke all on function public.create_contractor_request(uuid, text, date, text) from anon;
grant execute on function public.create_contractor_request(uuid, text, date, text) to authenticated;

commit;
