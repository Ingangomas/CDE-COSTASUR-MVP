insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cde-documents',
  'cde-documents',
  false,
  52428800,
  array[
    'application/pdf',
    'application/acad',
    'application/x-acad',
    'application/x-dwg',
    'application/dwg',
    'application/dxf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy cde_documents_select on storage.objects
for select to authenticated
using (
  bucket_id = 'cde-documents'
  and public.can_access_project((storage.foldername(name))[1]::uuid)
  and (
    public.is_admin()
    or not public.has_role('propietario')
    or exists (
      select 1 from public.documents d
      join public.document_versions dv on dv.document_id = d.id
      where dv.storage_path = name and (d.visible_to_owner = true or public.is_admin())
    )
  )
);

create policy cde_documents_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'cde-documents'
  and public.can_access_project((storage.foldername(name))[1]::uuid)
);

create policy cde_documents_update on storage.objects
for update to authenticated
using (bucket_id = 'cde-documents' and public.is_admin())
with check (bucket_id = 'cde-documents' and public.is_admin());

create policy cde_documents_delete on storage.objects
for delete to authenticated
using (bucket_id = 'cde-documents' and public.is_admin());
