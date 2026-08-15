import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import { getFirstProjectForUser } from "../lib/cde-data";
import { DocumentUpload } from "../components/DocumentUpload";

export function ArchitectPortal() {
  const [activeTab, setActiveTab] = useState("Anteproyecto");
  const { profile } = useSession();
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => { if (!profile?.id) return; getFirstProjectForUser(profile.id).then(setProjectId).catch(() => setProjectId(null)); }, [profile?.id]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-8 bg-surface-container-low min-h-full">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Project Header */}
        <div className="mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">Dashboard Arquitecto</h2>
          <p className="text-lg text-secondary">Gestione sus proyectos y sometimientos a revisión.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container-highest text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Active Project
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Remodelación Villa Vivero #22</h1>
          </div>
          <button className="glass-panel text-primary-container font-medium px-6 py-3 rounded-full hover:bg-white/90 transition-all flex items-center gap-2 border-white shadow-sm">
            <span className="material-symbols-outlined">upload_file</span>
            Someter a Revisión
          </button>
        </div>

        {/* Submission Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Tabs & Upload */}
          <div className="lg:col-span-2 space-y-6">
            {projectId && <DocumentUpload projectId={projectId} />}
            {/* Custom Tabs */}
            <div className="flex overflow-x-auto gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20 max-w-full custom-scrollbar">
              <button 
                onClick={() => setActiveTab("Anteproyecto")}
                className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "Anteproyecto" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}>
                  Anteproyecto
              </button>
              <button 
                onClick={() => setActiveTab("Planos Técnicos")}
                className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "Planos Técnicos" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}>
                  Planos Técnicos
              </button>
              <button 
                onClick={() => setActiveTab("Memoria Descriptiva")}
                className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === "Memoria Descriptiva" ? "bg-white shadow-sm text-primary" : "text-secondary hover:text-primary"}`}>
                  Memoria Descriptiva
              </button>
            </div>

            {/* Upload Area Bento Card */}
            <div className="bg-white rounded-[2rem] border border-[#E5E5E7] p-8 soft-shadow">
              
              {activeTab === "Anteproyecto" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-primary">Documentos Requeridos</h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-fixed/50 border border-primary/20 px-3 py-1.5 rounded-full shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                      Revisión Asistida por IA Próximamente
                    </div>
                  </div>
                  <div className="space-y-4">
                    
                    {/* Upload Item 1 */}
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">map</span>
                      <p className="font-medium text-primary">Curvas de nivel</p>
                      <p className="text-sm text-secondary mt-1">Arrastra y suelta tu archivo PDF o DWG aquí</p>
                    </div>

                    {/* Upload Item 2 */}
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">view_compact</span>
                      <p className="font-medium text-primary">Plantas Arquitectónicas</p>
                      <p className="text-sm text-secondary mt-1">Arrastra y suelta tus archivos PDF aquí</p>
                    </div>

                    {/* Upload Item 3 */}
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">view_in_ar</span>
                      <p className="font-medium text-primary">Renders</p>
                      <p className="text-sm text-secondary mt-1">Arrastra y suelta tus imágenes JPG o PNG aquí</p>
                    </div>
                    
                  </div>
                </>
              )}

              {activeTab === "Planos Técnicos" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-primary">Planos Técnicos Especializados</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">foundation</span>
                      <p className="font-medium text-primary">Estructurales</p>
                      <p className="text-sm text-secondary mt-1">Archivos PDF / DWG</p>
                    </div>
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">electrical_services</span>
                      <p className="font-medium text-primary">Eléctricos</p>
                      <p className="text-sm text-secondary mt-1">Archivos PDF / DWG</p>
                    </div>
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">water_drop</span>
                      <p className="font-medium text-primary">Hidrosanitarios</p>
                      <p className="text-sm text-secondary mt-1">Archivos PDF / DWG</p>
                    </div>
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2">air</span>
                      <p className="font-medium text-primary">Climatización</p>
                      <p className="text-sm text-secondary mt-1">Archivos PDF / DWG</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "Memoria Descriptiva" && (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-primary">Memoria Descriptiva del Proyecto</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center bg-surface-container-low text-center cursor-pointer hover:border-primary-container hover:bg-primary-fixed/30 transition-colors min-h-[250px]">
                      <span className="material-symbols-outlined text-5xl text-secondary mb-3">description</span>
                      <p className="text-lg font-medium text-primary">Cargar Documento Completo</p>
                      <p className="text-sm text-secondary mt-2 max-w-sm mx-auto">Adjunte la memoria descriptiva arquitectónica y de ingeniería. Se aceptan formatos PDF, DOCX (Máx 50MB).</p>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-[#E5E5E7] p-6 soft-shadow h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/30">
                <h3 className="text-xl font-bold text-primary">Historial de Versiones</h3>
                <span className="material-symbols-outlined text-secondary">history</span>
              </div>
              
              <div className="relative border-l-2 border-surface-container-high ml-3 space-y-8 pb-4">
                
                {/* Timeline Item 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-error"></div>
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">12 OCT 2023</span>
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-semibold uppercase tracking-wider">Rejected</span>
                  </div>
                  <p className="font-medium text-primary text-sm mb-2">V2 - Revisión Arquitectónica</p>
                  <div className="bg-surface-container-low p-3 rounded-lg text-sm text-on-surface-variant">
                    "Los retiros laterales no cumplen con el reglamento del sector Vivero. Favor ajustar a mínimo 3.5m."
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-tint"></div>
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">05 OCT 2023</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-dim text-on-surface text-[10px] font-semibold uppercase tracking-wider">Under Review</span>
                  </div>
                  <p className="font-medium text-primary text-sm mb-2">V2 - Sometido</p>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-container"></div>
                  <div className="mb-1 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">28 SEP 2023</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-semibold uppercase tracking-wider">Approved</span>
                  </div>
                  <p className="font-medium text-primary text-sm mb-2">V1 - Conceptualización</p>
                  <div className="bg-surface-container-low p-3 rounded-lg text-sm text-on-surface-variant">
                    "Volumetría aprobada preliminarmente."
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

