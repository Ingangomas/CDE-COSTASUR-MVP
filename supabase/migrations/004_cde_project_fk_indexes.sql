create index if not exists idx_contractor_requests_project on public.contractor_requests(project_id);
create index if not exists idx_inspections_project on public.inspections(project_id);
create index if not exists idx_logbook_entries_project on public.logbook_entries(project_id);
create index if not exists idx_incidents_project on public.incidents(project_id);
create index if not exists idx_licenses_project on public.licenses(project_id);
drop index if exists public.idx_properties_owner_user;
