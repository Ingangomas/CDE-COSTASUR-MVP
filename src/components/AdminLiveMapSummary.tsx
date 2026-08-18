import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminProjects, getAdminProperties } from "../lib/cde-data";
import type { ProjectRecord, PropertyRecord } from "../lib/cde-types";

const statusLabel = (value: string) => ({
  obra_activa: "Obra activa",
  en_revision: "En revisión",
  pendiente_inspeccion: "Pendiente inspección",
  critica: "Crítica",
  paralizada: "Paralizada",
  finalizada: "Finalizada",
  aprobado: "Aprobada",
}[value] ?? value.replaceAll("_", " "));

const propertyTypeLabel = (property: PropertyRecord) => property.property_type === "terreno" ? "Lote vacío" : "Villa existente";

export function AdminLiveMapSummary() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminProjects(), getAdminProperties()])
      .then(([projectRows, propertyRows]) => {
        setProjects(projectRows);
        setProperties(propertyRows);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No fue posible cargar los datos geográficos."));
  }, []);

  const projectByProperty = useMemo(() => {
    const map = new Map<string, ProjectRecord>();
    projects.forEach((project) => {
      if (!map.has(project.property_id)) map.set(project.property_id, project);
    });
    return map;
  }, [projects]);

  const counts = useMemo(() => projects.reduce((acc, project) => {
    acc[project.operational_status] = (acc[project.operational_status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>), [projects]);

  const villas = properties.filter((property) => property.property_type !== "terreno").length;
  const emptyLots = properties.filter((property) => property.property_type === "terreno").length;

  return (
    <div className="glass-panel rounded-3xl p-5 soft-shadow sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-secondary">Datos persistentes</p>
          <h3 className="mt-2 text-xl font-bold text-primary">Inventario georreferenciado del CDE</h3>
          <p className="mt-2 text-sm text-secondary">Propiedades desde el día uno y expedientes vinculados, sin datos inventados.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <span className="material-symbols-outlined text-[16px]">map</span>
          {properties.length} propiedades · {projects.length} expedientes
        </span>
      </div>

      {error ? <p className="rounded-2xl border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</p> : null}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-surface-container-low p-4"><p className="text-2xl font-bold text-primary">{properties.length}</p><p className="mt-1 text-xs font-semibold text-secondary">Propiedades</p></div>
        <div className="rounded-2xl bg-surface-container-low p-4"><p className="text-2xl font-bold text-primary">{villas}</p><p className="mt-1 text-xs font-semibold text-secondary">Villas existentes</p></div>
        <div className="rounded-2xl bg-surface-container-low p-4"><p className="text-2xl font-bold text-primary">{emptyLots}</p><p className="mt-1 text-xs font-semibold text-secondary">Lotes vacíos</p></div>
        <div className="rounded-2xl bg-primary/10 p-4 text-primary"><p className="text-2xl font-bold">{counts.obra_activa ?? 0}</p><p className="mt-1 text-xs font-semibold">Obras activas</p></div>
      </div>

      <div className="space-y-2">
        {properties.map((property) => {
          const project = projectByProperty.get(property.id);
          const content = (
            <>
              <div>
                <p className="text-sm font-semibold text-on-surface">{property.name}</p>
                <p className="mt-1 text-xs text-secondary">{property.property_code} · {propertyTypeLabel(property)}</p>
                <p className="mt-1 text-xs text-secondary">{property.latitude ?? "—"}, {property.longitude ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-primary">{project ? statusLabel(project.operational_status) : "Sin expediente"}</p>
                <p className="mt-1 text-xs text-secondary">{project ? `${project.project_code} · ${project.progress_percent}% físico` : "Disponible para futura actividad"}</p>
              </div>
            </>
          );
          return project ? <Link key={property.id} to={`/admin/proyectos/${project.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-white px-4 py-3 transition-colors hover:border-primary/40">{content}</Link> : <div key={property.id} className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3">{content}</div>;
        })}
      </div>
    </div>
  );
}
