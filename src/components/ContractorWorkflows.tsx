import { useState, type FormEvent } from "react";
import { useSession } from "../context/SessionContext";
import { requireSupabase } from "../lib/supabase";

interface ContractorWorkflowsProps {
  projectId: string;
}

export function ContractorWorkflows({ projectId }: ContractorWorkflowsProps) {
  const { profile } = useSession();
  const [active, setActive] = useState<"inicio_obra" | "inspeccion" | "bitacora" | null>(null);
  const [inspectionType, setInspectionType] = useState("inspeccion_tecnica");
  const [requestedDate, setRequestedDate] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState("38");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const reset = () => { setActive(null); setDescription(""); setTitle(""); setRequestedDate(""); setFeedback(""); setError(""); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile?.id || !active) return;
    setBusy(true); setError(""); setFeedback("");
    try {
      const client = requireSupabase();
      if (active === "bitacora") {
        const { error: insertError } = await client.from("logbook_entries").insert({ project_id: projectId, author_id: profile.id, title: title.trim() || "Avance de obra", description: description.trim(), progress_percent: Number(progress), entry_date: new Date().toISOString().slice(0, 10) });
        if (insertError) throw insertError;
        setFeedback("Entrada de bitácora guardada en el expediente.");
      } else {
        const requestType = active === "inicio_obra" ? "inicio_obra" : inspectionType;
        const { error: insertError } = await client.from("contractor_requests").insert({ project_id: projectId, requested_by: profile.id, request_type: requestType, requested_date: requestedDate || null, description: description.trim() || null, status: "submitted" });
        if (insertError) throw insertError;
        setFeedback(active === "inicio_obra" ? "Solicitud de inicio de obra enviada." : "Solicitud de inspección enviada a Control de Obras.");
      }
      setDescription(""); setTitle(""); setRequestedDate("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible registrar la solicitud."); } finally { setBusy(false); }
  };

  return (
    <section className="mb-8 rounded-3xl border border-outline-variant/30 bg-white p-6 md:p-7 soft-shadow">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Flujos persistentes</p><h2 className="text-2xl font-bold text-primary mt-2">Operaciones del contratista</h2><p className="text-sm text-secondary mt-2">Las solicitudes quedan asociadas al expediente y visibles para Control de Obras.</p></div><span className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1.5 font-semibold">Proyecto activo</span></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WorkflowButton icon="play_circle" label="Solicitar Inicio de Obra" onClick={() => { setActive("inicio_obra"); setFeedback(""); }} />
        <WorkflowButton icon="fact_check" label="Solicitar Inspección" onClick={() => { setActive("inspeccion"); setFeedback(""); }} />
        <WorkflowButton icon="edit_note" label="Añadir a Bitácora" onClick={() => { setActive("bitacora"); setFeedback(""); }} />
      </div>
      {active && <form onSubmit={submit} className="mt-6 rounded-2xl bg-surface-container-low p-5 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-on-surface">{active === "inicio_obra" ? "Solicitar inicio de obra" : active === "inspeccion" ? "Solicitar inspección" : "Registrar avance físico"}</h3><button type="button" onClick={reset} className="text-secondary hover:text-primary"><span className="material-symbols-outlined">close</span></button></div>
        {active === "inspeccion" && <label className="block text-sm text-secondary">Tipo de inspección<select value={inspectionType} onChange={(event) => setInspectionType(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-on-surface"><option value="inspeccion_tecnica">Inspección técnica</option><option value="inspeccion_topografica">Inspección topográfica</option></select></label>}
        {active === "bitacora" && <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="text-sm text-secondary">Título<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3" placeholder="Ej. Vaciado de losa" /></label><label className="text-sm text-secondary">Avance físico (%)<input type="number" min="0" max="100" value={progress} onChange={(event) => setProgress(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3" /></label></div>}
        {active !== "bitacora" && <label className="block text-sm text-secondary">Fecha solicitada<input type="date" value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3" /></label>}
        <label className="block text-sm text-secondary">Descripción<textarea required={active === "bitacora"} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full min-h-24 rounded-xl border border-outline-variant/40 bg-white px-4 py-3" placeholder="Describe el alcance, ubicación o avance…" /></label>
        {error && <p className="text-sm text-error">{error}</p>}{feedback && <p className="text-sm text-success">{feedback}</p>}
        <div className="flex justify-end"><button type="submit" disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Guardando…" : "Enviar al expediente"}</button></div>
      </form>}
    </section>
  );
}

function WorkflowButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"><span className="material-symbols-outlined text-primary">{icon}</span><span className="text-sm font-semibold text-on-surface">{label}</span><span className="material-symbols-outlined text-secondary text-base ml-auto">arrow_forward</span></button>;
}
