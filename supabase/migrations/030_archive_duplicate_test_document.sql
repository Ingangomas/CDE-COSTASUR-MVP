-- Archive the first failed technical-plan test upload without deleting its audit history.
UPDATE public.documents
SET cde_state = 'archive',
    title = 'Plano Técnico Arquitectónico — Workflow Demo (prueba archivada)'
WHERE id = 'ae77278b-5e79-4d0d-899b-dc9fab3f18c3'
  AND category = 'anteproyecto'
  AND cde_state = 'wip';
