-- RLS helper functions must be callable by authenticated clients because they are
-- referenced from authenticated policies. Public and anonymous execution remains revoked.
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.can_review_department(uuid, uuid) to authenticated;

revoke execute on function public.is_admin() from anon;
revoke execute on function public.has_role(text) from anon;
revoke execute on function public.can_access_project(uuid) from anon;
revoke execute on function public.can_review_department(uuid, uuid) from anon;
