# Definición funcional oficial del CDE Costasur — Versión actualizada

**Versión:** 2.0  
**Fecha:** 18 de agosto de 2026  
**Autor:** Ing. Angomas  
**Estado:** Definición funcional para el MVP y su evolución posterior

> **Regla fundacional:** El CDE comienza con el inventario de activos de Casa de Campo, no con la primera obra. Cada lote, solar, villa, vivienda o propiedad existe desde el día cero, mantiene una identidad permanente e inamovible y conserva su historial versionado. Los usuarios y departamentos son participantes temporales del historial del activo.

## 1. Contexto institucional

Casa de Campo es un complejo turístico y residencial de lujo ubicado en República Dominicana, con villas, viviendas, terrenos, campos de golf, instalaciones hoteleras, áreas deportivas, espacios naturales, vías, servicios y otras infraestructuras. Costasur Dominicana planifica, desarrolla y administra la infraestructura y los servicios públicos dentro del complejo.

La operación de Costasur involucra áreas de ingeniería, Arquitectura y Diseño, Revisión Técnica, Control de Obras, Legal, Electricidad, Hidrosanitaria, Paisajismo, Mensura, Seguridad y Guardianes, además de propietarios, arquitectos, contratistas y otros responsables externos.

El crecimiento de las construcciones, remodelaciones y renovaciones produjo un volumen de información difícil de controlar mediante correos electrónicos, archivos independientes y procesos manuales. El problema no es únicamente la cantidad de obras: es la falta de una línea histórica única por propiedad, la dispersión documental, la duplicación de revisiones, la ausencia de estados visibles y la dificultad para saber quién debe actuar a continuación.

## 2. Problema que resuelve el CDE

Cuando un propietario desea construir o remodelar, actualmente debe enviar una carta al Departamento de Arquitectura autorizando a un arquitecto o profesional a someter el proyecto. La titularidad puede requerir verificación Legal. Después se revisa el anteproyecto, se solicitan correcciones, se intercambian versiones y se espera la aprobación correspondiente. Una vez aprobado el anteproyecto, se presentan planos técnicos y disciplinas complementarias. Finalmente, el contratista somete el formulario de inicio de obra y Control de Obras verifica las aprobaciones antes de autorizar la ejecución.

Durante la obra se solicitan visitas topográficas y técnicas, se notifican vaciados, se cargan reportes y fotografías, se generan incidencias y se coordinan intervenciones de Seguridad, Mensura, Electricidad, Hidrosanitaria o Paisajismo. La dispersión de estos datos produce retrasos, información perdida, reprocesos y poca trazabilidad.

El CDE resuelve este problema mediante un entorno digital único, controlado y auditable en el que cada actividad se vincula al activo correcto, los documentos se versionan, las revisiones tienen etapa, los responsables reciben notificaciones y las decisiones quedan registradas.

## 3. Qué es Costasur CDE

Costasur CDE es el Common Data Environment o Entorno Común de Datos de Costasur Dominicana. Es la plataforma donde se conserva la metadata de los activos, el historial de propiedad y obra, los expedientes, los documentos, las revisiones, las aprobaciones, las licencias, las inspecciones, la bitácora, las incidencias y los eventos de auditoría.

El CDE está inspirado en los principios de gestión de información de ISO 19650 y BuildingSMART, pero el MVP no pretende ser un sistema BIM completo. Su valor principal es ordenar la información y el workflow real de Costasur, con una arquitectura que pueda crecer hacia integraciones cartográficas, visor Autodesk e inteligencia artificial sin perder la continuidad del activo.

## 4. El activo como entidad principal del CDE

### 4.1 Definición del activo

El activo es el lote, solar, villa, vivienda o propiedad identificable dentro de Casa de Campo. Es la entidad territorial y jurídica alrededor de la cual se organiza todo el CDE. Tiene un código permanente, tipo, ubicación, sector, metadata, estado actual y línea histórica.

El activo existe aunque esté vacío, no tenga propietario cargado, nunca haya tenido planos, no tenga obra activa o no cuente todavía con documentos digitalizados. Su existencia no depende de que un usuario abra un proyecto.

### 4.2 Permanencia e inmutabilidad

El activo es permanente e inamovible en el sentido de que su identidad no se elimina ni se sustituye cuando ocurre una nueva actividad. El propietario puede cambiar, el arquitecto puede ser reemplazado, el contratista puede finalizar su participación, el Administrador General puede cambiar y los departamentos pueden reasignar responsables. Ningún cambio de actor crea un activo nuevo.

La metadata actual puede corregirse, pero las modificaciones deben conservar el valor anterior, el valor nuevo, la fecha, el usuario responsable, la fuente y el motivo. La propiedad no se borra porque se venda, quede vacía, se cancele un plano, termine una obra o se archive un expediente.

> **Diferencia esencial:** el activo es permanente; el proyecto, la obra, el propietario, la membresía y el responsable son elementos temporales vinculados al activo.

### 4.3 Inventario desde el día cero

La primera activación del CDE debe cargar el inventario conocido de Costasur antes de iniciar nuevos expedientes. Esto incluye villas existentes, viviendas, lotes vacíos, solares disponibles, obras en curso y proyectos históricos. Los lotes sin obra deben aparecer como activos válidos, con estado vacío o sin actividad registrada, sin fabricar proyectos artificiales.

Las villas o propiedades con historia conocida pueden recibir expedientes históricos archivados. Un expediente migrado debe registrar su origen y conservar la información disponible. Si un proyecto fue sometido y no fue ejecutado, esa decisión sigue formando parte del historial del activo. Si una obra está en curso cuando se activa el CDE, debe entrar como expediente activo ligado a ese mismo activo.

Solo se crearán nuevas entidades de activo cuando Costasur abra nuevos sectores, incorpore nuevos terrenos o coloque nuevos lotes a disposición del mercado. La operación prevista de aproximadamente cuarenta lotes nuevos por año puede gestionarse como una ampliación controlada del inventario, no como generación de proyectos ficticios.

### 4.4 Historial de titularidad y actividades

El historial del activo debe conservar las compras, ventas, transferencias, reservas, cambios de titularidad, contratos, áreas anexas, sometimientos, revisiones, aprobaciones, rechazos, cancelaciones, licencias, inspecciones, incidencias, paralizaciones, reinicios, finalizaciones, mantenimientos y remodelaciones.

Cada evento debe indicar qué ocurrió, quién lo registró, cuándo ocurrió, cuál era el estado anterior, cuál es el estado nuevo, qué documento lo respalda y qué observación se añadió. La vista actual puede mostrar el estado vigente, pero nunca debe destruir la secuencia de hechos anteriores.

## 5. Estructura de información

| Entidad | Función dentro del CDE |
|---|---|
| Activo | Raíz permanente de la información territorial, jurídica, documental y operativa. |
| Expediente base | Contenedor inicial de metadata e historial del activo, aun sin obra. |
| Proyecto o actividad | Proceso específico de construcción, remodelación, ampliación, renovación o intervención. |
| Documento | Archivo o registro de información asociado a un proyecto y sus versiones. |
| Versión | Estado concreto de un documento, con archivo, autor, fecha y estado CDE. |
| Revisión | Decisión, comentario o devolución de un revisor autorizado sobre una versión. |
| Membresía | Relación temporal de una persona con un proyecto. |
| Solicitud | Petición operativa de inicio, inspección u otra acción autorizada. |
| Bitácora | Registro cronológico del avance físico y de las actividades de obra. |
| Inspección | Solicitud, programación, realización y resultado de una visita. |
| Incidencia | Situación observada que requiere atención, seguimiento o cierre. |
| Evento de workflow | Registro de una transición o acción relevante. |
| Evento de auditoría | Registro de responsabilidad, acceso o modificación de información. |

## 6. Workflow funcional completo

El workflow comienza cuando un Propietario autenticado selecciona un activo que ya existe y crea un proyecto o actividad sobre él. El CDE valida que el usuario sea titular o tenga autorización vigente, que el activo no esté archivado y que se seleccione un arquitecto activo de Costasur.

### 6.1 Autorización inicial

El Propietario crea el expediente sobre el activo y proporciona el código del proyecto, el título, el tipo de intervención y el correo del arquitecto. El proyecto se crea en fase `autorizacion_inicial`, estado CDE `wip` y estado operativo `en_revision`.

El Propietario queda como miembro activo y el Arquitecto como miembro pendiente. La carta de autorización se carga como documento de categoría `autorizacion`. La revisión debe verificar que el propietario está habilitado para autorizar a ese profesional.

### 6.2 Revisión de la autorización

Revisión Técnica, Arquitectura o un Administrador General autorizado revisa la carta. Puede comentar, devolver, rechazar o aprobar. La aprobación activa la membresía del Arquitecto y mueve el expediente a la fase `anteproyecto`. La devolución conserva el expediente en revisión y notifica qué debe corregirse.

Legal puede intervenir cuando la validación de titularidad, contrato, transferencia o área anexa sea necesaria. La participación de Legal debe conservarse como revisión independiente, sin duplicar el activo ni el expediente.

### 6.3 Anteproyecto

Una vez habilitado, el Arquitecto somete la información del anteproyecto: ubicación, linderos, curvas de nivel cuando correspondan, plantas, elevaciones, secciones, renders, imágenes, memoria descriptiva y demás documentos exigidos por Costasur.

El paquete se carga como trabajo en progreso y, al someterse, pasa a compartido para revisión. Arquitectura o Revisión Técnica puede visualizar el PDF, comentar, resaltar, marcar, devolver o aprobar. La decisión se registra en la versión concreta del documento.

### 6.4 Aprobación del anteproyecto

Cuando el anteproyecto es aprobado, el proyecto pasa a la fase `planos_tecnicos`. La aprobación no elimina los comentarios anteriores ni las versiones corregidas. El sistema conserva la decisión, el revisor, el departamento, el documento, la versión y la fecha.

Si el anteproyecto es devuelto o rechazado, el expediente permanece en revisión y el Arquitecto puede crear una nueva versión sin borrar la anterior. La IA puede aparecer como capacidad futura de apoyo, pero no emite la decisión.

### 6.5 Planos técnicos y disciplinas

En la fase de planos técnicos se someten las disciplinas requeridas: arquitectura, estructura, electricidad, hidrosanitaria, climatización, paisajismo, jardinería, memoria descriptiva y cualquier otra categoría que Costasur establezca.

Cada departamento recibe la información correspondiente a su función. Electricidad revisa planos eléctricos; Hidrosanitaria revisa planos hidrosanitarios; Paisajismo revisa paisajismo y jardinería; Mensura apoya linderos, niveles y ubicación; Seguridad participa cuando una solicitud operativa lo exige; Arquitectura y Revisión Técnica coordinan el paquete general.

La aprobación de los planos técnicos mueve el proyecto a `inicio_obra` y a estado operativo `aprobado`. La versión publicada se convierte en referencia válida para la autorización del contratista y el control posterior.

### 6.6 Autorización del contratista

Solo el Propietario del activo puede autorizar al Contratista. Esta acción queda bloqueada hasta que los planos técnicos estén aprobados y el proyecto se encuentre en fase `inicio_obra`.

El Contratista debe ser un usuario activo con rol de Contratista en Costasur. La autorización crea o activa una membresía temporal sobre ese proyecto. Un mismo contratista puede participar en varios proyectos, pero cada relación debe registrarse por separado y no debe mezclar expedientes.

### 6.7 Solicitud de inicio de obra

El Contratista autorizado somete el formulario de inicio de obra. El CDE verifica su membresía, el proyecto, la fase y los documentos requeridos. La solicitud queda persistente con solicitante, fecha solicitada, descripción y estado.

Control de Obras revisa que exista la autorización del propietario, que los planos estén aprobados, que las verificaciones necesarias estén completas y que el formulario contenga la información solicitada. Si faltan datos, el expediente permanece en revisión y el sistema notifica la corrección requerida.

### 6.8 Obra activa

Cuando Control de Obras autoriza el inicio, el proyecto pasa a `obra_activa`. El Contratista puede consultar los planos publicados que le correspondan, registrar entradas de bitácora, notificar vaciados, solicitar visitas topográficas o técnicas y solicitar apoyo de departamentos.

Control de Obras puede programar inspecciones, subir fotografías, emitir reportes, registrar observaciones, generar incidencias, suspender o reactivar una obra conforme a sus permisos y mantener la comunicación operativa dentro del expediente.

### 6.9 Bitácora, inspecciones e incidencias

La bitácora registra el avance físico, actividades ejecutadas, fecha, responsable, descripción y evidencias. El porcentaje de avance físico puede sincronizarse desde estas entradas. No se registra ni calcula avance financiero.

Las inspecciones tienen estados como solicitada, programada, realizada, observada y aprobada. Las incidencias pueden estar abiertas, en análisis, críticas, resueltas o cerradas. Cada acción debe tener responsable, fecha, evidencia y relación con el activo y proyecto.

### 6.10 Cierre y archivo

Al finalizar la actividad, Control de Obras y Administración pueden mover el proyecto a cierre o archivo. El activo no se archiva por el simple hecho de que el proyecto termine. La propiedad permanece en el inventario y puede recibir nuevas remodelaciones, ampliaciones o actividades futuras.

El archivo conserva planos aprobados, licencias, informes, fotografías, inspecciones, incidencias, decisiones, comunicaciones y versiones. Archivar significa conservar y retirar de la operación activa; no significa borrar.

## 7. Estados del CDE

### 7.1 Estados de información

| Estado | Significado |
|---|---|
| Trabajo en progreso (`wip`) | Información en preparación o corrección por el responsable. |
| Compartido (`shared`) | Información sometida para coordinación o revisión autorizada. |
| Publicado (`published`) | Información aprobada y válida para el uso permitido. |
| Archivo (`archive`) | Información cerrada, histórica o supersedida que debe conservarse. |

### 7.2 Fases del proyecto

Las fases operativas son `autorizacion_inicial`, `anteproyecto`, `revision_tecnica`, `directorio`, `planos_tecnicos`, `inicio_obra`, `obra_activa`, `cierre` y `archivo`.

### 7.3 Estados operativos

Los estados operativos son `en_revision`, `aprobado`, `pendiente_inspeccion`, `obra_autorizada`, `obra_activa`, `critica`, `paralizada`, `finalizada` y `archivada`. Estos estados expresan la situación del proceso, no la propiedad del activo.

## 8. Roles y permisos

### 8.1 Propietario

El Propietario consulta directamente **Mis Propiedades**. No tiene dashboard global. Puede ver activos asociados, avance físico, estados generales, documentos autorizados y próximas acciones. Puede crear un expediente sobre una propiedad propia, autorizar arquitectos y autorizar contratistas después de la aprobación de planos técnicos.

No debe ver comentarios internos, decisiones departamentales confidenciales, fotografías internas, suspensiones, reuniones entre contratistas y Control de Obras, incidencias internas ni información de otros propietarios.

### 8.2 Arquitecto o Tramitador

Puede trabajar en varios proyectos simultáneos, pero cada proyecto permanece separado. Puede cargar carta cuando corresponda, anteproyecto, planos técnicos, memoria y correcciones. Solo puede actuar en expedientes donde tenga membresía activa y en las fases habilitadas.

### 8.3 Contratista o Constructor

Puede participar en varios proyectos con membresías independientes. Puede someter inicio de obra cuando está autorizado, consultar documentos publicados, registrar bitácora y solicitar inspecciones. No puede modificar aprobaciones internas ni consultar decisiones que no correspondan a su función.

### 8.4 Departamentos internos

| Departamento | Función |
|---|---|
| Revisión Técnica / Arquitectura | Coordinar la revisión de autorización, anteproyecto y planos técnicos. |
| Legal | Validar titularidad, cartas, formularios, contratos, transferencias y áreas anexas. |
| Control de Obras | Validar inicio, autorizar obra, controlar inspecciones, incidencias, reportes y cierre. |
| Electricidad | Revisar planos y documentos eléctricos. |
| Hidrosanitaria | Revisar planos hidrosanitarios. |
| Paisajismo | Revisar paisajismo y jardinería. |
| Mensura | Apoyar ubicación, linderos, niveles y visitas topográficas. |
| Seguridad / Guardianes | Atender solicitudes y controles operativos de seguridad. |
| Administración General | Supervisar transversalmente el inventario, workflow, usuarios, departamentos, documentos, incidencias y auditoría. |

## 9. Trazabilidad y gobernanza

Cada acción relevante debe conservar fecha, usuario, rol, departamento, activo, proyecto, documento, versión, decisión, comentario, estado anterior y estado nuevo. Las transiciones generan workflow events, notificaciones y audit events.

La pertenencia a un proyecto se gestiona como membresía temporal con estados pendiente, activa o revocada. La revocación elimina la autorización futura, no el historial. La sustitución de un usuario o departamento debe dejar visible quién participó antes y quién participa ahora.

La consulta se controla en PostgreSQL mediante RLS y funciones seguras. Ninguna vista de interfaz puede otorgar acceso que la base de datos no permita. El mapa debe aplicar las mismas reglas del expediente y no debe exponer coordenadas o metadata a usuarios sin autorización.

## 10. Dashboards y límites de información

Los dashboards convierten datos persistentes en información operacional: expedientes por fase, documentos pendientes, revisiones, aprobaciones, inspecciones, incidencias, obras activas, carga departamental y avance físico.

El Administrador General puede ver métricas globales. Los departamentos ven su carga de trabajo. Arquitectos y contratistas ven sus proyectos. El Propietario solo ve sus propiedades y acciones pendientes.

> **Exclusión obligatoria:** El CDE no gestiona balance financiero de obras. No debe incluir cashflow, presupuesto, costos, rentabilidad, inversión ni avance financiero en ninguna vista o dashboard. La métrica de avance del CDE es física y operativa.

## 11. Documentos y visualización

Los documentos reales se cargan a Storage privado, se vinculan a un proyecto y se versionan. La plataforma debe permitir visualizar PDF en el navegador y conservar anotaciones asociadas a cada versión y página.

El visor PDF permite comentarios, resaltados, rectángulos, notas y marcadores según permisos. El visor CAD del MVP es solo lectura para DXF. Los DWG pueden conservarse como adjuntos autorizados. Autodesk Viewer se considera una integración posterior de visualización, medida y comentarios; no se incluye BIM, edición de modelos ni interpretación IFC en este MVP.

## 12. IA futura

El portal de Arquitectura puede mostrar una indicación de “Revisión asistida por IA”. Durante el MVP esta indicación es conceptual y no debe presentarse como una revisión real. La futura IA podrá identificar documentos faltantes, comparar versiones, resumir observaciones o alertar posibles inconsistencias, pero nunca sustituirá la aprobación humana de Costasur.

## 13. Interfaz y experiencia de usuario

La interfaz conserva la plantilla original de Google AI Studio y la adapta a la identidad visual de Costasur. Debe usar el navbar oficial con degradado grafito, logo de Costasur y los módulos definidos para el CDE: Normativas, Formularios, Carta de Inicio y Contactos.

El Layout, Sidebar, TopBar, paneles `glass-panel`, tokens semánticos, Material Symbols Outlined, bordes sutiles y espaciado generoso deben mantenerse coherentes. Los estados usan azul para obra activa, ámbar para revisión o inspección pendiente, rojo para crítica o paralización y verde para finalizada o aprobada.

El login es único y neutral. El usuario no elige su rol en pantalla. Supabase Auth identifica la sesión y el sistema dirige automáticamente a la ruta permitida. El Propietario entra directamente a Mis Propiedades.

## 14. Stack e infraestructura del MVP

El frontend utiliza React 19, TypeScript, Vite 6, React Router DOM 7, Tailwind CSS 4, Material Symbols Outlined, Lucide React, Motion y Recharts. Supabase proporciona PostgreSQL, Auth, Storage privado, RLS, funciones SQL, notificaciones y eventos de auditoría. `react-pdf` y `pdfjs-dist` soportan el visor PDF; `dxf-viewer` soporta DXF de solo lectura.

El frontend se desplegará en Vercel con Vite, `npm run build`, salida `dist`, raíz `/`, variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, y fallback SPA hacia `index.html`. Google Maps o Mapbox se conectarán posteriormente para la cartografía general de Casa de Campo. La aplicación conserva las coordenadas aunque la API cartográfica todavía no esté configurada.

## 15. Inventario demo de referencia

El MVP utiliza un inventario histórico de diez activos: cinco villas existentes y cinco lotes vacíos con coordenadas generales. Las villas pueden tener expedientes históricos archivados; los lotes vacíos son visibles como activos sin obra inventada. La propiedad demo principal sostiene el workflow integral de presentación.

Este inventario no representa una carga catastral definitiva. Para la activación real Costasur deberá aportar códigos oficiales, coordenadas o archivos geográficos, sectores, relación de titulares, historial de ventas, expedientes, documentos y criterios de conservación de información incompleta.

## 16. Reglas de continuidad

La regla más importante del CDE es que ninguna actividad puede romper la continuidad del activo. Si cambia el propietario, se registra una transferencia. Si cambia el arquitecto, se revoca una membresía y se crea o activa otra. Si cambia el contratista, la obra conserva sus documentos y se registra el nuevo responsable. Si se finaliza una obra, el activo sigue disponible para futuras actividades.

El activo es la memoria permanente de Casa de Campo; los proyectos son capítulos; los documentos son evidencias versionadas; los usuarios y departamentos son participantes temporales; y los eventos de auditoría explican la evolución completa.

## 17. Glosario oficial actualizado

| Término | Definición |
|---|---|
| Activo | Lote, solar, villa, vivienda o propiedad que constituye la entidad raíz del CDE. |
| Propiedad | Referencia general al activo inmobiliario; internamente debe conservarse la distinción entre terreno, villa, vivienda y proyecto. |
| Terreno / Lote / Solar | Unidad física de suelo que existe como activo aunque esté vacía o no tenga obra. |
| Villa / Vivienda | Edificación construida vinculada a un terreno y tratada como parte identificable del inventario de activos. |
| Activo permanente | Activo cuya identidad permanece a través de cambios de propietarios, obras, estados y responsables. |
| Inamovible | Que no se elimina ni se sustituye para representar nuevas actividades o cambios temporales. |
| Inventario desde el día cero | Conjunto inicial de activos, proyectos históricos y obras en curso cargados al activar el CDE. |
| Expediente base | Registro inicial del activo que conserva metadata, aun cuando no exista proyecto activo. |
| Historial | Secuencia de eventos, titularidades, documentos, revisiones, obras e incidencias asociadas al activo. |
| Proyecto | Actividad temporal de construcción, remodelación, ampliación, renovación o intervención sobre un activo existente. |
| Actividad | Nombre amplio para cualquier proceso nuevo que genere cambios o documentos sobre un activo. |
| Propietario | Usuario externo con relación vigente sobre uno o varios activos. |
| Arquitecto / Tramitador | Profesional autorizado para someter y corregir información de diseño. |
| Contratista / Constructor | Responsable autorizado de ejecutar una obra y gestionar acciones operativas. |
| Membresía | Relación temporal entre usuario y proyecto, con rol y estado. |
| Rol | Categoría de autorización del usuario dentro del CDE. |
| Departamento | Unidad interna que revisa, valida o actúa sobre información según su competencia. |
| Gate | Regla que debe cumplirse para habilitar la siguiente fase. |
| Carta de autorización | Documento firmado o presentado por el propietario para autorizar al arquitecto. |
| Anteproyecto | Primera propuesta de diseño sometida a Arquitectura. |
| Planos técnicos | Planos disciplinares requeridos para completar el proyecto ejecutivo. |
| Inicio de obra | Solicitud y etapa previa a la autorización de ejecución. |
| Obra activa | Estado en el que la ejecución está autorizada y se habilitan bitácora e inspecciones. |
| Bitácora | Registro cronológico del progreso físico de la obra. |
| Inspección | Solicitud y resultado de una visita técnica, topográfica u operativa. |
| Incidencia | Situación observada que requiere atención, resolución o cierre. |
| Documento | Archivo o registro digital asociado a un proyecto. |
| Versión | Captura concreta de un documento, con archivo, autor, fecha y estado. |
| Versión vigente | Última versión aprobada y válida para el uso permitido. |
| Anotación | Marca, comentario o señal vinculada a una versión y página del documento. |
| Trabajo en progreso | Información que está siendo preparada o corregida. |
| Compartido | Información sometida para coordinación o revisión. |
| Publicado | Información aprobada para uso autorizado. |
| Archivo | Información histórica conservada; no implica eliminación. |
| Avance físico | Estado o porcentaje de ejecución derivado de actividades y bitácora. |
| RLS | Row Level Security; controles de acceso aplicados directamente en la base de datos. |
| Fuente única de verdad | Principio por el que el expediente autorizado del CDE es la referencia central. |
| Autodesk Viewer | Integración futura de visualización web CAD/BIM sin edición de modelos en el MVP. |
| Revisión asistida por IA | Capacidad futura señalizada para apoyar revisiones, sin decisiones automáticas en el MVP. |

## 18. Resultado esperado

Costasur CDE debe convertirse en la memoria operativa, técnica y documental de cada activo de Casa de Campo. La aplicación será valiosa no porque muestre únicamente las obras activas, sino porque permite conocer qué es cada activo, quién estuvo relacionado con él, qué se sometió, qué fue aprobado, qué se construyó, qué quedó pendiente, qué ocurrió durante la obra y cuál es el siguiente capítulo de su historia.

## 19. Referencias internas

[1] Documento original: `Definicion Costasur CDE.md`.  
[2] PRD actualizado: `PRD_Arquitectura_v2_Actualizado.md`.  
[3] Modelo operativo del inventario histórico: `cde-modelo-inventario-historico.md`.  
[4] Contratos de roles, fases y entidades: `src/lib/cde-types.ts`.  
[5] Inventario demo de día cero: `supabase/migrations/024_demo_historical_inventory.sql`.  
[6] Gates reales del workflow: `supabase/migrations/025_real_workflow_gates.sql`.  
[7] Repositorio del MVP: [CDE-COSTASUR-MVP](https://github.com/Ingangomas/CDE-COSTASUR-MVP).
