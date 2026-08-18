-- Costasur CDE: synchronize physical project progress from logbook entries.

begin;

create or replace function private.sync_project_progress_from_logbook()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.progress_percent is not null then
    update public.projects
    set progress_percent = greatest(coalesce(progress_percent, 0), new.progress_percent),
        updated_at = now()
    where id = new.project_id;
  end if;
  return new;
end;
$$;

revoke all on function private.sync_project_progress_from_logbook() from public;
revoke all on function private.sync_project_progress_from_logbook() from anon;

drop trigger if exists trg_sync_project_progress_from_logbook on public.logbook_entries;
create trigger trg_sync_project_progress_from_logbook
after insert on public.logbook_entries
for each row execute function private.sync_project_progress_from_logbook();

-- Backfill the current highest physical progress for projects with existing logbook entries.
update public.projects p
set progress_percent = greatest(
      coalesce(p.progress_percent, 0),
      coalesce((
        select max(le.progress_percent)
        from public.logbook_entries le
        where le.project_id = p.id
      ), 0)
    ),
    updated_at = now()
where exists (
  select 1 from public.logbook_entries le where le.project_id = p.id
);

commit;
