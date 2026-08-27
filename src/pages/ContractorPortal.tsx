import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ContractorWorkflows } from "../components/ContractorWorkflows";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { useSession } from "../context/SessionContext";
import { getProjectsForUser } from "../lib/cde-data";
import { getDemoExtraProjects } from "../lib/demo-projects";
import type { ProjectRecord } from "../lib/cde-types";

const statusLabels: Record<string, string> = { obra_activa: "Obra activa", pendiente_inspeccion: "Pendiente de inspección", en_revision: "En revisión", paralizada: "Paralizada", critica: "Crítica", finalizada: "Finalizada", aprobado: "Aprobada", obra_autorizada: "Obra autorizada" };
const filterLabels = ["Todas", "Obra activa", "Pendiente de inspección", "En revisión", "Finalizada"];

export function ContractorPortal() {
  const { profile } = useSession();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const overviewProjects = profile?.is_demo ? [...projects, ...getDemoExtraProjects()] : projects;

  useEffect(() => {
    if (!profile?.id) return;
    getProjectsForUser(profile.id)
      .then(setProjects)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar tus proyectos asignados."))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const filtered = useMemo(() => overviewProjects.filter((project) => {
    const label = statusLabels[project.operational_status] ?? project.operational_status;
    return (filter === "Todas" || label === filter) && (!search || `${project.title} ${project.project_code}`.toLowerCase().includes(search));
  }), [filter, overviewProjects, search]);
  const selected = projects.find((project) => project.id === selectedProjectId) ?? null;

  return <div className="flex-1 overflow-y-auto bg-surface-container-low p-4 pt-6 md:p-10 md:pt-8 min-h-full"><div className="mx-auto max-w-[1400px] space-y-8">
    {selected ? <><div><button type="button" onClick={() => setSelectedProjectId(null)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Mis Proyectos</button><p className="text-xs uppercase tracking-[0.22em] text-secondary">Portal del contratista</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">{selected.title}</h1><p className="mt-3 text-base text-secondary">{selected.project_code} · {statusLabels[selected.operational_status] ?? selected.operational_status}</p></div><ContractorWorkflows projectId={selected.id} /></> : <><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Portal del contratista</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Mis Proyectos</h1><p className="mt-3 text-base text-secondary">Solicitudes, inspecciones y bitácora física sobre tus expedientes asignados.</p></div><span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{overviewProjects.length} proyectos</span></div>{loading && <div className="glass-panel p-10 text-center text-secondary">Cargando proyectos persistentes…</div>}{error && <div className="glass-panel border border-error/30 p-6 text-error">{error}</div>}{!loading && !error && !overviewProjects.length && <div className="glass-panel p-10 text-center"><span className="material-symbols-outlined mt-4 text-4xl text-warning">assignment_late</span><h2 className="mt-4 text-2xl font-bold text-on-surface">No tienes proyectos asignados</h2><p className="mt-2 text-secondary">El propietario debe autorizarte después de la aprobación de los planos técnicos.</p></div>}{!loading && !error && Boolean(overviewProjects.length) && <><div className="flex gap-2 overflow-x-auto pb-2">{filterLabels.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium ${filter === item ? "bg-primary text-white" : "border border-outline-variant/30 bg-white text-secondary"}`}>{item}</button>)}</div>{!filtered.length && <div className="glass-panel p-8 text-center text-secondary">No hay proyectos con el filtro actual.</div>}<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">{filtered.map((project) => <ProjectOverviewCard key={project.id} project={project} demoOnly={project.id.startsWith("demo-project-")} onClick={project.id.startsWith("demo-project-") ? undefined : () => setSelectedProjectId(project.id)} statusLabel={statusLabels[project.operational_status] ?? project.operational_status} statusTone={projectStatusTone(project.operational_status)} contextLabel="Expediente asignado al contratista" />)}</div></>}</>}</div></div>;
}
