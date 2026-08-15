import { useEffect, useState } from "react";
import { requireSupabase } from "../lib/supabase";

interface RequestRow {
  id: string;
  request_type: string;
  status: string;
  requested_date: string | null;
  description: string | null;
  created_at: string;
  projects?: { title?: string } | null;
}

const requestLabels: Record<string, string> = { inicio_obra: "Inicio de obra", inspeccion_topografica: "Inspección topográfica", inspeccion_tecnica: "Inspección técnica", vaciado_hormigon: "Vaciado de hormigón", solicitud_departamento: "Solicitud departamental", otro: "Otra solicitud" };
const statusLabels: Record<string, string> = { submitted: "Enviada", in_review: "En revisión", scheduled: "Programada", approved: "Aprobada", rejected: "Rechazada", completed: "Completada", cancelled: "Cancelada" };

export function ControlRequestsPanel() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const client = requireSupabase();
        const { data, error: queryError } = await client.from("contractor_requests").select("id,request_type,status,requested_date,description,created_at,project_id,projects(title)").order("created_at", { ascending: false }).limit(8);
        if (queryError) throw queryError;
        setRequests((data ?? []) as RequestRow[]);
      } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible cargar las solicitudes."); } finally { setLoading(false); }
    };
    void load();
  }, []);

  return <section className="lg:col-span-8 glass-panel rounded-3xl p-6 soft-shadow"><div className="flex items-center justify-between gap-3 mb-6"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Bandeja operativa</p><h3 className="text-2xl font-bold text-primary mt-2">Solicitudes de contratistas</h3></div><span className="rounded-full bg-warning/10 text-warning px-3 py-1.5 text-xs font-semibold">{requests.length} recientes</span></div>{loading && <p className="text-sm text-secondary">Cargando solicitudes…</p>}{error && <p className="text-sm text-error">{error}</p>}{!loading && !error && !requests.length && <p className="text-sm text-secondary">No hay solicitudes pendientes.</p>}<div className="space-y-3">{requests.map((request) => <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-outline-variant/30 bg-white p-4"><div className="min-w-0"><p className="text-sm font-semibold text-on-surface">{requestLabels[request.request_type] ?? request.request_type}</p><p className="text-xs text-secondary mt-1 truncate">{request.projects?.title ?? "Proyecto"}</p>{request.description && <p className="text-xs text-secondary mt-2 line-clamp-1">{request.description}</p>}</div><div className="flex items-center gap-3 shrink-0"><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${request.status === "rejected" ? "bg-error/10 text-error" : request.status === "approved" || request.status === "completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{statusLabels[request.status] ?? request.status}</span><span className="text-xs text-secondary">{request.requested_date ?? "Sin fecha"}</span></div></div>)}</div></section>;
}
