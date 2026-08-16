import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AdminLiveMetrics } from '../components/AdminLiveMetrics';
import { AdminLiveOperations } from '../components/AdminLiveOperations';

const COLORS = ['#003B70', '#4CAF50', '#FFC107', '#F44336'];

export function DashboardAnalytics({ role }: { role: string }) {
  let pieData = [];
  let barData = [];
  let title = "Dashboard";
  let description = "Vista general y métricas";

  switch (role) {
    case 'propietario':
      title = "Dashboard Propietario";
      description = "Progreso de sus proyectos y estado de solicitudes.";
      pieData = [
        { name: 'En Diseño', value: 1 },
        { name: 'En Revisión', value: 2 },
        { name: 'Aprobados', value: 1 },
        { name: 'En Construcción', value: 1 },
      ];
      barData = [
        { name: 'Villa Punta Águila', progreso: 65 },
        { name: 'Lote Barranca', progreso: 15 },
        { name: 'Remodelación', progreso: 90 },
      ];
      break;
    case 'arquitecto':
      title = "Dashboard Arquitecto";
      description = "Métricas de proyectos sometidos a Costasur.";
      pieData = [
        { name: 'Aprobados', value: 4 },
        { name: 'En Revisión', value: 3 },
        { name: 'Rechazados / Correcciones', value: 1 },
      ];
      barData = [
        { name: 'Ene', sometimientos: 2 },
        { name: 'Feb', sometimientos: 4 },
        { name: 'Mar', sometimientos: 3 },
        { name: 'Abr', sometimientos: 5 },
      ];
      break;
    case 'contratista':
      title = "Dashboard Contratista";
      description = "Avance general de las obras activas bajo su cargo.";
      pieData = [
        { name: 'Al Día', value: 5 },
        { name: 'Atrasados', value: 1 },
        { name: 'Finalizados', value: 3 },
      ];
      barData = [
        { name: 'Obra 1', avance: 45 },
        { name: 'Obra 2', avance: 80 },
        { name: 'Obra 3', avance: 20 },
      ];
      break;
    case 'control-obras':
      title = "Dashboard Control de Obras";
      description = "Métricas y resumen de estado de todas las obras y visitas.";
      pieData = [
        { name: 'Completadas', value: 34 },
        { name: 'En Proceso', value: 12 },
        { name: 'Suspendidas', value: 3 },
        { name: 'Recién Iniciadas', value: 5 },
      ];
      barData = [
        { name: 'Visitas Pendientes', cantidad: 8 },
        { name: 'Visitas Realizadas', cantidad: 45 },
        { name: 'Incidencias Abiertas', cantidad: 4 },
        { name: 'Incidencias Cerradas', cantidad: 12 },
      ];
      break;
    case 'revision-tecnica':
      title = "Dashboard Depto. Arquitectura";
      description = "Métricas de revisión de planos arquitectónicos y sometimientos.";
      pieData = [
        { name: 'En Revisión', value: 15 },
        { name: 'Aprobados', value: 45 },
        { name: 'Con Correcciones', value: 10 },
        { name: 'Rechazados', value: 2 },
      ];
      barData = [
        { name: 'Lun', revisiones: 8 },
        { name: 'Mar', revisiones: 12 },
        { name: 'Mié', revisiones: 15 },
        { name: 'Jue', revisiones: 10 },
        { name: 'Vie', revisiones: 14 },
      ];
      break;
    case 'admin':
      title = "Dashboard General de Administración";
      description = "Visión global de todas las operaciones, obras y revisiones en Costasur.";
      pieData = [
        { name: 'Obras Activas', value: 120 },
        { name: 'En Revisión (Arq)', value: 45 },
        { name: 'Revisiones Legales', value: 12 },
        { name: 'Proyectos Aprobados', value: 340 },
      ];
      barData = [
        { name: 'Arq.', tareas: 45 },
        { name: 'Legal', tareas: 12 },
        { name: 'Obras', tareas: 120 },
        { name: 'Elec.', tareas: 15 },
        { name: 'Hidro.', tareas: 8 },
        { name: 'Paisaje', tareas: 5 },
      ];
      break;
    default:
      title = `Dashboard - ${role.charAt(0).toUpperCase() + role.slice(1)}`;
      description = "Métricas de revisiones y casos de su departamento.";
      pieData = [
        { name: 'Pendientes', value: 12 },
        { name: 'En Proceso', value: 5 },
        { name: 'Completados', value: 24 },
      ];
      barData = [
        { name: 'Lun', casos: 4 },
        { name: 'Mar', casos: 6 },
        { name: 'Mié', casos: 8 },
        { name: 'Jue', casos: 5 },
        { name: 'Vie', casos: 10 },
      ];
      break;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 pt-8 bg-surface-container-low min-h-full">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">{title}</h2>
          <p className="text-lg text-secondary">{description}</p>
        </div>

        {role === 'admin' && (
          <div className="space-y-8">
            <AdminLiveMetrics />
            <AdminLiveOperations />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pie Chart Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 soft-shadow border border-outline-variant/30 flex flex-col">
            <h3 className="text-xl font-bold text-primary mb-6">Estado General</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 soft-shadow border border-outline-variant/30 flex flex-col">
            <h3 className="text-xl font-bold text-primary mb-6">Métricas de Actividad</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,59,112,0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey={Object.keys(barData[0] || {})[1]} fill="#003B70" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
