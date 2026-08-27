import { CasaDeCampoMap } from "../components/CasaDeCampoMap";
import { SupervisorPropertyInventory } from "../components/SupervisorPropertyInventory";

export function TechnicalReview() {
  return <div className="mx-auto flex-1 w-full max-w-[1600px] space-y-6 p-4 md:p-8 lg:px-10">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Departamento de Arquitectura</p><h2 className="mt-2 text-3xl font-bold text-primary md:text-5xl">Revisión General</h2><p className="mt-2 max-w-3xl text-sm text-secondary md:text-base">Mapa general del proyecto y propiedades bajo revisión del departamento.</p></div>
    <CasaDeCampoMap title="Mapa GIS de Arquitectura" subtitle="Casa de Campo · La Romana · ubicación general del proyecto" heightClassName="h-[300px] md:h-[380px]" />
    <SupervisorPropertyInventory contextLabel="Arquitectura · inventario general" />
  </div>;
}
