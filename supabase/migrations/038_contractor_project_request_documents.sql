-- CDE Costasur: attach documents to a contractor-submitted project request.
-- Additive only. Existing contractor_requests and project workflows remain unchanged.
begin;

create or replace function public.attach_contractor_project_request_documents(
  p_request_id uuid,
  p_start_form_path text,
  p_start_form_filename text,
  p_work_items_path text,
  p_work_items_filename text
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
  if caller_id is null then
    raise exception 'An authenticated contractor is required';
  end if;

  update public.contractor_project_requests
  set start_form_path = nullif(trim(p_start_form_path), ''),
      start_form_filename = nullif(trim(p_start_form_filename), ''),
      work_items_path = nullif(trim(p_work_items_path), ''),
      work_items_filename = nullif(trim(p_work_items_filename), '')
  where id = p_request_id
    and requested_by = caller_id
    and public.has_role('contratista');

  if not found then
    raise exception 'The contractor cannot attach documents to this request';
  end if;

  select * into request_row
  from public.contractor_project_requests
  where id = p_request_id;
  return request_row;
end;
$$;

revoke all on function public.attach_contractor_project_request_documents(uuid,text,text,text,text) from public;
revoke all on function public.attach_contractor_project_request_documents(uuid,text,text,text,text) from anon;
grant execute on function public.attach_contractor_project_request_documents(uuid,text,text,text,text) to authenticated;

commit;
