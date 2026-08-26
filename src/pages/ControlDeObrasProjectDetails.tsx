import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ControlRequestsPanel } from "../components/ControlRequestsPanel";
import { PlanSetViewer } from "../components/PlanSetViewer";
import { getProjectWorkspace, type ProjectWorkspace } from "../lib/cde-data";
import { requireSupabase } from "../lib/supabase";

interface IncidentRow { id: string; title: string; description: string; severity: string; status: string; created_at: string; }
const phaseLabels: Record<string, string> = { autorizacion_inicial: "Autorización inicial", anteproyecto: "Anteproyecto", planos_tecnicos: "Planos técnicos", inicio_obra: "Inicio de obra", obra_activa: "Obra activa", cierre: "Cierre" };

export function ControlDeObrasProjectDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"expediente" | "planos" | "reportes">("expediente");
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const nextWorkspace = await getProjectWorkspace(id);
        setWorkspace(nextWorkspace);
        setSelectedDocumentId(nextWorkspace.documents[0]?.id ?? null);
        const client = requireSupabase();
        const { data, error: incidentError } = await client.from("incidents").select("id,title,description,severity,status,created_at").eq("project_id", id).order("created_at", { ascending: false });
        if (incidentError) throw incidentError;
        setIncidents((data ?? []) as IncidentRow[]);
      } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible cargar el expediente de Control de Obras."); } finally { setLoading(false); }
    };
    void load();
  }, [id]);

  const planDocuments = useMemo(() => workspace?.documents.filter((document) => ["arquitectonico", "estructural", "electrico", "hidrosanitario", "climatizacion", "cad"].includes(document.category)) ?? [], [workspace]);
  if (loading) return <div className="p-10 text-center text-secondary">Cargando expediente operativo…</div>;
  if (error || !workspace || !id) return <div className="px-4 md:px-10 py-8 max-w-7xl mx-auto"><Link to="/control-obras/proyectos" className="text-primary hover:underline">← Volver a Control de Obras</Link><div className="glass-panel mt-6 p-8 border border-error/30 text-error">{error || "Expediente no disponible."}</div></div>;

  return <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-8"><div><Link to="/control-obras/proyectos" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-5"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Control de Obras</Link><div className="flex flex-col md:flex-row md:items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Expediente operativo real</p><h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-2">{workspace.project.title}</h1><p className="text-base text-secondary mt-3">{workspace.project.project_code} · {workspace.property?.name ?? "Propiedad CDE"}</p></div><span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">{phaseLabels[workspace.project.phase] ?? workspace.project.phase}</span></div></div><div className="bg-white rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden"><div className="flex border-b border-outline-variant/20 px-6 pt-4 bg-surface-container-lowest overflow-x-auto"><Tab active={activeTab === "expediente"} onClick={() => setActiveTab("expediente")} label="Expediente General" /><Tab active={activeTab === "planos"} onClick={() => setActiveTab("planos")} label="Planos y Visor" /><Tab active={activeTab === "reportes"} onClick={() => setActiveTab("reportes")} label="Reportes e Incidencias" /></div><div className="p-6 md:p-8">{activeTab === "expediente" && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-4"><h2 className="text-xl font-bold text-on-surface">Documentos del expediente</h2>{workspace.documents.length ? workspace.documents.map((document) => <button type="button" key={document.id} onClick={() => { setSelectedDocumentId(document.id); setActiveTab("planos"); }} className="w-full flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 text-left"><div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined">{document.category === "cad" ? "architecture" : "description"}</span></div><div className="flex-1 min-w-0"><h3 className="font-semibold text-on-surface truncate">{document.title}</h3><p className="text-xs text-secondary mt-1">{document.category.replaceAll("_", " ")} · {document.cde_state}</p></div><span className="material-symbols-outlined text-secondary">arrow_forward</span></button>) : <p className="text-sm text-secondary">No hay documentos cargados todavía en este expediente.</p>}</div><div className="rounded-3xl bg-surface-container-low p-6 border border-outline-variant/30"><span className="material-symbols-outlined text-4xl text-primary">fact_check</span><h3 className="text-xl font-bold text-on-surface mt-4">Solicitudes del proyecto</h3><p className="text-sm text-secondary mt-2">Las solicitudes del contratista se resuelven desde la bandeja de Control de Obras y quedan auditadas en el expediente.</p><Link to="/control-obras" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary">Abrir bandeja <span className="material-symbols-outlined text-base">arrow_forward</span></Link></div></div>}{activeTab === "planos" && <PlanSetViewer documents={planDocuments} />}{activeTab === "reportes" && <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-on-surface">Incidencias reales</h2><p className="text-sm text-secondary mt-1">Registros persistentes de seguridad, ejecución y control.</p></div><span className="rounded-full bg-error/10 text-error px-3 py-1.5 text-xs font-semibold">{incidents.length} registros</span></div>{incidents.length ? incidents.map((incident) => <div key={incident.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-on-surface">{incident.title}</h3><p className="text-sm text-secondary mt-2">{incident.description}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${incident.severity === "critical" || incident.severity === "high" ? "bg-error/10 text-error" : incident.status === "resolved" || incident.status === "closed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{incident.status}</span></div></div>) : <div className="rounded-2xl bg-surface-container-low p-8 text-center text-secondary">No hay incidencias registradas en este expediente.</div>}</div>}</div></div><div className="mt-8"><ControlRequestsPanel /></div></div>;
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${active ? "text-primary border-primary" : "text-secondary font-medium hover:text-primary border-transparent"}`}>{label}</button>; }
