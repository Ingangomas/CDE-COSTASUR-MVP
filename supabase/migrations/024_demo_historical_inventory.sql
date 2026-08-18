-- Costasur CDE: day-one historical demo inventory.
-- Five existing villas with historical projects and five empty lots.
-- DEMO-VILLA-001 remains the active owner workflow property.

begin;

do $$
declare
  demo_owner uuid := '2eae8dad-ca7a-41c4-9313-4553d946932f';
  demo_admin uuid := '5bc4b78d-438f-482d-89ee-7d86d72abbba';
  villa_id uuid;
  historical_project_id uuid;
begin
  insert into public.properties (property_code, property_type, name, address, owner_user_id, status, latitude, longitude)
  values
    ('DEMO-VILLA-001', 'villa', 'Villa Demo 1 — Casa Existente', 'Sector Punta Águila, Costasur', demo_owner, 'active', 18.5402100, -68.3654100),
    ('DEMO-VILLA-002', 'villa', 'Villa Demo 2 — Casa Existente', 'Sector La Romana, Costasur', null, 'active', 18.5421800, -68.3629000),
    ('DEMO-VILLA-003', 'villa', 'Villa Demo 3 — Casa Existente', 'Sector Los Mangos, Costasur', null, 'active', 18.5386200, -68.3681200),
    ('DEMO-VILLA-004', 'villa', 'Villa Demo 4 — Casa Existente', 'Sector Las Palmas, Costasur', null, 'active', 18.5440300, -68.3702500),
    ('DEMO-VILLA-005', 'villa', 'Villa Demo 5 — Casa Existente', 'Sector El Golf, Costasur', null, 'active', 18.5369400, -68.3608400),
    ('DEMO-LOTE-006', 'terreno', 'Lote Demo 6 — Solar Vacío', 'Sector de expansión Norte, Costasur', null, 'active', 18.5472100, -68.3576200),
    ('DEMO-LOTE-007', 'terreno', 'Lote Demo 7 — Solar Vacío', 'Sector de expansión Norte, Costasur', null, 'active', 18.5484000, -68.3559800),
    ('DEMO-LOTE-008', 'terreno', 'Lote Demo 8 — Solar Vacío', 'Sector de expansión Este, Costasur', null, 'active', 18.5457600, -68.3534400),
    ('DEMO-LOTE-009', 'terreno', 'Lote Demo 9 — Solar Vacío', 'Sector de expansión Este, Costasur', null, 'active', 18.5439500, -68.3518900),
    ('DEMO-LOTE-010', 'terreno', 'Lote Demo 10 — Solar Vacío', 'Sector de expansión Sur, Costasur', null, 'active', 18.5338200, -68.3547200)
  on conflict (property_code) do update set
    property_type = excluded.property_type,
    name = excluded.name,
    address = excluded.address,
    owner_user_id = excluded.owner_user_id,
    status = excluded.status,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    updated_at = now();

  for villa_id in
    select id from public.properties where property_code in ('DEMO-VILLA-002','DEMO-VILLA-003','DEMO-VILLA-004','DEMO-VILLA-005')
  loop
    insert into public.projects (property_id, project_code, title, project_type, phase, cde_status, operational_status, progress_percent, created_by)
    select villa_id,
           'DEMO-HIST-' || right(p.property_code, 3),
           p.name || ' — Historial de construcción',
           'obra_nueva',
           'archivo',
           'archive',
           'finalizada',
           100,
           demo_admin
    from public.properties p
    where p.id = villa_id
    on conflict (project_code) do update set
      property_id = excluded.property_id,
      title = excluded.title,
      phase = excluded.phase,
      cde_status = excluded.cde_status,
      operational_status = excluded.operational_status,
      progress_percent = excluded.progress_percent,
      updated_at = now()
    returning id into historical_project_id;

    if historical_project_id is not null then
      if not exists (
        select 1 from public.workflow_events we
        where we.project_id = historical_project_id and we.event_type = 'historical_import'
      ) then
        insert into public.workflow_events (project_id, actor_id, actor_role, event_type, from_state, to_state, entity_type, entity_id, comment, metadata)
        values (historical_project_id, demo_admin, 'admin_general', 'historical_import', null, 'archivo', 'project', historical_project_id,
                'Historial de construcción existente cargado al activar el CDE.', jsonb_build_object('source', 'demo_day_one_inventory'));
      end if;
    end if;
  end loop;

  update public.projects
  set title = 'Villa Demo 1 — Expediente Integral', updated_at = now()
  where project_code = 'CDE-DEMO-001';
end $$;

commit;
