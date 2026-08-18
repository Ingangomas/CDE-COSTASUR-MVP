## Hallazgo AUD-001 — Rutas de Mensura y Seguridad sin restricción de rol

Durante la revisión estática de `src/components/RequireAuth.tsx` se detectó que `App.tsx` declaraba las rutas `/mensura` y `/seguridad`, pero `routeRoles` no contenía sus restricciones. Como consecuencia, cualquier usuario autenticado podía acceder a esas rutas porque `allowedRoles` quedaba vacío. Se corrigió agregando `mensura` y `seguridad` junto con `admin_general` a `routeRoles`. `npm run lint` y `npm run build` pasan después de la corrección.

Estado: corregido; pendiente de prueba con cuentas departamentales y regresión de rutas.

## Prueba AUD-002 — Aislamiento de ruta interna

Con sesión autenticada como `owner.demo@costasur.com`, se navegó directamente a `/mensura`. La aplicación mostró `Acceso pendiente de autorización` y no renderizó el dashboard ni datos del departamento. Resultado: PASS para la barrera de rol de Mensura; repetir equivalente con `/seguridad` y con roles departamentales cruzados.

## Prueba AUD-003 — Aislamiento de ruta de Seguridad

Con sesión autenticada como `owner.demo@costasur.com`, se navegó directamente a `/seguridad`. La aplicación mostró `Acceso pendiente de autorización` y no expuso el dashboard ni información del departamento. Resultado: PASS.

## Hallazgo AUD-004 — AdminMapaGeneral contenía datos y mapa simulados

La auditoría externa detectó que `AdminMapaGeneral.tsx` presentaba cifras fijas (24 obras activas, 18 licencias, 2 incidencias, 42 inspecciones), alertas hardcodeadas, porcentajes departamentales fijos, nombres ficticios y una imagen estática como mapa. Esto contradecía el requisito de datos persistentes y podía inducir a Costasur a interpretar datos de demostración como datos reales.

Se reemplazó la página por `AdminLiveMetrics`, `AdminLiveMapSummary` y `AdminLiveOperations`, todos basados en expedientes persistidos. Se mantuvo una sección GIS honesta que muestra coordenadas y estados reales, pero declara que la capa cartográfica externa queda pendiente de configurar. `npm run lint` y `npm run build` pasan.

Estado: corregido en workspace; requiere sincronización posterior a Drive/GitHub y prueba visual de regresión.

## Hallazgo AUD-005 — Vistas departamentales con contenido simulado

La auditoría detectó datos ficticios en `DashboardAnalytics.tsx`, `ControlDeObras.tsx`, `DepartmentDashboard.tsx`, `DepartmentProyectos.tsx` y `DepartmentProjectDetails.tsx`, incluyendo propietarios, fechas, solicitudes, imágenes, documentos, KPIs y botones sin persistencia.

Se sustituyeron por consultas a proyectos y membresías reales, solicitudes de `contractor_requests`, `ControlRequestsPanel`, documentos reales de `documents`/`document_versions`, `DocumentViewer` y `ReviewDecisionPanel`. El dashboard ahora muestra explícitamente cuando un departamento no tiene membresías activas, en lugar de inventar proyectos. Lint y build pasan después de cada bloque.

Estado: corregido en workspace; requiere prueba visual por rol y sincronización posterior a Drive/GitHub.

## Prueba AUD-006 — Bandeja de Arquitectura

Con `review.demo@costasur.com`, la bandeja `/revision-tecnica/proyectos` mostró únicamente expedientes reales asignados al usuario: `CDE-DEMO-001` y `DEMO-VILLA-001-PROY-934923`. Los filtros visibles son Carta pendiente, Anteproyecto y Planos técnicos; no aparecen las tarjetas mock eliminadas. Resultado: PASS para carga real y aislamiento por membresía.

## Hallazgo AUD-007 — TechnicalReview contenía mapa y sometimientos ficticios

La vista `TechnicalReview.tsx` mostraba una imagen de mapa, marcadores y tres expedientes hardcodeados. Se reemplazó por `DashboardAnalytics` dinámico para el rol `revision-tecnica`, que consulta membresías activas y proyectos persistidos. Lint y build pasan.

## Prueba AUD-008 — Búsqueda global de mocks

Tras las rectificaciones, una búsqueda global en `src/**/*.ts` y `src/**/*.tsx` no encontró coincidencias de los propietarios, proyectos, métricas, nombres de obras ni etiquetas hardcodeadas que habían sido detectadas en las vistas simuladas. Resultado: PASS para el conjunto auditado.

## Prueba AUD-009 — Exclusión financiera

La búsqueda global en `src/**/*.ts` y `src/**/*.tsx` no encontró referencias a `financial`, `finance`, `financiero`, `finanzas`, `balance`, `cashflow`, `presupuesto` ni `budget`. El CDE queda limitado a avance físico, expediente documental, workflow operativo, inspecciones, incidencias, licencias y auditoría.

## Prueba AUD-010 — Aislamiento de Administración

Con sesión autenticada como `review.demo@costasur.com`, se navegó directamente a `/admin`. La aplicación mostró `Acceso pendiente de autorización` y no expuso el dashboard administrativo. Resultado: PASS.

## Prueba AUD-011 — Departamento Legal

`legal.demo@costasur.com` autenticó correctamente. Dashboard y `/legal/proyectos` mostraron el expediente real `CDE-DEMO-001` y no las tarjetas ficticias anteriores. La lista está filtrada por membresías activas. Resultado: PASS.

## Prueba AUD-012 — Departamento Eléctrica

`electrica.demo@costasur.com` autenticó correctamente. El dashboard muestra únicamente el expediente real `CDE-DEMO-001`, con avance físico de 38% y métricas derivadas de proyectos persistidos. No aparecen datos mock. Resultado: PASS.

## Prueba AUD-013 — Departamento Hidrosanitaria

`hidrosanitaria.demo@costasur.com` autenticó correctamente. El dashboard muestra el expediente real `CDE-DEMO-001` y el avance físico persistido de 38%, sin contenido simulado. Resultado: PASS.

## Prueba AUD-014 — Departamento Paisajismo

`paisajismo.demo@costasur.com` autenticó correctamente. El dashboard muestra el expediente real `CDE-DEMO-001`, el avance físico de 38% y datos derivados de Supabase. Resultado: PASS.

## Prueba AUD-015 — Departamento Mensura

`mensura.demo@costasur.com` autenticó correctamente y entró a `/mensura`. El dashboard muestra un expediente real asignado y el avance físico persistido de 38%. El rol tiene un portal reducido, sin menú interno ficticio. Resultado: PASS.

## Prueba AUD-016 — Departamento Seguridad

`seguridad.demo@costasur.com` autenticó correctamente. El dashboard muestra el expediente real `CDE-DEMO-001`, avance físico 38% y operaciones derivadas de Supabase. Resultado: PASS.

## Prueba AUD-017 — Regresión owner.demo / autorización intermitente

Durante la primera entrada posterior a varios cambios de sesión, `owner.demo@costasur.com` mostró temporalmente `Acceso pendiente de autorización`, pese a que Supabase confirmó `profile_status=active`, rol `propietario` activo y membresías activas. El cliente Supabase del navegador sí pudo leer el perfil y rol. Una navegación completa posterior cargó correctamente `/propietario/mis-propiedades` y mostró el inventario histórico y expedientes reales. Resultado: PASS con hallazgo de robustez: la pantalla pendiente no debe mostrarse ante un fallo/transición transitoria de carga; requiere reintento o estado de error explícito.

## Prueba AUD-018 — Owner demo tras corrección de robustez

Se añadió reintento controlado a `SessionContext.refreshProfile` para evitar que errores/transiciones transitorias de lectura presenten falsamente autorización pendiente. Se cerró sesión, se inició nuevamente `owner.demo@costasur.com` y el portal cargó correctamente `/propietario/mis-propiedades`, mostrando el inventario histórico y expedientes reales. Resultado: PASS.

## Prueba AUD-019 — Inventario histórico georreferenciado

Supabase devuelve exactamente 10 propiedades activas: cinco villas existentes `DEMO-VILLA-001` a `DEMO-VILLA-005` y cinco terrenos vacíos `DEMO-LOTE-006` a `DEMO-LOTE-010`. Todas tienen coordenadas persistentes. Resultado: PASS.

## Prueba AUD-020 — Administrador General tras rectificación de dashboards

`admin.demo@costasur.com` autenticó correctamente. El dashboard muestra 8 expedientes persistidos, 2 obras activas, 2 en revisión, 0 críticas y 56% de avance físico promedio, sin balance financiero. La bandeja de operaciones muestra expedientes reales, incluyendo históricos archivados y expedientes de workflow. Resultado: PASS.

## Prueba AUD-021 — Mapa administrativo e inventario histórico

La auditoría detectó que el primer reemplazo del mapa mostraba solo expedientes y omitía lotes vacíos. Se corrigió `AdminLiveMapSummary` para cargar propiedades y proyectos por separado. La vista verificada muestra `10 propiedades · 8 expedientes`, cinco villas existentes, cinco lotes vacíos, coordenadas persistentes y expedientes vinculados. Resultado: PASS tras corrección.

## Prueba AUD-022 — Gobernanza administrativa

El Administrador General abrió `/admin/departamentos`. La vista muestra 12 usuarios, 12 activos, 0 pendientes y 0 accesos por aprobar. Se observan roles, departamentos y membresías reales para Contratista, Seguridad, Mensura, Paisajismo, Hidrosanitaria, Electricidad, Legal, Control de Obras, Revisión Técnica, Arquitecto, Propietario y Administrador. Resultado: PASS.

## Prueba AUD-023 — Centro de notificaciones

El Administrador abrió el centro de notificaciones y recibió eventos persistentes de solicitud de inspección programada, inicio de obra aprobado, incidencia de alta severidad y licencia emitida. Se muestran 2 pendientes de lectura y el listado se filtra por el usuario autenticado. Resultado: PASS.

## Prueba AUD-024 — Portal Contratista

El contratista autenticó correctamente y ve 2 expedientes asignados desde membresías reales. La obra en fase `anteproyecto` mantiene bloqueados inicio, inspección y bitácora. La obra en fase `obra_activa` habilita inspección y bitácora, mientras inicio permanece bloqueado. El formulario de bitácora presenta título, avance físico y descripción, sin campos financieros. Resultado: PASS.

## Prueba AUD-025 — Solicitud de inspección

El formulario del contratista expone únicamente tipo de inspección (técnica/topográfica), fecha solicitada y descripción. La acción se habilita en `obra_activa` y no contiene campos financieros. Resultado: PASS.

## Prueba AUD-026 — Dashboard Control de Obras

`control.demo@costasur.com` autenticó correctamente. El dashboard muestra 4 expedientes asignados desde membresías reales, 2 obras activas, 2 en revisión, 0 inspecciones pendientes y 13% de avance físico promedio. No contiene balance financiero ni datos inventados. Resultado: PASS.

## Hallazgo AUD-027 — Documento técnico duplicado

En el expediente Workflow Demo aparecen dos documentos con título `Plano Técnico Arquitectónico — Workflow Demo`: uno con categoría incorrecta `anteproyecto` y otro con categoría correcta `arquitectonico`. El componente `DocumentUpload` ya fue corregido para nuevas cargas, pero el artefacto de la primera prueba quedó persistido. Debe archivarse o eliminarse de forma controlada antes del cierre para que el expediente no presente ambigüedad al usuario.

## Corrección AUD-027 — Artefacto técnico archivado

Se aplicó la migración 030. El documento de la primera prueba aparece ahora como `prueba archivada` con categoría `anteproyecto` y estado `archive`; el único plano técnico vigente queda como categoría `arquitectonico` y estado `wip`. El historial no se eliminó. Resultado: PASS tras corrección.

## Hallazgo AUD-028 — Fase y estado incompatibles en CDE-DEMO-001

El expediente legado `CDE-DEMO-001` aparece con `operational_status = obra_activa` pero `phase = anteproyecto`. Esto contradice el workflow aprobado, porque una obra activa no debe permanecer en fase de anteproyecto. Se corregirá a `phase = obra_activa` conservando el avance físico del 38% y el historial documental.

## Corrección AUD-028 — Fase de proyecto demo alineada

La migración 031 se aplicó correctamente. `CDE-DEMO-001` ahora tiene `phase = obra_activa`, `operational_status = obra_activa` y `progress_percent = 38.00`. Resultado: PASS tras corrección.

## Prueba AUD-029 — Portal Arquitecto y planos técnicos

El Arquitecto autenticó correctamente y pudo seleccionar el expediente Workflow Demo. La pestaña `Planos técnicos` habilita categorías `Arquitectónico`, `Estructural`, `Eléctrico`, `Hidrosanitario` y `Climatización`. El documento activo aparece como categoría `arquitectonico`, con versión PDF disponible en el visor y anotaciones. Resultado: PASS.

## Prueba AUD-030 — Ausencia de métricas financieras

La búsqueda global del frontend no encontró referencias a `financial`, `finance`, `cashflow`, `budget`, `presupuesto`, `balance financiero`, `avance financiero` ni `flujo de caja` dentro de `src/`. El CDE queda limitado a avance físico, documentos, estados operativos, inspecciones y auditoría. Resultado: PASS.

