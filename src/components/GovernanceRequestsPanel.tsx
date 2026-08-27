import { useEffect, useState } from "react";
import { listGovernanceRequests, resolveGovernanceRequest, type GovernanceRequest } from "../lib/governance-data";

const typeLabels: Record<string, string> = { new_user: "Nuevo usuario", role_assignment: "Asignación de rol", ownership_transfer: "Cambio de titularidad" };
const statusLabels: Record<string, string> = { submitted: "Enviada", in_review: "En revisión", approved: "Aprobada", rejected: "Rechazada", cancelled: "Cancelada" };

export function GovernanceRequestsPanel() {
  const [requests, setRequests] = useState<GovernanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setRequests(await listGovernanceRequests()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar las solicitudes."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const resolve = async (request: GovernanceRequest, status: "approved" | "rejected") => {
    setBusyId(request.id); setNotice(""); setError("");
    try {
      await resolveGovernanceRequest(request.id, status, status === "rejected" ? "Solicitud devuelta para revisión." : "Aprobada por Gobernanza.");
      setNotice(status === "approved" ? "Solicitud aprobada y registrada." : "Solicitud rechazada y registrada.");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo resolver la solicitud."); }
    finally { setBusyId(null); }
  };

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Bandeja de Gobernanza</p><h3 className="mt-2 text-2xl font-bold text-primary">Solicitudes de usuarios y titularidad</h3><p className="mt-1 max-w-2xl text-sm text-secondary">Aquí llegan las solicitudes emitidas por Legal, Arquitectura y Control de Obras. La decisión queda registrada en el expediente.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"><span className={`material-symbols-outlined text-[17px] ${loading ? "animate-spin" : ""}`}>refresh</span>Actualizar</button></div>
      {notice && <p className="mt-4 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{notice}</p>}
      {error && <p className="mt-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
      {loading ? <div className="mt-6 rounded-2xl bg-surface-container-low p-8 text-center text-sm text-secondary">Cargando solicitudes…</div> : requests.length ? <div className="mt-5 space-y-3">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-secondary">{typeLabels[request.request_type] ?? request.request_type}</p><h4 className="mt-1 font-semibold text-on-surface">{request.target_display_name || request.target_email || "Solicitud sin destinatario"}</h4><p className="mt-1 text-xs text-secondary">{request.project?.project_code || request.property?.property_code || "Sin expediente asociado"}</p>{request.notes && <p className="mt-3 text-sm text-secondary">{request.notes}</p>}</div><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${request.status === "approved" ? "bg-success/10 text-success" : request.status === "rejected" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>{statusLabels[request.status] ?? request.status}</span></div>{["submitted", "in_review"].includes(request.status) && <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-outline-variant/20 pt-3"><button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "rejected")} className="rounded-full bg-error/10 px-4 py-2 text-xs font-semibold text-error disabled:opacity-50">Rechazar</button><button type="button" disabled={busyId === request.id} onClick={() => void resolve(request, "approved")} className="rounded-full bg-success/10 px-4 py-2 text-xs font-semibold text-success disabled:opacity-50">{busyId === request.id ? "Guardando…" : "Aprobar"}</button></div>}</article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-outline-variant/40 p-8 text-center text-sm text-secondary">No hay solicitudes de Gobernanza pendientes.</div>}
    </section>
  );
}
