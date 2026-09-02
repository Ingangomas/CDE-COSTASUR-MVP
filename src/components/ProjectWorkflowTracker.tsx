import type { ProjectPhase } from "../lib/cde-types";

const WORKFLOW_STEPS = [
  { key: "autorizacion", label: "Validación legal" },
  { key: "anteproyecto", label: "Anteproyecto" },
  { key: "directorio", label: "Revisión del Directorio" },
  { key: "planos_tecnicos", label: "Planos técnicos" },
  { key: "contratista", label: "Validar contratista" },
  { key: "inicio", label: "Inicio de obra" },
  { key: "finalizado", label: "Finalizado" },
] as const;

function getWorkflowIndex(phase: ProjectPhase | string, operationalStatus: string) {
  if (["cierre", "archivo"].includes(phase) || ["finalizada", "archivada"].includes(operationalStatus)) return 6;
  if (["inicio_obra", "obra_activa"].includes(phase) || operationalStatus === "obra_activa") return 5;
  if (phase === "planos_tecnicos") return 3;
  if (phase === "directorio") return 2;
  if (phase === "revision_tecnica") return 3;
  if (phase === "anteproyecto") return 1;
  return 0;
}

export function ProjectWorkflowTracker({ phase, operationalStatus }: { phase: ProjectPhase | string; operationalStatus: string }) {
  const activeIndex = getWorkflowIndex(phase, operationalStatus);
  const isFinished = activeIndex === WORKFLOW_STEPS.length - 1;
  const completedWidth = activeIndex === 0 ? "0%" : `calc(${(activeIndex / (WORKFLOW_STEPS.length - 1)) * 100}% - 1rem)`;

  return (
    <section className="rounded-3xl border border-outline-variant/30 bg-white p-6 soft-shadow md:p-7" aria-label="Progreso del expediente">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary">Ruta del expediente</p>
          <h2 className="mt-2 text-xl font-bold text-on-surface md:text-2xl">Progreso del trabajo</h2>
        </div>
        <span className="self-start rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-secondary">{isFinished ? "Proceso completado" : `Fase ${activeIndex + 1} de ${WORKFLOW_STEPS.length}`}</span>
      </div>
      <div className="mt-7 overflow-x-auto pb-2">
        <div className="relative min-w-[860px] px-4">
          <div className="absolute left-8 right-8 top-4 h-px bg-outline-variant/40" />
          <div className="absolute left-8 top-4 h-px bg-primary transition-all" style={{ width: completedWidth }} />
          <div className="relative flex justify-between gap-4">
            {WORKFLOW_STEPS.map((step, index) => {
              const completed = index < activeIndex;
              const active = index === activeIndex;
              return <div key={step.key} className="flex w-28 shrink-0 flex-col items-center text-center">
                <span className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition-colors ${completed || active ? "border-primary" : "border-outline-variant/60"} ${active ? "ring-4 ring-primary/10" : ""}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${completed || active ? "bg-primary" : "bg-white"}`} />
                </span>
                <p className={`mt-3 text-[11px] font-semibold leading-tight ${active ? "text-primary" : completed ? "text-on-surface" : "text-secondary"}`}>{step.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary">{active ? "Etapa actual" : completed ? "Completada" : "Pendiente"}</p>
              </div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
