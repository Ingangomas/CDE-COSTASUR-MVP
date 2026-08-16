create extension if not exists pgcrypto;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_key text not null check (role_key in ('admin_general','propietario','arquitecto','contratista','revision_tecnica','control_obras','legal','electrica','hidrosanitaria','paisajismo','mensura','seguridad')),
  department_id uuid references public.departments(id) on delete set null,
  is_active boolean not null default true,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  unique (user_id, role_key, department_id)
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  property_code text not null unique,
  property_type text not null check (property_type in ('terreno','villa','vivienda')),
  name text not null,
  address text,
  owner_user_id uuid references public.profiles(id) on delete set null,
  area_m2 numeric(12,2),
  latitude numeric(10,7),
  longitude numeric(10,7),
  status text not null default 'active' check (status in ('active','archived','pending_validation')),
  legal_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete restrict,
  project_code text not null unique,
  title text not null,
  project_type text not null check (project_type in ('obra_nueva','remodelacion','ampliacion','renovacion','area_anexa','otro')),
  phase text not null default 'autorizacion_inicial' check (phase in ('autorizacion_inicial','anteproyecto','revision_tecnica','directorio','planos_tecnicos','inicio_obra','obra_activa','cierre','archivo')),
  cde_status text not null default 'wip' check (cde_status in ('wip','shared','published','archive')),
  operational_status text not null default 'en_revision' check (operational_status in ('en_revision','aprobado','pendiente_inspeccion','obra_autorizada','obra_activa','critica','paralizada','finalizada','archivada')),
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  financial_progress_percent numeric(5,2) not null default 0 check (financial_progress_percent >= 0 and financial_progress_percent <= 100),
  created_by uuid not null references public.profiles(id) on delete restrict,
  start_date date,
  target_end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  membership_role text not null check (membership_role in ('propietario','arquitecto','contratista','revisor','control_obras','observador')),
  department_id uuid references public.departments(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id, membership_role, department_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null check (category in ('autorizacion','legal','anteproyecto','arquitectonico','estructural','electrico','hidrosanitario','climatizacion','paisajismo','memoria_descriptiva','inicio_obra','licencia','inspeccion','reporte','fotografia','cad','otro')),
  title text not null,
  description text,
  required_department_id uuid references public.departments(id) on delete set null,
  cde_state text not null default 'wip' check (cde_state in ('wip','shared','published','archive')),
  visible_to_owner boolean not null default false,
  current_version_id uuid,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  original_filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes >= 0),
  checksum_sha256 text,
  cde_state text not null default 'wip' check (cde_state in ('wip','shared','published','archive')),
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

alter table public.documents
  drop constraint if exists documents_current_version_id_fkey;
alter table public.documents
  add constraint documents_current_version_id_fkey
  foreign key (current_version_id) references public.document_versions(id) on delete set null;

create table if not exists public.document_annotations (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  page_number integer not null default 1 check (page_number > 0),
  annotation_type text not null check (annotation_type in ('comment','highlight','rectangle','note','marker')),
  x numeric(10,4),
  y numeric(10,4),
  width numeric(10,4),
  height numeric(10,4),
  content text,
  visibility text not null default 'internal' check (visibility in ('internal','project_members','published')),
  status text not null default 'open' check (status in ('open','resolved','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  document_version_id uuid not null references public.document_versions(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete restrict,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  decision text not null check (decision in ('pendiente','comentado','devuelto','aprobado','rechazado')),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  event_type text not null,
  from_state text,
  to_state text,
  entity_type text,
  entity_id uuid,
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.contractor_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  request_type text not null check (request_type in ('inicio_obra','inspeccion_topografica','inspeccion_tecnica','vaciado_hormigon','solicitud_departamento','otro')),
  status text not null default 'submitted' check (status in ('draft','submitted','in_review','scheduled','approved','rejected','completed','cancelled')),
  requested_date date,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  request_id uuid references public.contractor_requests(id) on delete set null,
  inspection_type text not null check (inspection_type in ('topografica','tecnica','control_obras','electrica','hidrosanitaria','paisajismo','seguridad','otra')),
  inspector_id uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text not null default 'requested' check (status in ('requested','scheduled','in_progress','completed','cancelled')),
  findings text,
  report_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.logbook_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  entry_date date not null default current_date,
  progress_percent numeric(5,2) check (progress_percent >= 0 and progress_percent <= 100),
  title text not null,
  description text not null,
  weather text,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  assigned_to uuid references public.profiles(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  title text not null,
  description text not null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  license_type text not null check (license_type in ('inicio_obra','construccion','ocupacion','cierre','otra')),
  license_number text not null unique,
  status text not null default 'draft' check (status in ('draft','issued','suspended','expired','revoked')),
  issued_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz,
  expires_at date,
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_user on public.user_roles(user_id, is_active);
create index if not exists idx_properties_owner on public.properties(owner_user_id);
create index if not exists idx_projects_property on public.projects(property_id);
create index if not exists idx_projects_status on public.projects(phase, operational_status, cde_status);
create index if not exists idx_project_members_user on public.project_members(user_id, status);
create index if not exists idx_project_members_project on public.project_members(project_id, status);
create index if not exists idx_documents_project on public.documents(project_id, category, cde_state);
create index if not exists idx_document_versions_document on public.document_versions(document_id, version_number desc);
create index if not exists idx_reviews_project on public.reviews(project_id, department_id, decision);
create index if not exists idx_workflow_events_project on public.workflow_events(project_id, created_at desc);
create index if not exists idx_notifications_user on public.notifications(user_id, read_at, created_at desc);
create index if not exists idx_audit_project on public.audit_events(project_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key = 'admin_general'
      and ur.is_active = true
  );
$$;

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_key = required_role
      and ur.is_active = true
  );
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = auth.uid()
      and pm.status = 'active'
  );
$$;

create or replace function public.can_review_department(target_project_id uuid, target_department_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.project_members pm
    join public.user_roles ur on ur.user_id = auth.uid() and ur.is_active = true
    where pm.project_id = target_project_id
      and pm.department_id = target_department_id
      and pm.status = 'active'
      and pm.user_id = auth.uid()
      and pm.membership_role in ('revisor','control_obras')
  );
$$;

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.properties enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_annotations enable row level security;
alter table public.reviews enable row level security;
alter table public.workflow_events enable row level security;
alter table public.contractor_requests enable row level security;
alter table public.inspections enable row level security;
alter table public.logbook_entries enable row level security;
alter table public.incidents enable row level security;
alter table public.licenses enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_events enable row level security;

create policy departments_authenticated_read on public.departments for select to authenticated using (true);
create policy profiles_self_or_admin_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy user_roles_self_or_admin_read on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy properties_owner_member_or_admin_read on public.properties for select to authenticated using (
  owner_user_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.projects p
    where p.property_id = properties.id and public.can_access_project(p.id)
  )
);
create policy projects_member_or_admin_read on public.projects for select to authenticated using (public.can_access_project(id));
create policy project_members_member_or_admin_read on public.project_members for select to authenticated using (public.can_access_project(project_id));
create policy documents_project_member_read on public.documents for select to authenticated using (
  public.can_access_project(project_id) and (not exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role_key = 'propietario') or visible_to_owner = true or public.is_admin())
);
create policy document_versions_project_member_read on public.document_versions for select to authenticated using (
  exists (select 1 from public.documents d where d.id = document_id and public.can_access_project(d.project_id) and (d.visible_to_owner = true or public.is_admin() or not public.has_role('propietario')))
);
create policy document_annotations_project_member_read on public.document_annotations for select to authenticated using (
  exists (select 1 from public.document_versions dv join public.documents d on d.id = dv.document_id where dv.id = document_version_id and public.can_access_project(d.project_id) and (visibility = 'published' or public.is_admin() or not public.has_role('propietario')))
);
create policy reviews_project_member_read on public.reviews for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy workflow_events_project_member_read on public.workflow_events for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy contractor_requests_project_member_read on public.contractor_requests for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy inspections_project_member_read on public.inspections for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy logbook_project_member_read on public.logbook_entries for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy incidents_project_member_read on public.incidents for select to authenticated using (public.can_access_project(project_id) and (public.is_admin() or not public.has_role('propietario')));
create policy licenses_project_member_read on public.licenses for select to authenticated using (public.can_access_project(project_id));
create policy notifications_self_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy audit_events_admin_read on public.audit_events for select to authenticated using (public.is_admin());

create policy properties_admin_insert on public.properties for insert to authenticated with check (public.is_admin());
create policy projects_admin_or_creator_insert on public.projects for insert to authenticated with check (public.is_admin() or created_by = auth.uid());
create policy project_members_admin_insert on public.project_members for insert to authenticated with check (public.is_admin());
create policy documents_member_insert on public.documents for insert to authenticated with check (public.can_access_project(project_id) and created_by = auth.uid());
create policy document_versions_member_insert on public.document_versions for insert to authenticated with check (
  uploaded_by = auth.uid() and exists (select 1 from public.documents d where d.id = document_id and public.can_access_project(d.project_id))
);
create policy document_annotations_member_insert on public.document_annotations for insert to authenticated with check (
  author_id = auth.uid() and exists (select 1 from public.document_versions dv join public.documents d on d.id = dv.document_id where dv.id = document_version_id and public.can_access_project(d.project_id))
);
create policy reviews_authorized_insert on public.reviews for insert to authenticated with check (
  reviewer_id = auth.uid() and public.can_review_department(project_id, department_id)
);
create policy workflow_events_member_insert on public.workflow_events for insert to authenticated with check (actor_id = auth.uid() and public.can_access_project(project_id));
create policy contractor_requests_member_insert on public.contractor_requests for insert to authenticated with check (requested_by = auth.uid() and public.can_access_project(project_id));
create policy inspections_control_insert on public.inspections for insert to authenticated with check (public.is_admin() or public.has_role('control_obras'));
create policy logbook_member_insert on public.logbook_entries for insert to authenticated with check (author_id = auth.uid() and public.can_access_project(project_id));
create policy incidents_member_insert on public.incidents for insert to authenticated with check (reporter_id = auth.uid() and public.can_access_project(project_id));
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy properties_admin_update on public.properties for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy projects_admin_update on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy project_members_admin_update on public.project_members for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy documents_admin_update on public.documents for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy document_versions_admin_update on public.document_versions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy incidents_control_update on public.incidents for update to authenticated using (public.is_admin() or public.has_role('control_obras')) with check (public.is_admin() or public.has_role('control_obras'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists project_members_set_updated_at on public.project_members;
create trigger project_members_set_updated_at before update on public.project_members for each row execute function public.set_updated_at();
drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
drop trigger if exists document_annotations_set_updated_at on public.document_annotations;
create trigger document_annotations_set_updated_at before update on public.document_annotations for each row execute function public.set_updated_at();
drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();
drop trigger if exists contractor_requests_set_updated_at on public.contractor_requests;
create trigger contractor_requests_set_updated_at before update on public.contractor_requests for each row execute function public.set_updated_at();
drop trigger if exists inspections_set_updated_at on public.inspections;
create trigger inspections_set_updated_at before update on public.inspections for each row execute function public.set_updated_at();
drop trigger if exists incidents_set_updated_at on public.incidents;
create trigger incidents_set_updated_at before update on public.incidents for each row execute function public.set_updated_at();

do $$
begin
  alter table public.documents add constraint documents_version_unique unique (id, current_version_id);
exception when duplicate_object then null;
end $$;
