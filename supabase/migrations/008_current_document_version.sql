create or replace function public.set_current_document_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.documents
  set current_version_id = new.id,
      updated_at = now()
  where id = new.document_id
    and (current_version_id is null or current_version_id = old.id or new.version_number >= coalesce((select dv.version_number from public.document_versions dv where dv.id = current_version_id), 0));
  return new;
end;
$$;

revoke all on function public.set_current_document_version() from public;
revoke all on function public.set_current_document_version() from anon;
revoke all on function public.set_current_document_version() from authenticated;

drop trigger if exists document_version_sets_current on public.document_versions;
create trigger document_version_sets_current
after insert on public.document_versions
for each row execute function public.set_current_document_version();
