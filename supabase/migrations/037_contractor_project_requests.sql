-- CDE Costasur: contractor-submitted new project requests.
-- Additive only. Existing contractor_requests and owner/architect workflows remain unchanged.
begin;

create table if not exists public.contractor_project_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  property_reference text not null,
  project_title text not null,
  project_type text not null check (project_type in ('obra_mayor','remodelacion','reparacion','mantenimiento')),
  owner_name text not null,
  owner_email text not null,
  contractor_name text not null,
  contractor_email text not null,
  company_name text not null,
  company_phone text,
  work_items text not null,
  estimated_duration text not null,
  start_form_path text,
  start_form_filename text,
  work_items_path text,
  work_items_filename text,
  legal_status text not null default 'pending' check (legal_status in ('pending','in_review','approved','rejected')),
  control_status text not null default 'pending' check (control_status in ('pending','in_review','approved','rejected')),
  status text not null default 'submitted' check (status in ('submitted','in_review','approved','rejected')),
  legal_note text,
  control_note text,
  legal_reviewed_by uuid references public.profiles(id) on delete set null,
  control_reviewed_by uuid references public.profiles(id) on delete set null,
  legal_reviewed_at timestamptz,
  control_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contractor_project_requests_status_idx
  on public.contractor_project_requests(status, created_at desc);
create index if not exists contractor_project_requests_legal_idx
  on public.contractor_project_requests(legal_status, created_at desc);
create index if not exists contractor_project_requests_control_idx
  on public.contractor_project_requests(control_status, created_at desc);
create index if not exists contractor_project_requests_project_idx
  on public.contractor_project_requests(project_id, created_at desc);

alter table public.contractor_project_requests enable row level security;

create policy contractor_project_requests_requester_read
  on public.contractor_project_requests for select to authenticated
  using (requested_by = auth.uid());

create policy contractor_project_requests_department_read
  on public.contractor_project_requests for select to authenticated
  using (public.has_role('legal') or public.has_role('control_obras'));

create policy contractor_project_requests_contractor_insert
  on public.contractor_project_requests for insert to authenticated
  with check (requested_by = auth.uid() and public.has_role('contratista'));

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'contractor_project_requests_set_updated_at'
      and tgrelid = 'public.contractor_project_requests'::regclass
  ) then
    create trigger contractor_project_requests_set_updated_at
      before update on public.contractor_project_requests
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

create or replace function public.create_contractor_project_request(
  p_property_reference text,
  p_project_title text,
  p_project_type text,
  p_owner_name text,
  p_owner_email text,
  p_contractor_name text,
  p_contractor_email text,
  p_company_name text,
  p_company_phone text,
  p_work_items text,
  p_estimated_duration text
)
returns public.contractor_project_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  request_row public.contractor_project_requests;
begin
  if caller_id is null or not public.has_role('contratista') then
    raise exception 'Only an active contractor can create this request';
  end if;
  if p_project_type not in ('obra_mayor','remodelacion','reparacion','mantenimiento') then
    raise exception 'Invalid contractor project type';
  end if;
  if nullif(trim(p_property_reference), '') is null
     or nullif(trim(p_project_title), '') is null
     or nullif(trim(p_owner_name), '') is null
     or nullif(trim(p_owner_email), '') is null
     or nullif(trim(p_contractor_name), '') is null
     or nullif(trim(p_contractor_email), '') is null
     or nullif(trim(p_company_name), '') is null
     or nullif(trim(p_work_items), '') is null
     or nullif(trim(p_estimated_duration), '') is null then
    raise exception 'All required contractor project request fields must be completed';
  end if;

  insert into public.contractor_project_requests (
    requested_by, property_reference, project_title, project_type,
    owner_name, owner_email, contractor_name, contractor_email,
    company_name, company_phone, work_items, estimated_duration
  ) values (
    caller_id, trim(p_property_reference), trim(p_project_title), p_project_type,
    trim(p_owner_name), lower(trim(p_owner_email)), trim(p_contractor_name), lower(trim(p_contractor_email)),
    trim(p_company_name), nullif(trim(p_company_phone), ''), trim(p_work_items), trim(p_estimated_duration)
  ) returning * into request_row;

  insert into public.notifications (user_id, project_id, notification_type, title, body)
  select ur.user_id, null, 'contractor_project_request',
    'Nueva solicitud de proyecto de contratista',
    format('Solicitud de %s para %s pendiente de revisión.', request_row.project_title, request_row.property_reference)
  from public.user_roles ur
  where ur.role_key in ('legal','control_obras')
    and ur.is_active = true
    and ur.user_id <> caller_id;

  return request_row;
end;
$$;

revoke all on function public.create_contractor_project_request(text,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.create_contractor_project_request(text,text,text,text,text,text,text,text,text,text,text) from anon;
grant execute on function public.create_contractor_project_request(text,text,text,text,text,text,text,text,text,text,text) to authenticated;

create or replace function public.review_contractor_project_request(
  p_request_id uuid,
  p_department text,
  p_status text,
  p_note text default null
)
returns public.contractor_project_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  request_row public.contractor_project_requests;
  owner_id uuid;
  property_id uuid;
  new_project public.projects;
  control_department_id uuid;
  mapped_project_type text;
begin
  if caller_id is null or p_department not in ('legal','control_obras') then
    raise exception 'Invalid review department';
  end if;
  if p_department = 'legal' and not public.has_role('legal') then
    raise exception 'Only Legal can review owner data';
  end if;
  if p_department = 'control_obras' and not public.has_role('control_obras') then
    raise exception 'Only Control de Obras can review contractor data';
  end if;
  if p_status not in ('in_review','approved','rejected') then
    raise exception 'Invalid contractor project request status';
  end if;

  select * into request_row
  from public.contractor_project_requests
  where id = p_request_id
  for update;
  if request_row.id is null then
    raise exception 'Contractor project request not found';
  end if;

  if p_department = 'legal' then
    update public.contractor_project_requests
    set legal_status = p_status,
        legal_note = nullif(trim(p_note), ''),
        legal_reviewed_by = caller_id,
        legal_reviewed_at = now()
    where id = p_request_id;
  else
    update public.contractor_project_requests
    set control_status = p_status,
        control_note = nullif(trim(p_note), ''),
        control_reviewed_by = caller_id,
        control_reviewed_at = now()
    where id = p_request_id;
  end if;

  select * into request_row
  from public.contractor_project_requests
  where id = p_request_id
  for update;

  update public.contractor_project_requests
  set status = case
    when legal_status = 'rejected' or control_status = 'rejected' then 'rejected'
    when legal_status = 'approved' and control_status = 'approved' then 'approved'
    else 'in_review'
  end
  where id = p_request_id;

  select * into request_row
  from public.contractor_project_requests
  where id = p_request_id
  for update;

  if request_row.status = 'approved' and request_row.project_id is null then
    select p.id into owner_id
    from public.profiles p
    where lower(p.email) = lower(request_row.owner_email)
      and p.status = 'active'
    limit 1;

    select p.id into property_id
    from public.properties p
    where p.status <> 'archived'
      and (lower(p.property_code) = lower(request_row.property_reference)
        or lower(p.name) = lower(request_row.property_reference))
      and (owner_id is null or p.owner_user_id = owner_id)
    order by p.created_at asc
    limit 1;

    if owner_id is null then
      raise exception 'Owner profile was not found for the submitted email';
    end if;
    if property_id is null then
      raise exception 'Active property was not found for the submitted reference';
    end if;

    if owner_id is not null and property_id is not null then
      mapped_project_type := case request_row.project_type
        when 'obra_mayor' then 'obra_nueva'
        when 'remodelacion' then 'remodelacion'
        when 'reparacion' then 'renovacion'
        else 'otro'
      end;

      insert into public.projects (
        property_id, project_code, title, project_type,
        phase, cde_status, operational_status, created_by
      ) values (
        property_id,
        'CON-' || upper(substr(replace(request_row.id::text, '-', ''), 1, 10)),
        request_row.project_title,
        mapped_project_type,
        'autorizacion_inicial', 'wip', 'en_revision', coalesce(request_row.requested_by, caller_id)
      ) returning * into new_project;

      insert into public.project_members(project_id, user_id, membership_role, status, invited_by, approved_by)
      values(new_project.id, owner_id, 'propietario', 'active', request_row.requested_by, caller_id)
      on conflict (project_id, user_id, membership_role, department_id)
      do update set status = 'active', approved_by = caller_id, updated_at = now();

      if request_row.requested_by is not null then
        insert into public.project_members(project_id, user_id, membership_role, status, invited_by, approved_by)
        values(new_project.id, request_row.requested_by, 'contratista', 'active', request_row.requested_by, caller_id)
        on conflict (project_id, user_id, membership_role, department_id)
        do update set status = 'active', approved_by = caller_id, updated_at = now();
      end if;

      select d.id into control_department_id from public.departments d where d.slug in ('control-obras','control_obras') limit 1;
      insert into public.project_members(project_id, user_id, membership_role, department_id, status, invited_by, approved_by)
      select new_project.id, ur.user_id, 'control_obras', control_department_id, 'active', request_row.requested_by, caller_id
      from public.user_roles ur
      where ur.role_key = 'control_obras' and ur.is_active = true
      on conflict (project_id, user_id, membership_role, department_id)
      do update set status = 'active', approved_by = caller_id, updated_at = now();

      update public.contractor_project_requests
      set project_id = new_project.id
      where id = p_request_id;

      insert into public.notifications (user_id, project_id, notification_type, title, body)
      select ur.user_id, new_project.id, 'contractor_project_approved',
        'Proyecto nuevo disponible en Control de Obras',
        format('%s fue validado por Legal y Control de Obras.', new_project.title)
      from public.user_roles ur
      where ur.role_key = 'control_obras'
        and ur.is_active = true;
    end if;
  end if;

  select * into request_row
  from public.contractor_project_requests
  where id = p_request_id;
  return request_row;
end;
$$;

revoke all on function public.review_contractor_project_request(uuid,text,text,text) from public;
revoke all on function public.review_contractor_project_request(uuid,text,text,text) from anon;
grant execute on function public.review_contractor_project_request(uuid,text,text,text) to authenticated;

create policy contractor_project_requests_documents_select
  on storage.objects for select to authenticated
  using (
    bucket_id = 'cde-documents'
    and exists (
      select 1 from public.contractor_project_requests r
      where r.id::text = split_part(name, '/', 1)
        and (r.requested_by = auth.uid() or public.has_role('legal') or public.has_role('control_obras'))
    )
  );

create policy contractor_project_requests_documents_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cde-documents'
    and exists (
      select 1 from public.contractor_project_requests r
      where r.id::text = split_part(name, '/', 1)
        and r.requested_by = auth.uid()
    )
  );

commit;
