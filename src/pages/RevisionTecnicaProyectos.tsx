import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { getProjectsForUser } from "../lib/cde-data";
import type { ProjectRecord } from "../lib/cde-types";
import { ProjectOverviewCard, projectStatusTone } from "../components/ProjectOverviewCard";
import { getDemoExtraProjects } from "../lib/demo-projects";

const phaseLabels: Record<string, string> = { autorizacion_inicial: "Carta pendiente", anteproyecto: "Anteproyecto", directorio: "Revisión del Directorio", planos_tecnicos: "Planos técnicos", inicio_obra: "Inicio de obra", obra_activa: "Obra activa", cierre: "Cierre" };

export function RevisionTecnicaProyectos() {
  const { profile } = useSession();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todos");

  useEffect(() => { if (!profile?.id) return; getProjectsForUser(profile.id).then(setProjects).catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar los expedientes.")).finally(() => setLoading(false)); }, [profile?.id]);

  const overviewProjects = profile?.is_demo ? [...projects, ...getDemoExtraProjects()] : projects;
  const filtered = useMemo(() => overviewProjects.filter((project) => filter === "Todos" || phaseLabels[project.phase] === filter), [filter, overviewProjects]);
  const filters = ["Todos", "Carta pendiente", "Anteproyecto", "Revisión del Directorio", "Planos técnicos"];

  return <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-8"><div><p className="text-xs uppercase tracking-[0.22em] text-secondary">Bandeja persistente</p><h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-2">Proyectos de Arquitectura</h1><p className="text-base text-secondary mt-3">Revise cartas, anteproyectos, Directorio y planos técnicos desde los expedientes reales.</p></div><div className="flex gap-2 overflow-x-auto pb-2">{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={`rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap ${filter === item ? "bg-primary text-white" : "bg-white text-secondary border border-outline-variant/30"}`}>{item}</button>)}</div>{loading && <div className="glass-panel p-10 text-center text-secondary">Cargando expedientes…</div>}{error && <div className="glass-panel p-6 border border-error/30 text-error">{error}</div>}{!loading && !error && !filtered.length && <div className="glass-panel p-10 text-center text-secondary">No hay expedientes asignados para esta bandeja.</div>}<div className="grid grid-cols-1 gap-7 lg:grid-cols-2">{filtered.map((project) => <ProjectOverviewCard key={project.id} project={project} demoOnly={project.id.startsWith("demo-project-")} href={`/revision-tecnica/proyectos/${project.id}`} statusLabel={phaseLabels[project.phase] ?? project.phase} statusTone={projectStatusTone(project.operational_status)} contextLabel="Bandeja de Revisión Técnica" />)}</div></div>;
}
