import { useState } from "react";
import { Link, useParams } from "react-router-dom";

interface DepartmentProjectDetailsProps {
  department: "Legal" | "Eléctrica" | "Hidrosanitaria" | "Paisajismo";
  deptKey: "legal" | "electrica" | "hidrosanitaria" | "paisajismo";
}

export function DepartmentProjectDetails({ department, deptKey }: DepartmentProjectDetailsProps) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'planos' | 'documentos' | 'dictamen'>('planos');
  const [docSeleccionado, setDocSeleccionado] = useState(0);

  // Content customized per department
  const getDeptConfig = () => {
    switch (deptKey) {
      case "legal":
        return {
          title: "Expediente Legal & Títulos",
          docType: "Documentos Legales",
          docs: [
            { nombre: "Título de Propiedad - Parcela 42-B.pdf", version: "Oficial", fecha: "10 Ago 2026", estado: "Verificado" },
            { nombre: "Certificado de Deslinde y Mensura.pdf", version: "Oficial", fecha: "10 Ago 2026", estado: "Pendiente" },
            { nombre: "Poder de Representación Legal.pdf", version: "v1.0", fecha: "08 Ago 2026", estado: "Aprobado" },
            { nombre: "Certificado de No Objeción CDE.pdf", version: "Draft", fecha: "11 Ago 2026", estado: "En Revisión" },
          ],
          dictamenLabel: "Dictamen Legal & No Objeción",
          checks: [
            "Titularidad de la propiedad verificada en Registro de Títulos.",
            "Deslinde catastral coincide con los planos de lindero presentados.",
            "Ausencia de cargas o gravámenes que impidan la edificación.",
            "Cumplimiento con el reglamento legal de Costasur."
          ],
          viewerImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop"
        };
      case "electrica":
        return {
          title: "Expediente de Ingeniería Eléctrica",
          docType: "Planos y Diagramas Eléctricos",
          docs: [
            { nombre: "Diagrama Unifilar General.pdf", version: "v1.2", fecha: "10 Ago 2026", estado: "En Revisión" },
            { nombre: "Planta de Cargas e Iluminación.pdf", version: "v1.0", fecha: "10 Ago 2026", estado: "Pendiente" },
            { nombre: "Detalle Subestación y Transformador.pdf", version: "v1.0", fecha: "09 Ago 2026", estado: "Pendiente" },
            { nombre: "Memoria de Cálculo de Cargas (75 kVA).pdf", version: "v1.1", fecha: "11 Ago 2026", estado: "Revision" },
          ],
          dictamenLabel: "Dictamen Técnico Eléctrico",
          checks: [
            "Carga total calculada (75 kVA) dentro de la capacidad de la red local.",
            "Especificaciones del transformador tipo pad-mounted aprobadas.",
            "Ubicación del interruptor principal accesible para mantenimiento.",
            "Protección contra sobretensiones y puesta a tierra adecuada."
          ],
          viewerImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop"
        };
      case "hidrosanitaria":
        return {
          title: "Expediente Hidrosanitario & Drenajes",
          docType: "Planos Hidrosanitarios",
          docs: [
            { nombre: "Planta de Red de Agua Potable.pdf", version: "v1.0", fecha: "10 Ago 2026", estado: "Aprobado" },
            { nombre: "Planta de Drenaje Pluvial y Pozos.pdf", version: "v1.1", fecha: "10 Ago 2026", estado: "En Revisión" },
            { nombre: "Detalle de Trampa de Grasa y Cisterna.pdf", version: "v1.0", fecha: "08 Ago 2026", estado: "Pendiente" },
            { nombre: "Memoria de Cálculo de Agua (12,000G).pdf", version: "v1.0", fecha: "10 Ago 2026", estado: "En Revisión" },
          ],
          dictamenLabel: "Dictamen Hidrosanitario",
          checks: [
            "Capacidad de cisterna adecuada para el número de habitaciones.",
            "Pozos de infiltración pluvial respetan la distancia a la piscina.",
            "Trampa de grasa residencial incluida en la descarga de cocina.",
            "Conexión a la red principal de agua potable de Costasur conforme."
          ],
          viewerImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop"
        };
      case "paisajismo":
      default:
        return {
          title: "Expediente de Paisajismo & Jardinería",
          docType: "Planos de Paisajismo",
          docs: [
            { nombre: "Planta de Paisajismo y Especies.pdf", version: "v1.0", fecha: "11 Ago 2026", estado: "En Revisión" },
            { nombre: "Catálogo de Especies Vegetales.pdf", version: "v1.0", fecha: "11 Ago 2026", estado: "Pendiente" },
            { nombre: "Planta de Riego Automatizado.pdf", version: "v1.0", fecha: "09 Ago 2026", estado: "Pendiente" },
            { nombre: "Detalle de Retiros Verdes y Muros Vegetales.pdf", version: "v1.0", fecha: "10 Ago 2026", estado: "Aprobado" },
          ],
          dictamenLabel: "Dictamen de Paisajismo",
          checks: [
            "Porcentaje de cobertura verde (38%) excede el 35% reglamentario.",
            "Todas las especies seleccionadas son endémicas o permitidas en Costasur.",
            "Sistema de riego automatizado con sensores de humedad previstos.",
            "Preservación de árboles maduros en el lote respetada."
          ],
          viewerImage: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200&auto=format&fit=crop"
        };
    }
  };

  const config = getDeptConfig();

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="mb-8">
        <Link to={`/${deptKey}/proyectos`} className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium text-sm mb-4">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Volver a Proyectos ({department})
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Villa Punta Águila #15</h2>
              <span className="bg-primary-container text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {department} - En Revisión
              </span>
            </div>
            <p className="text-lg text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">folder</span>
              {config.title} • ID Solicitud: #{id || '1024'}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white border border-outline-variant/50 text-error hover:bg-error/5 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined">cancel</span>
              Observar / Corregir
            </button>
            <button className="bg-primary text-white hover:bg-primary/90 rounded-full py-3 px-6 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined">check_circle</span>
              Aprobar {department}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 soft-shadow overflow-hidden flex flex-col">
        
        {/* Tabs */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-4 bg-surface-container-lowest overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('planos')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'planos' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            {config.docType}
          </button>
          <button 
            onClick={() => setActiveTab('documentos')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'documentos' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            Documentos Adjuntos
          </button>
          <button 
            onClick={() => setActiveTab('dictamen')}
            className={`px-6 py-4 font-bold border-b-4 whitespace-nowrap transition-colors ${activeTab === 'dictamen' ? 'text-primary border-primary' : 'text-secondary font-medium hover:text-primary border-transparent hover:border-outline-variant/30'}`}
          >
            {config.dictamenLabel}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'planos' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
              {/* Document list sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-bold text-on-surface mb-4">Archivos del Expediente</h3>
                <div className="space-y-2">
                  {config.docs.map((doc, i) => (
                    <div 
                      key={i} 
                      onClick={() => setDocSeleccionado(i)}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${docSeleccionado === i ? 'bg-primary-container/20 border-primary/50' : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/30'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className={`flex items-center gap-2 ${docSeleccionado === i ? 'text-primary' : 'text-on-surface'}`}>
                          <span className="material-symbols-outlined text-[18px]">description</span>
                          <span className="font-bold text-sm truncate" title={doc.nombre}>{doc.nombre}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                         <span className="text-xs text-secondary">{doc.version} • {doc.fecha}</span>
                         <span className="text-[10px] uppercase font-bold bg-surface-variant text-secondary px-2 py-0.5 rounded">{doc.estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Area */}
              <div className="lg:col-span-3 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 overflow-hidden relative min-h-[550px] flex flex-col">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Zoom In">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Zoom Out">
                    <span className="material-symbols-outlined">zoom_out</span>
                  </button>
                  <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow border border-outline-variant/20 flex items-center justify-center text-secondary hover:text-primary transition-colors" title="Añadir Nota">
                    <span className="material-symbols-outlined">add_comment</span>
                  </button>
                </div>
                
                {/* Simulated Viewer */}
                <div className="flex-1 bg-surface-variant flex items-center justify-center relative overflow-hidden p-6">
                   <img 
                     src={config.viewerImage} 
                     alt="Documento Visor"
                     className="max-w-full max-h-[450px] object-cover rounded-2xl shadow-2xl border-2 border-white"
                   />
                </div>
                
                {/* Actions Bar */}
                <div className="bg-white border-t border-outline-variant/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-on-surface">{config.docs[docSeleccionado]?.nombre}</h4>
                    <p className="text-xs text-secondary">Documento digitalizado verificado por el departamento de {department}.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-warning/10 text-warning-dark hover:bg-warning/20 font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center justify-center gap-2 border border-warning/20">
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      Observación
                    </button>
                    <button className="flex-1 md:flex-none bg-success/10 text-success hover:bg-success/20 font-medium px-4 py-2 rounded-full transition-colors text-sm flex items-center justify-center gap-2 border border-success/20">
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      Validar Documento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.docs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">folder_zip</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">{doc.nombre}</h4>
                    <p className="text-xs text-secondary mt-0.5">Versión: {doc.version} • {doc.fecha}</p>
                  </div>
                  <button className="text-primary text-sm font-medium hover:underline">Descargar</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dictamen' && (
            <div className="animate-in fade-in duration-300 max-w-3xl space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <h4 className="font-bold text-on-surface mb-4 text-lg">Lista de Verificación de Requisitos ({department})</h4>
                <div className="space-y-3">
                  {config.checks.map((check, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer">
                      <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-primary rounded accent-primary" />
                      <span className="text-sm text-on-surface font-medium">{check}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
                <h4 className="font-bold text-on-surface mb-3">Resolución / Comentario Oficial</h4>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 text-sm text-on-surface focus:border-primary outline-none transition-colors mb-4 min-h-[120px]"
                  placeholder={`Escriba el dictamen o resolución técnica para el departamento de ${department}...`}
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button className="bg-surface-container-high text-secondary hover:text-on-surface font-medium px-6 py-2 rounded-full transition-colors text-sm">
                    Guardar Borrador
                  </button>
                  <button className="bg-primary text-white hover:bg-primary/90 font-medium px-6 py-2 rounded-full transition-colors text-sm">
                    Emitir Dictamen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
