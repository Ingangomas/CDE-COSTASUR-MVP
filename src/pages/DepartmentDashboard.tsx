import { Link } from "react-router-dom";

export function DepartmentDashboard({ department, icon, type, deptKey }: { department: string, icon: string, type: string, deptKey?: string }) {
  const targetLink = deptKey ? `/${deptKey}/proyectos/1` : "/revision-tecnica/proyectos/1";
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Dashboard Depto. {department}</h1>
          <p className="text-secondary mt-1">Bandeja de entrada: {type}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl soft-shadow border border-outline-variant/30">
          <p className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Pendientes de Revisión</p>
          <p className="text-4xl font-bold text-primary">12</p>
        </div>
        <div className="glass-panel p-6 rounded-3xl soft-shadow border border-outline-variant/30">
          <p className="text-secondary text-sm font-semibold uppercase tracking-wider mb-2">Aprobados este mes</p>
          <p className="text-4xl font-bold text-primary">45</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden soft-shadow">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary">Solicitudes Pendientes</h3>
          <button className="text-sm text-primary-container font-medium flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full hover:bg-surface-variant transition-colors">
            Filtrar <span className="material-symbols-outlined text-[18px]">filter_list</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Proyecto</th>
                <th className="p-4 font-semibold">Propietario / Arq.</th>
                <th className="p-4 font-semibold">Fecha Solicitud</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-primary">Villa Punta Águila #15</p>
                  <p className="text-sm text-secondary">Construcción Nueva</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">Juan Pérez</p>
                  <p className="text-sm text-secondary">Studio A</p>
                </td>
                <td className="p-4 text-sm text-secondary">12 Oct 2023</td>
                <td className="p-4">
                  <span className="bg-error-container/50 text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Urgente</span>
                </td>
                <td className="p-4 text-right">
                  <Link to={targetLink} className="inline-flex items-center justify-center bg-primary-container text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-container/90 transition-colors">
                    Revisar
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-primary">Remodelación Los Lagos #4</p>
                  <p className="text-sm text-secondary">Remodelación Mayor</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">María Gómez</p>
                  <p className="text-sm text-secondary">Arq. Independiente</p>
                </td>
                <td className="p-4 text-sm text-secondary">15 Oct 2023</td>
                <td className="p-4">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">En Cola</span>
                </td>
                <td className="p-4 text-right">
                  <Link to={targetLink} className="inline-flex items-center justify-center bg-primary-container text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-container/90 transition-colors">
                    Revisar
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
