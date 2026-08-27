import { useEffect, useMemo, useState } from "react";
import { getAdminGovernance, getAdminProjects, type AdminGovernanceUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";

const departmentLabels: Record<string, string> = {
  revision_tecnica: "Arquitectura / Revisión Técnica",
  control_obras: "Control de Obras",
  legal: "Legal",
  electrica: "Eléctrica",
  hidrosanitaria: "Hidrosanitaria",
  paisajismo: "Paisajismo",
  mensura: "Mensura",
  seguridad: "Seguridad",
};

export function AdminOperationalReviewPanel() {
  const [users, setUsers] = useState<AdminGovernanceUser[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRows, projectRows] = await Promise.all([getAdminGovernance(), getAdminProjects()]);
      setUsers(userRows);
      setProjects(projectRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar la revisión operativa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const departmentRows = useMemo(() => {
    const counts = new Map<string, { users: number; projects: number }>();
    users.forEach((user) => user.roles.filter((role) => role.is_active && role.department?.slug).forEach((role) => {
      const slug = role.department?.slug ?? "";
      const current = counts.get(slug) ?? { users: 0, projects: 0 };
      counts.set(slug, { ...current, users: current.users + 1 });
    }));
    projects.forEach((project) => {
      const phase = project.phase === "revision_tecnica" || project.phase === "planos_tecnicos" ? "revision_tecnica" : project.phase === "inicio_obra" || project.phase === "obra_activa" ? "control_obras" : "legal";
      const current = counts.get(phase) ?? { users: 0, projects: 0 };
      counts.set(phase, { ...current, projects: current.projects + 1 });
    });
    return Object.entries(departmentLabels).map(([slug, label]) => ({ slug, label, ...(counts.get(slug) ?? { users: 0, projects: 0 }) }));
  }, [projects, users]);

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">fact_check</span><h4 className="text-xl font-bold text-primary">Revisión operativa departamental</h4></div>
          <p className="mt-1 max-w-3xl text-sm text-secondary">Consulta el trabajo, la asignación y la actividad de los departamentos. La administración de usuarios pertenece exclusivamente a Gobernanza.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"><span className={`material-symbols-outlined text-[17px] ${loading ? "animate-spin" : ""}`}>refresh</span>Actualizar</button>
      </div>
      {error && <p className="mt-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
      {loading ? <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-sm text-secondary"><span className="material-symbols-outlined animate-spin">progress_activity</span>Cargando actividad departamental...</div> : <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{departmentRows.map((department) => <article key={department.slug} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4"><p className="text-xs font-bold uppercase tracking-wider text-secondary">{department.label}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[10px] uppercase tracking-wider text-secondary">Usuarios operativos</p><p className="mt-1 text-2xl font-bold text-primary">{department.users}</p></div><div><p className="text-[10px] uppercase tracking-wider text-secondary">Expedientes</p><p className="mt-1 text-2xl font-bold text-primary">{department.projects}</p></div></div><p className="mt-4 text-xs text-secondary">Vista de consulta; las acciones de Gobernanza no aparecen aquí.</p></article>)}</div>}
    </section>
  );
}
