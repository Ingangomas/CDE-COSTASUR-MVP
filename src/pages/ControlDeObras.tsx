export function ControlDeObras() {
  return (
    <div className="p-4 md:p-8 lg:px-10 flex-1 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-2">Dashboard Control de Obras</h2>
          <p className="text-lg text-secondary">Overview of active construction sites and critical actions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-white/40 border border-white backdrop-blur-md text-primary-container font-medium py-2 px-4 rounded-full flex items-center gap-2 hover:bg-white/60 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add_location</span>
            Programar Visita
          </button>
          <button className="bg-primary-container text-on-primary font-medium py-2 px-4 rounded-full flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">report_problem</span>
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Obras Activas Dashboard (Large) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 soft-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="text-xl text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">foundation</span>
              Obras Activas (Casa de Campo)
            </h3>
            <div className="flex gap-2">
              <button className="p-1 rounded bg-surface-container-low text-secondary hover:text-primary"><span className="material-symbols-outlined">map</span></button>
              <button className="p-1 rounded bg-surface-container-low text-secondary hover:text-primary"><span className="material-symbols-outlined">list</span></button>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden relative border border-outline-variant/20">
            {/* Map Placeholder */}
            <img 
              className="w-full h-full object-cover absolute inset-0" 
              alt="Map" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCASHFBPDzIj99DhGSfTRZM0vPzz9TMCbV8IAQaM68RqF_1wG1zFS4xX_YR9htxB4m9UIBDYAjfzpGo-8KDmNcclXBZ1_O_mz7g6eyT1UTMWHhj7jXU-U9i6w2t-DQHYKoBRNoO1WPeSEuoFGO7apu1hnLtNS61Pv8g5_0cIVrhCt_cFqMF-3dOCZRkyCZGGsMoeSyidPC3C-QngtpDTSE-UFUC6U09aZaL9J32X7XttcSS2W5T_Rrp" 
            />
            
            {/* Map Markers (Simulated) */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-primary-container rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary-container rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-error rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"></div>
          </div>
        </div>

        {/* Solicitudes de Inicio (Small/Vertical) */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 soft-shadow flex flex-col">
          <h3 className="text-xl text-primary font-bold mb-4 flex items-center gap-2 pb-4 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary-container">pending_actions</span>
            Solicitudes de Inicio
          </h3>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Request Card 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Villa 42 - Punta Minitas</span>
                <span className="bg-secondary-container/50 text-secondary text-[10px] font-semibold uppercase px-2 py-1 rounded-full">In Review</span>
              </div>
              <p className="text-sm text-on-surface mb-3 line-clamp-2">Permits pending legal verification. Structural plans approved by architecture board.</p>
              <div className="text-sm text-primary-container group-hover:underline flex items-center gap-1">
                Verificación Legal <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>

            {/* Request Card 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Lote 15 - Barranca</span>
                <span className="bg-primary-container/10 text-primary-container text-[10px] font-semibold uppercase px-2 py-1 rounded-full">Approved</span>
              </div>
              <p className="text-sm text-on-surface mb-3 line-clamp-2">All legal constraints cleared. Ready for initial topography sweep.</p>
              <div className="text-sm text-primary-container group-hover:underline flex items-center gap-1">
                Notificar Vaciado <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Log (Wide) */}
        <div className="lg:col-span-12 glass-panel rounded-3xl p-6 soft-shadow mt-2">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="text-xl text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">photo_library</span>
              Inspection Log & Multimedia
            </h3>
            <button className="text-primary-container text-sm font-medium hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Media Item 1 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 group">
              <div className="h-40 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Drone Survey" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm_Au9vuDtDWzx1qvCQkCjathVB-hy1-Qqot0JQG2MCk5itQ0yqxu-nOn6vqMKVNGd1FVBFf-MiQ1112rVU30PrfikF7U1SC8AwHMXgZL0ctpcOXmM_wJXLqgOMBg6L0Jgsfs2vwbxgKv4Gg9XSHIHMg-rC-UfR1WHrh8jJy5t-6oD0ma7i6_lZLUuikBYC7NllvZRBW59P_gGAbYOSQVfugMo0awJc4ujpIdPQkfGXg5ojtPUrpsI" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded backdrop-blur-sm tracking-wider">DRONE</span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-primary mb-1 text-base">Villa 42 - Drone Survey</h4>
                <p className="text-sm text-secondary">Oct 12, 2023 • Foundation stage</p>
              </div>
            </div>

            {/* Media Item 2 (Incidencia) */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 group ring-1 ring-error/30">
              <div className="h-40 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Incidencia" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy8Rvss-U-tpBDQQLhtvfAKoSYrQkfrUoCMWPQIAa5aGpl40xWG8eIAdOxiFjMvODK21I1BvRo8YsWGRsBcpeYPEqqjQVp2gbXD21CAIuGRUPzgDNXZVfx6YMj2FXSABqo49r0rrNcsNHUve9SIrCrEaFOVo2dHD5fLWITcAa1t4DnM2XpXwKBd_LAnEPOO_bbI_17yHrgtqIHiO-zn1W0mIyjMsTnqtxnxc7Rv6wQFgHZX7Kzu3zz" 
                />
                <span className="absolute top-2 left-2 bg-error text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm tracking-wider">INCIDENCIA</span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-primary mb-1 text-base">Lote 15 - Misaligned Conduit</h4>
                <p className="text-sm text-secondary">Oct 11, 2023 • Reported by J. Perez</p>
              </div>
            </div>

            {/* Media Item 3 */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 group">
              <div className="h-40 relative">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Framing" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCoAcIHRcUsNnpuC8wLM8J7uppJLBqmmGxEgz1a-n8_96kahOgBIiBQ3kHJ-U5ckVNG5nU4XizTOg-Kwej5ZB5mP3PhXCGqwOCN0tLMF0GEh21A6t1umzvMmTol100_q8dS7X9G6D-rvB771Mj3JtDLGrosTIhswk_dVA3u0zkqnp7wJZ5fTaeCwvnZ-KRLrnZjzdR2dpGH3D46uKzBw-5BbVafIYWcma6Hlo_eIRS8h4VznW2W8dr" 
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-primary mb-1 text-base">Marina Plot C - Framing</h4>
                <p className="text-sm text-secondary">Oct 10, 2023 • Site Visit</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
