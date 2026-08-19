-- Migración 032: Corregir el workflow de demostración de la Villa Demo 1
-- Objetivo: Un solo proyecto activo por propiedad, estado inicial coherente, documentos asociados por etapa

BEGIN;

-- 1. Archivar proyectos duplicados de prueba que no son el expediente principal
UPDATE projects 
SET cde_status = 'archive', 
    operational_status = 'archivada',
    updated_at = now()
WHERE property_id = (SELECT id FROM properties WHERE property_code = 'DEMO-VILLA-001' LIMIT 1)
  AND project_code IN (
    'DEMO-VILLA-001-PROY-474905',
    'DEMO-VILLA-001-PROY-277168',
    'DEMO-VILLA-001-PROY-385081'
  );

-- 2. Resetear el proyecto principal CDE-DEMO-001 a estado inicial coherente
UPDATE projects 
SET phase = 'autorizacion_inicial',
    cde_status = 'wip',
    operational_status = 'en_revision',
    progress_percent = 0,
    updated_at = now()
WHERE project_code = 'CDE-DEMO-001';

-- 3. Limpiar documentos duplicados y mantener solo la carta de autorización inicial
DELETE FROM document_versions 
WHERE document_id IN (
  SELECT id FROM documents 
  WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1)
    AND category != 'autorizacion'
);

DELETE FROM documents 
WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1)
  AND category != 'autorizacion';

-- 4. Asegurar que la carta de autorización existe y está en estado correcto
UPDATE documents 
SET cde_state = 'wip',
    visible_to_owner = true,
    updated_at = now()
WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1)
  AND category = 'autorizacion';

-- 5. Limpiar bitácora y solicitudes del contratista para reiniciar el flujo
DELETE FROM logbook_entries 
WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1);

DELETE FROM contractor_requests 
WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1);

-- 6. Asegurar que el arquitecto está pendiente hasta que se apruebe la carta
UPDATE project_members 
SET status = 'pending',
    updated_at = now()
WHERE project_id = (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1)
  AND membership_role = 'arquitecto';

-- 7. Registrar evento de corrección del workflow
INSERT INTO workflow_events (project_id, event_type, actor_role, comment, created_at)
VALUES (
  (SELECT id FROM projects WHERE project_code = 'CDE-DEMO-001' LIMIT 1),
  'workflow_reset',
  'admin_general',
  'Workflow de demostración reiniciado: estado inicial 0%, carta pendiente de aprobación, arquitecto pendiente de activación.',
  now()
);

COMMIT;
