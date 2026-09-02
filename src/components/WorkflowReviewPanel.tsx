import { useEffect, useMemo, useState } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { getProjectWorkspace, submitWorkflowReview, type ProjectWorkspace } from "../lib/cde-data";
import type { DocumentRecord } from "../lib/cde-types";

const stageLabels: Record<string, string> = {
  autorizacion: "Carta de autorización",
  anteproyecto: "Anteproyecto y documentación arquitectónica",
  directorio: "Revisión del Directorio",
  planos_tecnicos: "Planos técnicos",
};

const anteprojectCategories = ["anteproyecto", "planta_conjunto", "planta_nivel", "elevaciones", "secciones", "curvas_nivel", "memoria_descriptiva", "anexos"];
const technicalCategories = ["arquitectonico", "estructural", "electrico", "hidrosanitario", "climatizacion", "memoria_descriptiva", "anexos"];

const categoryMeta: Record<string, { label: string; icon: string; formats: string }> = {
  autorizacion: { label: "Carta de autorización", icon: "verified", formats: "PDF" },
  anteproyecto: { label: "Anteproyecto general", icon: "description", formats: "PDF" },
  planta_conjunto: { label: "Planta de conjunto", icon: "grid_view", formats: "PDF · DWG" },
  planta_nivel: { label: "Plantas por nivel", icon: "layers", formats: "PDF · DWG" },
  elevaciones: { label: "Elevaciones", icon: "view_stream", formats: "PDF · DWG" },
  secciones: { label: "Secciones", icon: "vertical_split", formats: "PDF · DWG" },
  curvas_nivel: { label: "Curvas de nivel", icon: "terrain", formats: "PDF · DWG" },
  arquitectonico: { label: "Planos arquitectónicos", icon: "architecture", formats: "PDF · DWG" },
  estructural: { label: "Planos estructurales", icon: "foundation", formats: "PDF · DWG" },
  electrico: { label: "Planos eléctricos", icon: "bolt", formats: "PDF · DWG" },
  hidrosanitario: { label: "Planos hidrosanitarios", icon: "plumbing", formats: "PDF · DWG" },
  climatizacion: { label: "Climatización", icon: "ac_unit", formats: "PDF · DWG" },
  memoria_descriptiva: { label: "Memoria descriptiva", icon: "article", formats: "PDF · DOCX" },
  anexos: { label: "Anexos", icon: "attachment", formats: "Imágenes · Modelos · ZIP" },
};

const decisionLabels: Record<string, string> = { aprobado: "Aprobado", comentado: "Comentado", devuelto: "Devuelto", rechazado: "Rechazado" };

function categoryInfo(category: string) {
  return categoryMeta[category] ?? { label: category.replaceAll("_", " "), icon: "description", formats: "Archivo" };
}

function documentCategory(document: DocumentRecord) {
  return document.category || "anexos";
}

function groupDocuments(documents: DocumentRecord[]) {
  return documents.reduce<Record<string, DocumentRecord[]>>((groups, document) => {
    const category = documentCategory(document);
    groups[category] = [...(groups[category] ?? []), document];
    return groups;
  }, {});
}

export function WorkflowReviewPanel({ projectId }: { projectId: string }) {
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"comentado" | "devuelto" | "aprobado" | "rechazado">("aprobado");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activeTool, setActiveTool] = useState("select");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const nextWorkspace = await getProjectWorkspace(projectId);
      setWorkspace(nextWorkspace);
      setSelectedDocumentId((current) => current && nextWorkspace.documents.some((document) => document.id === current) ? current : nextWorkspace.documents[0]?.id ?? null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar la revisión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [projectId]);

  const stage = useMemo(() => {
    if (!workspace || workspace.project.phase === "autorizacion_inicial") return "autorizacion";
    if (workspace.project.phase === "anteproyecto") return "anteproyecto";
    if (workspace.project.phase === "directorio") return "directorio";
    return "planos_tecnicos";
  }, [workspace]);

  const relevantDocuments = useMemo(() => {
    if (!workspace) return [];
    const categories = stage === "autorizacion" ? ["autorizacion"] : ["anteproyecto", "directorio"].includes(stage) ? anteprojectCategories : technicalCategories;
    return workspace.documents.filter((document) => categories.includes(document.category) && document.current_version_id);
  }, [stage, workspace]);

  const groups = useMemo(() => groupDocuments(relevantDocuments), [relevantDocuments]);
  const selectedDocument = relevantDocuments.find((document) => document.id === selectedDocumentId) ?? relevantDocuments[0] ?? null;
  const selectedInfo = selectedDocument ? categoryInfo(documentCategory(selectedDocument)) : null;

  useEffect(() => {
    if (relevantDocuments.length && !relevantDocuments.some((document) => document.id === selectedDocumentId)) setSelectedDocumentId(relevantDocuments[0].id);
  }, [relevantDocuments, selectedDocumentId]);

  const submit = async () => {
    if (!selectedDocument?.current_version_id) {
      setError("Selecciona un documento versionado antes de emitir el dictamen.");
      return;
    }
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await submitWorkflowReview({ projectId, documentVersionId: selectedDocument.current_version_id, workflowStage: stage as "autorizacion" | "anteproyecto" | "directorio" | "planos_tecnicos", decision, comment });
      setFeedback(decision === "aprobado" ? "Aprobación guardada. El expediente avanzó según el workflow." : "Dictamen guardado en el expediente.");
      setComment("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible guardar el dictamen.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="glass-panel p-8 text-center text-secondary">Preparando espacio de revisión…</div>;
  if (error && !workspace) return <div className="glass-panel p-8 border border-error/30 text-error">{error}</div>;

  return (
    <section className="overflow-hidden rounded-[28px] border border-outline-variant/30 bg-[#eef0f2] shadow-sm">
      <header className="flex flex-col gap-4 border-b border-outline-variant/30 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-lg bg-primary px-2 py-1 text-white">architecture</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-primary">{workspace?.project.title}</p><p className="truncate text-xs text-secondary">{workspace?.project.project_code} · {stageLabels[stage]}</p></div>
            <span className="rounded-full border border-outline-variant/50 px-2.5 py-1 text-xs font-semibold text-secondary">Vigente</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-secondary"><button type="button" className="rounded-lg p-2 hover:bg-surface-container-low" title="Buscar planos"><span className="material-symbols-outlined">search</span></button><button type="button" className="rounded-lg p-2 hover:bg-surface-container-low" title="Más opciones"><span className="material-symbols-outlined">more_horiz</span></button><span className="mx-1 h-6 w-px bg-outline-variant/40" /><span className="rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">{relevantDocuments.length} archivos listos</span></div>
      </header>

      <div className="grid min-h-[760px] grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_310px]">
        <aside className="border-b border-outline-variant/30 bg-[#f8f9fa] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Planos y vistas</p><p className="mt-1 text-xs text-secondary">{relevantDocuments.length} documentos versionados</p></div><span className="material-symbols-outlined text-secondary">close</span></div>
          <div className="border-b border-outline-variant/30 px-4 py-3"><div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-xs text-secondary"><span className="material-symbols-outlined text-base">search</span><span>Buscar en planos</span></div></div>
          <div className="max-h-[650px] overflow-y-auto p-3">
            {relevantDocuments.length === 0 && <div className="rounded-xl bg-warning/10 p-4 text-xs leading-5 text-warning">No hay planos versionados listos para esta etapa. El arquitecto debe someter el paquete documental.</div>}
            {(Object.entries(groups) as [string, DocumentRecord[]][]).map(([category, documents]) => {
              const info = categoryInfo(category);
              return <div key={category} className="mb-4"><div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-secondary"><span className="material-symbols-outlined text-base">{info.icon}</span>{info.label}</div>{documents.map((document, index) => <button key={document.id} type="button" onClick={() => setSelectedDocumentId(document.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors ${selectedDocument?.id === document.id ? "border-primary/40 bg-white shadow-sm" : "border-transparent hover:border-outline-variant/40 hover:bg-white"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-container-low text-primary"><span className="material-symbols-outlined text-xl">{info.icon}</span></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-on-surface">{document.title}</span><span className="mt-1 block truncate text-[10px] text-secondary">{info.formats} · V{index + 1}</span></span></button>)}</div>;
            })}
          </div>
        </aside>

        <main className="relative flex min-h-[620px] flex-col bg-[#dfe2e5]">
          <div className="flex items-center justify-between border-b border-black/10 bg-[#eceeef] px-4 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => setActiveTool("select")} className={`rounded-lg p-2 ${activeTool === "select" ? "bg-primary text-white" : "text-secondary hover:bg-white"}`} title="Seleccionar"><span className="material-symbols-outlined">near_me</span></button><button type="button" onClick={() => setActiveTool("pan")} className={`rounded-lg p-2 ${activeTool === "pan" ? "bg-primary text-white" : "text-secondary hover:bg-white"}`} title="Encuadrar"><span className="material-symbols-outlined">pan_tool</span></button><button type="button" onClick={() => setActiveTool("comment")} className={`rounded-lg p-2 ${activeTool === "comment" ? "bg-primary text-white" : "text-secondary hover:bg-white"}`} title="Anotar en PDF"><span className="material-symbols-outlined">edit_note</span></button><span className="mx-2 h-6 w-px bg-black/10" /><span className="text-xs text-secondary">{selectedInfo?.label ?? "Selecciona un plano"}</span></div><div className="flex items-center gap-2 text-secondary"><button type="button" className="rounded-lg p-2 hover:bg-white" title="Ajustar vista"><span className="material-symbols-outlined">fit_screen</span></button><button type="button" className="rounded-lg p-2 hover:bg-white" title="Medir (vista CAD)"><span className="material-symbols-outlined">straighten</span></button><button type="button" className="rounded-lg p-2 hover:bg-white" title="Configuración"><span className="material-symbols-outlined">settings</span></button></div></div>
          <div className="flex-1 overflow-auto p-4 md:p-6"><div className="mx-auto max-w-[900px]">{selectedDocument ? <DocumentViewer documentId={selectedDocument.id} /> : <div className="grid min-h-[560px] place-items-center rounded-2xl border border-dashed border-black/20 bg-[#eef0f2] text-center text-secondary"><div><span className="material-symbols-outlined text-5xl">architecture</span><p className="mt-3 text-sm">Selecciona un plano desde Planos y vistas.</p></div></div>}</div></div>
          <div className="flex items-center justify-center gap-2 border-t border-black/10 bg-[#eceeef] px-4 py-3 text-secondary"><button type="button" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold shadow-sm">Página 1</button><span className="text-xs">·</span><span className="text-xs">Vista de revisión</span></div>
        </main>

        <aside className="border-t border-outline-variant/30 bg-white lg:border-l lg:border-t-0">
          <div className="border-b border-outline-variant/30 px-5 py-4"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Revisión técnica</p><h3 className="mt-1 text-lg font-bold text-primary">{selectedDocument?.title ?? "Sin documento seleccionado"}</h3><p className="mt-1 text-xs text-secondary">{selectedInfo?.label ?? "Esperando documentación"} · {selectedInfo?.formats ?? ""}</p></div>
          <div className="space-y-5 p-5"><div className="rounded-xl bg-surface-container-low p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-secondary">Estado del archivo</span><span className="flex items-center gap-1 text-xs font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success" />Versionado</span></div><p className="mt-3 text-xs leading-5 text-secondary">La revisión se registra sobre la versión vigente, el plano seleccionado y la etapa actual del expediente.</p></div><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">Checklist de revisión</p><label className="flex items-center gap-3 border-b border-outline-variant/20 py-3 text-sm text-on-surface"><input type="checkbox" className="h-4 w-4 accent-primary" /> Escala y rotulación</label><label className="flex items-center gap-3 border-b border-outline-variant/20 py-3 text-sm text-on-surface"><input type="checkbox" className="h-4 w-4 accent-primary" /> Coherencia del plano</label><label className="flex items-center gap-3 py-3 text-sm text-on-surface"><input type="checkbox" className="h-4 w-4 accent-primary" /> Observaciones documentadas</label></div><div><label className="text-xs font-bold uppercase tracking-wider text-secondary">Dictamen<select value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-3 py-2.5 text-sm text-on-surface">{Object.entries(decisionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comentario o condición de aprobación" className="mt-3 min-h-28 w-full rounded-xl border border-outline-variant/40 bg-white p-3 text-sm text-on-surface outline-none focus:border-primary" /><button type="button" disabled={busy || !selectedDocument} onClick={() => void submit()} className="mt-3 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Guardando dictamen…" : "Guardar dictamen"}</button>{error && <p className="mt-3 text-xs text-error">{error}</p>}{feedback && <p className="mt-3 text-xs text-success">{feedback}</p>}</div></div>
        </aside>
      </div>
    </section>
  );
}
