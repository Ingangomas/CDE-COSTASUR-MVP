# Checkpoint de validación de workflow

## Expediente probado
- Proyecto: `DEMO-VILLA-001-PROY-934923`
- Propiedad: `Villa Demo 1 — Casa Existente`

## Transiciones verificadas
1. Propietario creó expediente con carta de autorización PDF real.
2. Arquitectura aprobó la carta.
3. Arquitecto cargó anteproyecto PDF versionado.
4. Arquitectura aprobó anteproyecto.
5. Arquitecto cargó plano técnico PDF; tras corregir DocumentUpload, quedó con categoría `arquitectonico`.
6. Arquitectura aprobó los planos técnicos.
7. Propietario autorizó a `contractor.demo@costasur.com`.
8. Contratista envió solicitud de inicio de obra.
9. Migración 028 asignó Control de Obras a los expedientes; la solicitud apareció en su bandeja.
10. Control de Obras aprobó la solicitud; el proyecto pasó a `obra_activa`.
11. Contratista registró bitácora con avance físico 12%.
12. Migración 029 sincronizó el avance de bitácora con `projects.progress_percent`; el portal mostró 12% tras recarga.
13. Contratista envió solicitud de inspección técnica para 2026-08-25.
14. Control de Obras programó la inspección; el detalle mostró `Programada 2026-08-25`.

## Brechas corregidas durante la prueba
- DocumentUpload conservaba la categoría `anteproyecto` al cambiar a la pestaña de planos técnicos; se sincronizó `defaultCategory` mediante `useEffect`.
- Control de Obras no veía proyectos con solicitudes porque solo consultaba membresías; migración 028 asigna miembros activos de `control_obras` y hace backfill.
- Bitácora se guardaba pero no actualizaba el avance del proyecto; migración 029 añadió trigger y backfill.

## Estado pendiente de validar
- Visor PDF y anotación persistente.
- Lectura directa de workflow_events/audit_events.
- Regresiones de acceso por rol y ausencia de avance financiero visible.

## Validación adicional
15. La migración 028 asignó Control de Obras a los expedientes y el proyecto `DEMO-VILLA-001-PROY-934923` apareció en su bandeja.
16. Control de Obras aprobó la solicitud y la lista mostró fase `obra activa`.
17. El contratista pudo registrar una bitácora; inicialmente el portal no reflejaba el 12% tras recarga.
18. Se aplicó migración 029; tras recarga el portal mostró `Avance físico 12%`.
19. El contratista pudo solicitar inspección técnica; Control de Obras la programó y el detalle mostró `Programada 2026-08-25`.
20. El visor PDF cargó la carta desde Storage, mostró la página 1/1 y permitió activar el modo anotación.
21. Se guardó la anotación `Comentario de prueba de Control de Obras sobre la carta de autorización.` y quedó visible en la versión PDF.
22. El grep del frontend no encontró referencias a `financial`, `financial_progress`, `balance`, `cashflow`, `financiero` ni `finanzas`.
23. `workflow_events` registró las transiciones del proyecto, incluyendo `aprobado -> obra_activa` y el cambio de avance físico.
