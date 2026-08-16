-- Costasur CDE: administrator user and role governance
-- Keeps self-service profile editing limited to the owner while allowing
-- only the administrator role to manage CDE membership and assignments.

create policy profiles_admin_update
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy user_roles_admin_insert
  on public.user_roles
  for insert
  to authenticated
  with check (public.is_admin());

create policy user_roles_admin_update
  on public.user_roles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy user_roles_admin_delete
  on public.user_roles
  for delete
  to authenticated
  using (public.is_admin());

create policy project_members_admin_delete
  on public.project_members
  for delete
  to authenticated
  using (public.is_admin());
