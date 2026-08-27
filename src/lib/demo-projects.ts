import type { ProjectRecord } from "./cde-types";

export const DEMO_EXTRA_PROJECTS: ProjectRecord[] = [
  {
    id: "demo-project-tamarindo-13",
    property_id: "demo-property-tamarindo-13",
    project_code: "TAMARINDO-13-PROY-01",
    title: "Remodelación Tamarindo #13",
    project_type: "remodelacion",
    phase: "anteproyecto",
    cde_status: "wip",
    operational_status: "en_revision",
    progress_percent: 24,
    start_date: null,
    target_end_date: null,
  },
  {
    id: "demo-project-caleton-57",
    property_id: "demo-property-caleton-57",
    project_code: "CALETON-57-PROY-01",
    title: "Ampliación Caleton #57",
    project_type: "ampliacion",
    phase: "autorizacion_inicial",
    cde_status: "wip",
    operational_status: "en_revision",
    progress_percent: 8,
    start_date: null,
    target_end_date: null,
  },
  {
    id: "demo-project-las-canas-24",
    property_id: "demo-property-las-canas-24",
    project_code: "LAS-CANAS-I-24-PROY-01",
    title: "Nueva obra Las Cañas I #24",
    project_type: "obra_nueva",
    phase: "planos_tecnicos",
    cde_status: "shared",
    operational_status: "aprobado",
    progress_percent: 56,
    start_date: null,
    target_end_date: null,
  },
  {
    id: "demo-project-palma-09",
    property_id: "demo-property-palma-09",
    project_code: "PALMA-09-LOT-PROY-01",
    title: "Lote Palma Real #09",
    project_type: "lote",
    phase: "inicio_obra",
    cde_status: "published",
    operational_status: "obra_autorizada",
    progress_percent: 72,
    start_date: null,
    target_end_date: null,
  },
];

export function getDemoExtraProjects() {
  return DEMO_EXTRA_PROJECTS.map((project) => ({ ...project }));
}
