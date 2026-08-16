create index if not exists idx_user_roles_department on public.user_roles(department_id);
create index if not exists idx_user_roles_granted_by on public.user_roles(granted_by);
create index if not exists idx_properties_owner_user on public.properties(owner_user_id);
create index if not exists idx_projects_created_by on public.projects(created_by);
create index if not exists idx_project_members_department on public.project_members(department_id);
create index if not exists idx_project_members_invited_by on public.project_members(invited_by);
create index if not exists idx_project_members_approved_by on public.project_members(approved_by);
create index if not exists idx_documents_required_department on public.documents(required_department_id);
create index if not exists idx_documents_created_by on public.documents(created_by);
create index if not exists idx_documents_current_version on public.documents(current_version_id);
create index if not exists idx_document_versions_uploaded_by on public.document_versions(uploaded_by);
create index if not exists idx_document_annotations_version on public.document_annotations(document_version_id);
create index if not exists idx_document_annotations_author on public.document_annotations(author_id);
create index if not exists idx_reviews_department on public.reviews(department_id);
create index if not exists idx_reviews_document_version on public.reviews(document_version_id);
create index if not exists idx_reviews_reviewer on public.reviews(reviewer_id);
create index if not exists idx_workflow_events_actor on public.workflow_events(actor_id);
create index if not exists idx_contractor_requests_requested_by on public.contractor_requests(requested_by);
create index if not exists idx_inspections_request on public.inspections(request_id);
create index if not exists idx_inspections_inspector on public.inspections(inspector_id);
create index if not exists idx_inspections_report_document on public.inspections(report_document_id);
create index if not exists idx_logbook_entries_author on public.logbook_entries(author_id);
create index if not exists idx_incidents_reporter on public.incidents(reporter_id);
create index if not exists idx_incidents_assigned_to on public.incidents(assigned_to);
create index if not exists idx_licenses_issued_by on public.licenses(issued_by);
create index if not exists idx_licenses_document on public.licenses(document_id);
create index if not exists idx_notifications_project on public.notifications(project_id);
create index if not exists idx_audit_events_actor on public.audit_events(actor_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
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
    where ur.user_id = (select auth.uid())
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
  select (select public.is_admin()) or exists (
    select 1 from public.project_members pm
    where pm.project_id = target_project_id
      and pm.user_id = (select auth.uid())
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
  select (select public.is_admin()) or exists (
    select 1
    from public.project_members pm
    join public.user_roles ur on ur.user_id = (select auth.uid()) and ur.is_active = true
    where pm.project_id = target_project_id
      and pm.department_id = target_department_id
      and pm.status = 'active'
      and pm.user_id = (select auth.uid())
      and pm.membership_role in ('revisor','control_obras')
  );
$$;

 drop policy if exists profiles_self_or_admin_read on public.profiles;
create policy profiles_self_or_admin_read on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
 drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
 drop policy if exists user_roles_self_or_admin_read on public.user_roles;
create policy user_roles_self_or_admin_read on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
 drop policy if exists properties_owner_member_or_admin_read on public.properties;
create policy properties_owner_member_or_admin_read on public.properties for select to authenticated using (
  owner_user_id = (select auth.uid()) or (select public.is_admin()) or exists (
    select 1 from public.projects p
    where p.property_id = properties.id and (select public.can_access_project(p.id))
  )
);
 drop policy if exists projects_member_or_admin_read on public.projects;
create policy projects_member_or_admin_read on public.projects for select to authenticated using ((select public.can_access_project(id)));
 drop policy if exists project_members_member_or_admin_read on public.project_members;
create policy project_members_member_or_admin_read on public.project_members for select to authenticated using ((select public.can_access_project(project_id)));
 drop policy if exists documents_project_member_read on public.documents;
create policy documents_project_member_read on public.documents for select to authenticated using (
  (select public.can_access_project(project_id)) and ((not exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role_key = 'propietario')) or visible_to_owner = true or (select public.is_admin()))
);
 drop policy if exists document_versions_project_member_read on public.document_versions;
create policy document_versions_project_member_read on public.document_versions for select to authenticated using (
  exists (select 1 from public.documents d where d.id = document_id and (select public.can_access_project(d.project_id)) and (d.visible_to_owner = true or (select public.is_admin()) or not (select public.has_role('propietario'))))
);
 drop policy if exists document_annotations_project_member_read on public.document_annotations;
create policy document_annotations_project_member_read on public.document_annotations for select to authenticated using (
  exists (select 1 from public.document_versions dv join public.documents d on d.id = dv.document_id where dv.id = document_version_id and (select public.can_access_project(d.project_id)) and (visibility = 'published' or (select public.is_admin()) or not (select public.has_role('propietario'))))
);
 drop policy if exists reviews_project_member_read on public.reviews;
create policy reviews_project_member_read on public.reviews for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists workflow_events_project_member_read on public.workflow_events;
create policy workflow_events_project_member_read on public.workflow_events for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists contractor_requests_project_member_read on public.contractor_requests;
create policy contractor_requests_project_member_read on public.contractor_requests for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists inspections_project_member_read on public.inspections;
create policy inspections_project_member_read on public.inspections for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists logbook_project_member_read on public.logbook_entries;
create policy logbook_project_member_read on public.logbook_entries for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists incidents_project_member_read on public.incidents;
create policy incidents_project_member_read on public.incidents for select to authenticated using ((select public.can_access_project(project_id)) and ((select public.is_admin()) or not (select public.has_role('propietario'))));
 drop policy if exists licenses_project_member_read on public.licenses;
create policy licenses_project_member_read on public.licenses for select to authenticated using ((select public.can_access_project(project_id)));
 drop policy if exists notifications_self_read on public.notifications;
create policy notifications_self_read on public.notifications for select to authenticated using (user_id = (select auth.uid()));
 drop policy if exists audit_events_admin_read on public.audit_events;
create policy audit_events_admin_read on public.audit_events for select to authenticated using ((select public.is_admin()));

 drop policy if exists properties_admin_insert on public.properties;
create policy properties_admin_insert on public.properties for insert to authenticated with check ((select public.is_admin()));
 drop policy if exists projects_admin_or_creator_insert on public.projects;
create policy projects_admin_or_creator_insert on public.projects for insert to authenticated with check ((select public.is_admin()) or created_by = (select auth.uid()));
 drop policy if exists project_members_admin_insert on public.project_members;
create policy project_members_admin_insert on public.project_members for insert to authenticated with check ((select public.is_admin()));
 drop policy if exists documents_member_insert on public.documents;
create policy documents_member_insert on public.documents for insert to authenticated with check ((select public.can_access_project(project_id)) and created_by = (select auth.uid()));
 drop policy if exists document_versions_member_insert on public.document_versions;
create policy document_versions_member_insert on public.document_versions for insert to authenticated with check (
  uploaded_by = (select auth.uid()) and exists (select 1 from public.documents d where d.id = document_id and (select public.can_access_project(d.project_id)))
);
 drop policy if exists document_annotations_member_insert on public.document_annotations;
create policy document_annotations_member_insert on public.document_annotations for insert to authenticated with check (
  author_id = (select auth.uid()) and exists (select 1 from public.document_versions dv join public.documents d on d.id = dv.document_id where dv.id = document_version_id and (select public.can_access_project(d.project_id)))
);
 drop policy if exists reviews_authorized_insert on public.reviews;
create policy reviews_authorized_insert on public.reviews for insert to authenticated with check (reviewer_id = (select auth.uid()) and (select public.can_review_department(project_id, department_id)));
 drop policy if exists workflow_events_member_insert on public.workflow_events;
create policy workflow_events_member_insert on public.workflow_events for insert to authenticated with check (actor_id = (select auth.uid()) and (select public.can_access_project(project_id)));
 drop policy if exists contractor_requests_member_insert on public.contractor_requests;
create policy contractor_requests_member_insert on public.contractor_requests for insert to authenticated with check (requested_by = (select auth.uid()) and (select public.can_access_project(project_id)));
 drop policy if exists inspections_control_insert on public.inspections;
create policy inspections_control_insert on public.inspections for insert to authenticated with check ((select public.is_admin()) or (select public.has_role('control_obras')));
 drop policy if exists logbook_member_insert on public.logbook_entries;
create policy logbook_member_insert on public.logbook_entries for insert to authenticated with check (author_id = (select auth.uid()) and (select public.can_access_project(project_id)));
 drop policy if exists incidents_member_insert on public.incidents;
create policy incidents_member_insert on public.incidents for insert to authenticated with check (reporter_id = (select auth.uid()) and (select public.can_access_project(project_id)));
 drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

 drop policy if exists properties_admin_update on public.properties;
create policy properties_admin_update on public.properties for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 drop policy if exists projects_admin_update on public.projects;
create policy projects_admin_update on public.projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 drop policy if exists project_members_admin_update on public.project_members;
create policy project_members_admin_update on public.project_members for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 drop policy if exists documents_admin_update on public.documents;
create policy documents_admin_update on public.documents for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 drop policy if exists document_versions_admin_update on public.document_versions;
create policy document_versions_admin_update on public.document_versions for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 drop policy if exists incidents_control_update on public.incidents;
create policy incidents_control_update on public.incidents for update to authenticated using ((select public.is_admin()) or (select public.has_role('control_obras'))) with check ((select public.is_admin()) or (select public.has_role('control_obras')));
