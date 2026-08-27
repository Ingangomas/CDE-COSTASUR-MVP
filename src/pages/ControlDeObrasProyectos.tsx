import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { getProjectsForUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { getDemoExtraProjects } from "../lib/demo-projects";

const statusLabels: Record<string, string> = { obra_activa: "Obra activa", pendiente_inspeccion: "Pendiente de inspección", en_revision: "En revisión", paralizada: "Paralizada", critica: "Crítica", finalizada: "Finalizada", aprobado: "Aprobada" };
const filters = ["Todas", "Obra activa", "Pendiente de inspección", "En revisión", "Finalizada"];

export function ControlDeObrasProyectos() {
  const { profile } = useSession();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [filter, setFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  useEffect(() => { if (!profile?.id) return; getProjectsForUser(profile.id).then(setProjects).catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar los proyectos de Control de Obras.")).finally(() => setLoading(false)); }, [profile?.id]);
  const overviewProjects = profile?.is_demo ? [...projects, ...getDemoExtraProjects()] : projects;
  const filtered = useMemo(() => overviewProjects.filter((project) => { const status = statusLabels[project.operational_status] ?? project.operational_status; return (filter === "Todas" || status === filter) && (!search || `${project.title} ${project.project_code}`.toLowerCase().includes(search)); }), [filter, overviewProjects, search]);

  return <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-8"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Control operativo</p><h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-2">Proyectos de Obra</h1><p className="text-base text-secondary mt-3">Solicitudes de inicio, inspecciones, incidencias y documentos desde expedientes persistentes.</p></div><div className="flex gap-2 overflow-x-auto pb-2">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap ${filter === item ? "bg-primary text-white" : "bg-white text-secondary border border-outline-variant/30"}`}>{item}</button>)}</div>{loading && <div className="glass-panel p-10 text-center text-secondary">Cargando expedientes…</div>}{error && <div className="glass-panel p-6 border border-error/30 text-error">{error}</div>}{!loading && !error && !filtered.length && <div className="glass-panel p-10 text-center text-secondary">No hay expedientes asignados para este filtro.</div>}<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filtered.map((project) => <ProjectOverviewCard key={project.id} project={project} demoOnly={project.id.startsWith("demo-project-")} href={`/control-obras/proyectos/${project.id}`} statusLabel={statusLabels[project.operational_status] ?? project.operational_status} statusTone={projectStatusTone(project.operational_status)} contextLabel="Bandeja de Control de Obras" />)}</div></div>;
}
