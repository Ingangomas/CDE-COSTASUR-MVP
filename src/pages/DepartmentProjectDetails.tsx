import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DocumentViewer } from "../components/DocumentViewer";
import { ReviewDecisionPanel } from "../components/ReviewDecisionPanel";
import { formatDate, getProjectWorkspace, type ProjectWorkspace } from "../lib/cde-data";

interface DepartmentProjectDetailsProps {
  department: "Legal" | "Eléctrica" | "Hidrosanitaria" | "Paisajismo" | "Mensura" | "Seguridad";
  deptKey: "legal" | "electrica" | "hidrosanitaria" | "paisajismo" | "mensura" | "seguridad";
}

const statusLabel = (status: string) => ({
  obra_activa: "Obra activa",
  en_revision: "En revisión",
  pendiente_inspeccion: "Pendiente de inspección",
  critica: "Crítica",
  paralizada: "Paralizada",
  finalizada: "Finalizada",
  aprobado: "Aprobada",
}[status] ?? status.replaceAll("_", " "));

export function DepartmentProjectDetails({ department, deptKey }: DepartmentProjectDetailsProps) {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    void getProjectWorkspace(id)
      .then((data) => { if (active) { setWorkspace(data); setSelectedDocumentId(data.documents[0]?.id ?? null); } })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el expediente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="flex-1 p-8 text-sm text-secondary">Cargando expediente persistido...</div>;
  if (error || !workspace || !id) return <div className="m-8 rounded-3xl border border-error/30 bg-error/10 p-8 text-sm text-error">{error ?? "Expediente no disponible."}</div>;

  const { project, property, documents } = workspace;
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-8 md:px-10 md:py-12">
      <Link to={`/${deptKey}/proyectos`} className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"><span className="material-symbols-outlined text-[20px]">arrow_back</span>Volver a Proyectos ({department})</Link>
      <header className="flex flex-col items-start justify-between gap-5 border-b border-outline-variant/30 pb-6 lg:flex-row lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Expediente persistente</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-on-surface md:text-5xl">{project.title}</h1><p className="mt-2 flex items-center gap-2 text-sm text-secondary"><span className="material-symbols-outlined text-[19px]">folder</span>{project.project_code} · {department} · {statusLabel(project.operational_status)}</p>{property && <p className="mt-1 text-sm text-secondary">{property.name} · {property.property_code}</p>}</div>
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-5 py-4 text-right"><p className="text-xs uppercase tracking-wider text-secondary">Avance físico</p><p className="mt-1 text-3xl font-bold text-primary">{project.progress_percent}%</p><p className="mt-1 text-xs text-secondary">Actualizado {formatDate(project.updated_at)}</p></div>
      </header>

      <ReviewDecisionPanel projectId={id} departmentSlug={deptKey} departmentName={department} />

      <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Repositorio documental</p><h2 className="mt-2 text-2xl font-bold text-primary">Documentos del expediente</h2></div><span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{documents.length} documentos</span></div>
        {!documents.length && <p className="mt-6 rounded-2xl bg-surface-container-low p-5 text-sm text-secondary">No hay documentos versionados disponibles para este expediente.</p>}
        {documents.length > 0 && <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.7fr)]"><div className="space-y-2">{documents.map((document) => <button key={document.id} type="button" onClick={() => setSelectedDocumentId(document.id)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedDocumentId === document.id ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:border-primary/40"}`}><p className="truncate text-sm font-semibold text-on-surface">{document.title}</p><p className="mt-1 text-xs text-secondary">{document.category.replaceAll("_", " ")} · {formatDate(document.created_at)}</p></button>)}</div><div className="min-h-[520px] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low">{selectedDocumentId ? <DocumentViewer documentId={selectedDocumentId} /> : <p className="p-8 text-sm text-secondary">Selecciona un documento.</p>}</div></div>}
      </section>
    </div>
  );
}
