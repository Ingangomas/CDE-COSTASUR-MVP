-- Costasur CDE: consolidate profile update policies
-- Keeps self-service updates for the current user and admin updates for
-- Administrador General in a single permissive policy.

drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;

create policy profiles_self_or_admin_update
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
