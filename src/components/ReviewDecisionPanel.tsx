import { useEffect, useState, type FormEvent } from "react";
import { useSession } from "../context/SessionContext";
import { requireSupabase } from "../lib/supabase";

interface ReviewDecisionPanelProps {
  projectId: string;
  departmentSlug: string;
  departmentName: string;
}

export function ReviewDecisionPanel({ projectId, departmentSlug, departmentName }: ReviewDecisionPanelProps) {
  const { profile } = useSession();
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [documentVersionId, setDocumentVersionId] = useState<string | null>(null);
  const [decision, setDecision] = useState("comentado");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const client = requireSupabase();
        const [{ data: department, error: departmentError }, { data: documents, error: documentsError }] = await Promise.all([
          client.from("departments").select("id").eq("slug", departmentSlug).maybeSingle(),
          client.from("documents").select("current_version_id").eq("project_id", projectId).not("current_version_id", "is", null).limit(1),
        ]);
        if (departmentError) throw departmentError;
        if (documentsError) throw documentsError;
        setDepartmentId(department?.id ?? null);
        setDocumentVersionId(documents?.[0]?.current_version_id ?? null);
      } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible preparar la revisión."); }
    };
    void load();
  }, [departmentSlug, projectId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile?.id || !departmentId || !documentVersionId || !comment.trim()) { setError("Necesitas un documento versionado y un comentario para emitir el dictamen."); return; }
    setBusy(true); setError(""); setFeedback("");
    try {
      const client = requireSupabase();
      const { error: insertError } = await client.from("reviews").insert({ project_id: projectId, document_version_id: documentVersionId, department_id: departmentId, reviewer_id: profile.id, decision, comment: comment.trim() });
      if (insertError) throw insertError;
      setFeedback(`Dictamen ${decision} guardado para ${departmentName}.`); setComment("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible guardar el dictamen."); } finally { setBusy(false); }
  };

  return <form onSubmit={submit} className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-4"><div><p className="text-xs uppercase tracking-[0.16em] text-secondary">Revisión persistente</p><h3 className="text-lg font-semibold text-on-surface mt-2">Emitir dictamen · {departmentName}</h3><p className="text-xs text-secondary mt-1">Se aplicará al primer documento versionado disponible del expediente.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-sm text-secondary">Decisión<select value={decision} onChange={(event) => setDecision(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-on-surface"><option value="comentado">Comentado</option><option value="aprobado">Aprobado</option><option value="devuelto">Devuelto</option><option value="rechazado">Rechazado</option></select></label><div className="rounded-xl bg-white px-4 py-3 text-sm text-secondary flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${documentVersionId ? "bg-success" : "bg-warning"}`} />{documentVersionId ? "Documento versionado listo" : "Esperando documento versionado"}</div></div><textarea required value={comment} onChange={(event) => setComment(event.target.value)} placeholder={`Escriba el dictamen o resolución técnica para ${departmentName}…`} className="w-full min-h-28 rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary" />{error && <p className="text-sm text-error">{error}</p>}{feedback && <p className="text-sm text-success">{feedback}</p>}<div className="flex justify-end"><button type="submit" disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Guardando…" : "Guardar dictamen"}</button></div></form>;
}
