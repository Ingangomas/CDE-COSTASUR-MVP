import { Link } from "react-router-dom";
import { AdminLiveMetrics } from "../components/AdminLiveMetrics";
import { AdminLiveOperations } from "../components/AdminLiveOperations";
import { CasaDeCampoMap } from "../components/CasaDeCampoMap";
import { SupervisorPropertyInventory } from "../components/SupervisorPropertyInventory";

export function AdminMapaGeneral() {
  return (
    <div className="flex-1 mx-auto w-full max-w-[1700px] space-y-6 p-4 md:p-8 lg:px-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Administración</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary md:text-5xl">Admin General</h2>
          <p className="mt-2 max-w-3xl text-sm text-secondary md:text-base">
            Supervisión operativa de expedientes, obras, revisiones y propiedades registradas en el CDE.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/proyectos"
            className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            Ver expedientes
          </Link>
          <Link
            to="/admin/departamentos"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            Departamentos
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 px-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Mapa principal</p><h3 className="mt-1 text-xl font-bold text-primary">Casa de Campo y propiedades del CDE</h3></div>
          <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:inline-flex">Ubicación operativa</span>
        </div>
        <CasaDeCampoMap />
      </section>

      <AdminLiveMetrics />

      <SupervisorPropertyInventory contextLabel="Administración · inventario general" />

      <AdminLiveOperations />
    </div>
  );
}
