-- Costasur CDE: Control de Obras transitions for contractor requests.

begin;

create or replace function public.resolve_contractor_request(
  p_request_id uuid,
  p_status text,
  p_comment text
)
returns public.contractor_requests
language plpgsql
security definer
set search_path = public, private
as $$
declare
  caller_id uuid := (select auth.uid());
  request_row public.contractor_requests;
  project_row public.projects;
  next_status text;
begin
  if caller_id is null then raise exception 'Authentication is required'; end if;
  if not (public.is_admin() or public.has_role('control_obras')) then raise exception 'Only Control de Obras can resolve this request'; end if;
  if p_status not in ('in_review','scheduled','approved','rejected','completed','cancelled') then raise exception 'Invalid request status'; end if;

  select * into request_row from public.contractor_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'Request not found'; end if;
  select * into project_row from public.projects where id = request_row.project_id for update;

  update public.contractor_requests
  set status = p_status,
      description = case when nullif(trim(p_comment), '') is null then description else concat_ws(E'\n\n', description, trim(p_comment)) end,
      updated_at = now()
  where id = p_request_id
  returning * into request_row;

  if p_status = 'approved' and request_row.request_type = 'inicio_obra' then
    update public.projects
    set phase = 'obra_activa', operational_status = 'obra_activa', cde_status = 'shared', updated_at = now()
    where id = request_row.project_id;
  elsif p_status = 'scheduled' and request_row.request_type like 'inspeccion_%' then
    insert into public.inspections(project_id, request_id, inspection_type, scheduled_at, status)
    values(request_row.project_id, request_row.id, case when request_row.request_type = 'inspeccion_topografica' then 'topografica' else 'tecnica' end, coalesce(request_row.requested_date::timestamptz, now()), 'scheduled');
  end if;

  return request_row;
end;
$$;

revoke all on function public.resolve_contractor_request(uuid, text, text) from public;
revoke all on function public.resolve_contractor_request(uuid, text, text) from anon;
grant execute on function public.resolve_contractor_request(uuid, text, text) to authenticated;

commit;
