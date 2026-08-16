import { useEffect, useMemo, useState } from "react";
import { getAdminProjects } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";

export function AdminLiveMetrics() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void getAdminProjects().then((data) => { if (active) setProjects(data); }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las métricas."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const metrics = useMemo(() => ({
    total: projects.length,
    active: projects.filter((project) => project.operational_status === "obra_activa").length,
    critical: projects.filter((project) => project.operational_status === "critica" || project.operational_status === "paralizada").length,
    review: projects.filter((project) => project.operational_status === "en_revision" || project.phase === "revision_tecnica").length,
    average: projects.length ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress_percent || 0), 0) / projects.length) : 0,
  }), [projects]);
  if (loading) return <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-sm text-secondary">Cargando métricas operativas...</div>;
  if (error) return <div className="rounded-3xl border border-error/20 bg-error/10 p-6 text-sm text-error">{error}</div>;
  return <section className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["Expedientes", metrics.total, "text-primary", "folder_open"], ["Obras activas", metrics.active, "text-primary", "construction"], ["En revisión", metrics.review, "text-warning", "rate_review"], ["Críticas", metrics.critical, "text-error", "priority_high"], ["Avance promedio", `${metrics.average}%`, "text-success", "trending_up"]].map(([label, value, tone, icon]) => <div key={String(label)} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"><span className={`material-symbols-outlined ${tone} text-[19px]`}>{icon}</span><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-secondary">{label}</p><p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p></div>)}</section>;
}
