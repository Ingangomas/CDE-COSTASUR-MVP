import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export function ControlDeObrasProyectos() {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const proyectos = [
    {
      id: "1",
      nombre: "Villa Punta Águila #15",
      ubicacion: "Costasur, República Dominicana",
      estado: "En proceso",
      progreso: 65,
      imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
    },
    {
      id: "2",
      nombre: "Solar Los Lagos #4",
      ubicacion: "Lote 1,200 m² - Etapa de Diseño",
      estado: "Pendiente",
      progreso: 15,
      imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe",
    },
    {
      id: "3",
      nombre: "Casa de Campo #22",
      ubicacion: "Costasur, Sector Norte",
      estado: "Suspendido",
      progreso: 40,
      imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "4",
      nombre: "Las Palmas #10",
      ubicacion: "Zona Costera, Lote 5",
      estado: "Completado",
      progreso: 100,
      imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "5",
      nombre: "Vista Mar #5",
      ubicacion: "Marina, Lote 12",
      estado: "Pendiente",
      progreso: 5,
      imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "6",
      nombre: "Residencia Marina #8",
      ubicacion: "Marina Principal",
      estado: "En proceso",
      progreso: 85,
      imagen: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    }
  ];

  const proyectosFiltrados = proyectos.filter(p => {
    const matchEstado = filtroEstado === "Todos" ? true : p.estado === filtroEstado;
    const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEstado && matchSearch;
  });

  const filtros = ["Todos", "En proceso", "Pendiente", "Suspendido", "Completado"];

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">Proyectos de Obra</h2>
        <p className="text-lg text-secondary">Seleccione un proyecto para ver su expediente, planos y visor de documentos.</p>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto gap-3 mb-8 pb-2 custom-scrollbar">
        {filtros.map(filtro => (
          <button
            key={filtro}
            onClick={() => setFiltroEstado(filtro)}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
              filtroEstado === filtro 
                ? "bg-primary text-white shadow-md" 
                : "bg-surface-container-low text-secondary border border-outline-variant/30 hover:bg-surface-container-highest"
            }`}
          >
            {filtro}
          </button>
        ))}
      </div>

      {proyectosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[48px] text-secondary/50 mb-4">inbox</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">No hay proyectos</h3>
          <p className="text-secondary">No se encontraron proyectos con el estado seleccionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectosFiltrados.map(proyecto => (
            <Link to={`/control-obras/proyectos/${proyecto.id}`} key={proyecto.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow hover:shadow-lg transition-shadow duration-300 block group">
              <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={proyecto.nombre} 
                  src={proyecto.imagen}
                />
                <div className="absolute top-4 right-4 bg-primary-fixed text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-opacity-90 shadow-sm">
                  {proyecto.estado}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-on-surface mb-1 truncate">{proyecto.nombre}</h4>
                <p className="text-sm text-secondary mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {proyecto.ubicacion}
                </p>
                
                <div className="pt-4 border-t border-outline-variant/20">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-secondary font-medium">Progreso</span>
                    <span className="font-bold text-primary">{proyecto.progreso}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${proyecto.progreso}%` }}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
