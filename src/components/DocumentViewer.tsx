import { useEffect, useState, type MouseEvent } from "react";
import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import { createPdfAnnotation, getDocumentViewerData } from "../lib/cde-data";
import type { DocumentAnnotation, DocumentVersion } from "../lib/cde-types";
import { useSession } from "../context/SessionContext";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { CadViewer } from "./CadViewer";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  documentId: string | null;
}

export function DocumentViewer({ documentId }: DocumentViewerProps) {
  const { profile, primaryRole } = useSession();
  const canAnnotate = primaryRole === "revision_tecnica";
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [version, setVersion] = useState<DocumentVersion | null>(null);
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>([]);
  const [title, setTitle] = useState("Documento");
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [draft, setDraft] = useState<{ x: number; y: number; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    if (!documentId) {
      setTitle("Sin plano seleccionado");
      setSignedUrl(null);
      setVersion(null);
      setAnnotations([]);
      setLoading(false);
      return;
    }
    getDocumentViewerData(documentId)
      .then((data) => { setTitle(data.document.title); setSignedUrl(data.signedUrl); setVersion(data.version); setAnnotations(data.annotations); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible abrir el documento."))
      .finally(() => setLoading(false));
  }, [documentId]);

  const handlePageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!annotationMode || !canAnnotate || !signedUrl || !version) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setDraft({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100, content: "" });
  };

  const saveAnnotation = async () => {
    if (!canAnnotate || !draft || !version || !profile?.id || !draft.content.trim()) return;
    setSaving(true);
    try {
      const saved = await createPdfAnnotation({ documentVersionId: version.id, authorId: profile.id, pageNumber, x: draft.x, y: draft.y, content: draft.content.trim() });
      setAnnotations((current) => [...current, saved]);
      setDraft(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible guardar la anotación.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="glass-panel p-8 text-center text-secondary">Preparando visor documental…</div>;
  if (error) return <div className="glass-panel p-8 border border-error/30 text-error">{error}</div>;
  if (!signedUrl || !version) return <section className="glass-panel overflow-hidden border border-outline-variant/30 bg-white"><div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Visor de planos</p><h2 className="text-xl font-bold text-on-surface mt-1">{title}</h2></div><span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-secondary">Sin archivo seleccionado</span></div><div className="grid min-h-[520px] place-items-center bg-[#eef0f2] p-8 text-center"><div><span className="material-symbols-outlined text-6xl text-secondary">architecture</span><h3 className="mt-4 text-xl font-semibold text-on-surface">Visor listo para recibir planos</h3><p className="mx-auto mt-2 max-w-md text-sm text-secondary">Selecciona una hoja del panel lateral. Cuando el archivo sea cargado y versionado, aparecerá aquí sin cambiar esta estructura.</p></div></div><p className="border-t border-outline-variant/30 px-5 py-3 text-xs text-secondary">{canAnnotate ? "Las herramientas de revisión estarán disponibles al abrir un plano." : "Vista de solo lectura para este perfil."}</p></section>;
  const isCad = /\.(dwg|dxf)$/i.test(version?.original_filename ?? "");
  if (isCad && signedUrl && version) return <section className="glass-panel p-5 md:p-7 border border-outline-variant/30"><div className="mb-6"><p className="text-xs uppercase tracking-[0.18em] text-secondary">Visor documental</p><h2 className="text-2xl font-bold text-on-surface mt-2">{title}</h2><p className="text-sm text-secondary mt-1">{version.original_filename} · solo lectura</p></div><CadViewer url={signedUrl} filename={version.original_filename} /></section>;

  return (
    <section className="glass-panel p-5 md:p-7 border border-outline-variant/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Visor documental</p><h2 className="text-2xl font-bold text-on-surface mt-2">{title}</h2><p className="text-sm text-secondary mt-1">Versión {version.version_number} · {version.original_filename}</p></div>
        <div className="flex items-center gap-2">{canAnnotate && <button type="button" onClick={() => { setAnnotationMode((value) => !value); setDraft(null); }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${annotationMode ? "bg-primary text-white border-primary" : "border-outline-variant/50 text-primary hover:bg-primary/5"}`}><span className="material-symbols-outlined text-base">edit_note</span>{annotationMode ? "Modo anotación activo" : "Añadir anotación"}</button>}</div>
      </div>
      <div className="flex items-center justify-between mb-4 text-sm text-secondary"><span>Página {pageNumber} de {numPages || "…"}</span><div className="flex items-center gap-2"><button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber((value) => Math.max(1, value - 1))} className="p-2 rounded-full hover:bg-surface-container-low disabled:opacity-40"><span className="material-symbols-outlined">chevron_left</span></button><button type="button" disabled={pageNumber >= numPages} onClick={() => setPageNumber((value) => Math.min(numPages, value + 1))} className="p-2 rounded-full hover:bg-surface-container-low disabled:opacity-40"><span className="material-symbols-outlined">chevron_right</span></button></div></div>
      <div className="overflow-auto rounded-2xl bg-surface-container-low p-4">
        <div className="relative mx-auto w-fit cursor-crosshair" onClick={handlePageClick}>
          <PdfDocument file={signedUrl} onLoadSuccess={({ numPages: total }) => setNumPages(total)} loading={<div className="p-16 text-secondary">Cargando PDF…</div>}><Page pageNumber={pageNumber} width={760} /></PdfDocument>
          {annotations.filter((annotation) => annotation.page_number === pageNumber).map((annotation) => <div key={annotation.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 max-w-[180px] rounded-xl bg-warning text-[#321b00] px-3 py-2 text-xs font-medium shadow-lg" style={{ left: `${annotation.x ?? 0}%`, top: `${annotation.y ?? 0}%` }}><span className="material-symbols-outlined text-sm align-middle mr-1">comment</span>{annotation.content}</div>)}
          {draft && <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2 w-64 rounded-2xl bg-white border border-primary/30 shadow-xl p-3" style={{ left: `${draft.x}%`, top: `${draft.y}%` }} onClick={(event) => event.stopPropagation()}><textarea autoFocus value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Escribe el comentario" className="w-full min-h-20 text-sm text-on-surface border border-outline-variant/40 rounded-xl p-2 outline-none focus:border-primary" /><div className="flex justify-end gap-2 mt-2"><button type="button" onClick={() => setDraft(null)} className="px-3 py-1.5 text-xs text-secondary">Cancelar</button><button type="button" disabled={saving || !draft.content.trim()} onClick={saveAnnotation} className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold disabled:opacity-50">{saving ? "Guardando…" : "Guardar"}</button></div></div>}
        </div>
      </div>
      <p className="text-xs text-secondary mt-4">Las anotaciones se guardan como una capa independiente vinculada a la versión del documento, página y autor.</p>
    </section>
  );
}


