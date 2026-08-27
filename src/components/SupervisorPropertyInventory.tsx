import { useMemo, useState } from "react";
import type { PropertyRecord } from "../lib/cde-types";

type PropertyInventoryRow = PropertyRecord & {
  historyCount: number;
  activeProject: string | null;
  projectStatus: string;
};

const propertyImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
];
const lotImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85",
];
const sectors = ["Punta Águila", "Tamarindo", "Caletón", "Las Cañas", "La Romana"];
const projectStatuses = ["En revisión", "Obra activa", "Finalizada", "Sin expediente activo"];
const propertyFilters = ["Todas", "Propiedades", "Solares"];

const SIMULATED_PROPERTIES: PropertyInventoryRow[] = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  const projectStatus = projectStatuses[index % projectStatuses.length];
  const isLot = number % 3 === 0;
  return {
    id: `supervisor-demo-property-${String(number).padStart(3, "0")}`,
    property_code: `COSTASUR-${isLot ? "LOT" : "VIV"}-${String(number).padStart(3, "0")}`,
    property_type: isLot ? "terreno" : "villa",
    name: `${isLot ? "Lote" : "Villa"} ${String(number).padStart(3, "0")}`,
    address: `Sector ${sectors[index % sectors.length]}, Casa de Campo · La Romana`,
    owner_user_id: null,
    area_m2: isLot ? 520 + (number % 8) * 45 : 420 + (number % 8) * 35,
    latitude: 18.423 + (index % 10) * 0.001,
    longitude: -68.976 - (index % 10) * 0.001,
    status: "active",
    historyCount: number % 4,
    activeProject: projectStatus === "Sin expediente activo" ? null : `Expediente ${String(number).padStart(3, "0")}`,
    projectStatus,
  };
});

const getStatusTone = (status: string) => status === "Obra activa" ? "bg-primary/10 text-primary" : status === "Finalizada" ? "bg-success/10 text-success" : status === "En revisión" ? "bg-warning/10 text-warning" : "bg-surface-container-low text-secondary";
const getPropertyImage = (property: PropertyInventoryRow) => {
  const number = Number(property.property_code.match(/\d+$/)?.[0] ?? 1);
  const images = property.property_type === "terreno" ? lotImages : propertyImages;
  return images[(number - 1) % images.length];
};

function PropertyDetail({ property, onBack }: { property: PropertyInventoryRow; onBack: () => void }) {
  const historyLabels = ["Registro de propiedad", "Expediente inicial", "Revisión documental", "Cierre de expediente"];
  const history = historyLabels.slice(0, property.historyCount);
  return <div className="space-y-6">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver al inventario</button>
    <article className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white shadow-sm"><div className="relative h-64 overflow-hidden bg-surface-container-low md:h-80"><img src={getPropertyImage(property)} alt={property.name} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" /><div className="absolute bottom-6 left-6 right-6 text-white md:left-8 md:right-8"><p className="text-xs uppercase tracking-[0.2em] opacity-85">{property.property_type === "terreno" ? "Solar del proyecto" : "Propiedad del proyecto"}</p><h2 className="mt-2 text-3xl font-bold md:text-4xl">{property.name}</h2></div></div><div className="p-6 md:p-8"><div className="flex flex-col gap-5 border-b border-outline-variant/20 pb-6 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{property.property_code}</p><p className="mt-3 flex items-start gap-2 text-sm text-secondary"><span className="material-symbols-outlined text-[20px]">location_on</span>{property.address}</p><p className="mt-3 text-sm font-semibold text-primary">{property.property_type === "terreno" ? "Solar / lote" : "Villa"} · {property.area_m2} m²</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusTone(property.projectStatus)}`}>{property.projectStatus}</span></div><div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2"><section className="rounded-2xl bg-surface-container-low p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Histórico del expediente</p>{history.length ? <div className="mt-4 space-y-3">{history.map((label, index) => <div key={label} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><div><p className="text-sm font-semibold text-on-surface">{label}</p><p className="text-xs text-secondary">Registro simulado del proyecto</p></div></div>)}</div> : <p className="mt-4 text-sm text-secondary">Esta propiedad todavía no tiene expedientes históricos registrados.</p>}</section><section className="rounded-2xl bg-surface-container-low p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Actividad actual</p>{property.activeProject ? <div className="mt-4"><p className="text-lg font-bold text-on-surface">{property.activeProject}</p><p className="mt-1 text-sm text-secondary">Estado actual: {property.projectStatus}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-primary" style={{ width: `${property.projectStatus === "Finalizada" ? 100 : property.projectStatus === "Obra activa" ? 68 : 32}%` }} /></div><p className="mt-2 text-xs text-secondary">Seguimiento operativo del expediente</p></div> : <p className="mt-4 text-sm text-secondary">Sin expediente activo en este momento.</p>}</section></div></div></article>
  </div>;
}

export function SupervisorPropertyInventory({ contextLabel = "Inventario general del proyecto" }: { contextLabel?: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todas");
  const [propertyType, setPropertyType] = useState("Todas");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const filteredProperties = useMemo(() => SIMULATED_PROPERTIES.filter((property) => {
    const haystack = `${property.property_code} ${property.name} ${property.address}`.toLowerCase();
    const matchesType = propertyType === "Todas" || (propertyType === "Solares" ? property.property_type === "terreno" : property.property_type !== "terreno");
    return matchesType && (!query || haystack.includes(query.toLowerCase())) && (status === "Todas" || property.projectStatus === status);
  }), [propertyType, query, status]);
  const selectedProperty = SIMULATED_PROPERTIES.find((property) => property.id === selectedPropertyId) ?? null;

  return <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm md:p-7">
    {selectedProperty ? <PropertyDetail property={selectedProperty} onBack={() => setSelectedPropertyId(null)} /> : <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{contextLabel}</p><h3 className="mt-2 text-2xl font-bold text-primary">100 viviendas y propiedades</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">Vista general del mismo inventario del proyecto: cada propiedad conserva su histórico y muestra si tiene una actividad actual.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><span className="material-symbols-outlined text-[16px]">grid_view</span>{filteredProperties.length} de 100 visibles</span></div>
      <div className="mt-6 flex flex-wrap gap-2">{propertyFilters.map((item) => <button type="button" key={item} onClick={() => setPropertyType(item)} className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${propertyType === item ? "bg-primary text-white" : "border border-outline-variant/30 bg-white text-secondary hover:border-primary/30"}`}>{item}</button>)}</div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1"><span className="sr-only">Buscar propiedad</span><span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-2xl border border-outline-variant/30 bg-white py-3 pl-10 pr-4 text-sm text-on-surface outline-none transition-colors focus:border-primary" placeholder="Buscar por código, villa o sector" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-outline-variant/30 bg-white px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"><option>Todas</option>{projectStatuses.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">{filteredProperties.map((property) => <button type="button" key={property.id} onClick={() => setSelectedPropertyId(property.id)} className="group overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="relative h-36 overflow-hidden bg-surface-container-low"><img src={getPropertyImage(property)} alt={property.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" /><div className="absolute bottom-4 left-5 right-5 text-white"><p className="text-[10px] uppercase tracking-[0.18em] opacity-85">{property.property_type === "terreno" ? "Solar del proyecto" : "Propiedad del proyecto"}</p><h4 className="mt-1 line-clamp-1 text-xl font-bold">{property.name}</h4></div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[11px] font-semibold uppercase tracking-[0.15em] text-secondary">{property.property_code}</p><p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-secondary"><span className="material-symbols-outlined text-[16px]">location_on</span><span>{property.address}</span></p><p className="mt-2 text-xs font-semibold text-primary">{property.property_type === "terreno" ? "Solar / lote" : "Villa"}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusTone(property.projectStatus)}`}>{property.projectStatus}</span></div><div className="mt-4 border-t border-outline-variant/20 pt-4"><p className="text-xs text-secondary">Histórico: <span className="font-semibold text-on-surface">{property.historyCount} {property.historyCount === 1 ? "expediente" : "expedientes"}</span></p><p className="mt-1 text-xs text-secondary">Activo: <span className="font-semibold text-on-surface">{property.activeProject ?? "Sin expediente activo"}</span></p></div></div></button>)}</div>
      {!filteredProperties.length && <div className="mt-6 rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low p-8 text-center text-sm text-secondary">No hay propiedades con esos criterios.</div>}
    </>}
  </section>;
}
