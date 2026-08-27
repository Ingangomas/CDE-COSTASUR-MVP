import { useEffect, useState } from "react";
import { formatDate, getContractorProjectRequests, reviewContractorProjectRequest } from "../lib/cde-data";
import type { ContractorProjectRequestRecord } from "../lib/cde-data";

type Department = "legal" | "control_obras";

const typeLabels: Record<ContractorProjectRequestRecord["project_type"], string> = {
  obra_mayor: "Obra mayor",
  remodelacion: "Remodelación",
  reparacion: "Reparaciones",
  mantenimiento: "Mantenimiento",
};

const statusLabels: Record<string, string> = {
  submitted: "Recibida",
  in_review: "En revisión",
  approved: "Validada",
  rejected: "Rechazada",
};

function statusClass(status: string) {
  if (status === "approved") return "bg-success/10 text-success";
  if (status === "rejected") return "bg-error/10 text-error";
  if (status === "in_review") return "bg-warning/10 text-warning";
  return "bg-primary/10 text-primary";
}

export function ContractorProjectRequestsPanel({ department }: { department: Department }) {
  const [requests, setRequests] = useState<ContractorProjectRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const isLegal = department === "legal";

  const load = async () => {
    setError("");
    try {
      setRequests(await getContractorProjectRequests());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar las solicitudes nuevas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const review = async (requestId: string, status: "in_review" | "approved" | "rejected") => {
    setBusyId(requestId);
    setError("");
    try {
      await reviewContractorProjectRequest({ requestId, department, status });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible actualizar la solicitud.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-3xl border border-primary/15 bg-surface-container-lowest p-6 shadow-sm lg:col-span-8">
      <div className="flex flex-col justify-between gap-3 border-b border-outline-variant/20 pb-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Flujo separado del contratista</p>
          <h3 className="mt-2 text-2xl font-bold text-on-surface">Solicitudes de nuevo proyecto</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">{isLegal ? "Revisa y valida únicamente los datos del propietario. Esta revisión es independiente de la validación del contratista." : "Revisa y valida únicamente los datos del contratista y su compañía. El proyecto aparecerá después de ambas validaciones."}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{requests.length} solicitudes</span>
      </div>

      {loading && <p className="py-8 text-sm text-secondary">Cargando solicitudes…</p>}
      {error && <div className="mt-5 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}
      {!loading && !error && !requests.length && <div className="mt-5 rounded-2xl border border-dashed border-outline-variant/40 p-8 text-center"><span className="material-symbols-outlined text-3xl text-secondary">inbox</span><p className="mt-3 text-sm text-secondary">No hay solicitudes nuevas de contratistas.</p></div>}
      {!loading && requests.length > 0 && <div className="mt-5 space-y-4">{requests.map((request) => {
        const departmentStatus = isLegal ? request.legal_status : request.control_status;
        const canReview = departmentStatus !== "approved" && departmentStatus !== "rejected";
        return <article key={request.id} className="rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-on-surface">{request.project_title}</h4><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-secondary">{typeLabels[request.project_type]}</span></div><p className="mt-1 text-sm text-secondary">{request.property_reference} · enviada {formatDate(request.created_at)}</p></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(departmentStatus)}`}>{isLegal ? "Legal: " : "Control: "}{statusLabels[departmentStatus] ?? departmentStatus}</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Propietario</p><p className="mt-1 text-on-surface">{request.owner_name}</p><p className="text-secondary">{request.owner_email}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Contratista / compañía</p><p className="mt-1 text-on-surface">{request.contractor_name} · {request.company_name}</p><p className="text-secondary">{request.contractor_email}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Tiempo estimado</p><p className="mt-1 text-on-surface">{request.estimated_duration}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Validación conjunta</p><p className="mt-1 text-secondary">Legal: {statusLabels[request.legal_status]} · Control: {statusLabels[request.control_status]}</p></div></div>
          <div className="mt-4 rounded-xl bg-white p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Partidas a ejecutar</p><p className="mt-1 whitespace-pre-wrap text-on-surface">{request.work_items}</p></div>
          {request.project_id && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success"><span className="material-symbols-outlined text-[18px]">check_circle</span>Ambas validaciones completadas; proyecto creado en Control de Obras.</p>}
          {canReview && <div className="mt-5 flex flex-wrap gap-2 border-t border-outline-variant/20 pt-4"><button type="button" disabled={busyId === request.id} onClick={() => void review(request.id, "in_review")} className="rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-semibold text-secondary disabled:opacity-50">Marcar en revisión</button><button type="button" disabled={busyId === request.id} onClick={() => void review(request.id, "rejected")} className="rounded-full border border-error/30 px-4 py-2 text-xs font-semibold text-error disabled:opacity-50">Rechazar</button><button type="button" disabled={busyId === request.id} onClick={() => void review(request.id, "approved")} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50">{busyId === request.id ? "Guardando…" : isLegal ? "Validar datos del propietario" : "Validar contratista"}</button></div>}
        </article>;
      })}</div>}
    </section>
  );
}

export default ContractorProjectRequestsPanel;
