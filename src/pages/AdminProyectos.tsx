import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatDate, getAdminProjects } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";

const statuses = ["Todos", "En revisión", "Obra activa", "Pendiente inspección", "Finalizada"];
const statusLabel = (value: string) => ({ en_revision: "En revisión", obra_activa: "Obra activa", pendiente_inspeccion: "Pendiente inspección", finalizada: "Finalizada", aprobado: "Aprobada", paralizada: "Paralizada", critica: "Crítica" }[value] ?? value.replaceAll("_", " "));

export function AdminProyectos() {
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { getAdminProjects().then(setProjects).catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar los proyectos.")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => projects.filter((project) => {
    const matchesSearch = !searchQuery || `${project.title} ${project.project_code}`.toLowerCase().includes(searchQuery.toLowerCase());
    const label = statusLabel(project.operational_status);
    return matchesSearch && (filtroEstado === "Todos" || label.toLowerCase() === filtroEstado.toLowerCase());
  }), [filtroEstado, projects, searchQuery]);

  return (
    <div className="p-4 md:p-8 lg:px-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Administración general</p><h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-2">Control de Obras</h1><p className="text-base text-secondary mt-3">Expedientes, estados operativos y trazabilidad de todos los proyectos autorizados.</p></div><span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">{projects.length} proyectos registrados</span></div>
      <div className="flex gap-2 overflow-x-auto pb-2">{statuses.map((status) => <button type="button" key={status} onClick={() => setFiltroEstado(status)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${filtroEstado === status ? "bg-primary text-white" : "bg-white text-secondary border border-outline-variant/30 hover:text-primary"}`}>{status}</button>)}</div>
      {loading && <div className="glass-panel p-10 text-center text-secondary">Cargando expedientes…</div>}
      {error && <div className="glass-panel p-6 border border-error/30 text-error">{error}</div>}
      {!loading && !error && !filtered.length && <div className="glass-panel p-10 text-center text-secondary">No hay proyectos que coincidan con el filtro actual.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((project) => <div key={project.id}><ProjectCard project={project} /></div>)}</div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  const label = statusLabel(project.operational_status);
  const tone = project.operational_status === "critica" || project.operational_status === "paralizada" ? "bg-error/10 text-error" : project.operational_status === "finalizada" ? "bg-success/10 text-success" : project.operational_status === "pendiente_inspeccion" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";
  return <Link to={`/admin/proyectos/${project.id}`} className="group block overflow-hidden rounded-3xl bg-white border border-outline-variant/30 soft-shadow hover:border-primary/40 transition-colors"><div className="h-44 bg-surface-container-low relative overflow-hidden"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80" alt="Obra Costasur" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /><span className={`absolute top-4 right-4 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${tone}`}>{label}</span><span className="absolute bottom-4 left-4 rounded-lg bg-black/55 px-3 py-1 text-xs font-mono text-white">{project.project_code}</span></div><div className="p-6"><p className="text-xs uppercase tracking-[0.16em] text-secondary">{project.phase.replaceAll("_", " ")}</p><h2 className="text-xl font-bold text-on-surface mt-2 line-clamp-2">{project.title}</h2><div className="mt-5 space-y-3"><Progress label="Avance físico" value={Number(project.progress_percent)} color="bg-primary" /><Progress label="Avance financiero" value={Number(project.financial_progress_percent)} color="bg-success" /></div><div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/30 text-xs text-secondary"><span>Entrega: {formatDate(project.target_end_date)}</span><span className="inline-flex items-center gap-1 text-primary font-semibold">Expediente <span className="material-symbols-outlined text-base">arrow_forward</span></span></div></div></Link>;
}

function Progress({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className="flex justify-between text-xs mb-1.5"><span className="text-secondary">{label}</span><span className="font-semibold text-on-surface">{value.toFixed(0)}%</span></div><div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}

