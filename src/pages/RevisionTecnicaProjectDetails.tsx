import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export function RevisionTecnicaProjectDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'planos' | 'documentos' | 'comentarios'>('planos');
  const [planoSeleccionado, setPlanoSeleccionado] = useState(0);

  const planos = [
    { nombre: 'Arquitectónico - Planta 1', version: 'v1.0', fecha: '10 Ago 2026', estado: 'Pendiente' },
    { nombre: 'Arquitectónico - Planta 2', version: 'v1.0', fecha: '10 Ago 2026', estado: 'Pendiente' },
    { nombre: 'Elevaciones y Cortes', version: 'v1.0', fecha: '10 Ago 2026', estado: 'Pendiente' },
    { nombre: 'Planta de Techos', version: 'v1.0', fecha: '10 Ago 2026', estado: 'Pendiente' },
  ];

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link to="/revision-tecnica/proyectos" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver a Proyectos
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Villa Punta Águila #15</h2>
              <span className="bg-primary-container text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                En Revisión
              </span>
            </div>
            <p className="text-lg text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
              Arquitecto: Studio A
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-outline-variant/50 text-error hover:bg-error/5 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined">cancel</span>
              Rechazar Proyecto
            </button>
            <button className="bg-primary text-white hover:bg-primary/90 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined">check_circle</span>
              Aprobar Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Layout Area */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col">
        
        {/* Tabs UI */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-4 bg-surface-container-lowest overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('planos')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'planos' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Revisión de Planos
          </button>
          <button 
            onClick={() => setActiveTab('documentos')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'documentos' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Documentos Adjuntos
          </button>
          <button 
            onClick={() => setActiveTab('comentarios')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'comentarios' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Comentarios y Correcciones
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          
          {activeTab === 'planos' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
              {/* Toolbar/Sidebar for Plans */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-bold text-on-surface mb-4">Planos Sometidos</h3>
                <div className="space-y-2">
                  {planos.map((plano, i) => (
                    <div 
                      key={i} 
                      onClick={() => setPlanoSeleccionado(i)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${planoSeleccionado === i ? 'bg-primary-container/20 border-primary/50' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/30'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`flex items-center gap-2 ${planoSeleccionado === i ? 'text-primary' : 'text-on-surface'}`}>
                          <span className="material-symbols-outlined text-[18px]">architecture</span>
                          <span className="font-bold text-sm truncate" title={plano.nombre}>{plano.nombre}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-xs text-secondary">{plano.version} • {plano.fecha}</span>
                         <span className="text-[10px] uppercase font-bold bg-surface-variant text-secondary px-2 py-0.5 rounded">{plano.estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Area */}
              <div className="lg:col-span-3 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden relative min-h-[600px] flex flex-col">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Acercar">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Alejar">
                    <span className="material-symbols-outlined">zoom_out</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Medir">
                    <span className="material-symbols-outlined">straighten</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Añadir Comentario">
                    <span className="material-symbols-outlined">add_comment</span>
                  </button>
                </div>
                
                {/* Canvas Area */}
                <div className="flex-1 bg-surface-variant flex items-center justify-center relative group overflow-hidden">
                   <div className="absolute inset-0 pattern-grid-lg text-outline-variant/20"></div>
                   <img 
                     src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop" 
                     alt="Plano Arquitectónico"
                     className="max-w-[90%] max-h-[90%] object-contain shadow-2xl border-4 border-white opacity-80 mix-blend-multiply transition-transform duration-300"
                   />
                   
                   {/* Mock Comment Pin */}
                   <div className="absolute top-[40%] left-[55%] w-8 h-8 bg-warning text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-sm font-bold">1</span>
                   </div>
                </div>
                
                {/* Actions Bar */}
                <div className="bg-white border-t border-outline-variant/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-on-surface">{planos[planoSeleccionado].nombre}</h4>
                    <p className="text-xs text-secondary">Haga clic en el plano para agregar anotaciones o comentarios de corrección.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none border border-outline-variant/50 text-secondary hover:bg-surface-container-low font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      Versiones
                    </button>
                    <button className="flex-1 md:flex-none bg-warning/10 text-warning-dark hover:bg-warning/20 font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center justify-center gap-2 border border-warning/20">
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      Solicitar Corrección
                    </button>
                    <button className="flex-1 md:flex-none bg-success/10 text-success hover:bg-success/20 font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center justify-center gap-2 border border-success/20">
                      <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                      Aprobar Plano
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">Memoria_Descriptiva.pdf</h4>
                  <p className="text-xs text-secondary mt-0.5">Subido el 10 Ago 2026 • 2.4 MB</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Ver</button>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">Formulario_Solicitud.pdf</h4>
                  <p className="text-xs text-secondary mt-0.5">Subido el 10 Ago 2026 • 1.1 MB</p>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Ver</button>
              </div>
            </div>
          )}

          {activeTab === 'comentarios' && (
            <div className="animate-in fade-in duration-300">
               <div className="max-w-3xl space-y-6">
                 
                 <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                         RA
                       </div>
                       <div>
                         <h4 className="font-bold text-on-surface text-sm">Revisor Arquitectura</h4>
                         <p className="text-xs text-secondary">11 Ago 2026, 09:30 AM</p>
                       </div>
                     </div>
                     <span className="bg-warning/10 text-warning-dark px-2 py-1 rounded text-[10px] font-bold uppercase">Corrección Solicitada</span>
                   </div>
                   <p className="text-sm text-on-surface mb-3">En el plano "Arquitectónico - Planta 1", la distancia de retiro frontal no cumple con el mínimo de 5 metros establecido en el reglamento del sector. Por favor ajustar.</p>
                   <div className="flex items-center gap-2 text-xs text-secondary bg-surface-container-low p-2 rounded-lg w-fit">
                     <span className="material-symbols-outlined text-[16px]">attachment</span>
                     <span>Referencia: Plano Arquitectónico - Planta 1 (Pin #1)</span>
                   </div>
                 </div>

                 <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                   <h4 className="font-bold text-on-surface mb-4">Añadir Comentario General</h4>
                   <textarea 
                     className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 text-sm text-on-surface focus:border-primary outline-none transition-colors mb-4 min-h-[120px]"
                     placeholder="Escriba aquí un comentario o solicitud de corrección general para el arquitecto..."
                   ></textarea>
                   <div className="flex justify-end">
                     <button className="bg-primary text-white hover:bg-primary/90 font-medium px-6 py-2 rounded-full transition-colors text-sm">
                       Enviar Comentario
                     </button>
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
