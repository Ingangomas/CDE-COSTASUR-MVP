import { Link } from "react-router-dom";
import type { ProjectRecord } from "../lib/cde-types";

const DEFAULT_PROJECT_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85";

interface ProjectOverviewCardProps {
  key?: string;
  project: ProjectRecord;
  href?: string;
  onClick?: () => void;
  demoOnly?: boolean;
  statusLabel: string;
  statusTone?: string;
  contextLabel?: string;
  imageUrl?: string;
}

const cardClassName = "group block overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md";

export function ProjectOverviewCard({ project, href, onClick, demoOnly = false, statusLabel, statusTone = "bg-primary/10 text-primary", contextLabel = "Expediente de proyecto", imageUrl = DEFAULT_PROJECT_IMAGE }: ProjectOverviewCardProps) {
  const content = (
    <>
      <div className="relative h-44 overflow-hidden bg-surface-container-low">
        <img src={imageUrl} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 text-white">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Expediente de proyecto</p>
          <h2 className="mt-2 line-clamp-2 text-2xl font-bold">{project.title}</h2>
        </div>
      </div>
      <div className="p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary">{project.project_code}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-secondary"><span className="material-symbols-outlined text-base">domain</span>{contextLabel}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone}`}>{statusLabel}</span>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-5">
          <span className="text-sm font-semibold text-primary">Entrar al proyecto</span>
          <span className="material-symbols-outlined text-2xl text-primary transition-transform group-hover:translate-x-1">arrow_forward</span>
        </div>
      </div>
    </>
  );

  if (demoOnly) return <div className={`${cardClassName} cursor-default`}>{content}</div>;
  if (onClick) return <button type="button" onClick={onClick} className={`${cardClassName} w-full`}>{content}</button>;
  return <Link to={href ?? "#"} className={cardClassName}>{content}</Link>;
}

export function projectStatusTone(status: string) {
  if (["critica", "paralizada"].includes(status)) return "bg-error/10 text-error";
  if (["finalizada", "cerrada", "archivada"].includes(status)) return "bg-success/10 text-success";
  if (["en_revision", "pendiente_inspeccion"].includes(status)) return "bg-warning/10 text-warning";
  return "bg-primary/10 text-primary";
}
