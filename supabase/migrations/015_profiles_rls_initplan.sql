-- Costasur CDE: optimize the consolidated profile update policy

drop policy if exists profiles_self_or_admin_update on public.profiles;

create policy profiles_self_or_admin_update
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));
