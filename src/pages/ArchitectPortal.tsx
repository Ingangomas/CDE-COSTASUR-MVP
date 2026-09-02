import { useEffect, useMemo, useState } from "react";
import { DocumentUpload } from "../components/DocumentUpload";
import { ArchitectAnteprojectUploadPanel } from "../components/ArchitectAnteprojectUploadPanel";
import { PlanSetViewer } from "../components/PlanSetViewer";
import { getProjectsForUser, getProjectWorkspace, type ProjectWorkspace } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { useSession } from "../context/SessionContext";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { getDemoExtraProjects } from "../lib/demo-projects";
import { ProjectWorkflowTracker } from "../components/ProjectWorkflowTracker";

const technicalCategories = [
  { value: "arquitectonico", label: "Arquitectónico" },
  { value: "estructural", label: "Estructural" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hidrosanitario", label: "Hidrosanitario" },
  { value: "climatizacion", label: "Climatización" },
];

const phaseLabels: Record<string, string> = {
  autorizacion_inicial: "Esperando aprobación de carta",
  anteproyecto: "Anteproyecto habilitado",
  directorio: "Anteproyecto en Revisión del Directorio",
  planos_tecnicos: "Planos técnicos habilitados",
  inicio_obra: "Planos aprobados · esperando inicio de obra",
  obra_activa: "Obra activa",
};

export function ArchitectPortal() {
  const { profile } = useSession();
  const [activeTab, setActiveTab] = useState<"anteproyecto" | "planos_tecnicos" | "memoria_descriptiva">("anteproyecto");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWorkspace = async (requestedProjectId?: string) => {
    if (!profile?.id) return;
    setLoading(true);
    setError("");
    try {
      const projectRows = await getProjectsForUser(profile.id);
      setProjects(projectRows);
      const id = requestedProjectId ?? projectId ?? null;
      setProjectId(id);
      if (!id) { setWorkspace(null); return; }
      const nextWorkspace = await getProjectWorkspace(id);
      setWorkspace(nextWorkspace);
      setSelectedDocumentId((current) => current && nextWorkspace.documents.some((document) => document.id === current) ? current : nextWorkspace.documents[0]?.id ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar los expedientes del arquitecto.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadWorkspace(); }, [profile?.id]);

  const phase = workspace?.project.phase ?? "autorizacion_inicial";
  const anteprojectEnabled = phase !== "autorizacion_inicial";
  const technicalEnabled = ["planos_tecnicos", "inicio_obra", "obra_activa", "cierre"].includes(phase);
  const visibleDocuments = useMemo(() => {
    if (!workspace) return [];
    if (activeTab === "anteproyecto") return workspace.documents.filter((document) => ["anteproyecto", "planta_conjunto", "planta_nivel", "elevaciones", "secciones", "curvas_nivel", "memoria_descriptiva", "anexos"].includes(document.category));
    if (activeTab === "memoria_descriptiva") return workspace.documents.filter((document) => document.category === "memoria_descriptiva");
    return workspace.documents.filter((document) => technicalCategories.some((category) => category.value === document.category));
  }, [activeTab, workspace]);

  useEffect(() => {
    if (visibleDocuments.length && !visibleDocuments.some((document) => document.id === selectedDocumentId)) setSelectedDocumentId(visibleDocuments[0].id);
  }, [selectedDocumentId, visibleDocuments]);

  if (loading) return <div className="flex-1 overflow-y-auto p-10 bg-surface-container-low"><div className="glass-panel p-10 text-center text-secondary">Cargando expediente arquitectónico…</div></div>;
  if (error) return <div className="flex-1 overflow-y-auto p-10 bg-surface-container-low"><div className="glass-panel p-8 border border-error/30 text-error">{error}</div></div>;
  if (!projectId) {
    const overviewProjects = profile?.is_demo ? [...projects, ...getDemoExtraProjects()] : projects;
    const activationProjects = overviewProjects.filter((project) => ["autorizacion_inicial", "anteproyecto", "revision_tecnica", "planos_tecnicos"].includes(project.phase));
    const activeProjects = overviewProjects.filter((project) => ["inicio_obra", "obra_activa", "cierre"].includes(project.phase));
    const projectCard = (project: ProjectRecord) => <ProjectOverviewCard key={project.id} project={project} demoOnly={project.id.startsWith("demo-project-")} onClick={project.id.startsWith("demo-project-") ? undefined : () => void loadWorkspace(project.id)} statusLabel={phaseLabels[project.phase] ?? project.phase.replaceAll("_", " ")} statusTone={projectStatusTone(project.operational_status)} contextLabel="Proyecto asignado a Arquitectura" />;
    return <div className="flex-1 overflow-y-auto bg-surface-container-low p-4 pt-8 md:p-10"><div className="mx-auto max-w-[1200px] space-y-8"><header><p className="text-xs uppercase tracking-[0.2em] text-secondary">Portal arquitectónico</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Mis Proyectos</h1><p className="mt-3 text-base text-secondary">Selecciona un expediente para entrar a su visor y continuar el proceso.</p></header>{!projects.length && <div className="glass-panel p-10 text-center"><span className="material-symbols-outlined text-4xl text-warning">folder_off</span><h2 className="mt-4 text-2xl font-bold text-on-surface">No hay proyectos asignados</h2><p className="mt-2 text-secondary">El propietario o el Administrador General debe crear y asignar un proyecto antes de iniciar el sometimiento.</p></div>}{Boolean(activationProjects.length) && <section className="space-y-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Procesos en activación</p><h2 className="mt-2 text-2xl font-bold text-primary">Proyectos por habilitar</h2></div><div className="grid grid-cols-1 gap-7 lg:grid-cols-2">{activationProjects.map(projectCard)}</div></section>}{Boolean(activeProjects.length) && <section className="space-y-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Expedientes activos</p><h2 className="mt-2 text-2xl font-bold text-primary">Proyectos en curso</h2></div><div className="grid grid-cols-1 gap-7 lg:grid-cols-2">{activeProjects.map(projectCard)}</div></section>}</div></div>;
  }

  return <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-8 bg-surface-container-low min-h-full"><div className="max-w-[1200px] mx-auto space-y-8">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><button type="button" onClick={() => { setProjectId(null); setWorkspace(null); }} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Mis Proyectos</button><p className="text-xs uppercase tracking-[0.2em] text-secondary">Expediente arquitectónico persistente</p><h1 className="mt-2 text-4xl font-bold text-on-surface">{workspace.project.title}</h1><p className="mt-3 text-sm text-secondary">{workspace.project.project_code} · {workspace.property?.name ?? "Propiedad CDE"}</p></div><div className="flex flex-col items-stretch gap-3 md:items-end"><span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{phaseLabels[phase] ?? phase}</span>{projects.length > 1 && <select value={projectId ?? ""} onChange={(event) => void loadWorkspace(event.target.value)} className="rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm text-on-surface"><option value="">Seleccionar expediente</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} · {project.title}</option>)}</select>}</div></div>
    <section className="glass-panel bg-white p-6 md:p-7 border border-outline-variant/30"><div className="flex items-start gap-4"><span className="material-symbols-outlined text-3xl text-primary">account_tree</span><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Gate del workflow</p><h2 className="text-xl font-bold text-on-surface mt-2">{phase === "autorizacion_inicial" ? "La carta aún debe ser aprobada por Arquitectura" : phase === "anteproyecto" ? "Puede someter el anteproyecto" : phase === "directorio" ? "El anteproyecto está en Revisión del Directorio" : phase === "planos_tecnicos" ? "Puede someter los planos técnicos" : "El expediente avanzó a la etapa de inicio de obra"}</h2><p className="text-sm text-secondary mt-2">Los documentos y revisiones se guardan en Supabase. La revisión asistida por IA continúa señalizada como futura y no ejecuta análisis.</p></div></div></section>
    <ProjectWorkflowTracker phase={workspace.project.phase} operationalStatus={workspace.project.operational_status} />
    <PlanSetViewer projectId={projectId} documents={workspace.documents} technicalEnabled={technicalEnabled} directoryReviewEnabled={["directorio", "planos_tecnicos", "inicio_obra", "obra_activa", "cierre"].includes(phase)} onUploaded={() => { void loadWorkspace(projectId ?? undefined); }} />
  </div></div>;
}

function TabButton({ active, disabled, onClick, label }: { active: boolean; disabled: boolean; onClick: () => void; label: string }) { return <button type="button" disabled={disabled} onClick={onClick} className={`flex-1 px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${active ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"} disabled:opacity-40 disabled:cursor-not-allowed`}>{label}{disabled && <span className="material-symbols-outlined text-sm align-middle ml-2">lock</span>}</button>; }
function GateNotice({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 flex items-start gap-3"><span className="material-symbols-outlined text-warning">lock</span><div><h3 className="font-semibold text-on-surface">{title}</h3><p className="text-sm text-secondary mt-1">{body}</p></div></div>; }
