import { AdminOperationalReviewPanel } from "../components/AdminOperationalReviewPanel";

export function AdminDepartamentos() {
  return (
    <div className="mx-auto flex-1 w-full max-w-[1600px] space-y-6 p-4 md:p-8 lg:px-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Administración interna</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-5xl">Revisión departamental</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary md:text-base">
          Seguimiento operativo de los departamentos, sus usuarios asignados y el trabajo activo en los expedientes. La gobernanza global se gestiona desde su portal independiente.
        </p>
      </header>
      <AdminOperationalReviewPanel />
    </div>
  );
}
