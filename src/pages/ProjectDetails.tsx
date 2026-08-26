import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDate, getProjectWorkspace, type ProjectWorkspace } from "../lib/cde-data";
import { ContractorAuthorizationPanel } from "../components/ContractorAuthorizationPanel";

const phaseLabels: Record<string, string> = { anteproyecto: "Anteproyecto", revision_tecnica: "Revisión técnica", planos_tecnicos: "Planos técnicos", inicio_obra: "Inicio de obra", obra_activa: "Obra activa", cierre: "Cierre", archivo: "Archivo", autorizacion_inicial: "Autorización inicial", directorio: "Directorio" };
const cdeLabels: Record<string, string> = { wip: "En trabajo", shared: "Compartido", published: "Publicado", archive: "Archivado" };

const OWNER_WORKFLOW_STEPS = [
  { key: "autorizacion", label: "Validación legal", shortLabel: "Autorización" },
  { key: "anteproyecto", label: "Anteproyecto", shortLabel: "Anteproyecto" },
  { key: "planos", label: "Planos técnicos", shortLabel: "Planos técnicos" },
  { key: "contratista", label: "Validar contratista", shortLabel: "Contratista" },
  { key: "inicio", label: "Inicio de obra", shortLabel: "Inicio de obra" },
  { key: "finalizado", label: "Finalizado", shortLabel: "Finalizado" },
] as const;

function getOwnerWorkflowIndex(phase: string, operationalStatus: string) {
  if (["cierre", "archivo"].includes(phase) || ["finalizada", "archivada"].includes(operationalStatus)) return 5;
  if (["obra_activa"].includes(phase) || ["obra_activa"].includes(operationalStatus)) return 4;
  if (["inicio_obra"].includes(phase)) return 3;
  if (["revision_tecnica", "planos_tecnicos"].includes(phase)) return 2;
  if (["anteproyecto"].includes(phase)) return 1;
  return 0;
}

export function ProjectDetails() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("No se indicó un proyecto válido."); setLoading(false); return; }
    getProjectWorkspace(id)
      .then(setWorkspace)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar el expediente."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-secondary">Cargando expediente…</div>;
  if (error || !workspace) return <div className="p-10 max-w-3xl mx-auto"><Link to="/propietario/mis-propiedades" className="text-primary hover:underline">← Volver a Mis Propiedades</Link><div className="glass-panel mt-6 p-8 border border-error/30 text-error">{error || "Expediente no disponible."}</div></div>;

  const { project, property, documents, events } = workspace;
  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-8">
      <div>
        <Link to="/propietario/mis-propiedades" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-5"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Mis Propiedades</Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-secondary">{project.project_code}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-2">{project.title}</h1>
            <p className="text-base text-secondary mt-3 flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">location_on</span>{property?.address ?? "Ubicación pendiente"}</p>
          </div>
          <span className="inline-flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"><span className="w-2 h-2 rounded-full bg-white" />{project.operational_status.replaceAll("_", " ")}</span>
        </div>
      </div>

      <OwnerWorkflowTracker phase={project.phase} operationalStatus={project.operational_status} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-3xl p-7 md:p-8 border border-outline-variant/30 soft-shadow">
            <div className="flex items-center justify-between gap-4 mb-7"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Estado del expediente</p><h2 className="text-2xl font-bold text-on-surface mt-2">Avance consolidado</h2></div><span className="text-sm font-semibold text-primary">{phaseLabels[project.phase] ?? project.phase}</span></div>
<div className="max-w-xl">
              <Progress label="Avance físico" value={Number(project.progress_percent)} tone="primary" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-7 border-t border-outline-variant/30">
              <Metric label="Estado CDE" value={cdeLabels[project.cde_status] ?? project.cde_status} />
              <Metric label="Tipo" value={project.project_type.replaceAll("_", " ")} />
              <Metric label="Inicio" value={formatDate(project.start_date)} />
              <Metric label="Entrega estimada" value={formatDate(project.target_end_date)} />
            </div>
          </section>

          <section className="bg-white rounded-3xl p-7 md:p-8 border border-outline-variant/30 soft-shadow">
            <div className="flex items-center justify-between mb-6"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Repositorio documental</p><h2 className="text-2xl font-bold text-on-surface mt-2">Documentos del proyecto</h2></div><span className="text-sm text-secondary">{documents.length} registros</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => <div key={document.id}><DocumentCard projectId={project.id} documentId={document.id} title={document.title} category={document.category} state={document.cde_state} visibleToOwner={document.visible_to_owner} /></div>)}
            </div>
          </section>
          <ContractorAuthorizationPanel projectId={project.id} phase={project.phase} />
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-3xl p-7 border border-outline-variant/30 soft-shadow">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">Trazabilidad</p>
            <h2 className="text-2xl font-bold text-on-surface mt-2 mb-6">Línea de tiempo</h2>
            <div className="space-y-5">
              {events.length ? events.map((event) => <div key={event.id} className="flex gap-3"><span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-primary shrink-0" /><div><p className="text-sm font-semibold text-on-surface">{event.event_type.replaceAll("_", " ")}</p><p className="text-xs text-secondary mt-1">{formatDate(event.created_at)}</p>{event.comment && <p className="text-sm text-secondary mt-2">{event.comment}</p>}</div></div>) : <p className="text-sm text-secondary">Todavía no hay eventos registrados.</p>}
            </div>
          </section>
          <section className="rounded-3xl bg-primary-container text-white p-7">
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70 mt-5">Revisión asistida por IA</p>
            <h3 className="text-xl font-bold mt-2">Procesamiento próximamente</h3>
            <p className="text-sm text-white/75 mt-3 leading-relaxed">El expediente está preparado para la futura revisión automática de normativas. Esta señal no ejecuta todavía análisis de IA.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function OwnerWorkflowTracker({ phase, operationalStatus }: { phase: string; operationalStatus: string }) {
  const activeIndex = getOwnerWorkflowIndex(phase, operationalStatus);
  const isFinished = activeIndex === OWNER_WORKFLOW_STEPS.length - 1;
  const completedWidth = activeIndex === 0 ? "0%" : `calc(${(activeIndex / (OWNER_WORKFLOW_STEPS.length - 1)) * 100}% - 1rem)`;

  return (
    <section className="bg-white rounded-3xl p-6 md:p-7 border border-outline-variant/30 soft-shadow" aria-label="Progreso del expediente">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary">Ruta del expediente</p>
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mt-2">Progreso del trabajo</h2>
        </div>
        <span className="self-start rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-secondary">{isFinished ? "Proceso completado" : `Fase ${Math.min(activeIndex + 1, 5)} de 5`}</span>
      </div>
      <div className="mt-7 overflow-x-auto pb-2">
        <div className="relative min-w-[700px] px-4">
          <div className="absolute left-8 right-8 top-4 h-px bg-outline-variant/40" />
          <div className="absolute left-8 top-4 h-px bg-primary transition-all" style={{ width: completedWidth }} />
          <div className="relative flex justify-between gap-4">
            {OWNER_WORKFLOW_STEPS.map((step, index) => {
              const completed = index < activeIndex;
              const active = index === activeIndex;
              return <div key={step.key} className="flex w-28 shrink-0 flex-col items-center text-center">
                <span className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-colors ${completed || active ? "border-primary" : "border-outline-variant/60"} ${active ? "ring-4 ring-primary/10" : ""}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${completed ? "bg-primary" : active ? "bg-primary" : "bg-white"}`} />
                </span>
                <p className={`mt-3 text-[11px] font-semibold leading-tight ${active ? "text-primary" : completed ? "text-on-surface" : "text-secondary"}`}>{step.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary">{index === activeIndex ? "Etapa actual" : index < activeIndex ? "Completada" : "Pendiente"}</p>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Progress({ label, value, tone }: { label: string; value: number; tone: "primary" | "success" }) {
  const color = tone === "success" ? "bg-success" : "bg-primary";
  return <div><div className="flex items-center justify-between text-sm mb-2"><span className="text-secondary">{label}</span><span className="font-bold text-on-surface">{value.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-surface-container-low overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] uppercase tracking-wider text-secondary">{label}</p><p className="text-sm font-semibold text-on-surface mt-2 capitalize">{value}</p></div>;
}

function DocumentCard({ projectId, documentId, title, category, state, visibleToOwner }: { projectId: string; documentId: string; title: string; category: string; state: string; visibleToOwner: boolean }) {
  return <Link to={`/propietario/mis-propiedades/${projectId}/documentos/${documentId}`} className="block rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors"><div className="flex items-start justify-between gap-3"><span className="material-symbols-outlined text-primary">description</span><span className="text-[10px] uppercase tracking-wider rounded-full bg-white px-2 py-1 text-secondary">{cdeLabels[state] ?? state}</span></div><h3 className="text-base font-semibold text-on-surface mt-4 leading-snug">{title}</h3><p className="text-xs text-secondary mt-2 uppercase tracking-wider">{category.replaceAll("_", " ")}</p><p className="text-xs mt-4 text-secondary">{visibleToOwner ? "Visible para el propietario · Abrir visor" : "Uso interno autorizado · Abrir visor"}</p></Link>;
}


