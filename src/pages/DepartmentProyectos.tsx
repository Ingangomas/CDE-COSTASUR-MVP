import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

interface DepartmentProyectosProps {
  department: "Legal" | "Eléctrica" | "Hidrosanitaria" | "Paisajismo" | "Mensura" | "Seguridad";
  deptKey: "legal" | "electrica" | "hidrosanitaria" | "paisajismo" | "mensura" | "seguridad";
}

export function DepartmentProyectos({ department, deptKey }: DepartmentProyectosProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Data customized per department
  const getDepartmentProjects = () => {
    switch (deptKey) {
      case "legal":
        return [
          {
            id: "1",
            nombre: "Villa Punta Águila #15",
            propietario: "Juan Pérez",
            ubicacion: "Costasur - Parcela 42-B",
            estado: "En Revisión Legal",
            detalle: "Verificación de Título y Deslinde",
            fecha: "10 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
          },
          {
            id: "2",
            nombre: "Solar Los Lagos #4",
            propietario: "Inversiones del Caribe",
            ubicacion: "Lote 1,200 m²",
            estado: "Validado",
            detalle: "Sin Objeciones / No Gravamen",
            fecha: "01 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe",
          },
          {
            id: "3",
            nombre: "Casa de Campo #22",
            propietario: "Roberto Gómez",
            ubicacion: "Costasur, Sector Norte",
            estado: "Pendiente Titulo",
            detalle: "Documento de Traspaso en Proceso",
            fecha: "15 Jul 2026",
            imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
          },
        ];
      case "electrica":
        return [
          {
            id: "1",
            nombre: "Villa Punta Águila #15",
            propietario: "Juan Pérez",
            ubicacion: "Carga solicitada: 75 kVA",
            estado: "En Revisión Unifilar",
            detalle: "Cálculo de subestación y grupo electrógeno",
            fecha: "10 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
          },
          {
            id: "2",
            nombre: "Solar Los Lagos #4",
            propietario: "Inversiones del Caribe",
            ubicacion: "Carga solicitada: 45 kVA",
            estado: "Aprobado",
            detalle: "Acometida subterránea conforme",
            fecha: "02 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe",
          },
          {
            id: "5",
            nombre: "Vista Mar #5",
            propietario: "Estudio Litoral",
            ubicacion: "Carga solicitada: 100 kVA",
            estado: "Con Correcciones",
            detalle: "Ajustar ubicación de transfer switch",
            fecha: "05 Ago 2026",
            imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
          },
        ];
      case "hidrosanitaria":
        return [
          {
            id: "1",
            nombre: "Villa Punta Águila #15",
            propietario: "Juan Pérez",
            ubicacion: "Acometida 2 pulgadas - Cisterna 12,000G",
            estado: "En Revisión Pluvial",
            detalle: "Diseño de pozos de infiltración y trampa de grasa",
            fecha: "10 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
          },
          {
            id: "3",
            nombre: "Casa de Campo #22",
            propietario: "Roberto Gómez",
            ubicacion: "Tanque Séptico ecológico",
            estado: "Aprobado",
            detalle: "Drenaje pluvial y trampa de grasa aprobada",
            fecha: "20 Jul 2026",
            imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
          },
          {
            id: "5",
            nombre: "Vista Mar #5",
            propietario: "Estudio Litoral",
            ubicacion: "Piscina + Cisterna 18,000G",
            estado: "Con Correcciones",
            detalle: "Relocalizar trampa de grasa a 3m del lindero",
            fecha: "05 Ago 2026",
            imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
          },
        ];
      case "paisajismo":
        return [
          {
            id: "1",
            nombre: "Villa Punta Águila #15",
            propietario: "Juan Pérez",
            ubicacion: "Área verde: 450 m²",
            estado: "En Revisión Especies",
            detalle: "Plan de siembra de palmas reales y grama Zoysia",
            fecha: "11 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuFYMxX4l2AYjQh0ZLvhR-q67Q4XEepb3zGqd2LeDZUvs-BrveruRScUEh58i_vXNm4jcPuE3-Dmboe4NnULR_aFErYQHFa0ejDqvWtznOUrYKi1UUjKUD-IDG-qjrtUlHp9HP4Z_Kk1AdHRoyausxeQlFLcs2dS4Qht3kMfGxHOwULF4W_qN3ctDyKMuovROLMIaZHs4oR0UCRKR6RTWQF9pvKmBZOxjUJyjrWZro1fD6wfeK_4l0",
          },
          {
            id: "2",
            nombre: "Solar Los Lagos #4",
            propietario: "Inversiones del Caribe",
            ubicacion: "Área verde: 600 m²",
            estado: "Aprobado",
            detalle: "Cumple con el 35% mínimo de cobertura vegetal",
            fecha: "03 Ago 2026",
            imagen: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuWGOWXc1Fyh_aW0Q4Nb740Hdw1GpLBxhonddysbeyKxPeycXTWmvmgGBBR3nN52CbEMg_0hq8j-cFjfJVSaU0hXmJhBfk3lu8tvgucxqyXJmFApkr74eAstkSFtaw57G7s80H1mLE0XwuJlNDmXu_GDhDH6t-1aLgr8zQ3NmTxu8dfdaKeUz61L0RW1Tj118xIbpyGij2FURJaLz-RnHHjXZmXNPH6jCnnU16vko2M8bZHuGIzgIe",
          },
        ];
    }
  };

  const proyectos = getDepartmentProjects();

  const proyectosFiltrados = proyectos.filter(p => {
    const matchEstado = filtroEstado === "Todos" ? true : p.estado.includes(filtroEstado) || filtroEstado === p.estado;
    const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.propietario.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEstado && matchSearch;
  });

  const filtros = ["Todos", "En Revisión", "Aprobado", "Validado", "Con Correcciones"];

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">
          Proyectos - Depto. {department}
        </h2>
        <p className="text-lg text-secondary">
          Expedientes y solicitudes sometidas a la revisión del departamento de {department.toLowerCase()}.
        </p>
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
          <p className="text-secondary">No se encontraron proyectos para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectosFiltrados.map(proyecto => (
            <Link 
              to={`/${deptKey}/proyectos/${proyecto.id}`} 
              key={proyecto.id} 
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow hover:shadow-lg transition-shadow duration-300 block group"
            >
              <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={proyecto.nombre} 
                  src={proyecto.imagen}
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-opacity-90 shadow-sm ${
                  proyecto.estado.includes('Aprobado') || proyecto.estado.includes('Validado') ? 'bg-success/90 text-white' :
                  proyecto.estado.includes('Correcciones') ? 'bg-warning/90 text-white' :
                  'bg-primary-fixed text-primary'
                }`}>
                  {proyecto.estado}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-on-surface mb-1 truncate">{proyecto.nombre}</h4>
                <p className="text-xs text-secondary mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Propietario: <span className="font-medium text-on-surface">{proyecto.propietario}</span>
                </p>
                <p className="text-xs text-secondary mb-4 line-clamp-1">
                  {proyecto.ubicacion}
                </p>
                
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-secondary text-xs">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>{proyecto.fecha}</span>
                  </div>
                  <span className="text-primary font-medium hover:underline flex items-center gap-1 text-xs">
                    Ver Expediente <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

