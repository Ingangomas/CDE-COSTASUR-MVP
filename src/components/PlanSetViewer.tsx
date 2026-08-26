import { useEffect, useMemo, useState } from "react";
import { DocumentViewer } from "./DocumentViewer";
import { useSession } from "../context/SessionContext";
import type { DocumentRecord } from "../lib/cde-types";

const PLAN_CATEGORY_ORDER = [
  "curvas_nivel", "planta_conjunto", "planta_nivel", "sotano", "elevaciones", "secciones",
  "anteproyecto", "arquitectonico", "estructural", "electrico", "hidrosanitario", "climatizacion", "cad",
];

const PLAN_CATEGORY_META: Record<string, { label: string; icon: string; discipline: string }> = {
  curvas_nivel: { label: "Curvas de nivel", icon: "terrain", discipline: "Topografía" },
  planta_conjunto: { label: "Planta de conjunto", icon: "grid_view", discipline: "Arquitectura" },
  planta_nivel: { label: "Plantas por nivel", icon: "layers", discipline: "Arquitectura" },
  sotano: { label: "Sótano", icon: "foundation", discipline: "Arquitectura" },
  elevaciones: { label: "Elevaciones", icon: "view_stream", discipline: "Arquitectura" },
  secciones: { label: "Secciones", icon: "vertical_split", discipline: "Arquitectura" },
  anteproyecto: { label: "Anteproyecto", icon: "architecture", discipline: "Arquitectura" },
  arquitectonico: { label: "Planos arquitectónicos", icon: "architecture", discipline: "Arquitectura" },
  estructural: { label: "Planos estructurales", icon: "foundation", discipline: "Estructuras" },
  electrico: { label: "Planos eléctricos", icon: "bolt", discipline: "Electricidad" },
  hidrosanitario: { label: "Planos hidrosanitarios", icon: "plumbing", discipline: "Hidrosanitaria" },
  climatizacion: { label: "Climatización", icon: "ac_unit", discipline: "Climatización" },
  cad: { label: "Planos CAD", icon: "architecture", discipline: "Documentación técnica" },
};

function categoryMeta(category: string) {
  return PLAN_CATEGORY_META[category] ?? { label: category.replaceAll("_", " "), icon: "description", discipline: "Documento técnico" };
}

function sortPlans(documents: DocumentRecord[]) {
  return [...documents].sort((a, b) => {
    const categoryDifference = (PLAN_CATEGORY_ORDER.indexOf(a.category) < 0 ? 999 : PLAN_CATEGORY_ORDER.indexOf(a.category)) - (PLAN_CATEGORY_ORDER.indexOf(b.category) < 0 ? 999 : PLAN_CATEGORY_ORDER.indexOf(b.category));
    return categoryDifference || a.title.localeCompare(b.title, "es");
  });
}

export function PlanSetViewer({ documents }: { documents: DocumentRecord[] }) {
  const { primaryRole } = useSession();
  const canAnnotate = primaryRole === "revision_tecnica";
  const plans = useMemo(() => sortPlans(documents.filter((document) => PLAN_CATEGORY_ORDER.includes(document.category))), [documents]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(plans[0]?.id ?? null);
  const selectedDocument = plans.find((document) => document.id === selectedDocumentId) ?? null;

  useEffect(() => {
    if (!plans.some((document) => document.id === selectedDocumentId)) setSelectedDocumentId(plans[0]?.id ?? null);
  }, [plans, selectedDocumentId]);

  const groupedPlans = useMemo(() => plans.reduce<Record<string, DocumentRecord[]>>((groups, document) => {
    groups[document.category] = [...(groups[document.category] ?? []), document];
    return groups;
  }, {}), [plans]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-outline-variant/30 bg-[#eef0f2] shadow-sm">
      <header className="flex flex-col gap-4 border-b border-outline-variant/30 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="material-symbols-outlined rounded-lg bg-primary px-2 py-1 text-white">architecture</span>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-primary">Planos y hojas</p><p className="truncate text-xs text-secondary">Visor documental del expediente · {canAnnotate ? "Revisión técnica" : "Solo lectura"}</p></div>
        </div>
        <span className="self-start rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">{plans.length} {plans.length === 1 ? "hoja" : "hojas"}</span>
      </header>

      <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_250px]">
        <aside className="border-b border-outline-variant/30 bg-[#f8f9fa] lg:border-b-0 lg:border-r">
          <div className="border-b border-outline-variant/30 px-4 py-4"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Planos y vistas</p><p className="mt-1 text-xs text-secondary">{plans.length} documentos disponibles</p></div>
          <div className="border-b border-outline-variant/30 px-4 py-3"><div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-xs text-secondary"><span className="material-symbols-outlined text-base">search</span><span>Buscar hojas</span></div></div>
          <div className="max-h-[590px] overflow-y-auto p-3">
            {!plans.length && <div className="rounded-xl bg-white p-4 text-xs leading-5 text-secondary">Todavía no hay planos cargados. Las hojas aparecerán aquí en el orden correspondiente cuando sean versionadas.</div>}
            {(Object.entries(groupedPlans) as [string, DocumentRecord[]][]).map(([category, categoryDocuments]) => {
              const meta = categoryMeta(category);
              return <div key={category} className="mb-4"><div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-secondary"><span className="material-symbols-outlined text-base">{meta.icon}</span>{meta.label}</div>{categoryDocuments.map((document, index) => <button key={document.id} type="button" onClick={() => setSelectedDocumentId(document.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors ${selectedDocument?.id === document.id ? "border-primary/40 bg-white shadow-sm" : "border-transparent hover:border-outline-variant/40 hover:bg-white"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-container-low text-primary"><span className="material-symbols-outlined text-xl">{meta.icon}</span></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-on-surface">{document.title}</span><span className="mt-1 block truncate text-[10px] text-secondary">{meta.discipline} · {document.current_version_id ? `V${index + 1}` : "Pendiente de archivo"}</span></span></button>)}</div>;
            })}
          </div>
        </aside>

        <main className="relative flex min-h-[620px] flex-col bg-[#dfe2e5]">
          <div className="flex items-center justify-between border-b border-black/10 bg-[#eceeef] px-4 py-3"><div className="flex items-center gap-2"><span className="rounded-lg bg-white p-2 text-secondary"><span className="material-symbols-outlined">near_me</span></span><span className="rounded-lg p-2 text-secondary"><span className="material-symbols-outlined">pan_tool</span></span><span className="mx-1 h-6 w-px bg-black/10" /><span className="text-xs text-secondary">{selectedDocument ? categoryMeta(selectedDocument.category).label : "Selecciona una hoja"}</span></div><div className="flex items-center gap-2 text-secondary"><span className="rounded-lg p-2"><span className="material-symbols-outlined">fit_screen</span></span><span className="rounded-lg p-2"><span className="material-symbols-outlined">grid_on</span></span></div></div>
          <div className="flex-1 overflow-auto p-4 md:p-6"><div className="mx-auto max-w-[900px]"><DocumentViewer documentId={selectedDocument?.id ?? null} /></div></div>
          <div className="flex items-center justify-center gap-2 border-t border-black/10 bg-[#eceeef] px-4 py-3 text-secondary"><span className="text-xs">{selectedDocument ? "Hoja seleccionada" : "Vista preparada"}</span><span className="text-xs">·</span><span className="text-xs">{canAnnotate ? "Herramientas de revisión disponibles" : "Vista de revisión"}</span></div>
        </main>

        <aside className="border-t border-outline-variant/30 bg-white lg:border-l lg:border-t-0">
          <div className="border-b border-outline-variant/30 px-5 py-4"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Información de la hoja</p><h3 className="mt-1 text-lg font-bold text-primary">{selectedDocument?.title ?? "Sin hoja seleccionada"}</h3><p className="mt-1 text-xs text-secondary">{selectedDocument ? `${categoryMeta(selectedDocument.category).discipline} · ${categoryMeta(selectedDocument.category).label}` : "Esperando documentación"}</p></div>
          <div className="space-y-5 p-5"><div className="rounded-xl bg-surface-container-low p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-secondary">Estado</span><span className={`flex items-center gap-1 text-xs font-semibold ${selectedDocument?.current_version_id ? "text-success" : "text-secondary"}`}><span className={`h-2 w-2 rounded-full ${selectedDocument?.current_version_id ? "bg-success" : "bg-secondary/40"}`} />{selectedDocument?.current_version_id ? "Versionado" : "Pendiente"}</span></div><p className="mt-3 text-xs leading-5 text-secondary">{canAnnotate ? "Puedes revisar y colocar comentarios sobre la hoja seleccionada." : "Este perfil puede consultar las hojas sin modificar el expediente."}</p></div>{canAnnotate && <div className="rounded-xl border border-primary/20 bg-primary/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-primary">Revisión técnica</p><p className="mt-2 text-xs leading-5 text-secondary">Activa “Añadir anotación” dentro del visor para marcar y comentar el plano.</p></div>}</div>
        </aside>
      </div>
    </section>
  );
}
