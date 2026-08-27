import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectsForUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { useSession } from "../context/SessionContext";
import { CasaDeCampoMap } from "../components/CasaDeCampoMap";
import { SupervisorPropertyInventory } from "../components/SupervisorPropertyInventory";
import { ContractorProjectRequestsPanel } from "../components/ContractorProjectRequestsPanel";

export function DepartmentDashboard({ department, icon, type, deptKey }: { department: string; icon: string; type: string; deptKey?: string }) {
  const { session } = useSession();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const targetPrefix = deptKey ?? "revision-tecnica";
  const hasPropertyOverview = ["electrica", "hidrosanitaria"].includes(targetPrefix);

  useEffect(() => {
    if (!session?.user.id) return;
    let active = true;
    void getProjectsForUser(session.user.id)
      .then((rows) => { if (active) setProjects(rows); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los expedientes."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.user.id]);

  const summary = useMemo(() => ({
    total: projects.length,
    review: projects.filter((project) => project.operational_status === "en_revision" || project.phase === "revision_tecnica").length,
    active: projects.filter((project) => project.operational_status === "obra_activa").length,
  }), [projects]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-10">
      <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed text-primary shadow-sm"><span className="material-symbols-outlined text-3xl">{icon}</span></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">CDE Costasur</p><h1 className="mt-2 text-3xl font-bold text-primary md:text-4xl">Departamento {department}</h1><p className="mt-1 text-secondary">{type}</p></div>
      </div>

      {hasPropertyOverview && <CasaDeCampoMap title={`Mapa GIS de ${department}`} subtitle="Casa de Campo · La Romana · ubicación general del proyecto" heightClassName="h-[300px] md:h-[380px]" />}
      {hasPropertyOverview && <SupervisorPropertyInventory contextLabel={`${department} · inventario general`} />}
      {targetPrefix === "legal" && <ContractorProjectRequestsPanel department="legal" />}

      {loading && <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-sm text-secondary">Cargando expedientes persistidos...</div>}
      {error && <div className="rounded-3xl border border-error/30 bg-error/10 p-8 text-sm text-error">{error}</div>}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[["Expedientes asignados", summary.total, "folder_open"], ["En revisión", summary.review, "rate_review"], ["Obras activas", summary.active, "construction"]].map(([label, value, symbol]) => <div key={String(label)} className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"><span className="material-symbols-outlined text-primary">{symbol}</span><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-secondary">{label}</p><p className="mt-1 text-4xl font-bold text-primary">{value}</p></div>)}
          </div>

          <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/20 p-6"><div><h3 className="text-xl font-bold text-primary">Expedientes asignados</h3><p className="mt-1 text-sm text-secondary">Datos obtenidos de membresías activas y proyectos persistidos.</p></div><Link to={`/${targetPrefix}/proyectos`} className="text-sm font-semibold text-primary hover:underline">Ver todos</Link></div>
            <div className="divide-y divide-outline-variant/20">
              {projects.slice(0, 8).map((project) => <Link key={project.id} to={`/${targetPrefix}/proyectos/${project.id}`} className="flex flex-col gap-3 p-5 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-on-surface">{project.title}</p><p className="mt-1 text-xs text-secondary">{project.project_code} · {project.phase.replaceAll("_", " ")}</p></div><div className="flex items-center gap-4"><span className="text-xs font-semibold text-primary">{project.operational_status.replaceAll("_", " ")}</span><span className="text-xs text-secondary">{project.progress_percent}% físico</span></div></Link>)}
              {!projects.length && <p className="p-8 text-sm text-secondary">No hay expedientes con membresía activa para este departamento.</p>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
