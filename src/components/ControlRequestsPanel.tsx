import { useEffect, useState } from "react";
import { requireSupabase } from "../lib/supabase";
import { resolveContractorRequest } from "../lib/cde-data";

interface RequestRow {
  id: string;
  request_type: string;
  status: string;
  requested_date: string | null;
  description: string | null;
  created_at: string;
  project_id: string;
  projects?: { title?: string } | null;
}

const requestLabels: Record<string, string> = { inicio_obra: "Inicio de obra", inspeccion_topografica: "Inspección topográfica", inspeccion_tecnica: "Inspección técnica", vaciado_hormigon: "Vaciado de hormigón", solicitud_departamento: "Solicitud departamental", otro: "Otra solicitud" };
const statusLabels: Record<string, string> = { submitted: "Enviada", in_review: "En revisión", scheduled: "Programada", approved: "Aprobada", rejected: "Rechazada", completed: "Completada", cancelled: "Cancelada" };

export function ControlRequestsPanel() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const client = requireSupabase();
      const { data, error: queryError } = await client.from("contractor_requests").select("id,request_type,status,requested_date,description,created_at,project_id,projects(title)").order("created_at", { ascending: false }).limit(20);
      if (queryError) throw queryError;
      setRequests((data ?? []) as RequestRow[]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible cargar las solicitudes."); } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const resolve = async (request: RequestRow, status: "in_review" | "scheduled" | "approved" | "rejected") => {
    setBusyId(request.id); setError(""); setFeedback("");
    try {
      await resolveContractorRequest({ requestId: request.id, status, comment: status === "rejected" ? "Solicitud devuelta para corrección por Control de Obras." : undefined });
      setFeedback(status === "approved" ? "Solicitud aprobada y workflow actualizado." : status === "scheduled" ? "Inspección programada en el expediente." : `Solicitud marcada como ${statusLabels[status].toLowerCase()}.`);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible actualizar la solicitud."); } finally { setBusyId(null); }
  };

  return <section className="lg:col-span-8 glass-panel rounded-3xl p-6 soft-shadow"><div className="flex items-center justify-between gap-3 mb-6"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Bandeja operativa</p><h3 className="text-2xl font-bold text-primary mt-2">Solicitudes de contratistas</h3></div><span className="rounded-full bg-warning/10 text-warning px-3 py-1.5 text-xs font-semibold">{requests.length} recientes</span></div>{loading && <p className="text-sm text-secondary">Cargando solicitudes…</p>}{error && <p className="text-sm text-error mb-4">{error}</p>}{feedback && <p className="text-sm text-success mb-4">{feedback}</p>}{!loading && !error && !requests.length && <p className="text-sm text-secondary">No hay solicitudes pendientes.</p>}<div className="space-y-3">{requests.map((request) => <div key={request.id} className="rounded-2xl border border-outline-variant/30 bg-white p-4"><div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-semibold text-on-surface">{requestLabels[request.request_type] ?? request.request_type}</p><p className="text-xs text-secondary mt-1 truncate">{request.projects?.title ?? "Proyecto"}</p>{request.description && <p className="text-xs text-secondary mt-2 line-clamp-2">{request.description}</p>}</div><div className="flex items-center gap-3 shrink-0"><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${request.status === "rejected" ? "bg-error/10 text-error" : request.status === "approved" || request.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{statusLabels[request.status] ?? request.status}</span><span className="text-xs text-secondary">{request.requested_date ?? "Sin fecha"}</span></div></div>{["submitted", "in_review"].includes(request.status) && <div className="flex flex-wrap justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20"><button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "in_review")} className="rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-50">En revisión</button>{request.request_type.startsWith("inspeccion_") && <button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "scheduled")} className="rounded-full bg-warning/10 px-4 py-2 text-xs font-semibold text-warning hover:bg-warning/20 disabled:opacity-50">Programar inspección</button>}<button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "approved")} className="rounded-full bg-success/10 px-4 py-2 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50">{busyId === request.id ? "Guardando…" : "Aprobar"}</button><button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "rejected")} className="rounded-full bg-error/10 px-4 py-2 text-xs font-semibold text-error hover:bg-error/20 disabled:opacity-50">Rechazar</button></div>}</div>)}</div></section>;
}
