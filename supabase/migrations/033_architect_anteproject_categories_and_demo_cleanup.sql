-- Migración 033: categorías organizadas del anteproyecto y limpieza del demo duplicado
BEGIN;

-- Villa Demo 1 es el único expediente de prueba operativo de esta propiedad.
-- Los expedientes restantes conservan su historial, pero dejan de presentarse como Villa Demo 001.
UPDATE public.projects AS p
SET project_code = 'ARCH-EXP-' || upper(substr(replace(p.id::text, '-', ''), 1, 8)),
    title = 'Expediente archivado — referencia anterior',
    cde_status = 'archive',
    operational_status = 'archivada',
    updated_at = now()
WHERE p.property_id = (SELECT id FROM public.properties WHERE property_code = 'DEMO-VILLA-001' LIMIT 1)
  AND p.project_code <> 'CDE-DEMO-001';

UPDATE public.project_members AS pm
SET status = 'revoked', updated_at = now()
WHERE pm.project_id IN (
  SELECT p.id
  FROM public.projects AS p
  WHERE p.property_id = (SELECT id FROM public.properties WHERE property_code = 'DEMO-VILLA-001' LIMIT 1)
    AND p.project_code <> 'CDE-DEMO-001'
);

INSERT INTO public.workflow_events (project_id, event_type, actor_role, comment, created_at)
SELECT p.id,
       'demo_archived',
       'admin_general',
       'Expediente de prueba anterior archivado y retirado de los portales operativos. El único demo oficial es CDE-DEMO-001 — Villa Demo 1.',
       now()
FROM public.projects AS p
WHERE p.property_id = (SELECT id FROM public.properties WHERE property_code = 'DEMO-VILLA-001' LIMIT 1)
  AND p.project_code <> 'CDE-DEMO-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.workflow_events AS we
    WHERE we.project_id = p.id AND we.event_type = 'demo_archived'
  );

-- La aprobación del anteproyecto acepta cada documento del paquete arquitectónico formal.
CREATE OR REPLACE FUNCTION public.submit_workflow_review(
  p_project_id uuid,
  p_document_version_id uuid,
  p_workflow_stage text,
  p_decision text,
  p_comment text
)
RETURNS public.projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  caller_id uuid := (SELECT auth.uid());
  project_row public.projects;
  document_row public.documents;
  review_row public.reviews;
  reviewer_allowed boolean := false;
  new_phase text;
  new_status text;
BEGIN
  IF caller_id IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  IF p_decision NOT IN ('comentado','devuelto','aprobado','rechazado') THEN RAISE EXCEPTION 'Invalid workflow decision'; END IF;
  IF p_workflow_stage NOT IN ('autorizacion','anteproyecto','planos_tecnicos','legal','inicio_obra') THEN RAISE EXCEPTION 'Invalid workflow stage'; END IF;

  SELECT * INTO project_row FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF project_row.id IS NULL THEN RAISE EXCEPTION 'Project not found'; END IF;

  SELECT d.* INTO document_row
  FROM public.documents d
  JOIN public.document_versions dv ON dv.document_id = d.id
  WHERE dv.id = p_document_version_id AND d.project_id = p_project_id;
  IF document_row.id IS NULL THEN RAISE EXCEPTION 'Document version does not belong to project'; END IF;

  IF p_workflow_stage = 'autorizacion' AND document_row.category <> 'autorizacion' THEN RAISE EXCEPTION 'Authorization review requires an authorization document'; END IF;
  IF p_workflow_stage = 'anteproyecto' AND document_row.category NOT IN ('anteproyecto','planta_conjunto','planta_nivel','elevaciones','secciones','curvas_nivel','memoria_descriptiva','anexos') THEN RAISE EXCEPTION 'Anteproject review requires an anteproject package document'; END IF;
  IF p_workflow_stage = 'planos_tecnicos' AND document_row.category NOT IN ('arquitectonico','estructural','electrico','hidrosanitario','climatizacion','memoria_descriptiva') THEN RAISE EXCEPTION 'Technical review requires a technical plan document'; END IF;

  reviewer_allowed := public.is_admin();
  IF NOT reviewer_allowed THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.project_members pm
      JOIN public.user_roles ur ON ur.user_id = caller_id AND ur.is_active = true
      WHERE pm.project_id = p_project_id
        AND pm.user_id = caller_id
        AND pm.status = 'active'
        AND pm.membership_role = 'revisor'
        AND (
          (p_workflow_stage IN ('autorizacion','anteproyecto','planos_tecnicos') AND ur.role_key = 'revision_tecnica' AND ur.department_id = pm.department_id)
          OR (p_workflow_stage = 'legal' AND ur.role_key = 'legal' AND ur.department_id = pm.department_id)
        )
    ) INTO reviewer_allowed;
  END IF;
  IF NOT reviewer_allowed THEN RAISE EXCEPTION 'The current user is not authorized for this workflow review'; END IF;

  INSERT INTO public.reviews(project_id, document_version_id, department_id, reviewer_id, decision, comment, workflow_stage)
  SELECT p_project_id, p_document_version_id, d.id, caller_id, p_decision, NULLIF(TRIM(p_comment), ''), p_workflow_stage
  FROM public.departments d
  WHERE d.slug = CASE WHEN p_workflow_stage IN ('autorizacion','anteproyecto','planos_tecnicos') THEN 'arquitectura' WHEN p_workflow_stage = 'legal' THEN 'legal' ELSE 'control_obras' END
  RETURNING * INTO review_row;

  IF p_decision = 'aprobado' THEN
    IF p_workflow_stage = 'autorizacion' THEN
      new_phase := 'anteproyecto';
      new_status := 'en_revision';
      UPDATE public.project_members SET status = 'active', approved_by = caller_id, updated_at = now()
      WHERE project_id = p_project_id AND membership_role = 'arquitecto' AND status = 'pending';
    ELSIF p_workflow_stage = 'anteproyecto' THEN
      new_phase := 'planos_tecnicos';
      new_status := 'en_revision';
    ELSIF p_workflow_stage = 'planos_tecnicos' THEN
      new_phase := 'inicio_obra';
      new_status := 'aprobado';
    ELSE
      new_phase := project_row.phase;
      new_status := project_row.operational_status;
    END IF;
  ELSIF p_decision IN ('devuelto','rechazado') THEN
    new_phase := project_row.phase;
    new_status := 'en_revision';
  ELSE
    new_phase := project_row.phase;
    new_status := project_row.operational_status;
  END IF;

  UPDATE public.projects
  SET phase = new_phase,
      operational_status = new_status,
      cde_status = CASE WHEN p_decision = 'aprobado' THEN 'shared' ELSE cde_status END,
      updated_at = now()
  WHERE id = p_project_id
  RETURNING * INTO project_row;

  RETURN project_row;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_workflow_review(uuid, uuid, text, text, text) FROM public;
REVOKE ALL ON FUNCTION public.submit_workflow_review(uuid, uuid, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_workflow_review(uuid, uuid, text, text, text) TO authenticated;

COMMIT;
