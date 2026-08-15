insert into public.licenses (project_id, license_type, license_number, status, issued_by, issued_at, expires_at)
select p.id, 'inicio_obra', 'COSTASUR-MVP-LIC-001', 'issued', a.id, '2026-08-10T00:00:00Z', '2027-08-10'
from public.projects p
cross join public.profiles a
where p.project_code = 'CDE-DEMO-001' and a.email = 'admin.demo@costasur.com'
on conflict (license_number) do nothing;

insert into public.incidents (project_id, reporter_id, assigned_to, severity, status, title, description)
select p.id, a.id, a.id, 'high', 'in_progress', 'Revisión de drenaje pendiente', 'La revisión hidrosanitaria del sector norte requiere validación antes de cerrar la fase de planos técnicos.'
from public.projects p
cross join public.profiles a
where p.project_code = 'CDE-DEMO-001' and a.email = 'admin.demo@costasur.com'
and not exists (select 1 from public.incidents i where i.project_id = p.id and i.title = 'Revisión de drenaje pendiente');
