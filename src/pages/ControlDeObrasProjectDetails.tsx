import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export function ControlDeObrasProjectDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'expediente' | 'planos' | 'reportes'>('expediente');

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link to="/control-obras/proyectos" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver a Proyectos
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Villa Punta Águila #15</h2>
              <span className="bg-primary-container text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Obra Activa
              </span>
            </div>
            <p className="text-lg text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              Costasur, República Dominicana
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-primary text-white hover:bg-primary/90 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined">add</span>
              {activeTab === 'reportes' ? 'Nueva Incidencia' : 'Subir Documento'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Layout Area */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col">
        
        {/* Simple Tabs UI */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-4 bg-surface-container-lowest overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('expediente')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'expediente' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Expediente General
          </button>
          <button 
            onClick={() => setActiveTab('planos')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'planos' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Planos y Visor
          </button>
          <button 
            onClick={() => setActiveTab('reportes')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'reportes' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Reportes e Incidencias
          </button>
        </div>

        {/* Tab Content Placeholder */}
        <div className="p-8">
          {activeTab === 'expediente' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              {/* Documents List */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder_open</span>
                  Documentos del Expediente
                </h3>
                
                <div className="space-y-3">
                  {/* Document Item 1 */}
                  <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">Aprobacion_Medio_Ambiente_v2.pdf</h4>
                      <p className="text-xs text-secondary mt-0.5">Subido el 12 Oct 2023 • 2.4 MB</p>
                    </div>
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                  
                  {/* Document Item 2 */}
                  <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-[#003B70]/10 text-[#003B70] rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">architecture</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">Planos_Arquitectonicos_Aprobados.dwg</h4>
                      <p className="text-xs text-secondary mt-0.5">Subido el 05 Oct 2023 • 15.2 MB</p>
                    </div>
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>

                  {/* Document Item 3 */}
                  <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">Memoria_Descriptiva.docx</h4>
                      <p className="text-xs text-secondary mt-0.5">Subido el 01 Oct 2023 • 1.1 MB</p>
                    </div>
                    <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Preview / Viewer Sidebar */}
              <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 flex flex-col items-center justify-center min-h-[400px] text-center">
                <span className="material-symbols-outlined text-[64px] text-secondary/30 mb-4">preview</span>
                <h4 className="font-bold text-on-surface mb-2">Visor de Documentos</h4>
                <p className="text-sm text-secondary">Seleccione un plano o documento del expediente para previsualizarlo aquí.</p>
                <button 
                  onClick={() => setActiveTab('planos')}
                  className="mt-6 border border-outline-variant/50 bg-white text-secondary hover:text-primary font-medium px-6 py-2 rounded-full transition-colors text-sm"
                >
                  Abrir Visor
                </button>
              </div>
            </div>
          )}

          {activeTab === 'planos' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
              {/* Toolbar/Sidebar for Plans */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-bold text-on-surface mb-4">Lista de Planos</h3>
                <div className="space-y-2">
                  {['Arquitectónico - Planta 1', 'Estructural - Cimientos', 'Instalaciones Eléctricas', 'Instalaciones Sanitarias'].map((plano, i) => (
                    <div key={i} className={`p-3 rounded-xl border cursor-pointer transition-colors ${i === 0 ? 'bg-primary-container/20 border-primary/50 text-primary' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/30 text-secondary'}`}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">architecture</span>
                        <span className="font-medium text-sm">{plano}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Area */}
              <div className="lg:col-span-3 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden relative min-h-[600px] flex flex-col">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">zoom_out</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">fit_screen</span>
                  </button>
                </div>
                
                <div className="flex-1 bg-surface-variant flex items-center justify-center relative group">
                   <div className="absolute inset-0 pattern-grid-lg text-outline-variant/20"></div>
                   <img 
                     src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop" 
                     alt="Plano Arquitectónico"
                     className="max-w-[90%] max-h-[90%] object-contain shadow-2xl border-4 border-white opacity-80 mix-blend-multiply"
                   />
                </div>
                
                <div className="bg-white border-t border-outline-variant/20 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-on-surface">Plano Arquitectónico - Planta 1</h4>
                    <p className="text-xs text-secondary">Última actualización: 10 Ago 2026 • v2.1</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-secondary hover:text-primary p-2 transition-colors">
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button className="text-secondary hover:text-primary p-2 transition-colors">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reportes' && (
            <div className="animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-on-surface">Reportes e Incidencias</h3>
                <div className="flex gap-2">
                  <select className="bg-surface-container-low border border-outline-variant/30 text-secondary text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
                    <option>Todos los estados</option>
                    <option>Abierto</option>
                    <option>En Proceso</option>
                    <option>Resuelto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {/* Incidencia 1 */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">warning</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-on-surface">Muro desplazado del límite</h4>
                          <span className="bg-error/10 text-error px-2 py-1 rounded text-xs font-bold uppercase">Alta Prioridad</span>
                        </div>
                        <p className="text-sm text-secondary">Se detectó que el muro perimetral este se encuentra desplazado 50cm fuera de los linderos aprobados en los planos.</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-secondary">Hace 2 horas</span>
                  </div>
                  <div className="pl-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Reportado por: Inspector de Obras (Zona Norte)</span>
                    </div>
                    <button className="text-primary font-medium text-sm hover:underline">Ver Detalles</button>
                  </div>
                </div>

                {/* Incidencia 2 */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">build</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-on-surface">Obra con exceso de basura</h4>
                          <span className="bg-warning/10 text-warning-dark px-2 py-1 rounded text-xs font-bold uppercase">Media Prioridad</span>
                        </div>
                        <p className="text-sm text-secondary">Se observó acumulación excesiva de escombros y materiales de desecho en la acera frontal. Debe limpiarse de inmediato para no afectar la vía pública.</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-secondary">Ayer</span>
                  </div>
                  <div className="pl-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Reportado por: Inspector de Obras (Zona Sur)</span>
                    </div>
                    <button className="text-primary font-medium text-sm hover:underline">Ver Detalles</button>
                  </div>
                </div>
                
                {/* Incidencia 3 */}
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-lg text-on-surface">Reparación de verja perimetral</h4>
                          <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold uppercase">Resuelto</span>
                        </div>
                        <p className="text-sm text-secondary">La verja provisional que había sido derribada por el viento fue reparada y asegurada.</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-secondary">Hace 3 días</span>
                  </div>
                  <div className="pl-16 flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Reportado por: Dept. Control de Obras</span>
                    </div>
                    <button className="text-primary font-medium text-sm hover:underline">Ver Detalles</button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

