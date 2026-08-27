import { Link } from "react-router-dom";
import { ControlRequestsPanel } from "../components/ControlRequestsPanel";
import { AdminLiveMetrics } from "../components/AdminLiveMetrics";
import { CasaDeCampoMap } from "../components/CasaDeCampoMap";
import { SupervisorPropertyInventory } from "../components/SupervisorPropertyInventory";

export function ControlDeObras() {
  return (
    <div className="mx-auto flex-1 w-full max-w-[1600px] space-y-6 p-4 md:p-8 lg:px-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Control de Obras</p>
          <h2 className="mt-2 text-3xl font-bold text-primary md:text-5xl">Operaciones de obra</h2>
          <p className="mt-2 max-w-3xl text-sm text-secondary md:text-base">
            Bandeja persistente de solicitudes, inspecciones y expedientes asignados al departamento.
          </p>
        </div>
        <Link
          to="/control-obras/proyectos"
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
          Ver expedientes
        </Link>
      </div>

      <CasaDeCampoMap title="Mapa GIS de Control de Obras" subtitle="Casa de Campo · La Romana · ubicación de expedientes" heightClassName="h-[300px] md:h-[380px]" />
      <SupervisorPropertyInventory contextLabel="Control de Obras · inventario general" />

      <AdminLiveMetrics />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ControlRequestsPanel />
        <section className="lg:col-span-4 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Operación física</p>
          <h3 className="mt-2 text-xl font-bold text-primary">Siguiente acción</h3>
          <p className="mt-3 text-sm leading-6 text-secondary">
            Las solicitudes aprobadas, inspecciones programadas y entradas de bitácora se consultan dentro del expediente real. No se muestran obras, visitas ni incidencias ficticias.
          </p>
          <Link to="/control-obras/proyectos" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Abrir bandeja de proyectos
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
