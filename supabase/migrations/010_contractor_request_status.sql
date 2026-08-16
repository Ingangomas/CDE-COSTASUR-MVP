create policy contractor_requests_control_update
on public.contractor_requests
for update
to authenticated
using (public.is_admin() or public.has_role('control_obras'))
with check (public.is_admin() or public.has_role('control_obras'));
