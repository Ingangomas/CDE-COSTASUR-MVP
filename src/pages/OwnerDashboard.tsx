import { Link } from "react-router-dom";

export function OwnerDashboard() {
  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">Mis Propiedades</h2>
          <p className="text-lg text-secondary">Gestione sus propiedades, proyectos arquitectónicos y documentos aprobados.</p>
        </div>
        <button className="glass-panel text-primary-container border-white/40 hover:bg-white/60 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-all shadow-sm self-start md:self-auto">
          <span className="material-symbols-outlined">verified</span>
          Autorización de Arquitecto
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Property Card 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow hover:shadow-lg transition-shadow duration-300">
          <div className="relative h-64 w-full bg-surface-variant">
            <img 
              className="w-full h-full object-cover" 
              alt="Villa Punta Águila" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0"
            />
            <div className="absolute top-4 right-4 bg-primary-fixed text-primary px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-opacity-90 flex items-center gap-2 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
              Obra Activa
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8">
              <div className="flex-1">
                <h4 className="text-3xl font-bold text-on-surface mb-2">Villa Punta Águila #15</h4>
                <p className="text-base text-secondary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  Costasur, República Dominicana
                </p>
                
                <div className="flex flex-wrap gap-8 pt-4 border-t border-outline-variant/20">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Arquitecto</p>
                    <p className="text-base font-medium mt-1">Studio A</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Contratista</p>
                    <p className="text-base font-medium mt-1">Constructora ABC</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-secondary font-semibold">Progreso</p>
                    <p className="text-base font-medium mt-1 text-primary">65%</p>
                  </div>
                </div>
              </div>
              
              {/* Documentos Aprobados Embebidos */}
              <div className="bg-surface-container-low rounded-2xl p-6 lg:w-96 border border-outline-variant/30 shrink-0">
                <h5 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">task</span>
                  Documentos Aprobados
                </h5>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer transition-colors group">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm group-hover:bg-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-primary group-hover:text-white">description</span>
                    </div>
                    <span className="font-medium">Carta de Aprobación.pdf</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-secondary hover:text-primary cursor-pointer transition-colors group">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm group-hover:bg-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-primary group-hover:text-white">architecture</span>
                    </div>
                    <span className="font-medium">Planos_Finales_v2.dwg</span>
                  </li>
                </ul>
                <button className="w-full mt-4 text-center text-primary-container font-medium text-sm hover:underline">
                  Ver todos los documentos
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link to="/propietario/mis-propiedades/1" className="text-primary-container font-medium hover:underline flex items-center gap-1 text-lg">
                Ir al Proyecto <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Property Card 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow hover:shadow-lg transition-shadow duration-300 flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-1/3 h-64 lg:h-auto bg-surface-variant shrink-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Solar Los Lagos" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe"
            />
          </div>
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-3xl font-bold text-on-surface">Solar Los Lagos #4</h4>
              <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                En Revisión Legal
              </div>
            </div>
            <p className="text-base text-secondary mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">map</span>
              Lote 1,200 m² - Etapa de Diseño
            </p>
            
            <div className="bg-surface-container-low rounded-xl p-5 mb-6 border border-outline-variant/30">
              <h5 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">pending_actions</span>
                Documentos Sometidos (En proceso)
              </h5>
              <p className="text-sm text-secondary italic">Aún no hay documentos aprobados para esta propiedad. Expediente actualmente bajo revisión legal.</p>
            </div>

            <div className="flex gap-4">
              <button className="bg-primary text-white py-3 px-6 rounded-full text-sm hover:bg-primary/90 transition-colors font-medium shadow-sm">
                Ver Estatus de Revisión
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
