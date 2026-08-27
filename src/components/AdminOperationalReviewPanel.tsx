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

const departmentSummaries: Record<string, { focus: string; activity: string; nextStep: string }> = {
  revision_tecnica: { focus: "Revisión de anteproyectos y planos técnicos", activity: "Seguimiento de entregables técnicos y observaciones de arquitectura.", nextStep: "Consultar revisiones activas y documentos del departamento." },
  control_obras: { focus: "Supervisión física y solicitudes de inicio de obra", activity: "Control de solicitudes, inspecciones y expedientes de construcción.", nextStep: "Consultar la operación de obra y sus validaciones pendientes." },
  legal: { focus: "Validaciones legales y verificación de propietarios", activity: "Revisión de titularidad, documentación y solicitudes pendientes.", nextStep: "Consultar verificaciones legales y decisiones registradas." },
  electrica: { focus: "Revisión de planos y criterios eléctricos", activity: "Seguimiento de entregables eléctricos asociados a los expedientes.", nextStep: "Consultar revisiones técnicas eléctricas." },
  hidrosanitaria: { focus: "Revisión de redes hidrosanitarias", activity: "Control de planos, observaciones y coordinación hidrosanitaria.", nextStep: "Consultar actividad hidrosanitaria por expediente." },
  paisajismo: { focus: "Revisión de paisajismo y áreas exteriores", activity: "Seguimiento de propuestas de jardinería y espacios exteriores.", nextStep: "Consultar entregables y observaciones de paisajismo." },
  mensura: { focus: "Revisión topográfica y deslindes", activity: "Control de levantamientos, límites y documentos de mensura.", nextStep: "Consultar expedientes topográficos del departamento." },
  seguridad: { focus: "Control de accesos y seguridad de obra", activity: "Seguimiento operativo de seguridad y accesos de los expedientes.", nextStep: "Consultar actividad de seguridad en modo lectura." },
};

export function AdminOperationalReviewPanel() {
  const [users, setUsers] = useState<AdminGovernanceUser[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

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
    <>
      <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">fact_check</span><h4 className="text-xl font-bold text-primary">Revisión operativa departamental</h4></div>
          <p className="mt-1 max-w-3xl text-sm text-secondary">Consulta el trabajo, la asignación y la actividad de los departamentos. La administración de usuarios pertenece exclusivamente a Gobernanza.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/5"><span className={`material-symbols-outlined text-[17px] ${loading ? "animate-spin" : ""}`}>refresh</span>Actualizar</button>
      </div>
      {error && <p className="mt-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
      {loading ? <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-10 text-sm text-secondary"><span className="material-symbols-outlined animate-spin">progress_activity</span>Cargando actividad departamental...</div> : <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{departmentRows.map((department) => <article key={department.slug} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4"><p className="text-xs font-bold uppercase tracking-wider text-secondary">{department.label}</p><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[10px] uppercase tracking-wider text-secondary">Usuarios operativos</p><p className="mt-1 text-2xl font-bold text-primary">{department.users}</p></div><div><p className="text-[10px] uppercase tracking-wider text-secondary">Expedientes</p><p className="mt-1 text-2xl font-bold text-primary">{department.projects}</p></div></div><p className="mt-4 text-xs text-secondary">Vista de consulta; las acciones de Gobernanza no aparecen aquí.</p><button type="button" onClick={() => setSelectedDepartment(department.slug)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"><span className="material-symbols-outlined text-[18px]">login</span>Entrar</button></article>)}</div>}
      </section>
      {selectedDepartment && (() => {
      const department = departmentRows.find((row) => row.slug === selectedDepartment);
      const summary = departmentSummaries[selectedDepartment];
      if (!department || !summary) return null;
      return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDepartment(null); }}><div className="w-full max-w-xl rounded-3xl bg-surface-container-lowest p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-department-view-title"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Consulta simulada · solo lectura</p><h3 id="admin-department-view-title" className="mt-2 text-2xl font-bold text-primary">{department.label}</h3><p className="mt-2 text-sm leading-6 text-secondary">Administración puede consultar el trabajo operativo, pero no administrar usuarios ni ejecutar acciones de Gobernanza desde aquí.</p></div><button type="button" onClick={() => setSelectedDepartment(null)} className="rounded-full p-2 text-secondary hover:bg-surface-container-low hover:text-primary" aria-label="Cerrar consulta departamental"><span className="material-symbols-outlined">close</span></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-surface-container-low p-4"><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Actividad principal</p><p className="mt-2 text-sm font-semibold text-on-surface">{summary.focus}</p></div><div className="rounded-2xl bg-surface-container-low p-4"><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Estado consultado</p><p className="mt-2 text-sm font-semibold text-on-surface">{department.projects} expedientes · {department.users} usuarios operativos</p></div></div><div className="mt-4 rounded-2xl border border-outline-variant/20 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-secondary">Lo que hizo el departamento</p><p className="mt-2 text-sm leading-6 text-on-surface">{summary.activity}</p><p className="mt-3 text-xs leading-5 text-secondary">Siguiente consulta disponible: {summary.nextStep}</p></div><div className="mt-6 flex justify-end border-t border-outline-variant/20 pt-5"><button type="button" onClick={() => setSelectedDepartment(null)} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Cerrar</button></div></div></div>;
      })()}
    </>
  );
}
