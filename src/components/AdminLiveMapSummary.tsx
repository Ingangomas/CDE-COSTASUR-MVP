import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminProjects } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";

const label = (value: string) => ({ obra_activa: "Obra activa", en_revision: "En revisión", pendiente_inspeccion: "Pendiente inspección", critica: "Crítica", paralizada: "Paralizada", finalizada: "Finalizada", aprobado: "Aprobada" }[value] ?? value.replaceAll("_", " "));

export function AdminLiveMapSummary() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  useEffect(() => { getAdminProjects().then(setProjects).catch(() => setProjects([])); }, []);
  const counts = useMemo(() => projects.reduce((acc, project) => { acc[project.operational_status] = (acc[project.operational_status] ?? 0) + 1; return acc; }, {} as Record<string, number>), [projects]);
  return <div className="lg:col-span-8 glass-panel rounded-3xl p-5 sm:p-6 soft-shadow"><div className="flex items-center justify-between mb-5"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Datos persistentes</p><h3 className="text-xl font-bold text-primary mt-2">Estado georreferenciado del CDE</h3></div><span className="text-xs text-secondary">{projects.length} expedientes</span></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{[["obra_activa","Activas","bg-primary/10 text-primary"],["pendiente_inspeccion","Inspección","bg-warning/10 text-warning"],["critica","Críticas","bg-error/10 text-error"],["finalizada","Finalizadas","bg-success/10 text-success"]].map(([status, title, tone]) => <div key={status} className={`rounded-2xl p-4 ${tone}`}><p className="text-2xl font-bold">{counts[status] ?? 0}</p><p className="text-xs font-semibold mt-1">{title}</p></div>)}</div><div className="space-y-2">{projects.slice(0, 4).map((project) => <Link key={project.id} to={`/admin/proyectos/${project.id}`} className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-white px-4 py-3 hover:border-primary/40"><div><p className="text-sm font-semibold text-on-surface">{project.title}</p><p className="text-xs text-secondary mt-1">{project.project_code} · {project.latitude ?? "—"}, {project.longitude ?? "—"}</p></div><span className="text-xs font-semibold text-primary">{label(project.operational_status)}</span></Link>)}</div></div>;
}
