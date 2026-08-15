import { Link } from "react-router-dom";

export function TechnicalReview() {
  return (
    <div className="p-4 md:p-8 lg:px-10 flex-1 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">Revisión General de Proyectos</h2>
          <p className="text-lg text-secondary">Mapa interactivo y estado de las solicitudes de proyectos arquitectónicos.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-primary-container text-on-primary font-medium py-2 px-4 rounded-full flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtrar Mapa
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mapa General (Large) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 soft-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="text-xl text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">map</span>
              Ubicación de Proyectos (Casa de Campo)
            </h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-xs font-medium text-secondary">
                 <div className="w-3 h-3 bg-warning rounded-full"></div> En Revisión
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-secondary ml-2">
                 <div className="w-3 h-3 bg-success rounded-full"></div> Aprobado
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden relative border border-outline-variant/20">
            {/* Map Placeholder */}
            <img 
              className="w-full h-full object-cover absolute inset-0" 
              alt="Map" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCASHFBPDzIj99DhGSfTRZM0vPzz9TMCbV8IAQaM68RqF_1wG1zFS4xX_YR9htxB4m9UIBDYAjfzpGo-8KDmNcclXBZ1_O_mz7g6eyT1UTMWHhj7jXU-U9i6w2t-DQHYKoBRNoO1WPeSEuoFGO7apu1hnLtNS61Pv8g5_0cIVrhCt_cFqMF-3dOCZRkyCZGGsMoeSyidPC3C-QngtpDTSE-UFUC6U09aZaL9J32X7XttcSS2W5T_Rrp" 
            />
            
            {/* Map Markers (Simulated) */}
            <Link to="/revision-tecnica/proyectos/1" className="absolute top-[30%] left-[40%] group cursor-pointer hover:z-10">
              <div className="w-5 h-5 bg-warning rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform"></div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">Villa Punta Águila #15</p>
                <p className="text-[10px] text-secondary">En Revisión</p>
              </div>
            </Link>

            <Link to="/revision-tecnica/proyectos/2" className="absolute top-[60%] left-[55%] group cursor-pointer hover:z-10">
              <div className="w-5 h-5 bg-success rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform"></div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">Solar Los Lagos #4</p>
                <p className="text-[10px] text-secondary">Aprobado</p>
              </div>
            </Link>
            
            <Link to="/revision-tecnica/proyectos/5" className="absolute top-[45%] right-[30%] group cursor-pointer hover:z-10">
              <div className="w-5 h-5 bg-warning rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform"></div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">Vista Mar #5</p>
                <p className="text-[10px] text-secondary">En Revisión</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Proyectos Recientes (Small/Vertical) */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 soft-shadow flex flex-col">
          <h3 className="text-xl text-primary font-bold mb-4 flex items-center gap-2 pb-4 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container">recent_actors</span>
            Sometimientos Recientes
          </h3>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Request Card 1 */}
            <Link to="/revision-tecnica/proyectos/1" className="block bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Villa Punta Águila #15</span>
                <span className="bg-warning/10 text-warning-dark text-[10px] font-semibold uppercase px-2 py-1 rounded-full">En Revisión</span>
              </div>
              <p className="text-sm text-on-surface mb-3 line-clamp-2">Planos arquitectónicos sometidos para evaluación inicial. Retiros y elevaciones por verificar.</p>
              <div className="text-sm text-primary group-hover:underline flex items-center gap-1">
                Abrir Expediente <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </Link>

            {/* Request Card 2 */}
            <Link to="/revision-tecnica/proyectos/5" className="block bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Vista Mar #5</span>
                <span className="bg-warning/10 text-warning-dark text-[10px] font-semibold uppercase px-2 py-1 rounded-full">En Revisión</span>
              </div>
              <p className="text-sm text-on-surface mb-3 line-clamp-2">Revisión de planos de techo y manejo de aguas pluviales.</p>
              <div className="text-sm text-primary group-hover:underline flex items-center gap-1">
                Abrir Expediente <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </Link>
            
            {/* Request Card 3 */}
            <Link to="/revision-tecnica/proyectos/3" className="block bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Casa de Campo #22</span>
                <span className="bg-warning/10 text-warning-dark text-[10px] font-semibold uppercase px-2 py-1 rounded-full">Con Correcciones</span>
              </div>
              <p className="text-sm text-on-surface mb-3 line-clamp-2">Arquitecto reenvió los planos con las modificaciones solicitadas al lindero este.</p>
              <div className="text-sm text-primary group-hover:underline flex items-center gap-1">
                Ver Cambios <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
