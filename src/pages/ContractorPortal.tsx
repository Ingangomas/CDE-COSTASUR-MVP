import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";
import { getFirstProjectForUser } from "../lib/cde-data";
import { ContractorWorkflows } from "../components/ContractorWorkflows";
import { useSearchParams } from "react-router-dom";

interface Obra {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string;
  fase: string;
  estado: "Obra Activa" | "Pendiente Inspección" | "Por Iniciar" | "Finalizada";
  progreso: number;
  proximaInspeccion?: string;
  imagen: string;
  arquitecto: string;
  propietario: string;
  licencia: string;
}

export function ContractorPortal() {
  const [searchParams] = useSearchParams();
  const { profile } = useSession();
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => { if (!profile?.id) return; getFirstProjectForUser(profile.id).then(setProjectId).catch(() => setProjectId(null)); }, [profile?.id]);
  const searchQuery = searchParams.get("search") || "";
  const [filtroEstado, setFiltroEstado] = useState<string>("Todas");
  const [activeModal, setActiveModal] = useState<"inicio" | "inspeccion" | "bitacora" | null>(null);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [obras] = useState<Obra[]>([
    {
      id: "1",
      codigo: "OBR-2025-042",
      nombre: "Villa 42 - Punta Minitas",
      ubicacion: "Punta Minitas, Lote 42",
      fase: "Vaciado de Hormigón Armado",
      estado: "Obra Activa",
      progreso: 65,
      proximaInspeccion: "12 de Agosto, 2026",
      imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDm_Au9vuDtDWzx1qvCQkCjathVB-hy1-Qqot0JQG2MCk5itQ0yqxu-nOn6vqMKVNGd1FVBFf-MiQ1112rVU30PrfikF7U1SC8AwHMXgZL0ctpcOXmM_wJXLqgOMBg6L0Jgsfs2vwbxgKv4Gg9XSHIHMg-rC-UfR1WHrh8jJy5t-6oD0ma7i6_lZLUuikBYC7NllvZRBW59P_gGAbYOSQVfugMo0awJc4ujpIdPQkfGXg5ojtPUrpsI",
      arquitecto: "Arq. Roberto Morales",
      propietario: "Familia Gómez-Báez",
      licencia: "LIC-CDE-2025-089"
    },
    {
      id: "2",
      codigo: "OBR-2025-015",
      nombre: "Villa Punta Águila #15",
      ubicacion: "Punta Águila, Sector 2",
      fase: "Verificación de Linderos & Replanteo",
      estado: "Pendiente Inspección",
      progreso: 25,
      proximaInspeccion: "9 de Agosto, 2026 (Mañana)",
      imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
      arquitecto: "Studio Arq. Viteri",
      propietario: "Carlos Mendoza",
      licencia: "LIC-CDE-2025-014"
    },
    {
      id: "3",
      codigo: "OBR-2025-104",
      nombre: "Residencia Las Palmas #10",
      ubicacion: "Las Palmas, Lote 10",
      fase: "Instalación Eléctrica e Hidrosanitaria",
      estado: "Obra Activa",
      progreso: 80,
      proximaInspeccion: "18 de Agosto, 2026",
      imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
      arquitecto: "Arq. Sarah Jenkins",
      propietario: "Desarrollos Palmas SRL",
      licencia: "LIC-CDE-2024-512"
    },
    {
      id: "4",
      codigo: "OBR-2026-004",
      nombre: "Solar Los Lagos #4",
      ubicacion: "Los Lagos, Lote 4",
      fase: "Excavación y Movimiento de Tierra",
      estado: "Por Iniciar",
      progreso: 5,
      imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe",
      arquitecto: "Arq. Fernando Castillo",
      propietario: "Inversiones CDE",
      licencia: "LIC-CDE-2026-003"
    },
    {
      id: "5",
      codigo: "OBR-2024-088",
      nombre: "Villa Vista Mar #88",
      ubicacion: "Vista Mar, Lote 88",
      fase: "Terminación y Paisajismo",
      estado: "Finalizada",
      progreso: 100,
      imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
      arquitecto: "Arq. Diana Torres",
      propietario: "Familia Rivas",
      licencia: "LIC-CDE-2024-102"
    }
  ]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const obrasFiltradas = obras.filter(obra => {
    const matchEstado = filtroEstado === "Todas" ? true : obra.estado === filtroEstado;
    const matchSearch = obra.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        obra.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        obra.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEstado && matchSearch;
  });

  const getStatusColor = (estado: Obra["estado"]) => {
    switch (estado) {
      case "Obra Activa":
        return "bg-primary-fixed text-primary border-primary/20";
      case "Pendiente Inspección":
        return "bg-tertiary-fixed text-tertiary border-tertiary/20";
      case "Por Iniciar":
        return "bg-secondary-container text-on-secondary-container border-secondary/20";
      case "Finalizada":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-6 md:pt-8 bg-surface-container-low min-h-full">
      {projectId && <ContractorWorkflows projectId={projectId} />}
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-white/20">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-on-surface tracking-tight mb-1">
              Portal del Contratista
            </h2>
            <p className="text-sm md:text-base text-secondary">
              Gestión centralizada de obras asignadas, visitas topográficas y bitácoras de campo.
            </p>
          </div>
          <button 
            onClick={() => setActiveModal("inicio")}
            className="bg-primary text-white font-medium px-6 py-3 rounded-full hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg shrink-0 text-sm md:text-base"
          >
            <span className="material-symbols-outlined text-[20px]">assignment_add</span>
            Someter Inicio de Obra
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">construction</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{obras.length}</p>
              <p className="text-xs text-secondary font-medium">Obras Totales</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">play_circle</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-800">{obras.filter(o => o.estado === "Obra Activa").length}</p>
              <p className="text-xs text-secondary font-medium">En Ejecución</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">engineering</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{obras.filter(o => o.estado === "Pendiente Inspección").length}</p>
              <p className="text-xs text-secondary font-medium">Inspecciones Solicitadas</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{obras.filter(o => o.estado === "Finalizada").length}</p>
              <p className="text-xs text-secondary font-medium">Finalizadas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {["Todas", "Obra Activa", "Pendiente Inspección", "Por Iniciar", "Finalizada"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroEstado(filtro)}
              className={`px-5 py-2.5 rounded-full font-medium text-xs md:text-sm transition-all whitespace-nowrap border ${
                filtroEstado === filtro
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-variant"
              }`}
            >
              {filtro}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obrasFiltradas.map((obra) => (
            <div 
              key={obra.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={obra.nombre} 
                    src={obra.imagen}
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${getStatusColor(obra.estado)}`}>
                    {obra.estado}
                  </div>
                  <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-mono">
                    {obra.codigo}
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-on-surface truncate">{obra.nombre}</h4>
                    <p className="text-xs md:text-sm text-secondary flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      {obra.ubicacion}
                    </p>
                  </div>

                  <div className="space-y-2 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 text-xs text-secondary">
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface/70">Fase Actual:</span>
                      <span className="font-semibold text-primary truncate max-w-[170px] text-right">{obra.fase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface/70">Arquitecto:</span>
                      <span className="text-on-surface truncate">{obra.arquitecto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-on-surface/70">Licencia:</span>
                      <span className="font-mono text-on-surface">{obra.licencia}</span>
                    </div>
                    {obra.proximaInspeccion && (
                      <div className="flex justify-between pt-1 border-t border-outline-variant/20 text-amber-700 font-medium">
                        <span>Próxima Visita:</span>
                        <span>{obra.proximaInspeccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-secondary font-medium">Avance Físico</span>
                      <span className="font-bold text-primary">{obra.progreso}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${obra.progreso}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 md:p-6 pt-0 space-y-2">
                <button 
                  onClick={() => {
                    setSelectedObra(obra);
                    setActiveModal("inspeccion");
                  }}
                  className="w-full bg-primary-container text-white py-2.5 rounded-xl font-medium text-xs md:text-sm hover:bg-primary-container/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">engineering</span>
                  Solicitar Visita / Inspección
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => showNotification(`Descargando expedientes de planos aprobados para ${obra.codigo}...`)}
                    className="w-full bg-surface-container-low text-primary py-2 rounded-xl font-medium text-xs hover:bg-surface-container transition-colors flex items-center justify-center gap-1 border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span>
                    Planos
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedObra(obra);
                      setActiveModal("bitacora");
                    }}
                    className="w-full bg-surface-container-low text-primary py-2 rounded-xl font-medium text-xs hover:bg-surface-container transition-colors flex items-center justify-center gap-1 border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    Bitácora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Someter Inicio de Obra */}
        {activeModal === "inicio" && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-outline-variant/30 animate-scale-up">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-primary">Someter Inicio de Obra</h3>
                  <p className="text-xs md:text-sm text-secondary">Notifique a la Oficina de Control de Obras de Costasur el arranque oficial.</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-secondary hover:text-primary p-1 rounded-full"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showNotification("Aviso de Inicio de Obra enviado correctamente a la Oficina de Control.");
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Proyecto / Lote</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Solar Los Lagos #4 (OBR-2026-004)</option>
                    <option>Villa Punta Águila #15 (OBR-2025-015)</option>
                    <option>Otro proyecto autorizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Fecha Programada de Inicio</label>
                  <input 
                    type="date" 
                    defaultValue="2026-08-15"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Ingeniero / Residente a Cargo</label>
                  <input 
                    type="text" 
                    placeholder="Ing. Juan Pérez - Codia #34120"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Adjuntar Permiso o Documentación (PDF/IMG)</label>
                  <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 text-center bg-surface-container-lowest hover:bg-surface-variant/30 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[28px] text-secondary">cloud_upload</span>
                    <p className="text-xs text-secondary mt-1">Arrastre o seleccione el acta de replanteo inicial</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-surface-variant text-secondary py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Solicitar Inspección */}
        {activeModal === "inspeccion" && selectedObra && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-outline-variant/30 animate-scale-up">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-primary">Solicitar Inspección de Campo</h3>
                  <p className="text-xs md:text-sm text-secondary">{selectedObra.nombre} ({selectedObra.codigo})</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-secondary hover:text-primary p-1 rounded-full"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showNotification(`Visita de inspección programada con éxito para ${selectedObra.nombre}.`);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Tipo de Visita Técnica</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option>Verificación de Linderos / Replanteo</option>
                    <option>Inspección de Armado de Acero (Previo a Vaciado)</option>
                    <option>Inspección de Red Eléctrica e Hidrosanitaria</option>
                    <option>Inspección Final de Entrega</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Fecha Sugerida</label>
                  <input 
                    type="date" 
                    defaultValue="2026-08-11"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Comentarios / Indicaciones para el Inspector</label>
                  <textarea 
                    rows={3}
                    placeholder="Ej. El acero del vaciado estará listo para revisión antes del mediodía..."
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-surface-variant text-secondary py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Confirmar Visita
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Bitácora */}
        {activeModal === "bitacora" && selectedObra && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-outline-variant/30 animate-scale-up">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-primary">Añadir Entrada a Bitácora</h3>
                  <p className="text-xs md:text-sm text-secondary">{selectedObra.nombre}</p>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-secondary hover:text-primary p-1 rounded-full"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setActiveModal(null);
                showNotification("Entrada registrada en la bitácora digital de la obra.");
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Avance o Registro Diario</label>
                  <textarea 
                    rows={4}
                    placeholder="Describa los trabajos ejecutados hoy, personal en obra o incidentes..."
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Porcentaje de Avance Físico Actualizado (%)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedObra.progreso}
                    min={0}
                    max={100}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 bg-surface-variant text-secondary py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


