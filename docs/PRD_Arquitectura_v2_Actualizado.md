# Documento de Arquitectura y Requisitos del Producto (PRD) — Costasur CDE

**Versión:** 2.0 — Actualización del modelo de activo, workflow y MVP funcional  
**Fecha:** 18 de agosto de 2026  
**Autor:** Ing. Angomas  
**Estado:** Documento actualizado para presentación y evolución del MVP

> **Principio arquitectónico rector:** El activo —lote, solar, villa, vivienda o propiedad— es la entidad principal del CDE. Existe desde el día cero, conserva su identidad permanente y mantiene un historial versionado e inmutable. Los propietarios, arquitectos, contratistas, administradores y departamentos son actores temporales que pueden cambiar sin alterar la identidad del activo.

## 1. Visión general

Costasur CDE es el Entorno Común de Datos de Casa de Campo para centralizar, ordenar, revisar y conservar la información de propiedades, proyectos arquitectónicos, obras, remodelaciones, inspecciones y decisiones operativas de Costasur Dominicana. La plataforma sustituye el flujo fragmentado de correos, archivos dispersos y reprocesos por una fuente única de verdad, con autenticación, permisos por rol, documentos versionados, revisiones, aprobaciones, notificaciones y auditoría.

El CDE no debe entenderse como una simple bandeja de obras activas. Su propósito es mantener el **registro de vida de los activos de Costasur**. El sistema comienza con un inventario territorial inicial que contiene las propiedades conocidas, incluidas las villas existentes, lotes vacíos, solares disponibles, obras en curso y expedientes históricos. Una obra nueva o una remodelación no crea la propiedad: crea una nueva actividad o expediente vinculado a una propiedad que ya existe.

El activo permanece cuando cambia el propietario, termina una obra, se cancela un plano, se vende un lote, se sustituye un contratista o se reorganiza un departamento. Los cambios se registran como eventos, versiones, relaciones temporales y nuevos expedientes vinculados al mismo identificador permanente.

## 2. Objetivos del producto

El MVP debe permitir a Costasur demostrar un workflow completo y persistente, desde la autorización inicial del propietario hasta el control de una obra activa. La plataforma debe facilitar que cada actor encuentre únicamente la información que necesita, mantenga la trazabilidad de sus decisiones y trabaje sobre documentos que conserven su historial.

| Objetivo | Resultado esperado |
|---|---|
| Inventario permanente | Todas las propiedades conocidas existen desde la activación del CDE, aunque estén vacías o no tengan obra. |
| Fuente única de verdad | Documentos, revisiones, aprobaciones, inspecciones y eventos se concentran por activo y expediente. |
| Workflow controlado | Las etapas y condiciones de avance se aplican mediante gates reales, no solo mediante botones de interfaz. |
| Gobernanza | Los doce roles del MVP reciben acceso de acuerdo con su función, membresía y departamento. |
| Trazabilidad | Cada acción relevante registra usuario, fecha, rol, documento, versión, estado y comentario. |
| Persistencia | Los archivos reales se almacenan en Storage privado y permanecen disponibles según permisos. |
| Operación física | El contratista y Control de Obras pueden gestionar inicio, bitácora, solicitudes e inspecciones. |
| Evolución | La arquitectura permite incorporar mapas externos, Autodesk Viewer e IA sin rehacer el modelo principal. |

## 3. Alcance del MVP

El MVP incluye autenticación semirreal mediante Supabase Auth con cuentas demo controladas, perfiles activos, roles, membresías de proyecto y protección de rutas. Incluye PostgreSQL en Supabase, Row Level Security, Storage privado para documentos, carga y versionado de archivos, visor PDF en navegador con anotaciones persistentes por página y versión, visor DXF de solo lectura y adjuntos DWG autorizados sin edición BIM.

Incluye el inventario histórico demo de diez propiedades: cinco villas existentes y cinco lotes vacíos con coordenadas. Las villas con historial conocido pueden tener expedientes históricos archivados; los lotes vacíos existen como activos válidos sin que el sistema invente obras o proyectos que nunca ocurrieron.

Incluye el workflow real de carta de autorización, revisión de Arquitectura, anteproyecto, aprobación del anteproyecto, planos técnicos, autorización del contratista, solicitud de inicio de obra, operación de obra activa, bitácora física, inspecciones y auditoría. Incluye notificaciones y eventos persistentes de workflow.

No incluye en el MVP un sistema financiero de obras. El CDE no debe mostrar balance financiero, cashflow, presupuesto, avance financiero ni rentabilidad de proyectos. El avance que se registra es físico y operativo, derivado de la bitácora, inspecciones, estados e incidencias.

La IA solo se señaliza como capacidad futura de revisión asistida. No aprueba, rechaza ni interpreta normativas de forma funcional en este MVP. La cartografía externa de Google Maps o Mapbox queda preparada como integración posterior; las coordenadas y el inventario persistente sí forman parte del MVP.

## 4. Modelo de dominio: el activo como entidad principal

### 4.1 Definición del activo

Un activo es un lote, solar, villa, vivienda o propiedad identificable dentro de Casa de Campo. El activo tiene un identificador permanente, un código oficial o interno, una ubicación, un tipo, una metadata territorial y un historial. Es la raíz de la trazabilidad del CDE.

Un activo puede estar vacío, ocupado, vendido, reservado, en mantenimiento, en remodelación, asociado a una obra activa o archivado operativamente. Su estado puede cambiar, pero su identidad no se reemplaza por el cambio de estado.

### 4.2 Inmutabilidad de identidad

La inmutabilidad del activo significa que el registro principal no se elimina ni se sustituye porque cambie la realidad operativa. El código e identificador del activo deben mantenerse. Las correcciones de metadata se registran con fecha, usuario, valor anterior, valor nuevo y fuente de respaldo. La ubicación puede corregirse si se detecta un error, pero la modificación debe quedar versionada y auditada.

La inmutabilidad no significa que todos los atributos sean intocables. Significa que ningún cambio de propietario, obra, responsable, estado, documento o departamento puede destruir la continuidad histórica del activo. La plataforma conserva una representación actual y un historial de eventos anteriores.

### 4.3 Separación entre activo, expediente, proyecto y actores

| Concepto | Naturaleza | Regla |
|---|---|---|
| Activo | Entidad permanente | Existe desde el día cero y nunca se duplica por una nueva obra. |
| Expediente base | Contenedor histórico del activo | Puede existir aunque el activo esté vacío y sin actividad. |
| Proyecto o actividad | Proceso temporal | Se crea sobre un activo existente para una construcción, remodelación, ampliación, renovación o intervención. |
| Documento | Evidencia versionada | Pertenece a un expediente/proyecto y conserva sus versiones. |
| Membresía | Relación temporal | Vincula propietario, arquitecto, contratista o revisor al proyecto mientras corresponda. |
| Departamento | Actor institucional | Puede recibir, revisar o aprobar según su función y las reglas del workflow. |
| Evento | Registro inmutable | Explica qué ocurrió, cuándo, quién lo hizo y qué cambió. |

Los actores nunca deben convertirse en la identidad del expediente. El propietario puede transferir la titularidad; el arquitecto puede ser sustituido; el contratista puede terminar su relación; el administrador puede cambiar; y un departamento puede reasignar la revisión. El activo permanece como referencia principal.

### 4.4 Inventario desde el día cero

La activación del CDE debe comenzar con una carga inicial de inventario. Costasur debe incorporar lotes, solares, villas, viviendas y propiedades conocidas, junto con sus coordenadas aproximadas, códigos, sectores, estado, propietario o titular cuando corresponda y fuente del dato.

La carga inicial debe distinguir entre propiedades y proyectos históricos. Un lote vacío se crea como activo y puede tener un expediente base, pero no se debe fabricar un proyecto para simular actividad. Una villa con historial conocido puede recibir uno o varios expedientes históricos migrados, con estado archivado y evento de importación. Una obra en curso debe entrar como actividad o expediente activo enlazado al activo ya existente.

Los nuevos activos solo se crean cuando Costasur abre nuevos sectores o incorpora nuevos terrenos disponibles. La previsión operativa del modelo es de aproximadamente cuarenta lotes nuevos por año, sin que esto cambie el principio de que la entidad nace cuando existe físicamente o es oficialmente incorporada al inventario de Costasur.

### 4.5 Historial permanente

El historial de un activo debe conservar compras, ventas, transferencias, reservas, cambios de titularidad, planos sometidos, planos rechazados, proyectos cancelados, licencias, inspecciones, incidencias, paralizaciones, reinicios, obras finalizadas, remodelaciones y documentos asociados. Un documento supersedido puede dejar de ser la versión vigente, pero no se elimina del historial salvo que exista una política formal de retención y un registro de archivo controlado.

## 5. Arquitectura del software

El MVP es una Single Page Application construida con React y TypeScript. El enrutamiento se realiza del lado del cliente con React Router y las vistas están protegidas mediante autenticación, rol y permisos. El componente de layout conserva la plantilla visual original de Google AI Studio adaptada al estilo oficial de Costasur: navbar de grafito degradado, logo oficial, Sidebar dinámico, TopBar, paneles limpios, tokens semánticos, `glass-panel`, bordes sutiles y espaciado generoso.

La separación principal de la aplicación es la siguiente:

| Capa | Responsabilidad |
|---|---|
| Presentación | Layout, Sidebar, TopBar, dashboards, portales por rol, modales, formularios y visores. |
| Acceso a datos | Helpers TypeScript para propiedades, proyectos, membresías, documentos, revisiones, solicitudes, bitácora, notificaciones y auditoría. |
| Autenticación | Supabase Auth, SessionContext, perfil, roles activos, logout y reintentos controlados de carga. |
| Persistencia | PostgreSQL, RLS, Storage privado, versiones de documentos, anotaciones y eventos. |
| Workflow | RPCs y funciones SQL que validan actor, propiedad, etapa, documento requerido y transición permitida. |
| Integraciones futuras | Google Maps/Mapbox, Autodesk Platform Services e IA asistida, sin alterar la raíz de activos. |

## 6. Stack tecnológico real

| Área | Tecnología |
|---|---|
| Frontend | React 19, TypeScript y Vite 6. |
| Enrutamiento | React Router DOM 7. |
| Estilos | Tailwind CSS 4, tokens semánticos y clases de paneles existentes. |
| Iconografía | Material Symbols Outlined y Lucide React. |
| Estado | Hooks nativos de React y contextos especializados; no se requiere Redux para el MVP. |
| Base de datos | PostgreSQL administrado por Supabase. |
| Backend gestionado | Supabase Auth, PostgREST/RPC, RLS y funciones SQL. |
| Archivos | Supabase Storage privado, con rutas y permisos por proyecto. |
| PDF | `react-pdf` y `pdfjs-dist`, con anotaciones persistentes por versión y página. |
| CAD | `dxf-viewer` para DXF de solo lectura; DWG como adjunto autorizado. |
| Analítica visual | Recharts para métricas operativas, sin métricas financieras. |
| Animación | Motion para transiciones sobrias de interfaz. |
| Hosting previsto | Vercel conectado al repositorio GitHub, con build `npm run build` y salida `dist`. |

## 7. Roles y autorización

El MVP mantiene los doce roles definidos. Los cuatro roles externos principales no sustituyen a los departamentos internos: estos forman una segunda capa de autorización operativa.

| Rol | Ruta o área | Responsabilidad principal |
|---|---|---|
| Administrador General | `/admin` | Gobernanza transversal, inventario, expedientes, usuarios, departamentos, operaciones, incidencias y auditoría. |
| Propietario | `/propietario/mis-propiedades` | Ver únicamente sus activos, estados autorizados, documentos aprobados y acciones disponibles. |
| Arquitecto / Tramitador | `/arquitecto` | Someter carta, anteproyecto, planos técnicos y memoria según habilitación de etapa. |
| Contratista / Constructor | `/contratista` | Solicitar inicio, registrar bitácora, solicitar inspecciones y consultar documentos aprobados de obras asignadas. |
| Revisión Técnica | `/revision-tecnica` | Revisar autorización, anteproyecto y coordinación técnica según membresía y permisos. |
| Control de Obras | `/control-obras` | Validar inicio, gestionar obra activa, inspecciones, incidencias, reportes y cierre. |
| Legal | `/legal` | Validar titularidad, cartas, formularios, contratos y áreas anexas cuando corresponda. |
| Electricidad | `/electrica` | Revisar planos y documentos eléctricos. |
| Hidrosanitaria | `/hidrosanitaria` | Revisar planos hidrosanitarios. |
| Paisajismo | `/paisajismo` | Revisar paisajismo y jardinería. |
| Mensura | `/mensura` | Apoyar validaciones de ubicación, linderos, niveles y solicitudes topográficas. |
| Seguridad / Guardianes | `/seguridad` | Atender solicitudes y controles de seguridad asociados a obras. |

El acceso debe determinarse automáticamente por la sesión, roles activos, departamento y membresía. El usuario no selecciona manualmente “entrar como propietario” o “entrar como administrador”. Nadie debe ver información de otro usuario, propiedad o proyecto sin autorización. Las políticas de RLS son la protección principal; la interfaz solo refleja esas reglas.

### 7.1 Regla estricta del Propietario

El Propietario no tiene un dashboard general ni métricas globales. Al iniciar sesión debe ser dirigido directamente a **Mis Propiedades**, donde observa sus lotes, solares, villas o viviendas específicas. Desde allí puede abrir un expediente, autorizar un arquitecto o contratista cuando el gate lo permita, consultar estados generales, ver documentos autorizados y recibir notificaciones relevantes.

El Propietario no debe ver comentarios internos, revisiones entre departamentos, reportes confidenciales de inspección, incidencias internas, reuniones de contratistas, suspensiones operativas ni métricas globales de Costasur.

## 8. Workflow real del CDE

El workflow inicia siempre desde un activo existente. El Propietario selecciona una propiedad de su portafolio y crea una actividad o proyecto vinculado a ella. La función de creación valida que el activo pertenezca al usuario autenticado, no esté archivado, que exista un arquitecto activo autorizado y que se suministre la información mínima del expediente.

| Etapa | Actor principal | Condición de avance |
|---|---|---|
| Autorización inicial | Propietario, Arquitecto, Revisión Técnica/Legal | Carta de autorización cargada y revisada. |
| Anteproyecto | Arquitecto, Revisión Técnica/Arquitectura | El arquitecto está habilitado y somete documentos de anteproyecto. |
| Aprobación de anteproyecto | Revisión Técnica/Arquitectura | El anteproyecto se aprueba; se habilitan planos técnicos. |
| Planos técnicos | Arquitecto y departamentos técnicos | Se cargan categorías técnicas y se completan revisiones requeridas. |
| Autorización de contratista | Propietario | Solo después de la aprobación de planos técnicos. |
| Inicio de obra | Contratista y Control de Obras | El contratista autorizado somete el formulario; Control de Obras valida y decide. |
| Obra activa | Contratista y Control de Obras | Se autoriza el inicio y se habilita la operación física. |
| Bitácora e inspecciones | Contratista, Control de Obras y departamentos de apoyo | Se registran avances, solicitudes, visitas, incidencias y evidencias. |
| Cierre y archivo | Control de Obras y Administración | La actividad se finaliza conservando toda la historia. |

### 8.1 Gates implementados

La etapa inicial se crea como `autorizacion_inicial`, con estado CDE `wip` y estado operativo `en_revision`. Se crean membresías para el propietario y el arquitecto seleccionado; el arquitecto comienza pendiente.

La carta debe pertenecer al proyecto y tener categoría `autorizacion`. Revisión Técnica o un administrador autorizado puede aprobarla. Cuando se aprueba, la membresía del arquitecto pasa a activa y el proyecto avanza a `anteproyecto`.

El anteproyecto debe tener categoría `anteproyecto`. Una aprobación válida mueve el proyecto a `planos_tecnicos`. Los planos técnicos aceptan categorías como `arquitectonico`, `estructural`, `electrico`, `hidrosanitario`, `climatizacion` y `memoria_descriptiva`, según la disciplina y las reglas vigentes.

Cuando se aprueban los planos técnicos, el proyecto avanza a `inicio_obra` y queda operacionalmente aprobado para que el propietario pueda autorizar al contratista. La autorización del contratista solo la puede ejecutar el propietario del activo, y solo cuando la fase sea `inicio_obra`.

El contratista autorizado puede crear una solicitud de inicio de obra. La solicitud se valida contra su membresía activa y la fase del proyecto. Control de Obras revisa el formulario, la documentación y las aprobaciones previas. Si procede, autoriza el inicio y el proyecto pasa a `obra_activa`.

### 8.2 Operación de obra activa

Durante `obra_activa`, el contratista registra entradas de bitácora de progreso físico, notifica actividades relevantes, solicita inspecciones topográficas o técnicas y consulta los documentos aprobados que correspondan. Control de Obras programa visitas, registra reportes, gestiona incidencias, solicita apoyo de Seguridad, Mensura, Electricidad, Hidrosanitaria o Paisajismo y mantiene el historial de decisiones.

El avance del proyecto es físico y operativo. Puede sincronizarse desde la bitácora y no representa avance financiero. La aplicación no debe calcular ni exhibir dinero invertido, presupuesto ejecutado, cashflow o rentabilidad.

## 9. Estados y versionado

Los estados de información siguen una lógica compatible con CDE/ISO 19650, adaptada al alcance del MVP:

| Estado CDE | Uso |
|---|---|
| `wip` / Trabajo en progreso | Documento en preparación o corrección por su responsable. |
| `shared` / Compartido | Información sometida para coordinación y revisión autorizada. |
| `published` / Publicado | Documento aprobado y válido para uso oficial según permisos. |
| `archive` / Archivo | Información cerrada o histórica que debe conservarse. |

El proyecto utiliza fases como `autorizacion_inicial`, `anteproyecto`, `revision_tecnica`, `directorio`, `planos_tecnicos`, `inicio_obra`, `obra_activa`, `cierre` y `archivo`. Los estados operativos incluyen `en_revision`, `aprobado`, `pendiente_inspeccion`, `obra_autorizada`, `obra_activa`, `critica`, `paralizada`, `finalizada` y `archivada`.

Cada documento tiene un registro principal y una o varias versiones. La versión vigente es la última versión aprobada y válida, pero las versiones anteriores permanecen disponibles como historial conforme a los permisos. Las anotaciones se relacionan con la versión concreta y la página correspondiente; no deben perderse cuando se carga una nueva versión.

## 10. Documentos y visores

El CDE debe aceptar PDF, imágenes y documentos técnicos autorizados mediante Storage privado. El visor PDF se ejecuta dentro del navegador y permite anotaciones persistentes de comentario, resaltado, rectángulo, nota o marcador, con visibilidad interna, de miembros del proyecto o publicada.

El visor DXF es una capacidad de consulta de solo lectura. DWG puede conservarse como adjunto autorizado, sin edición ni promesa de interoperabilidad BIM. Autodesk Viewer queda definido como fase posterior para visualizar formatos compatibles, medir y comentar cuando Costasur decida habilitar APS; su futura incorporación no cambia la entidad principal ni el modelo histórico.

## 11. Notificaciones, auditoría y gobernanza

Cada transición relevante genera una notificación al siguiente actor o responsable. Los eventos de workflow registran tipo, actor, rol, estado anterior, estado nuevo, entidad afectada, documento asociado, comentario y metadata. La auditoría debe conservar quién creó, cargó, revisó, aprobó, rechazó, archivó o modificó una información.

La gobernanza debe manejar perfiles, roles, membresías temporales, departamentos y estados de usuario. Una membresía puede estar pendiente, activa o revocada. Revocar a un actor no elimina su contribución histórica. Un cambio de administrador tampoco rompe la trazabilidad.

## 12. Requisitos no funcionales

La aplicación debe ser responsiva, segura, auditable y coherente con la plantilla visual original. Debe evitar gradientes excesivos, neón, pantallas genéricas SaaS y duplicación innecesaria de componentes. Los estados visuales deben seguir la semántica definida: azul para obra activa, ámbar para revisión o inspección pendiente, rojo para crítica o paralización y verde para finalizada o aprobada.

Las lecturas y mutaciones deben aplicar RLS y validaciones server-side. Los botones de la interfaz no sustituyen las restricciones de base de datos. Las rutas deben estar protegidas para todos los roles definidos, incluidos Mensura y Seguridad. El cierre de sesión debe limpiar la sesión local y devolver al login.

## 13. Dashboards y métricas permitidas

Los dashboards deben mostrar información operacional útil para el rol. Se permiten conteos de expedientes, etapas, documentos, aprobaciones, solicitudes, inspecciones, incidencias, carga departamental y avance físico. El Propietario solo ve el resumen de sus propiedades y proyectos autorizados.

Está expresamente fuera de alcance cualquier tarjeta o gráfico de balance financiero, cashflow, presupuesto, costos, retorno, rentabilidad o avance financiero. Esta exclusión aplica a todas las vistas, incluyendo Administración, Propietario, Contratista y departamentos.

## 14. IA, mapas y evolución posterior

La interfaz puede mostrar una señal de “Revisión asistida por IA” en el portal de Arquitectura, pero en el MVP no realiza análisis normativo automático ni decisiones. Cualquier implementación futura debe producir recomendaciones identificadas como asistencia y exigir validación humana.

La capa de mapa puede utilizar Google Maps o Mapbox para mostrar Casa de Campo, rutas y ubicaciones generales. El MVP debe mantener coordenadas y propiedad como datos propios, de forma que la ausencia temporal de una API externa no elimine el inventario ni la trazabilidad.

## 15. Despliegue

El frontend se desplegará en Vercel conectado al repositorio privado de GitHub. La configuración esperada es Framework Vite, comando `npm run build`, directorio de salida `dist`, raíz `/` y variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Se requiere una regla SPA que redirija las rutas no estáticas a `index.html`.

Antes del despliegue se debe verificar que GitHub contenga el frontend completo, la carpeta `supabase/migrations` completa, documentación, assets públicos y las últimas correcciones de auditoría. No se deben publicar `.env`, `service_role`, `node_modules`, `dist` ni secretos.

## 16. Criterios de aceptación del MVP

El MVP se considera aceptable cuando un propietario puede seleccionar un activo existente, crear un expediente, cargar la carta, conseguir la revisión de Arquitectura, habilitar al arquitecto, completar anteproyecto y planos técnicos, autorizar al contratista y llevar el expediente a obra activa mediante Control de Obras.

También debe ser posible consultar el inventario histórico, conservar lotes vacíos sin obras inventadas, cargar documentos reales, ver PDF y anotar sus versiones, consultar DXF en modo lectura, registrar bitácora, solicitar inspecciones, generar notificaciones, consultar auditoría, cerrar sesión correctamente y bloquear rutas o datos no autorizados.

## 17. Glosario actualizado

| Término | Definición operativa |
|---|---|
| Activo | Lote, solar, villa, vivienda o propiedad que constituye la entidad principal y permanente del CDE. |
| Activo permanente | Activo cuya identidad y código sobreviven a cambios de propietario, obra, estado, departamento o responsable. |
| Historial del activo | Secuencia inmutable de eventos, documentos, titularidades, obras, decisiones e incidencias asociadas al activo. |
| Versionado | Conservación ordenada de versiones de metadata, documentos y decisiones, identificando cuál es la vigente. |
| Inamovible | Regla que impide borrar o reemplazar la identidad del activo para representar una nueva actividad. |
| Inventario de día cero | Carga inicial de propiedades conocidas antes de iniciar nuevos workflows, incluidas propiedades vacías e históricas. |
| Expediente base | Contenedor inicial ligado al activo; puede existir sin proyecto activo y sirve para conservar metadata e historial. |
| Proyecto o actividad | Proceso temporal de construcción, remodelación, ampliación, renovación o intervención sobre un activo existente. |
| Propietario | Usuario externo que tiene relación vigente con uno o más activos y puede iniciar o autorizar acciones según sus permisos. |
| Arquitecto / Tramitador | Profesional externo habilitado para someter información de diseño y planos en expedientes asignados. |
| Contratista / Constructor | Responsable externo de ejecutar la obra y gestionar solicitudes operativas cuando ha sido autorizado. |
| Membresía | Relación temporal entre una persona y un proyecto, con rol, estado, invitación y posible revocación. |
| Departamento | Unidad interna de Costasur que participa en una revisión, validación, inspección o decisión. |
| Gate | Condición obligatoria que debe cumplirse para avanzar una fase del workflow. |
| Carta de autorización | Documento por el cual el propietario autoriza al arquitecto a someter el proceso ante Costasur. |
| Anteproyecto | Paquete inicial de diseño sometido para revisión de Arquitectura antes de los planos técnicos. |
| Planos técnicos | Documentos disciplinares arquitectónicos, estructurales, eléctricos, hidrosanitarios, de climatización y memorias requeridas. |
| Inicio de obra | Etapa en la que el contratista autorizado somete la solicitud que debe validar Control de Obras. |
| Obra activa | Estado operacional posterior a la autorización de inicio, con bitácora e inspecciones habilitadas. |
| Bitácora | Registro cronológico del progreso físico, actividades, evidencias y observaciones de la obra. |
| Inspección | Solicitud, programación, realización y resultado de una visita técnica, topográfica u operativa. |
| CDE state | Estado de madurez documental: trabajo en progreso, compartido, publicado o archivo. |
| Versión vigente | Última versión aprobada y válida para el uso autorizado, sin eliminar versiones anteriores. |
| Anotación | Comentario o marca persistente vinculada a una versión y página concreta del documento. |
| Fuente única de verdad | Principio por el que el expediente autorizado del CDE es la referencia central del proceso. |
| Archivo | Estado de conservación histórica; no significa eliminación. |
| Avance físico | Porcentaje o estado de ejecución derivado de actividades y bitácora, sin relación con dinero. |
| Control de acceso | Reglas combinadas de autenticación, rol, departamento, membresía, activo, proyecto y tipo de documento. |

## 18. Referencias internas

[1] Documento original proporcionado para el proyecto: `PRD_Arquitectura.md`.  
[2] Definición oficial proporcionada para el proyecto: `Definicion Costasur CDE.md`.  
[3] Modelo operativo del inventario histórico: `cde-modelo-inventario-historico.md`.  
[4] Contratos TypeScript del MVP: `src/lib/cde-types.ts`.  
[5] Migración de inventario histórico: `supabase/migrations/024_demo_historical_inventory.sql`.  
[6] Migración de gates del workflow: `supabase/migrations/025_real_workflow_gates.sql`.  
[7] Repositorio del MVP: [CDE-COSTASUR-MVP](https://github.com/Ingangomas/CDE-COSTASUR-MVP).
