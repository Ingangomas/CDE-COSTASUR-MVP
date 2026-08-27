-- Native CDE calendar and operational activity layer.
-- Additive migration: does not drop or rename existing workflow objects.

begin;

create table if not exists public.calendar_activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  organizer_id uuid not null references public.profiles(id) on delete restrict,
  assigned_supervisor_id uuid references public.profiles(id) on delete set null,
  contractor_request_id uuid references public.contractor_requests(id) on delete set null,
  inspection_id uuid references public.inspections(id) on delete set null,
  activity_type text not null check (activity_type in ('directorio','reunion','cita_propietario','cita_arquitecto','cita_contratista','visita','inspeccion','revision','seguimiento','otra')),
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  status text not null default 'scheduled' check (status in ('draft','scheduled','in_progress','completed','cancelled','rescheduled')),
  visibility text not null default 'project_members' check (visibility in ('department_internal','project_members','participants')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_activities_valid_range check (ends_at > starts_at)
);

create table if not exists public.calendar_activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.calendar_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  participant_role text not null default 'attendee' check (participant_role in ('organizer','supervisor','attendee','observer')),
  response_status text not null default 'pending' check (response_status in ('pending','accepted','declined','tentative')),
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

create table if not exists public.project_supervisor_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  supervisor_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  is_primary boolean not null default true,
  status text not null default 'active' check (status in ('active','revoked')),
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_activity_documents (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.calendar_activities(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  relation_type text not null default 'evidence' check (relation_type in ('evidence','report','notice','other')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (activity_id, document_id)
);

create table if not exists public.project_enforcement_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  activity_id uuid references public.calendar_activities(id) on delete set null,
  incident_id uuid references public.incidents(id) on delete set null,
  action_type text not null check (action_type in ('amonestacion','sancion')),
  status text not null default 'draft' check (status in ('draft','issued','responded','appealed','resolved','cancelled')),
  title text not null check (char_length(trim(title)) between 3 and 160),
  description text not null,
  recipient_id uuid references public.profiles(id) on delete set null,
  issued_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  issued_at timestamptz,
  resolved_at timestamptz,
  resolution text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calendar_activities_range on public.calendar_activities(starts_at, ends_at);
create index if not exists idx_calendar_activities_project on public.calendar_activities(project_id, starts_at);
create index if not exists idx_calendar_activities_department on public.calendar_activities(department_id, starts_at);
create index if not exists idx_calendar_activities_supervisor on public.calendar_activities(assigned_supervisor_id, starts_at);
create index if not exists idx_calendar_participants_user on public.calendar_activity_participants(user_id, activity_id);
create index if not exists idx_project_supervisors_project on public.project_supervisor_assignments(project_id, status);
create unique index if not exists idx_project_primary_supervisor_active
  on public.project_supervisor_assignments(project_id)
  where is_primary = true and status = 'active';
create index if not exists idx_activity_documents_activity on public.calendar_activity_documents(activity_id);
create index if not exists idx_enforcement_project on public.project_enforcement_actions(project_id, status, created_at desc);

alter table public.calendar_activities enable row level security;
alter table public.calendar_activity_participants enable row level security;
alter table public.project_supervisor_assignments enable row level security;
alter table public.calendar_activity_documents enable row level security;
alter table public.project_enforcement_actions enable row level security;

create or replace function private.is_calendar_supervisor()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select public.is_admin() or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role_key in ('revision_tecnica','control_obras','legal','electrica','hidrosanitaria','paisajismo','mensura','seguridad')
  );
$$;

create or replace function private.has_calendar_department(target_department_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select public.is_admin() or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.department_id = target_department_id
      and ur.role_key in ('revision_tecnica','control_obras','legal','electrica','hidrosanitaria','paisajismo','mensura','seguridad')
  );
$$;

create or replace function private.can_access_calendar_activity(target_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select public.is_admin() or exists (
    select 1
    from public.calendar_activities ca
    where ca.id = target_activity_id
      and (
        ca.organizer_id = auth.uid()
        or ca.assigned_supervisor_id = auth.uid()
        or (ca.department_id is not null and private.has_calendar_department(ca.department_id))
        or (ca.project_id is not null and ca.visibility = 'project_members' and public.can_access_project(ca.project_id))
        or exists (
          select 1 from public.calendar_activity_participants cap
          where cap.activity_id = ca.id and cap.user_id = auth.uid()
        )
      )
  );
$$;

create policy calendar_activities_authorized_read
on public.calendar_activities for select to authenticated
using (private.can_access_calendar_activity(id));

create policy calendar_participants_authorized_read
on public.calendar_activity_participants for select to authenticated
using (private.can_access_calendar_activity(activity_id));

create policy project_supervisors_authorized_read
on public.project_supervisor_assignments for select to authenticated
using (public.is_admin() or public.has_role('control_obras') or public.can_access_project(project_id));

create policy activity_documents_authorized_read
on public.calendar_activity_documents for select to authenticated
using (private.can_access_calendar_activity(activity_id));

create policy enforcement_authorized_read
on public.project_enforcement_actions for select to authenticated
using (public.is_admin() or public.has_role('control_obras') or public.can_access_project(project_id));

create trigger calendar_activities_set_updated_at
before update on public.calendar_activities
for each row execute function public.set_updated_at();

create trigger project_supervisor_assignments_set_updated_at
before update on public.project_supervisor_assignments
for each row execute function public.set_updated_at();

create trigger project_enforcement_actions_set_updated_at
before update on public.project_enforcement_actions
for each row execute function public.set_updated_at();

create or replace function public.create_calendar_activity(
  p_project_id uuid,
  p_department_id uuid,
  p_assigned_supervisor_id uuid,
  p_activity_type text,
  p_title text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_description text default null,
  p_all_day boolean default false,
  p_location text default null,
  p_visibility text default 'project_members',
  p_contractor_request_id uuid default null,
  p_inspection_id uuid default null
)
returns public.calendar_activities
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  created_activity public.calendar_activities;
  conflicting_activity public.calendar_activities;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not private.is_calendar_supervisor() then raise exception 'Calendar supervisor role is required'; end if;
  if p_ends_at <= p_starts_at then raise exception 'Activity end must be after its start'; end if;
  if p_project_id is not null and not (public.is_admin() or public.can_access_project(p_project_id)) then
    raise exception 'Project access denied';
  end if;
  if p_department_id is not null and not private.has_calendar_department(p_department_id) then
    raise exception 'Department calendar access denied';
  end if;
  if p_assigned_supervisor_id is not null and not exists (
    select 1 from public.user_roles ur
    where ur.user_id = p_assigned_supervisor_id
      and ur.is_active = true
      and (p_department_id is null or ur.department_id = p_department_id or ur.role_key = 'admin_general')
  ) then
    raise exception 'Assigned supervisor is not active in the selected department';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(coalesce(p_assigned_supervisor_id::text, p_project_id::text, caller_id::text), 0));

  select ca.* into conflicting_activity
  from public.calendar_activities ca
  where ca.status in ('scheduled','in_progress')
    and tstzrange(ca.starts_at, ca.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    and (
      (p_assigned_supervisor_id is not null and ca.assigned_supervisor_id = p_assigned_supervisor_id)
      or (p_project_id is not null and ca.project_id = p_project_id)
    )
  order by ca.starts_at
  limit 1;

  if conflicting_activity.id is not null then
    raise exception using
      errcode = 'P0001',
      message = 'CALENDAR_CONFLICT',
      detail = json_build_object('activity_id', conflicting_activity.id, 'title', conflicting_activity.title, 'starts_at', conflicting_activity.starts_at, 'ends_at', conflicting_activity.ends_at)::text;
  end if;

  insert into public.calendar_activities(
    project_id, department_id, organizer_id, assigned_supervisor_id,
    contractor_request_id, inspection_id, activity_type, title, description,
    starts_at, ends_at, all_day, location, status, visibility
  ) values (
    p_project_id, p_department_id, caller_id, p_assigned_supervisor_id,
    p_contractor_request_id, p_inspection_id, p_activity_type, trim(p_title), nullif(trim(p_description), ''),
    p_starts_at, p_ends_at, p_all_day, nullif(trim(p_location), ''), 'scheduled', p_visibility
  ) returning * into created_activity;

  insert into public.calendar_activity_participants(activity_id, user_id, participant_role, response_status)
  values(created_activity.id, caller_id, 'organizer', 'accepted')
  on conflict (activity_id, user_id) do update set participant_role = excluded.participant_role, response_status = excluded.response_status;

  if p_assigned_supervisor_id is not null then
    insert into public.calendar_activity_participants(activity_id, user_id, participant_role, response_status)
    values(created_activity.id, p_assigned_supervisor_id, 'supervisor', case when p_assigned_supervisor_id = caller_id then 'accepted' else 'pending' end)
    on conflict (activity_id, user_id) do update set participant_role = excluded.participant_role;
  end if;

  insert into public.notifications(user_id, project_id, notification_type, title, body)
  select distinct participant.user_id, created_activity.project_id, 'calendar_activity', 'Nueva actividad programada',
         format('%s · %s', created_activity.title, to_char(created_activity.starts_at at time zone 'America/Santo_Domingo', 'DD/MM/YYYY HH24:MI'))
  from public.calendar_activity_participants participant
  where participant.activity_id = created_activity.id and participant.user_id <> caller_id;

  if created_activity.project_id is not null then
    insert into public.workflow_events(project_id, actor_id, actor_role, event_type, entity_type, entity_id, comment, metadata)
    values(created_activity.project_id, caller_id, 'supervisor', 'calendar_activity_created', 'calendar_activity', created_activity.id,
           created_activity.title, jsonb_build_object('starts_at', created_activity.starts_at, 'ends_at', created_activity.ends_at));
  end if;

  return created_activity;
end;
$$;

create or replace function public.reschedule_calendar_activity(
  p_activity_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns public.calendar_activities
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  activity_row public.calendar_activities;
  conflicting_activity public.calendar_activities;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  select * into activity_row from public.calendar_activities where id = p_activity_id for update;
  if activity_row.id is null then raise exception 'Calendar activity not found'; end if;
  if not (public.is_admin() or activity_row.organizer_id = caller_id or (activity_row.department_id is not null and private.has_calendar_department(activity_row.department_id))) then
    raise exception 'Calendar activity update denied';
  end if;
  if p_ends_at <= p_starts_at then raise exception 'Activity end must be after its start'; end if;

  perform pg_advisory_xact_lock(hashtextextended(coalesce(activity_row.assigned_supervisor_id::text, activity_row.project_id::text, caller_id::text), 0));

  select ca.* into conflicting_activity
  from public.calendar_activities ca
  where ca.id <> p_activity_id
    and ca.status in ('scheduled','in_progress')
    and tstzrange(ca.starts_at, ca.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    and (
      (activity_row.assigned_supervisor_id is not null and ca.assigned_supervisor_id = activity_row.assigned_supervisor_id)
      or (activity_row.project_id is not null and ca.project_id = activity_row.project_id)
    )
  order by ca.starts_at
  limit 1;

  if conflicting_activity.id is not null then
    raise exception using errcode = 'P0001', message = 'CALENDAR_CONFLICT',
      detail = json_build_object('activity_id', conflicting_activity.id, 'title', conflicting_activity.title, 'starts_at', conflicting_activity.starts_at, 'ends_at', conflicting_activity.ends_at)::text;
  end if;

  update public.calendar_activities
  set starts_at = p_starts_at, ends_at = p_ends_at, status = 'rescheduled'
  where id = p_activity_id
  returning * into activity_row;

  insert into public.notifications(user_id, project_id, notification_type, title, body)
  select participant.user_id, activity_row.project_id, 'calendar_activity', 'Actividad reprogramada',
         format('%s · %s', activity_row.title, to_char(activity_row.starts_at at time zone 'America/Santo_Domingo', 'DD/MM/YYYY HH24:MI'))
  from public.calendar_activity_participants participant
  where participant.activity_id = activity_row.id and participant.user_id <> caller_id;

  return activity_row;
end;
$$;

create or replace function public.update_calendar_activity_status(
  p_activity_id uuid,
  p_status text
)
returns public.calendar_activities
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  activity_row public.calendar_activities;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if p_status not in ('scheduled','in_progress','completed','cancelled') then raise exception 'Invalid calendar activity status'; end if;
  select * into activity_row from public.calendar_activities where id = p_activity_id for update;
  if activity_row.id is null then raise exception 'Calendar activity not found'; end if;
  if not (public.is_admin() or activity_row.organizer_id = caller_id or activity_row.assigned_supervisor_id = caller_id or (activity_row.department_id is not null and private.has_calendar_department(activity_row.department_id))) then
    raise exception 'Calendar activity update denied';
  end if;
  update public.calendar_activities set status = p_status where id = p_activity_id returning * into activity_row;
  return activity_row;
end;
$$;

create or replace function public.find_available_activity_slots(
  p_project_id uuid,
  p_supervisor_id uuid,
  p_department_id uuid,
  p_duration_minutes integer,
  p_start_date date,
  p_limit integer default 5,
  p_day_start time default '08:00',
  p_day_end time default '17:00'
)
returns table(starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public, private
as $$
  with candidate_days as (
    select day::date as work_day
    from generate_series(p_start_date::timestamp, (p_start_date + 20)::timestamp, interval '1 day') day
    where extract(isodow from day) between 1 and 5
  ), candidates as (
    select slot at time zone 'America/Santo_Domingo' as candidate_start
    from candidate_days
    cross join lateral generate_series(
      work_day + p_day_start,
      work_day + p_day_end - make_interval(mins => p_duration_minutes),
      interval '30 minutes'
    ) slot
  )
  select candidate_start, candidate_start + make_interval(mins => p_duration_minutes)
  from candidates
  where private.is_calendar_supervisor()
    and (p_project_id is null or public.is_admin() or public.can_access_project(p_project_id))
    and (p_department_id is null or private.has_calendar_department(p_department_id))
    and not exists (
      select 1 from public.calendar_activities ca
      where ca.status in ('scheduled','in_progress')
        and tstzrange(ca.starts_at, ca.ends_at, '[)') && tstzrange(candidate_start, candidate_start + make_interval(mins => p_duration_minutes), '[)')
        and (
          (p_supervisor_id is not null and ca.assigned_supervisor_id = p_supervisor_id)
          or (p_project_id is not null and ca.project_id = p_project_id)
          or (p_department_id is not null and ca.department_id = p_department_id and ca.activity_type = 'directorio')
        )
    )
  order by candidate_start
  limit greatest(1, least(p_limit, 10));
$$;

create or replace function public.get_calendar_activities(
  p_from timestamptz,
  p_to timestamptz,
  p_department_id uuid default null,
  p_project_id uuid default null
)
returns table(
  id uuid,
  project_id uuid,
  project_code text,
  project_title text,
  property_name text,
  department_id uuid,
  department_name text,
  organizer_id uuid,
  organizer_name text,
  assigned_supervisor_id uuid,
  supervisor_name text,
  activity_type text,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean,
  location text,
  status text,
  visibility text,
  contractor_request_id uuid,
  inspection_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, private
as $$
  select ca.id, ca.project_id, p.project_code, p.title, prop.name,
         ca.department_id, d.name, ca.organizer_id, organizer.display_name,
         ca.assigned_supervisor_id, supervisor.display_name,
         ca.activity_type, ca.title, ca.description, ca.starts_at, ca.ends_at,
         ca.all_day, ca.location, ca.status, ca.visibility,
         ca.contractor_request_id, ca.inspection_id, ca.created_at, ca.updated_at
  from public.calendar_activities ca
  left join public.projects p on p.id = ca.project_id
  left join public.properties prop on prop.id = p.property_id
  left join public.departments d on d.id = ca.department_id
  join public.profiles organizer on organizer.id = ca.organizer_id
  left join public.profiles supervisor on supervisor.id = ca.assigned_supervisor_id
  where private.can_access_calendar_activity(ca.id)
    and ca.starts_at < p_to
    and ca.ends_at > p_from
    and (p_department_id is null or ca.department_id = p_department_id)
    and (p_project_id is null or ca.project_id = p_project_id)
  order by ca.starts_at;
$$;

create or replace function public.list_calendar_supervisors(p_department_id uuid default null)
returns table(id uuid, display_name text, email text, department_id uuid, role_key text)
language sql
stable
security definer
set search_path = public, private
as $$
  select distinct p.id, p.display_name, p.email, ur.department_id, ur.role_key
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  where private.is_calendar_supervisor()
    and p.status = 'active'
    and ur.is_active = true
    and ur.role_key in ('revision_tecnica','control_obras','legal','electrica','hidrosanitaria','paisajismo','mensura','seguridad','admin_general')
    and (p_department_id is null or ur.department_id = p_department_id)
  order by p.display_name;
$$;

create or replace function public.assign_project_supervisor(
  p_project_id uuid,
  p_supervisor_id uuid,
  p_notes text default null
)
returns public.project_supervisor_assignments
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  assignment_row public.project_supervisor_assignments;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not (public.is_admin() or public.has_role('control_obras')) then raise exception 'Only Control de Obras or Administration can assign supervisors'; end if;
  if not exists (select 1 from public.projects where id = p_project_id) then raise exception 'Project not found'; end if;
  if not exists (
    select 1 from public.user_roles where user_id = p_supervisor_id and role_key = 'control_obras' and is_active = true
  ) then raise exception 'Selected profile is not an active Control de Obras supervisor'; end if;

  update public.project_supervisor_assignments
  set status = 'revoked', revoked_at = now()
  where project_id = p_project_id and is_primary = true and status = 'active';

  insert into public.project_supervisor_assignments(project_id, supervisor_id, assigned_by, is_primary, status, notes)
  values(p_project_id, p_supervisor_id, caller_id, true, 'active', nullif(trim(p_notes), ''))
  returning * into assignment_row;

  insert into public.notifications(user_id, project_id, notification_type, title, body)
  values(p_supervisor_id, p_project_id, 'supervisor_assignment', 'Proyecto asignado para supervisión', 'Has sido asignado como supervisor principal del proyecto.');

  insert into public.workflow_events(project_id, actor_id, actor_role, event_type, entity_type, entity_id, comment)
  values(p_project_id, caller_id, 'control_obras', 'project_supervisor_assigned', 'project_supervisor_assignment', assignment_row.id, p_notes);

  return assignment_row;
end;
$$;

create or replace function public.schedule_project_inspection(
  p_request_id uuid,
  p_supervisor_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_title text default 'Inspección programada',
  p_description text default null
)
returns public.calendar_activities
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  request_row public.contractor_requests;
  inspection_row public.inspections;
  control_department_id uuid;
  activity_row public.calendar_activities;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not (public.is_admin() or public.has_role('control_obras')) then raise exception 'Only Control de Obras or Administration can schedule inspections'; end if;

  select * into request_row from public.contractor_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'Contractor request not found'; end if;
  if request_row.request_type not in ('inspeccion_topografica','inspeccion_tecnica') then raise exception 'Request is not an inspection request'; end if;
  select id into control_department_id from public.departments where slug = 'control_obras' limit 1;

  insert into public.inspections(project_id, request_id, inspection_type, inspector_id, scheduled_at, status)
  values(request_row.project_id, request_row.id,
         case when request_row.request_type = 'inspeccion_topografica' then 'topografica' else 'tecnica' end,
         p_supervisor_id, p_starts_at, 'scheduled')
  returning * into inspection_row;

  update public.contractor_requests set status = 'scheduled', updated_at = now() where id = p_request_id;

  activity_row := public.create_calendar_activity(
    request_row.project_id, control_department_id, p_supervisor_id, 'inspeccion', p_title,
    p_starts_at, p_ends_at, p_description, false, null, 'project_members', request_row.id, inspection_row.id
  );

  return activity_row;
end;
$$;

create or replace function public.add_calendar_activity_participant(
  p_activity_id uuid,
  p_user_id uuid,
  p_participant_role text default 'attendee'
)
returns public.calendar_activity_participants
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  activity_row public.calendar_activities;
  participant_row public.calendar_activity_participants;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if p_participant_role not in ('attendee','observer') then raise exception 'Invalid participant role'; end if;
  select * into activity_row from public.calendar_activities where id = p_activity_id;
  if activity_row.id is null then raise exception 'Calendar activity not found'; end if;
  if not (public.is_admin() or activity_row.organizer_id = caller_id or (activity_row.department_id is not null and private.has_calendar_department(activity_row.department_id))) then
    raise exception 'Calendar participant update denied';
  end if;
  if activity_row.project_id is not null and not exists (
    select 1 from public.project_members pm
    where pm.project_id = activity_row.project_id and pm.user_id = p_user_id and pm.status = 'active'
  ) and not exists (
    select 1 from public.user_roles ur where ur.user_id = p_user_id and ur.role_key = 'admin_general' and ur.is_active = true
  ) then
    raise exception 'Participant is not an active project member';
  end if;

  insert into public.calendar_activity_participants(activity_id, user_id, participant_role, response_status)
  values(p_activity_id, p_user_id, p_participant_role, 'pending')
  on conflict (activity_id, user_id) do update set participant_role = excluded.participant_role
  returning * into participant_row;

  insert into public.notifications(user_id, project_id, notification_type, title, body)
  values(p_user_id, activity_row.project_id, 'calendar_invitation', 'Invitación de calendario',
         format('%s · %s', activity_row.title, to_char(activity_row.starts_at at time zone 'America/Santo_Domingo', 'DD/MM/YYYY HH24:MI')));

  return participant_row;
end;
$$;

create or replace function public.link_activity_document(
  p_activity_id uuid,
  p_document_id uuid,
  p_relation_type text default 'evidence'
)
returns public.calendar_activity_documents
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  activity_row public.calendar_activities;
  link_row public.calendar_activity_documents;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  select * into activity_row from public.calendar_activities where id = p_activity_id;
  if activity_row.id is null then raise exception 'Calendar activity not found'; end if;
  if not (public.is_admin() or public.has_role('control_obras') or activity_row.assigned_supervisor_id = caller_id or activity_row.organizer_id = caller_id) then
    raise exception 'Activity document link denied';
  end if;
  if not exists (select 1 from public.documents d where d.id = p_document_id and d.project_id = activity_row.project_id) then
    raise exception 'Document does not belong to the activity project';
  end if;
  insert into public.calendar_activity_documents(activity_id, document_id, relation_type, created_by)
  values(p_activity_id, p_document_id, p_relation_type, caller_id)
  on conflict (activity_id, document_id) do update set relation_type = excluded.relation_type
  returning * into link_row;
  return link_row;
end;
$$;

create or replace function public.create_enforcement_action(
  p_project_id uuid,
  p_activity_id uuid,
  p_incident_id uuid,
  p_action_type text,
  p_title text,
  p_description text,
  p_recipient_id uuid,
  p_due_at timestamptz default null
)
returns public.project_enforcement_actions
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  action_row public.project_enforcement_actions;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not (public.is_admin() or public.has_role('control_obras')) then raise exception 'Only Control de Obras or Administration can create enforcement actions'; end if;
  if p_action_type not in ('amonestacion','sancion') then raise exception 'Invalid enforcement action type'; end if;

  insert into public.project_enforcement_actions(
    project_id, activity_id, incident_id, action_type, status, title, description,
    recipient_id, created_by, issued_by, issued_at, due_at
  ) values (
    p_project_id, p_activity_id, p_incident_id, p_action_type,
    case when public.is_admin() then 'issued' else 'draft' end,
    trim(p_title), trim(p_description), p_recipient_id, caller_id,
    case when public.is_admin() then caller_id else null end,
    case when public.is_admin() then now() else null end,
    p_due_at
  ) returning * into action_row;

  insert into public.audit_events(actor_id, project_id, action, entity_type, entity_id, metadata)
  values(caller_id, p_project_id, 'enforcement_action_created', 'project_enforcement_action', action_row.id,
         jsonb_build_object('action_type', p_action_type, 'status', action_row.status));

  return action_row;
end;
$$;

revoke all on function public.create_calendar_activity(uuid, uuid, uuid, text, text, timestamptz, timestamptz, text, boolean, text, text, uuid, uuid) from public, anon;
revoke all on function public.reschedule_calendar_activity(uuid, timestamptz, timestamptz) from public, anon;
revoke all on function public.update_calendar_activity_status(uuid, text) from public, anon;
revoke all on function public.find_available_activity_slots(uuid, uuid, uuid, integer, date, integer, time, time) from public, anon;
revoke all on function public.get_calendar_activities(timestamptz, timestamptz, uuid, uuid) from public, anon;
revoke all on function public.list_calendar_supervisors(uuid) from public, anon;
revoke all on function public.assign_project_supervisor(uuid, uuid, text) from public, anon;
revoke all on function public.schedule_project_inspection(uuid, uuid, timestamptz, timestamptz, text, text) from public, anon;
revoke all on function public.add_calendar_activity_participant(uuid, uuid, text) from public, anon;
revoke all on function public.link_activity_document(uuid, uuid, text) from public, anon;
revoke all on function public.create_enforcement_action(uuid, uuid, uuid, text, text, text, uuid, timestamptz) from public, anon;

grant execute on function public.create_calendar_activity(uuid, uuid, uuid, text, text, timestamptz, timestamptz, text, boolean, text, text, uuid, uuid) to authenticated;
grant execute on function public.reschedule_calendar_activity(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.update_calendar_activity_status(uuid, text) to authenticated;
grant execute on function public.find_available_activity_slots(uuid, uuid, uuid, integer, date, integer, time, time) to authenticated;
grant execute on function public.get_calendar_activities(timestamptz, timestamptz, uuid, uuid) to authenticated;
grant execute on function public.list_calendar_supervisors(uuid) to authenticated;
grant execute on function public.assign_project_supervisor(uuid, uuid, text) to authenticated;
grant execute on function public.schedule_project_inspection(uuid, uuid, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.add_calendar_activity_participant(uuid, uuid, text) to authenticated;
grant execute on function public.link_activity_document(uuid, uuid, text) to authenticated;
grant execute on function public.create_enforcement_action(uuid, uuid, uuid, text, text, text, uuid, timestamptz) to authenticated;

commit;
