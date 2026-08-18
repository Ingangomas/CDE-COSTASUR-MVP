import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLiveMetrics } from "../components/AdminLiveMetrics";
import { AdminLiveOperations } from "../components/AdminLiveOperations";
import { getAdminProjects, getProjectsForUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { useSession } from "../context/SessionContext";

const roleLabels: Record<string, string> = {
  admin: "Administrador General",
  arquitecto: "Arquitecto",
  contratista: "Contratista",
  "revision-tecnica": "Arquitectura",
  "control-obras": "Control de Obras",
  legal: "Departamento Legal",
  electrica: "Ingeniería Eléctrica",
  hidrosanitaria: "Ingeniería Hidrosanitaria",
  paisajismo: "Paisajismo",
  mensura: "Mensura",
  seguridad: "Seguridad y Guardianes",
};

const statusLabel = (status: string) => ({
  obra_activa: "Obra activa",
  en_revision: "En revisión",
  pendiente_inspeccion: "Pendiente de inspección",
  critica: "Crítica",
  paralizada: "Paralizada",
  finalizada: "Finalizada",
  aprobado: "Aprobada",
}[status] ?? status.replaceAll("_", " "));

export function DashboardAnalytics({ role }: { role: string }) {
  const { session } = useSession();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    let active = true;
    setLoading(true);
    const request = role === "admin" ? getAdminProjects() : getProjectsForUser(session.user.id);
    void request
      .then((rows) => { if (active) setProjects(rows); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los expedientes."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role, session?.user.id]);

  const summary = useMemo(() => ({
    active: projects.filter((project) => project.operational_status === "obra_activa").length,
    review: projects.filter((project) => project.operational_status === "en_revision" || project.phase === "revision_tecnica").length,
    inspection: projects.filter((project) => project.operational_status === "pendiente_inspeccion").length,
    finalised: projects.filter((project) => project.operational_status === "finalizada").length,
    average: projects.length ? Math.round(projects.reduce((total, project) => total + Number(project.progress_percent || 0), 0) / projects.length) : 0,
  }), [projects]);

  const title = roleLabels[role] ?? role.replaceAll("-", " ");
  const description = role === "admin"
    ? "Visión global de expedientes y operaciones persistidas en Costasur."
    : "Estado real de los expedientes asignados a este usuario o departamento.";

  return (
    <div className="min-h-full flex-1 overflow-y-auto bg-surface-container-low p-4 pt-8 md:p-10">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">CDE Costasur</p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Dashboard {title}</h2>
          <p className="mt-2 text-lg text-secondary">{description}</p>
        </header>

        {role === "admin" && <div className="space-y-6"><AdminLiveMetrics /><AdminLiveOperations /></div>}

        {loading && <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-sm text-secondary">Cargando expedientes persistidos...</div>}
        {error && <div className="rounded-3xl border border-error/30 bg-error/10 p-8 text-sm text-error">{error}</div>}
        {!loading && !error && (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                ["Expedientes", projects.length, "folder_open", "text-primary"],
                ["Obras activas", summary.active, "construction", "text-primary"],
                ["En revisión", summary.review, "rate_review", "text-warning"],
                ["Inspección", summary.inspection, "fact_check", "text-warning"],
                ["Avance físico", `${summary.average}%`, "trending_up", "text-success"],
              ].map(([label, value, icon, tone]) => (
                <div key={String(label)} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                  <span className={`material-symbols-outlined ${tone} text-[20px]`}>{icon}</span>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-secondary">{label}</p>
                  <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Operación persistente</p>
                  <h3 className="mt-2 text-xl font-bold text-primary">Expedientes asignados</h3>
                </div>
                <span className="text-xs text-secondary">{summary.finalised} finalizados</span>
              </div>
              <div className="mt-5 space-y-3">
                {projects.slice(0, 8).map((project) => (
                  <Link key={project.id} to={role === "admin" ? `/admin/proyectos/${project.id}` : `/${role}/mis-proyectos`} className="block rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 transition-colors hover:border-primary/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-on-surface">{project.title}</p>
                        <p className="mt-1 text-xs text-secondary">{project.project_code} · {project.phase.replaceAll("_", " ")}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:justify-end">
                        <span className="text-xs font-semibold text-primary">{statusLabel(project.operational_status)}</span>
                        <div className="w-24">
                          <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant"><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress_percent}%` }} /></div>
                          <p className="mt-1 text-right text-[10px] text-secondary">{project.progress_percent}% físico</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {!projects.length && <p className="rounded-xl bg-surface-container-low p-5 text-sm text-secondary">No hay expedientes asignados para este usuario.</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
