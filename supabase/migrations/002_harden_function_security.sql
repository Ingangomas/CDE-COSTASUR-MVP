create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
revoke all on function public.is_admin() from authenticated;
revoke all on function public.has_role(text) from public;
revoke all on function public.has_role(text) from anon;
revoke all on function public.has_role(text) from authenticated;
revoke all on function public.can_access_project(uuid) from public;
revoke all on function public.can_access_project(uuid) from anon;
revoke all on function public.can_access_project(uuid) from authenticated;
revoke all on function public.can_review_department(uuid, uuid) from public;
revoke all on function public.can_review_department(uuid, uuid) from anon;
revoke all on function public.can_review_department(uuid, uuid) from authenticated;
