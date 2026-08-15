import { AdminLiveMapSummary } from "../components/AdminLiveMapSummary";
import { Link } from "react-router-dom";

export function AdminMapaGeneral() {
  return (
    <div className="p-4 md:p-8 lg:px-10 flex-1 max-w-[1700px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-1 tracking-tight">Admin General</h2>
          <p className="text-xs md:text-base text-secondary">
            Supervisión ejecutiva global: mapa georeferenciado de obras, control de licencias e incidencias normativas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link 
            to="/admin/proyectos" 
            className="bg-surface-container-low text-primary border border-outline-variant/30 font-medium py-2 px-4 rounded-full flex items-center gap-2 hover:bg-surface-variant transition-all text-xs md:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            Ver Proyectos (12)
          </Link>
          <button className="bg-primary-container text-on-primary font-medium py-2 px-4 rounded-full flex items-center gap-2 hover:opacity-90 transition-all shadow-sm text-xs md:text-sm">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Reporte Ejecutivo
          </button>
        </div>
      </div>

      {/* KPI Stat Cards for Admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Obras Activas</p>
            <p className="text-2xl md:text-3xl font-bold text-primary mt-1">24</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +3 este mes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">construction</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Licencias Vigentes</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-800 mt-1">18</p>
            <p className="text-[11px] text-secondary font-medium mt-1">
              2 pendientes de firma
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Incidencias Críticas</p>
            <p className="text-2xl md:text-3xl font-bold text-error mt-1">2</p>
            <p className="text-[11px] text-error font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span> Requiere intervención
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container/30 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">report_problem</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Inspecciones Mes</p>
            <p className="text-2xl md:text-3xl font-bold text-secondary mt-1">42</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              98% aprobadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">fact_check</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6"><AdminLiveMapSummary /></div>
      {/* Main Grid: Map + Executive Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map (8 columns on lg) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-4 sm:p-6 soft-shadow flex flex-col relative overflow-hidden min-h-[480px]">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant/20">
            <h3 className="text-lg md:text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">map</span>
              Geolocalización de Proyectos y Obras (GIS Costasur)
            </h3>
            <span className="text-xs text-secondary bg-surface-container-low px-3 py-1 rounded-full font-mono border border-outline-variant/20">
              Coordenadas: 18.4278° N, 68.9061° W
            </span>
          </div>

          <div className="absolute top-16 left-6 sm:top-20 sm:left-8 z-10 glass-panel p-3 sm:p-4 rounded-2xl shadow-lg border border-white/50 flex flex-col gap-1.5 bg-surface/90 backdrop-blur-md max-w-[210px] sm:max-w-none">
            <h4 className="font-bold text-xs text-on-surface mb-1">Leyenda General</h4>
            <div className="flex items-center gap-2 text-[11px] font-medium text-secondary">
               <div className="w-3 h-3 bg-warning rounded-full shrink-0"></div> En Revisión Técnica
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-secondary">
               <div className="w-3 h-3 bg-primary rounded-full shrink-0"></div> Obra Activa
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-secondary">
               <div className="w-3 h-3 bg-error rounded-full shrink-0"></div> Obra Paralizada / Violación
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-secondary">
               <div className="w-3 h-3 bg-success rounded-full shrink-0"></div> Finalizado / Licencia Emítida
            </div>
          </div>

          <div className="w-full flex-1 rounded-2xl overflow-hidden relative border border-outline-variant/20 min-h-[380px]">
            {/* Map Background */}
            <img 
              className="w-full h-full object-cover absolute inset-0" 
              alt="Map" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCASHFBPDzIj99DhGSfTRZM0vPzz9TMCbV8IAQaM68RqF_1wG1zFS4xX_YR9htxB4m9UIBDYAjfzpGo-8KDmNcclXBZ1_O_mz7g6eyT1UTMWHhj7jXU-U9i6w2t-DQHYKoBRNoO1WPeSEuoFGO7apu1hnLtNS61Pv8g5_0cIVrhCt_cFqMF-3dOCZRkyCZGGsMoeSyidPC3C-QngtpDTSE-UFUC6U09aZaL9J32X7XttcSS2W5T_Rrp" 
            />
            
            {/* Map Markers */}
            <Link to="/admin/proyectos/1" className="absolute top-[30%] left-[40%] group cursor-pointer hover:z-10">
              <div className="w-7 h-7 bg-warning rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-[14px] text-white">architecture</span>
              </div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20 z-20">
                <p className="text-xs font-bold text-on-surface">Villa Punta Águila #15</p>
                <p className="text-[10px] text-secondary">En Revisión (Arq)</p>
              </div>
            </Link>

            <Link to="/admin/proyectos/2" className="absolute top-[60%] left-[55%] group cursor-pointer hover:z-10">
              <div className="w-7 h-7 bg-primary rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white">construction</span>
              </div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20 z-20">
                <p className="text-xs font-bold text-on-surface">Solar Los Lagos #4</p>
                <p className="text-[10px] text-secondary">Obra Activa (65% avance)</p>
              </div>
            </Link>

            <Link to="/admin/proyectos/3" className="absolute top-[50%] left-[70%] group cursor-pointer hover:z-10">
              <div className="w-7 h-7 bg-error rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-[14px] text-white">warning</span>
              </div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20 z-20">
                <p className="text-xs font-bold text-on-surface">Casa de Campo #22</p>
                <p className="text-[10px] text-error font-medium">Paralizada - Permiso Vencido</p>
              </div>
            </Link>
            
            <Link to="/admin/proyectos/4" className="absolute top-[45%] right-[30%] group cursor-pointer hover:z-10">
              <div className="w-7 h-7 bg-success rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-white">check</span>
              </div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-outline-variant/20 z-20">
                <p className="text-xs font-bold text-on-surface">Vista Mar #5</p>
                <p className="text-[10px] text-secondary">Obra Finalizada</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Executive Administrative Details (4 columns on lg) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Critical Alerts Card */}
          <div className="glass-panel rounded-3xl p-5 soft-shadow border border-outline-variant/20 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-error">notification_important</span>
                Alertas de Control de Obras
              </h3>
              <span className="bg-error-container/50 text-on-error-container text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Urgente
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-error-container/20 border border-error/30 rounded-2xl space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface">Casa de Campo #22</span>
                  <span className="text-[10px] text-error font-semibold">Licencia Expirada</span>
                </div>
                <p className="text-[11px] text-secondary">
                  Inspector reportó continuación de trabajos de vaciado sin renovación de permiso de construcción.
                </p>
                <div className="pt-1 flex gap-2">
                  <button className="text-[11px] text-error font-bold hover:underline">Emitir Paro de Obra</button>
                  <span className="text-secondary text-[11px]">•</span>
                  <Link to="/admin/proyectos/3" className="text-[11px] text-primary font-bold hover:underline">Ver Expediente</Link>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-on-surface">Punta Minitas #12</span>
                  <span className="text-[10px] text-amber-800 font-semibold">Exceso Altura Linderos</span>
                </div>
                <p className="text-[11px] text-secondary">
                  Revisión técnica de arquitectura detecta +0.80m sobre la cota máxima aprobada en reglamento.
                </p>
              </div>
            </div>
          </div>

          {/* Departmental Status Overview */}
          <div className="glass-panel rounded-3xl p-5 soft-shadow border border-outline-variant/20 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
              <h3 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">corporate_fare</span>
                Eficiencia Departamental
              </h3>
              <Link to="/admin/departamentos" className="text-xs text-primary font-medium hover:underline">
                Gestionar
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary font-medium">Arquitectura & Urbanismo</span>
                  <span className="font-bold text-primary">92% a tiempo</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary font-medium">Departamento Legal</span>
                  <span className="font-bold text-primary">88% a tiempo</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary font-medium">Ingeniería Eléctrica e Hidro</span>
                  <span className="font-bold text-primary">95% a tiempo</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary font-medium">Inspecciones de Control de Obras</span>
                  <span className="font-bold text-amber-700">78% a tiempo</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-1.5">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Inspector Logs */}
          <div className="glass-panel rounded-3xl p-5 soft-shadow border border-outline-variant/20 space-y-3">
            <h3 className="text-base font-bold text-primary flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary">engineering</span>
              Últimas Inspecciones de Campo
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-surface-container-low">
                <div>
                  <p className="font-bold text-on-surface">Solar Los Lagos #4</p>
                  <p className="text-[11px] text-secondary">Inspección de Armado de Acero</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Aprobada</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-surface-container-low">
                <div>
                  <p className="font-bold text-on-surface">Villa Punta Águila #15</p>
                  <p className="text-[11px] text-secondary">Replanteo de Linderos Topográficos</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pendiente</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


