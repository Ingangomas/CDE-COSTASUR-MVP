import { AdminGovernancePanel } from "../components/AdminGovernancePanel";

export function AdminDepartamentos() {
  return (
    <div className="mx-auto flex-1 w-full max-w-[1600px] space-y-6 p-4 md:p-8 lg:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Administración interna</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-5xl">Gobernanza de departamentos</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary md:text-base">
          Directorio real de perfiles, roles, departamentos y membresías activas. Las acciones se registran mediante las políticas y auditorías de Supabase.
        </p>
      </header>
      <AdminGovernancePanel />
    </div>
  );
}
