create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, status, is_demo)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'Usuario Costasur'), '@', 1)),
    'pending',
    false
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.departments (slug, name, description)
values
  ('arquitectura', 'Arquitectura y Diseño', 'Anteproyecto, planos arquitectónicos y memoria descriptiva.'),
  ('revision_tecnica', 'Revisión Técnica', 'Coordinación y revisión interdisciplinaria.'),
  ('control_obras', 'Control de Obras', 'Seguimiento, inspecciones, licencias y control operativo.'),
  ('legal', 'Legal', 'Validación de propiedad, contratos y documentación legal.'),
  ('electrica', 'Electricidad', 'Revisión de planos y sistemas eléctricos.'),
  ('hidrosanitaria', 'Hidrosanitaria', 'Revisión de redes hidrosanitarias y especificaciones.'),
  ('paisajismo', 'Paisajismo', 'Revisión de diseño exterior y jardinería.'),
  ('mensura', 'Mensura', 'Topografía, deslindes y control geométrico.'),
  ('seguridad', 'Seguridad y Guardianes', 'Accesos, seguridad y coordinación en sitio.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;
