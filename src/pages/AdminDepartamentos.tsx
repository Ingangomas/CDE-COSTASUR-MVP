import { useState } from "react";

export function AdminDepartamentos() {
  const [activeDept, setActiveDept] = useState("arquitectura");

  const departamentos = [
    { id: "arquitectura", nombre: "Arquitectura", icon: "architecture", tareas: 45, alertas: 2 },
    { id: "obras", nombre: "Control de Obras", icon: "construction", tareas: 120, alertas: 15 },
    { id: "legal", nombre: "Legal", icon: "gavel", tareas: 12, alertas: 0 },
    { id: "electrica", nombre: "Eléctrica", icon: "electrical_services", tareas: 15, alertas: 1 },
    { id: "hidrosanitaria", nombre: "Hidrosanitaria", icon: "plumbing", tareas: 8, alertas: 0 },
    { id: "paisajismo", nombre: "Paisajismo", icon: "park", tareas: 5, alertas: 0 },
  ];

  return (
    <div className="px-4 md:px-10 py-6 md:py-12 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] md:overflow-hidden">
      <div className="mb-6 shrink-0">
        <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">Control Departamental</h2>
        <p className="text-sm md:text-lg text-secondary">Gestión y monitoreo del desempeño por departamento.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        
        {/* Sidebar Departments */}
        <div className="w-full md:w-80 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar shrink-0 pb-2 md:pb-0">
          {departamentos.map(dept => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left shrink-0 md:shrink ${
                activeDept === dept.id 
                  ? 'bg-primary text-white border-primary shadow-md' 
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">{dept.icon}</span>
                <span className="font-bold">{dept.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                {dept.alertas > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeDept === dept.id ? 'bg-white text-error' : 'bg-error text-white'}`}>
                    {dept.alertas}
                  </span>
                )}
                <span className={`text-xs ${activeDept === dept.id ? 'text-primary-container' : 'text-secondary'}`}>
                  {dept.tareas}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 flex flex-col overflow-y-auto custom-scrollbar shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
            <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px]">
                {departamentos.find(d => d.id === activeDept)?.icon}
              </span>
              Departamento de {departamentos.find(d => d.id === activeDept)?.nombre}
            </h3>
            <button className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
              Exportar Reporte
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-variant rounded-2xl p-4 border border-outline-variant/20">
              <span className="text-sm text-secondary font-medium uppercase tracking-wider">Total Tareas Activas</span>
              <p className="text-3xl font-bold text-on-surface mt-1">{departamentos.find(d => d.id === activeDept)?.tareas}</p>
            </div>
            <div className="bg-surface-variant rounded-2xl p-4 border border-outline-variant/20">
              <span className="text-sm text-secondary font-medium uppercase tracking-wider">Tiempo Prom. Respuesta</span>
              <p className="text-3xl font-bold text-on-surface mt-1">4.2 <span className="text-lg text-secondary font-normal">días</span></p>
            </div>
            <div className="bg-error/10 rounded-2xl p-4 border border-error/20">
              <span className="text-sm text-error font-medium uppercase tracking-wider">Alertas / Atrasos</span>
              <p className="text-3xl font-bold text-error mt-1">{departamentos.find(d => d.id === activeDept)?.alertas}</p>
            </div>
          </div>

          {/* Current Queue */}
          <h4 className="font-bold text-on-surface mb-4">Cola de Trabajo (Prioridad Alta)</h4>
          <div className="space-y-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">folder</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">Revisión Proyecto #{1024 + item}</h5>
                    <p className="text-xs text-secondary mt-0.5">Asignado a: Analista Sr. • Hace 2 días</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                   <button className="text-xs font-medium text-secondary hover:text-primary border border-outline-variant/50 px-3 py-1.5 rounded-full">Reasignar</button>
                   <button className="text-xs font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-full">Ver Detalles</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
