# Auditoría externa del MVP CDE Costasur

**Fecha de auditoría:** 18 de agosto de 2026  
**Alcance:** workflow funcional, roles, rutas, datos persistentes, documentos, visores, seguridad de acceso y ausencia de métricas financieras.

## Dictamen ejecutivo

El workflow principal del CDE está **funcionalmente aprobado para la demostración del MVP**. La validación se realizó contra Supabase real y recorrió la secuencia completa desde la creación del expediente por el propietario hasta la activación de obra, bitácora física, solicitud de inspección, programación de Control de Obras, visor PDF y anotación persistente.

La auditoría no se limitó a verificar que las pantallas cargaran. Se revisaron las condiciones de habilitación, las membresías, los roles, la persistencia, los estados y la visibilidad para el siguiente actor del flujo. Se encontraron brechas reales y se corrigieron durante la revisión.

## Workflow validado

| Etapa | Resultado |
|---|---|
| Propietario crea expediente sobre una propiedad existente | PASS |
| Carta de autorización cargada en Storage privado y versionada | PASS |
| Arquitectura revisa y aprueba la carta | PASS |
| Arquitecto queda habilitado para anteproyecto | PASS |
| Anteproyecto cargado y visible en visor PDF | PASS |
| Arquitectura aprueba anteproyecto | PASS |
| Arquitecto queda habilitado para planos técnicos | PASS |
| Planos técnicos cargados con categoría disciplinar | PASS |
| Arquitectura aprueba planos técnicos | PASS |
| Propietario autoriza contratista | PASS |
| Contratista solicita inicio de obra | PASS |
| Control de Obras recibe y aprueba la solicitud | PASS |
| Expediente pasa a `obra_activa` | PASS |
| Contratista registra avance físico en bitácora | PASS |
| Bitácora sincroniza avance físico del proyecto | PASS |
| Contratista solicita inspección | PASS |
| Control de Obras programa inspección | PASS |
| Visor PDF muestra documento y anotaciones por página | PASS |
| Auditoría y notificaciones de transiciones | PASS |

## Roles y aislamiento

Se probaron los accesos de Administrador General, Propietario, Arquitecto, Revisión Técnica, Contratista, Control de Obras, Legal, Electricidad, Hidrosanitaria, Paisajismo, Mensura y Seguridad.

El Administrador General muestra gobernanza, expedientes, operaciones, inventario y notificaciones reales. El Propietario está limitado a sus propiedades y al flujo de autorización. Arquitectura trabaja con los expedientes asignados y gates de etapa. El Contratista solo ve obras asignadas y las acciones permitidas por fase. Control de Obras recibe solicitudes y expone la operación persistente. Los departamentos internos muestran expedientes filtrados por membresía y rol.

Se verificó que un Propietario no puede acceder a las rutas internas de Mensura ni Seguridad, y que Revisión Técnica no puede acceder al dashboard administrativo.

## Inventario histórico

El inventario demo contiene **10 propiedades persistentes desde el día cero**: cinco villas existentes y cinco lotes vacíos, todos con código, coordenadas y estado. El mapa administrativo muestra actualmente `10 propiedades · 8 expedientes`, diferenciando villas existentes, lotes vacíos y expedientes vinculados. Los lotes vacíos permanecen disponibles para futuras actividades sin inventar expedientes.

## Correcciones realizadas durante la auditoría

Se protegieron las rutas de Mensura y Seguridad, que inicialmente no tenían la restricción de rol completa. Se reemplazaron dashboards y listas estáticas por datos de Supabase. Se corrigió el mapa para que mostrara propiedades sin expediente, no solo proyectos. Se eliminó todo el balance financiero, cashflow, presupuesto y avance financiero del frontend.

Se corrigió la autorización intermitente del Propietario mediante reintentos controlados de carga de perfil y roles. Se corrigió la categoría de planos técnicos. Se archivó el documento duplicado generado por la primera prueba fallida, conservando su historial y dejando como único documento técnico vigente el de categoría `arquitectonico`. Se alineó `CDE-DEMO-001` a `phase = obra_activa` para que coincidiera con su estado operativo y avance físico del 38%.

## Documentos, Storage y visor

La carga documental utiliza Storage privado y versiones persistentes. Se probó una carta PDF, un anteproyecto PDF y un plano técnico PDF. El visor muestra el documento en navegador y permite anotaciones vinculadas a la versión, página y autor. El flujo CAD permanece de solo lectura para DXF y no se presentó como integración BIM.

## Validaciones técnicas

| Validación | Resultado |
|---|---|
| TypeScript / `npm run lint` | Correcto |
| Producción / `npm run build` | Correcto; 482 módulos transformados en la última validación del frontend |
| RLS y roles | Verificados durante los recorridos |
| Storage privado | Verificado mediante carga y visor PDF |
| Notificaciones | Verificadas para solicitudes, incidencias y licencias |
| Auditoría de workflow | Verificada mediante eventos persistentes |
| Referencias financieras en `src/` | Sin coincidencias |

## Limitaciones conocidas, no bloqueantes para el MVP

El mapa administrativo ya trabaja con coordenadas persistentes, pero la capa cartográfica visual de Google Maps o Mapbox todavía no está conectada. Actualmente se muestra el inventario geográfico persistente sin dibujar una cartografía externa. Autodesk Platform Services tampoco está integrado; el MVP conserva el visor PDF y el visor DXF de solo lectura, que son los flujos confirmados para la demostración.

Los últimos cambios de auditoría incluyen las migraciones 030 y 031 y modificaciones adicionales del frontend. Antes de Vercel, deben publicarse en GitHub y verificarse en `origin/main`; no se debe desplegar una copia anterior.

## Dictamen final

**APROBADO PARA PRUEBA CONTROLADA Y PRESENTACIÓN DEL WORKFLOW PRINCIPAL.** El sistema ya puede demostrar un flujo real completo con autenticación, roles, expediente histórico, carta de autorización, aprobación de Arquitectura, anteproyecto, planos técnicos, autorización de contratista, inicio de obra, bitácora física, inspecciones, documentos, visor PDF, anotaciones, notificaciones y auditoría.

La siguiente actividad técnica correcta es sincronizar las últimas correcciones de auditoría a Drive/GitHub, verificar el árbol remoto y desplegar esa versión exacta en Vercel. No se recomienda desplegar antes de esa sincronización.
