do $$
declare
  demo_project uuid;
  admin_user uuid;
begin
  select id into demo_project from public.projects where project_code = 'CDE-DEMO-001' limit 1;
  select id into admin_user from public.profiles where email = 'admin.demo@costasur.com' limit 1;

  if demo_project is not null then
    insert into public.licenses (project_id, license_type, license_number, status, issued_by, issued_at, expires_at)
    select demo_project, 'inicio_obra', 'COSTASUR-MVP-LIC-001', 'issued', admin_user, '2026-08-10T00:00:00Z', '2027-08-10'
    where not exists (select 1 from public.licenses where license_number = 'COSTASUR-MVP-LIC-001' limit 1);

    insert into public.incidents (project_id, reporter_id, assigned_to, severity, status, title, description)
    select demo_project, admin_user, admin_user, 'high', 'in_progress', 'Revisión de drenaje pendiente', 'La revisión hidrosanitaria del sector norte requiere validación antes de cerrar la fase de planos técnicos.'
    where not exists (select 1 from public.incidents where title = 'Revisión de drenaje pendiente' and project_id = demo_project limit 1);
  end if;
end $$;
