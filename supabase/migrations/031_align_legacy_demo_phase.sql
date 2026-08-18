-- Align the legacy demo project with its active operational state.
UPDATE public.projects
SET phase = 'obra_activa'
WHERE project_code = 'CDE-DEMO-001'
  AND operational_status = 'obra_activa'
  AND phase = 'anteproyecto';
