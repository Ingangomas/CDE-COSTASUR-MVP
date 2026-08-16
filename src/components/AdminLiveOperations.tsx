import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminProjects } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";

function statusInfo(status: ProjectRecord["operational_status"]) {
  if (status === "critica" || status === "paralizada") return { label: status === "critica" ? "Crítica" : "Paralizada", tone: "text-error", dot: "bg-error" };
  if (status === "pendiente_inspeccion" || status === "en_revision") return { label: status === "en_revision" ? "En revisión" : "Pendiente inspección", tone: "text-warning", dot: "bg-warning" };
  if (status === "finalizada") return { label: "Finalizada", tone: "text-success", dot: "bg-success" };
  return { label: "Obra activa", tone: "text-primary", dot: "bg-primary" };
}

export function AdminLiveOperations() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void getAdminProjects().then((data) => { if (active) setProjects(data); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-8"><div className="flex items-center justify-between gap-4"><div><h3 className="text-xl font-bold text-primary">Operaciones en vivo</h3><p className="mt-1 text-sm text-secondary">Estado de los expedientes persistidos en el CDE.</p></div><Link to="/admin/proyectos" className="text-xs font-semibold text-primary hover:underline">Ver todos</Link></div>{loading ? <p className="mt-6 text-sm text-secondary">Cargando operaciones...</p> : <div className="mt-5 space-y-3">{projects.slice(0, 6).map((project) => { const status = statusInfo(project.operational_status); return <Link key={project.id} to={`/admin/proyectos/${project.id}`} className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dot}`} /><div className="min-w-0"><p className="truncate font-semibold text-on-surface">{project.title}</p><p className="mt-1 text-xs text-secondary">{project.project_code} · {project.phase.replaceAll("_", " ")}</p></div></div><div className="flex items-center gap-4 sm:justify-end"><span className={`text-xs font-semibold ${status.tone}`}>{status.label}</span><div className="w-24"><div className="h-1.5 overflow-hidden rounded-full bg-surface-variant"><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress_percent}%` }} /></div><p className="mt-1 text-right text-[10px] text-secondary">{project.progress_percent}%</p></div></div></Link>; })}{!projects.length && <p className="rounded-xl bg-surface-container-low p-5 text-sm text-secondary">No hay proyectos disponibles para este usuario.</p>}</div>}</section>;
}
