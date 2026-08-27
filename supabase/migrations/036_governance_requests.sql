-- CDE Costasur: governance requests from Legal, Architecture and Control de Obras.
-- Additive only. Existing contractor_requests and project workflows remain unchanged.

begin;

create table if not exists public.governance_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('new_user','role_assignment','ownership_transfer')),
  status text not null default 'submitted' check (status in ('submitted','in_review','approved','rejected','cancelled')),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  target_user_id uuid references public.profiles(id) on delete set null,
  target_email text,
  target_display_name text,
  target_role text,
  department_id uuid references public.departments(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  notes text,
  decision_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_user_id is not null or nullif(trim(target_email), '') is not null)
);

create index if not exists governance_requests_status_idx on public.governance_requests(status, created_at desc);
create index if not exists governance_requests_project_idx on public.governance_requests(project_id, created_at desc);
create index if not exists governance_requests_property_idx on public.governance_requests(property_id, created_at desc);

alter table public.governance_requests enable row level security;

create policy governance_requests_governance_all
  on public.governance_requests for all to authenticated
  using (public.is_governance())
  with check (public.is_governance());

create policy governance_requests_requester_read
  on public.governance_requests for select to authenticated
  using (requested_by = auth.uid() or target_user_id = auth.uid());

create policy governance_requests_department_insert
  on public.governance_requests for insert to authenticated
  with check (
    requested_by = auth.uid()
    and (
      public.has_role('legal')
      or public.has_role('arquitecto')
      or public.has_role('control_obras')
      or public.has_role('revision_tecnica')
    )
  );

create policy governance_requests_department_update
  on public.governance_requests for update to authenticated
  using (requested_by = auth.uid() and status in ('submitted','in_review'))
  with check (requested_by = auth.uid() and status in ('submitted','in_review','cancelled'));

create or replace function public.resolve_governance_request(
  p_request_id uuid,
  p_status text,
  p_decision_note text default null
)
returns public.governance_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := auth.uid();
  request_row public.governance_requests;
begin
  if caller_id is null or not public.is_governance() then
    raise exception 'Only Gobernanza can resolve this request';
  end if;
  if p_status not in ('approved','rejected','cancelled') then
    raise exception 'Invalid governance request status';
  end if;

  select * into request_row from public.governance_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'Governance request not found'; end if;

  update public.governance_requests
  set status = p_status,
      decision_note = nullif(trim(p_decision_note), ''),
      reviewed_by = caller_id,
      reviewed_at = now(),
      updated_at = now()
  where id = p_request_id
  returning * into request_row;

  if p_status = 'approved' and request_row.request_type = 'role_assignment' and request_row.target_user_id is not null then
    insert into public.user_roles(user_id, role_key, department_id, is_active, granted_by)
    values(request_row.target_user_id, request_row.target_role, request_row.department_id, true, caller_id)
    on conflict (user_id, role_key, department_id) do update set is_active = true, granted_by = caller_id, granted_at = now();
  end if;

  if p_status = 'approved' and request_row.request_type = 'ownership_transfer' and request_row.target_user_id is not null and request_row.property_id is not null then
    update public.properties set owner_user_id = request_row.target_user_id, updated_at = now() where id = request_row.property_id;
  end if;

  return request_row;
end;
$$;

revoke all on function public.resolve_governance_request(uuid, text, text) from public;
revoke all on function public.resolve_governance_request(uuid, text, text) from anon;
grant execute on function public.resolve_governance_request(uuid, text, text) to authenticated;

commit;
