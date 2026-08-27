import { AdminGovernancePanel } from "../components/AdminGovernancePanel";
import { GovernanceRequestsPanel } from "../components/GovernanceRequestsPanel";

export function GovernancePortal() {
  return (
    <div className="mx-auto flex-1 w-full max-w-[1600px] space-y-6 p-4 md:p-8 lg:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Gobernanza del CDE</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-5xl">Administración de usuarios</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary md:text-base">
          Altas, activación de perfiles, roles funcionales y accesos a expedientes con trazabilidad de cada decisión.
        </p>
      </header>
      <AdminGovernancePanel />
      <GovernanceRequestsPanel />
    </div>
  );
}
