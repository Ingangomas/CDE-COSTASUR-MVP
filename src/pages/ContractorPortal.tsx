import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContractorNewProjectModal } from "../components/ContractorNewProjectModal";
import { ContractorWorkflows } from "../components/ContractorWorkflows";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { useSession } from "../context/SessionContext";
import { getContractorStartRequestProjects, getProjectsForUser } from "../lib/cde-data";
import { getDemoExtraProjects } from "../lib/demo-projects";
import type { ProjectRecord } from "../lib/cde-types";

const statusLabels: Record<string, string> = { obra_activa: "Obra activa", pendiente_inspeccion: "Pendiente de inspección", en_revision: "En revisión", paralizada: "Paralizada", critica: "Crítica", finalizada: "Finalizada", aprobado: "Aprobada", obra_autorizada: "Obra autorizada" };
const filterLabels = ["Todas", "En revisión", "Obra activa", "Finalizada"];
const getCardStatus = (project: ProjectRecord, inReviewProjectIds: Set<string>) => inReviewProjectIds.has(project.id) || ["en_revision", "pendiente_inspeccion"].includes(project.operational_status) ? "En revisión" : (statusLabels[project.operational_status] ?? project.operational_status);
const getCardPriority = (project: ProjectRecord, inReviewProjectIds: Set<string>) => inReviewProjectIds.has(project.id) || ["en_revision", "pendiente_inspeccion"].includes(project.operational_status) ? 0 : project.operational_status === "obra_activa" ? 1 : project.operational_status === "finalizada" ? 2 : 3;

export function ContractorPortal() {
  const { profile } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [inReviewProjectIds, setInReviewProjectIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const newProjectOpen = searchParams.get("nuevo") === "1";
  const overviewProjects = profile?.is_demo ? [...projects, ...getDemoExtraProjects()] : projects;

  useEffect(() => {
    if (!profile?.id) return;
    getProjectsForUser(profile.id)
      .then(setProjects)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar tus proyectos asignados."))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  useEffect(() => {
    if (!projects.length) { setInReviewProjectIds(new Set()); return; }
    getContractorStartRequestProjects(projects.map((project) => project.id))
      .then((requests) => setInReviewProjectIds(new Set(requests.map((request) => request.project_id))))
      .catch(() => setInReviewProjectIds(new Set()));
  }, [projects]);

  const orderedProjects = useMemo(() => [...overviewProjects].sort((a, b) => {
    const priorityDifference = getCardPriority(a, inReviewProjectIds) - getCardPriority(b, inReviewProjectIds);
    return priorityDifference || a.title.localeCompare(b.title, "es");
  }), [overviewProjects, inReviewProjectIds]);
  const filtered = useMemo(() => orderedProjects.filter((project) => {
    const label = getCardStatus(project, inReviewProjectIds);
    return (filter === "Todas" || label === filter) && (!search || `${project.title} ${project.project_code}`.toLowerCase().includes(search));
  }), [filter, orderedProjects, inReviewProjectIds, search]);
  const selected = projects.find((project) => project.id === selectedProjectId) ?? null;

  return <>
    <div className="flex min-h-full flex-1 overflow-y-auto bg-surface-container-low p-4 pt-6 md:p-10 md:pt-8"><div className="mx-auto w-full max-w-[1400px] space-y-8">
    {selected ? <><div><button type="button" onClick={() => setSelectedProjectId(null)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Mis Proyectos</button><p className="text-xs uppercase tracking-[0.22em] text-secondary">Portal del contratista</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">{selected.title}</h1><p className="mt-3 text-base text-secondary">{selected.project_code} · {getCardStatus(selected, inReviewProjectIds)}</p></div><ContractorWorkflows projectId={selected.id} onRequestSubmitted={(requestType) => { if (requestType === "inicio_obra") setInReviewProjectIds((current) => new Set(current).add(selected.id)); }} /></> : <><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Portal del contratista</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Mis Proyectos</h1><p className="mt-3 text-base text-secondary">Solicitudes, inspecciones y bitácora física sobre tus expedientes asignados.</p></div><span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{overviewProjects.length} proyectos</span></div>{loading && <div className="glass-panel p-10 text-center text-secondary">Cargando proyectos persistentes…</div>}{error && <div className="glass-panel border border-error/30 p-6 text-error">{error}</div>}{!loading && !error && !overviewProjects.length && <div className="glass-panel p-10 text-center"><span className="material-symbols-outlined mt-4 text-4xl text-warning">assignment_late</span><h2 className="mt-4 text-2xl font-bold text-on-surface">No tienes proyectos asignados</h2><p className="mt-2 text-secondary">El propietario debe autorizarte después de la aprobación de los planos técnicos.</p></div>}{!loading && !error && Boolean(overviewProjects.length) && <><div className="flex gap-2 overflow-x-auto pb-2">{filterLabels.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium ${filter === item ? "bg-primary text-white" : "border border-outline-variant/30 bg-white text-secondary"}`}>{item}</button>)}</div>{!filtered.length && <div className="glass-panel p-8 text-center text-secondary">No hay proyectos con el filtro actual.</div>}<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">{filtered.map((project) => <ProjectOverviewCard key={project.id} project={project} demoOnly={project.id.startsWith("demo-project-")} onClick={project.id.startsWith("demo-project-") ? undefined : () => setSelectedProjectId(project.id)} statusLabel={getCardStatus(project, inReviewProjectIds)} statusTone={projectStatusTone(project.operational_status)} contextLabel="Expediente asignado al contratista" />)}</div></>}</>}  </div></div>
    <ContractorNewProjectModal open={newProjectOpen} onClose={() => navigate("/contratista/obras-activas")} />
  </>;
}
