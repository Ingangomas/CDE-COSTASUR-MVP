begin;

update public.profiles
set status = 'active',
    is_demo = true,
    display_name = case email
      when 'admin.demo@costasur.com' then 'Administrador General Demo'
      when 'owner.demo@costasur.com' then 'Propietario Demo'
      when 'architect.demo@costasur.com' then 'Arquitecto Demo'
      when 'contractor.demo@costasur.com' then 'Contratista Demo'
      when 'review.demo@costasur.com' then 'Revisión Técnica Demo'
      when 'control.demo@costasur.com' then 'Control de Obras Demo'
      when 'legal.demo@costasur.com' then 'Legal Demo'
      when 'electrica.demo@costasur.com' then 'Electricidad Demo'
      when 'hidrosanitaria.demo@costasur.com' then 'Hidrosanitaria Demo'
      when 'paisajismo.demo@costasur.com' then 'Paisajismo Demo'
      when 'mensura.demo@costasur.com' then 'Mensura Demo'
      when 'seguridad.demo@costasur.com' then 'Seguridad Demo'
      else display_name
    end
where email in (
  'admin.demo@costasur.com','owner.demo@costasur.com','architect.demo@costasur.com','contractor.demo@costasur.com',
  'review.demo@costasur.com','control.demo@costasur.com','legal.demo@costasur.com','electrica.demo@costasur.com',
  'hidrosanitaria.demo@costasur.com','paisajismo.demo@costasur.com','mensura.demo@costasur.com','seguridad.demo@costasur.com'
);

with admin as (
  select id from public.profiles where email = 'admin.demo@costasur.com' limit 1
), role_rows(email, role_key, department_slug) as (
  values
    ('admin.demo@costasur.com', 'admin_general', null),
    ('owner.demo@costasur.com', 'propietario', null),
    ('architect.demo@costasur.com', 'arquitecto', 'arquitectura'),
    ('contractor.demo@costasur.com', 'contratista', null),
    ('review.demo@costasur.com', 'revision_tecnica', 'revision_tecnica'),
    ('control.demo@costasur.com', 'control_obras', 'control_obras'),
    ('legal.demo@costasur.com', 'legal', 'legal'),
    ('electrica.demo@costasur.com', 'electrica', 'electrica'),
    ('hidrosanitaria.demo@costasur.com', 'hidrosanitaria', 'hidrosanitaria'),
    ('paisajismo.demo@costasur.com', 'paisajismo', 'paisajismo'),
    ('mensura.demo@costasur.com', 'mensura', 'mensura'),
    ('seguridad.demo@costasur.com', 'seguridad', 'seguridad')
)
insert into public.user_roles (user_id, role_key, department_id, is_active, granted_by)
select p.id, r.role_key, d.id, true, admin.id
from role_rows r
join public.profiles p on p.email = r.email
cross join admin
left join public.departments d on d.slug = r.department_slug
on conflict (user_id, role_key, department_id) do update
set is_active = true, granted_by = excluded.granted_by, granted_at = now();

insert into public.properties (property_code, property_type, name, address, owner_user_id, area_m2, latitude, longitude, status, legal_reference)
values (
  'DEMO-VILLA-001', 'villa', 'Villa Demo Costasur', 'Sector Punta Águila, Costasur',
  (select id from public.profiles where email = 'owner.demo@costasur.com' limit 1),
  482.50, 18.5402100, -68.3654100, 'active', 'EXP-DEMO-001'
)
on conflict (property_code) do update set
  name = excluded.name,
  owner_user_id = excluded.owner_user_id,
  status = excluded.status,
  updated_at = now();

insert into public.projects (property_id, project_code, title, project_type, phase, cde_status, operational_status, progress_percent, financial_progress_percent, created_by, start_date, target_end_date)
values (
  (select id from public.properties where property_code = 'DEMO-VILLA-001' limit 1),
  'CDE-DEMO-001', 'Villa Demo Costasur — Expediente Integral', 'obra_nueva',
  'anteproyecto', 'shared', 'obra_activa', 38.00, 31.50,
  (select id from public.profiles where email = 'admin.demo@costasur.com' limit 1),
  '2026-06-15', '2027-04-30'
)
on conflict (project_code) do update set
  title = excluded.title,
  phase = excluded.phase,
  cde_status = excluded.cde_status,
  operational_status = excluded.operational_status,
  progress_percent = excluded.progress_percent,
  financial_progress_percent = excluded.financial_progress_percent,
  updated_at = now();

with project as (
  select id from public.projects where project_code = 'CDE-DEMO-001' limit 1
), admin as (
  select id from public.profiles where email = 'admin.demo@costasur.com' limit 1
), member_rows(email, membership_role, department_slug) as (
  values
    ('owner.demo@costasur.com', 'propietario', null),
    ('architect.demo@costasur.com', 'arquitecto', 'arquitectura'),
    ('contractor.demo@costasur.com', 'contratista', null),
    ('review.demo@costasur.com', 'revisor', 'revision_tecnica'),
    ('control.demo@costasur.com', 'control_obras', 'control_obras'),
    ('legal.demo@costasur.com', 'revisor', 'legal'),
    ('electrica.demo@costasur.com', 'revisor', 'electrica'),
    ('hidrosanitaria.demo@costasur.com', 'revisor', 'hidrosanitaria'),
    ('paisajismo.demo@costasur.com', 'revisor', 'paisajismo'),
    ('mensura.demo@costasur.com', 'revisor', 'mensura'),
    ('seguridad.demo@costasur.com', 'observador', 'seguridad')
)
insert into public.project_members (project_id, user_id, membership_role, department_id, status, invited_by, approved_by)
select project.id, p.id, m.membership_role, d.id, 'active', admin.id, admin.id
from project
cross join admin
join member_rows m on true
join public.profiles p on p.email = m.email
left join public.departments d on d.slug = m.department_slug
on conflict (project_id, user_id, membership_role, department_id) do update
set status = 'active', approved_by = excluded.approved_by, updated_at = now();

insert into public.documents (project_id, category, title, description, required_department_id, cde_state, visible_to_owner, created_by)
values
  ((select id from public.projects where project_code = 'CDE-DEMO-001' limit 1), 'anteproyecto', 'Anteproyecto Arquitectónico — Villa Demo', 'Documento de referencia para el flujo de anteproyecto y revisión asistida por IA futura.', (select id from public.departments where slug = 'arquitectura' limit 1), 'shared', true, (select id from public.profiles where email = 'architect.demo@costasur.com' limit 1)),
  ((select id from public.projects where project_code = 'CDE-DEMO-001' limit 1), 'electrico', 'Planos Eléctricos — Villa Demo', 'Paquete técnico pendiente de revisión por el departamento de Electricidad.', (select id from public.departments where slug = 'electrica' limit 1), 'wip', false, (select id from public.profiles where email = 'architect.demo@costasur.com' limit 1)),
  ((select id from public.projects where project_code = 'CDE-DEMO-001' limit 1), 'hidrosanitario', 'Planos Hidrosanitarios — Villa Demo', 'Paquete técnico para coordinación hidrosanitaria.', (select id from public.departments where slug = 'hidrosanitaria' limit 1), 'wip', false, (select id from public.profiles where email = 'architect.demo@costasur.com' limit 1)),
  ((select id from public.projects where project_code = 'CDE-DEMO-001' limit 1), 'cad', 'Modelo CAD — Villa Demo', 'Modelo CAD de solo lectura para revisión coordinada.', (select id from public.departments where slug = 'revision_tecnica' limit 1), 'wip', false, (select id from public.profiles where email = 'architect.demo@costasur.com' limit 1)),
  ((select id from public.projects where project_code = 'CDE-DEMO-001' limit 1), 'licencia', 'Licencia de Inicio de Obra — Demo', 'Registro documental de la autorización inicial del proyecto.', (select id from public.departments where slug = 'legal' limit 1), 'published', true, (select id from public.profiles where email = 'legal.demo@costasur.com' limit 1))
on conflict do nothing;

insert into public.workflow_events (project_id, actor_id, actor_role, event_type, to_state, entity_type, comment)
select p.id, a.id, 'admin_general', 'project_seeded', 'shared', 'project', 'Proyecto demostrativo persistente preparado para el recorrido MVP.'
from public.projects p
cross join public.profiles a
where p.project_code = 'CDE-DEMO-001' and a.email = 'admin.demo@costasur.com'
  and not exists (
    select 1 from public.workflow_events w where w.project_id = p.id and w.event_type = 'project_seeded'
  );

insert into public.logbook_entries (project_id, author_id, entry_date, progress_percent, title, description, weather)
select p.id, c.id, current_date, 38, 'Avance inicial de obra', 'Se registró el avance físico inicial del proyecto demostrativo para validar la bitácora persistente.', 'Soleado'
from public.projects p
cross join public.profiles c
where p.project_code = 'CDE-DEMO-001' and c.email = 'contractor.demo@costasur.com'
  and not exists (
    select 1 from public.logbook_entries l where l.project_id = p.id and l.title = 'Avance inicial de obra'
  );

insert into public.notifications (user_id, project_id, notification_type, title, body)
select o.id, p.id, 'project_update', 'Proyecto Demo Costasur activo', 'El expediente integral de Villa Demo está disponible para tu revisión.'
from public.profiles o
cross join public.projects p
where o.email = 'owner.demo@costasur.com' and p.project_code = 'CDE-DEMO-001'
  and not exists (
    select 1 from public.notifications n where n.user_id = o.id and n.project_id = p.id and n.notification_type = 'project_update'
  );

commit;
