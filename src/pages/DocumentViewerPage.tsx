import { Link, useParams } from "react-router-dom";
import { DocumentViewer } from "../components/DocumentViewer";

export function DocumentViewerPage() {
  const { id, documentId } = useParams();
  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-6">
      <Link to={id ? `/propietario/mis-propiedades/${id}` : "/propietario/mis-propiedades"} className="inline-flex items-center gap-2 text-secondary hover:text-primary text-sm font-medium"><span className="material-symbols-outlined text-base">arrow_back</span>Volver al expediente</Link>
      {documentId ? <DocumentViewer documentId={documentId} /> : <div className="glass-panel p-8 text-error">No se indicó un documento válido.</div>}
    </div>
  );
}
