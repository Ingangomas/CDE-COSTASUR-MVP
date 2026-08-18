import { useEffect, useMemo, useState } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { getProjectWorkspace, submitWorkflowReview, type ProjectWorkspace } from "../lib/cde-data";

const stageLabels: Record<string, string> = { autorizacion: "Carta de autorización", anteproyecto: "Anteproyecto", planos_tecnicos: "Planos técnicos" };

export function WorkflowReviewPanel({ projectId }: { projectId: string }) {
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"comentado" | "devuelto" | "aprobado" | "rechazado">("aprobado");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const nextWorkspace = await getProjectWorkspace(projectId);
      setWorkspace(nextWorkspace);
      setSelectedDocumentId((current) => current && nextWorkspace.documents.some((document) => document.id === current) ? current : nextWorkspace.documents[0]?.id ?? null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible cargar la revisión."); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [projectId]);

  const stage = useMemo(() => {
    if (!workspace) return "autorizacion";
    if (workspace.project.phase === "autorizacion_inicial") return "autorizacion";
    if (workspace.project.phase === "anteproyecto") return "anteproyecto";
    if (workspace.project.phase === "planos_tecnicos") return "planos_tecnicos";
    return "planos_tecnicos";
  }, [workspace]);

  const relevantDocuments = useMemo(() => {
    if (!workspace) return [];
    const categories = stage === "autorizacion" ? ["autorizacion"] : stage === "anteproyecto" ? ["anteproyecto"] : ["arquitectonico", "estructural", "electrico", "hidrosanitario", "climatizacion"];
    return workspace.documents.filter((document) => categories.includes(document.category) && document.current_version_id);
  }, [stage, workspace]);

  useEffect(() => {
    if (relevantDocuments.length && !relevantDocuments.some((document) => document.id === selectedDocumentId)) setSelectedDocumentId(relevantDocuments[0].id);
  }, [relevantDocuments, selectedDocumentId]);

  const submit = async () => {
    const document = relevantDocuments.find((item) => item.id === selectedDocumentId);
    if (!document?.current_version_id) { setError("Selecciona un documento versionado antes de emitir el dictamen."); return; }
    setBusy(true); setError(""); setFeedback("");
    try {
      await submitWorkflowReview({ projectId, documentVersionId: document.current_version_id, workflowStage: stage as "autorizacion" | "anteproyecto" | "planos_tecnicos", decision, comment });
      setFeedback(decision === "aprobado" ? `Aprobación guardada. El expediente avanzó según el workflow.` : "Dictamen guardado en el expediente.");
      setComment("");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible guardar el dictamen."); } finally { setBusy(false); }
  };

  if (loading) return <div className="glass-panel p-8 text-center text-secondary">Cargando revisión documental…</div>;
  if (error && !workspace) return <div className="glass-panel p-8 border border-error/30 text-error">{error}</div>;
  return <section className="space-y-6"><div className="glass-panel bg-white p-6 md:p-7 border border-outline-variant/30"><div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Revisión de Arquitectura</p><h2 className="text-2xl font-bold text-on-surface mt-2">{stageLabels[stage]}</h2><p className="text-sm text-secondary mt-2">La decisión se registra sobre el documento versionado y mueve la fase únicamente cuando corresponde.</p></div><span className="rounded-full bg-warning/10 text-warning px-3 py-1.5 text-xs font-semibold">{relevantDocuments.length} documentos listos</span></div>{relevantDocuments.length === 0 && <div className="mt-5 rounded-2xl bg-warning/10 p-5 text-sm text-warning">No hay un documento versionado listo para esta etapa. El propietario o arquitecto debe cargarlo primero.</div>}{relevantDocuments.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6"><div className="space-y-2">{relevantDocuments.map((document) => <button type="button" key={document.id} onClick={() => setSelectedDocumentId(document.id)} className={`w-full text-left rounded-xl border p-3 ${selectedDocumentId === document.id ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/30"}`}><p className="text-sm font-semibold text-on-surface truncate">{document.title}</p><p className="text-xs text-secondary mt-1">{document.category.replaceAll("_", " ")} · versión disponible</p></button>)}<label className="block text-sm text-secondary pt-3">Decisión<select value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-3 py-2.5 text-on-surface"><option value="aprobado">Aprobado</option><option value="comentado">Comentado</option><option value="devuelto">Devuelto</option><option value="rechazado">Rechazado</option></select></label><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comentario o condición de aprobación" className="mt-3 w-full min-h-24 rounded-xl border border-outline-variant/40 bg-white p-3 text-sm text-on-surface" /><button type="button" disabled={busy} onClick={() => void submit()} className="mt-3 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Guardando dictamen…" : "Guardar dictamen"}</button>{error && <p className="text-sm text-error mt-3">{error}</p>}{feedback && <p className="text-sm text-success mt-3">{feedback}</p>}</div><div className="lg:col-span-2">{selectedDocumentId ? <DocumentViewer documentId={selectedDocumentId} /> : <div className="glass-panel p-8 text-center text-secondary">Selecciona un documento.</div>}</div></div>}</div></section>;
}
