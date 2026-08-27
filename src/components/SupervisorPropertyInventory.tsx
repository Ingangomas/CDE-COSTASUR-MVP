import { useMemo, useState } from "react";

type SimulatedProperty = {
  id: string;
  code: string;
  name: string;
  sector: string;
  status: string;
  type: string;
};

const sectors = ["Punta Águila", "Tamarindo", "Caletón", "Las Cañas", "La Romana"];
const statuses = ["Disponible", "En revisión", "Obra activa", "Finalizada"];

const SIMULATED_PROPERTIES: SimulatedProperty[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  return {
    id: `supervisor-demo-property-${String(number).padStart(3, "0")}`,
    code: `COSTASUR-VIV-${String(number).padStart(3, "0")}`,
    name: `Villa ${String(number).padStart(3, "0")}`,
    sector: sectors[index % sectors.length],
    status: statuses[index % statuses.length],
    type: number % 5 === 0 ? "Lote en desarrollo" : "Vivienda",
  };
});

export function SupervisorPropertyInventory({ contextLabel = "Inventario general del proyecto" }: { contextLabel?: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todas");
  const filteredProperties = useMemo(() => SIMULATED_PROPERTIES.filter((property) => {
    const haystack = `${property.code} ${property.name} ${property.sector}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (status === "Todas" || property.status === status);
  }), [query, status]);

  return <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm md:p-7">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{contextLabel}</p><h3 className="mt-2 text-2xl font-bold text-primary">100 viviendas y propiedades</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">Simulación visual del inventario completo del proyecto para supervisión general. Estos registros no modifican propiedades ni expedientes reales.</p></div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><span className="material-symbols-outlined text-[16px]">grid_view</span>{filteredProperties.length} de 100 visibles</span>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1"><span className="sr-only">Buscar propiedad simulada</span><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-2xl border border-outline-variant/30 bg-white py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" placeholder="Buscar por código, villa o sector" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"><option>Todas</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{filteredProperties.map((property) => <div key={property.id} className="rounded-2xl border border-outline-variant/30 bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-on-surface">{property.name}</p><p className="mt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-secondary">{property.code}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${property.status === "Obra activa" ? "bg-primary/10 text-primary" : property.status === "Finalizada" ? "bg-success/10 text-success" : property.status === "En revisión" ? "bg-warning/10 text-warning" : "bg-surface-container-low text-secondary"}`}>{property.status}</span></div><p className="mt-3 flex items-center gap-1 text-xs text-secondary"><span className="material-symbols-outlined text-[16px]">location_on</span>{property.sector} · {property.type}</p></div>)}</div>
    {!filteredProperties.length && <div className="mt-6 rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low p-8 text-center text-sm text-secondary">No hay propiedades simuladas con esos criterios.</div>}
  </section>;
}
