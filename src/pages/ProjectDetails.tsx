import { Link, useParams } from "react-router-dom";

export function ProjectDetails() {
  const { id } = useParams();

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link to="/propietario/mis-propiedades" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver a Mis Propiedades
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
            <button className="glass-panel text-primary-container border-white/40 hover:bg-white/60 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-all shadow-sm">
              <span className="material-symbols-outlined">chat</span>
              Contactar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress Overview */}
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 soft-shadow">
            <h3 className="text-xl font-bold text-on-surface mb-6">Progreso de la Obra</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Avance General</span>
              <span className="text-2xl font-bold text-primary">65%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-3 mb-8">
              <div className="bg-primary h-3 rounded-full" style={{ width: '65%' }}></div>
            </div>

            {/* Project Milestones Timeline */}
            <div className="mt-8 space-y-6">
              <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider border-b border-outline-variant/30 pb-2 mb-4">Línea de Tiempo de Hitos</h4>
              
              {/* Milestone 1 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Aprobación de Permisos</h4>
                      <span className="text-xs text-secondary">Completado - 15 Ago 2026</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-success">100%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5 shadow-inner">
                  <div className="bg-success h-2.5 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">construction</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Fundaciones y Obra Gris</h4>
                      <span className="text-xs text-primary font-medium">En Progreso - Estructura Nivel 1</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">60%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5 shadow-inner">
                  <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary/50 text-[20px]">handyman</span>
                    <div>
                      <h4 className="font-bold text-secondary text-sm">Terminaciones (Acabados)</h4>
                      <span className="text-xs text-secondary/70">Pendiente</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-secondary">0%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5 shadow-inner">
                  <div className="bg-secondary/30 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              {/* Milestone 4 */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary/50 text-[20px]">park</span>
                    <div>
                      <h4 className="font-bold text-secondary text-sm">Paisajismo y Exteriores</h4>
                      <span className="text-xs text-secondary/70">Pendiente</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-secondary">0%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5 shadow-inner">
                  <div className="bg-secondary/30 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Galería de Avances */}
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/30 soft-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Galería de Avances</h3>
              <button className="text-sm text-primary font-medium hover:underline">Ver todas</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-variant group relative">
                <img src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Avance 1" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-medium">Hace 2 días</span>
                </div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-variant group relative">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Avance 2" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-medium">Hace 1 semana</span>
                </div>
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-surface-variant group relative hidden md:block">
                <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Avance 3" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-medium">Hace 2 semanas</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar / Info Area */}
        <div className="space-y-8">
          
          {/* Project Details Box */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 soft-shadow">
            <h3 className="text-lg font-bold text-on-surface mb-4">Información del Proyecto</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Arquitecto Responsable</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
                    SA
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Studio A</p>
                    <p className="text-xs text-secondary">arq@studioa.demo</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-outline-variant/20 pt-4">
                <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Contratista Principal</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-[#003B70] flex items-center justify-center text-white font-bold">
                    CA
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Constructora ABC</p>
                    <p className="text-xs text-secondary">contacto@abc.demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos Aprobados */}
          <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 soft-shadow">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">task</span>
              Documentos Aprobados
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer transition-colors group bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="bg-surface-container-lowest p-2 rounded-lg group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-primary group-hover:text-white">description</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium block text-on-surface">Carta de Aprobación.pdf</span>
                  <span className="text-xs text-secondary">2.4 MB • 15 Ago 2026</span>
                </div>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary">download</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer transition-colors group bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="bg-surface-container-lowest p-2 rounded-lg group-hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-primary group-hover:text-white">architecture</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium block text-on-surface">Planos_Finales_v2.dwg</span>
                  <span className="text-xs text-secondary">15.1 MB • 10 Ago 2026</span>
                </div>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary">download</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
