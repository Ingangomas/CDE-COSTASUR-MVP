import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProjectsForUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { useSession } from "../context/SessionContext";

interface DepartmentProyectosProps {
  department: "Legal" | "Eléctrica" | "Hidrosanitaria" | "Paisajismo" | "Mensura" | "Seguridad";
  deptKey: "legal" | "electrica" | "hidrosanitaria" | "paisajismo" | "mensura" | "seguridad";
}

const statusLabel = (status: string) => ({
  obra_activa: "Obra activa",
  en_revision: "En revisión",
  pendiente_inspeccion: "Pendiente de inspección",
  critica: "Crítica",
  paralizada: "Paralizada",
  finalizada: "Finalizada",
  aprobado: "Aprobada",
}[status] ?? status.replaceAll("_", " "));

function statusTone(status: string) {
  if (status === "critica" || status === "paralizada") return "bg-error/10 text-error";
  if (status === "en_revision" || status === "pendiente_inspeccion") return "bg-warning/10 text-warning";
  if (status === "finalizada") return "bg-success/10 text-success";
  return "bg-primary/10 text-primary";
}

export function DepartmentProyectos({ department, deptKey }: DepartmentProyectosProps) {
  const { session } = useSession();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    let active = true;
    setLoading(true);
    void getProjectsForUser(session.user.id)
      .then((rows) => { if (active) setProjects(rows); })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los expedientes del departamento."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.user.id]);

  const filtered = useMemo(() => projects.filter((project) => {
    if (!searchQuery) return true;
    return project.title.toLowerCase().includes(searchQuery) || project.project_code.toLowerCase().includes(searchQuery);
  }), [projects, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Expedientes persistentes</p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Proyectos — {department}</h2>
        <p className="mt-2 text-lg text-secondary">Expedientes asignados al departamento {department.toLowerCase()} mediante membresías activas.</p>
      </header>

      {loading && <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-8 text-sm text-secondary">Cargando expedientes persistidos...</div>}
      {error && <div className="rounded-3xl border border-error/30 bg-error/10 p-8 text-sm text-error">{error}</div>}
      {!loading && !error && (
        filtered.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => <ProjectOverviewCard key={project.id} project={project} href={`/${deptKey}/proyectos/${project.id}`} statusLabel={statusLabel(project.operational_status)} statusTone={projectStatusTone(project.operational_status)} contextLabel={`Bandeja de ${department}`} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-12 text-center"><span className="material-symbols-outlined text-[48px] text-secondary/50">inbox</span><h3 className="mt-4 text-xl font-bold text-on-surface">No hay expedientes asignados</h3><p className="mt-2 text-secondary">Este departamento no tiene todavía una membresía activa para mostrar.</p></div>
        )
      )}
    </div>
  );
}
