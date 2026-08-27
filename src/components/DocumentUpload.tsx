import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useSession } from "../context/SessionContext";
import type { DocumentRecord } from "../lib/cde-types";
import { requireSupabase } from "../lib/supabase";

interface DocumentCategoryOption {
  value: string;
  label: string;
}

interface DocumentUploadProps {
  projectId: string;
  onUploaded?: (document?: DocumentRecord) => void;
  defaultCategory?: string;
  categories?: DocumentCategoryOption[];
  titleLabel?: string;
  accept?: string;
  visibleToOwner?: boolean;
  compact?: boolean;
  fixedTitle?: string;
}

const DEFAULT_CATEGORIES: DocumentCategoryOption[] = [
  { value: "anteproyecto", label: "Anteproyecto" },
  { value: "arquitectonico", label: "Arquitectónico" },
  { value: "estructural", label: "Estructural" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hidrosanitario", label: "Hidrosanitario" },
  { value: "climatizacion", label: "Climatización" },
  { value: "memoria_descriptiva", label: "Memoria descriptiva" },
  { value: "cad", label: "CAD" },
  { value: "otro", label: "Otro" },
];

export function DocumentUpload({ projectId, onUploaded, defaultCategory = "anteproyecto", categories = DEFAULT_CATEGORIES, titleLabel = "Título del documento", accept = ".pdf,.dwg,.dxf,.doc,.docx,image/png,image/jpeg", visibleToOwner = false, compact = false, fixedTitle = "" }: DocumentUploadProps) {
  const { profile } = useSession();
  const inputId = useId();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const uploadFile = async (selectedFile: File) => {
    const documentTitle = fixedTitle.trim() || title.trim();
    if (!profile?.id || !documentTitle) { setError("Indica un título y selecciona un archivo."); return; }
    if (selectedFile.size > 50 * 1024 * 1024) { setError("El archivo supera el límite de 50 MB."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const client = requireSupabase();
      const { data: document, error: documentError } = await client.from("documents").insert({ project_id: projectId, category, title: documentTitle, cde_state: "wip", visible_to_owner: visibleToOwner || category === "autorizacion", created_by: profile.id }).select("*").single();
      if (documentError) throw documentError;
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${projectId}/${document.id}/v1_${safeName}`;
      const { error: uploadError } = await client.storage.from("cde-documents").upload(storagePath, selectedFile, { contentType: selectedFile.type || "application/octet-stream", upsert: false });
      if (uploadError) throw uploadError;
      const { data: version, error: versionError } = await client.from("document_versions").insert({ document_id: document.id, version_number: 1, original_filename: selectedFile.name, storage_path: storagePath, mime_type: selectedFile.type || "application/octet-stream", file_size_bytes: selectedFile.size, cde_state: "wip", uploaded_by: profile.id }).select("id").single();
      if (versionError) throw versionError;
      const { error: currentVersionError } = await client.from("documents").update({ current_version_id: version.id }).eq("id", document.id);
      if (currentVersionError) throw currentVersionError;
      setTitle(""); setFile(null); setMessage("Documento cargado, versionado y vinculado al expediente."); onUploaded?.(document as DocumentRecord);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar el documento.");
    } finally { setBusy(false); }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setError("");
    if (compact && selectedFile) {
      void uploadFile(selectedFile);
      event.currentTarget.value = "";
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (file) await uploadFile(file);
  };

  if (compact) return <form onSubmit={submit} className="inline-flex items-center" aria-label={`Cargar ${fixedTitle || "hoja"}`}><input id={inputId} type="file" onChange={onFileChange} accept={accept} className="sr-only" disabled={busy} /><label htmlFor={inputId} className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 ${busy ? "pointer-events-none opacity-50" : ""}`} title={busy ? "Cargando hoja" : `Cargar ${fixedTitle || "hoja"}`}><span className="material-symbols-outlined text-[22px]">cloud_upload</span></label>{busy && <span className="ml-1 text-[10px] text-secondary">Cargando…</span>}{error && <span className="sr-only" role="alert">{error}</span>}</form>;

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-outline-variant/30 bg-white p-6">
      <div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Repositorio CDE</p><h3 className="mt-2 text-xl font-bold text-primary">Cargar documento real</h3><p className="mt-2 text-sm text-secondary">El archivo quedará privado, versionado y vinculado al expediente seleccionado.</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-secondary">{titleLabel}<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="Ej. Carta de autorización de obra" /></label>
        <label className="text-sm text-secondary">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3 text-on-surface outline-none focus:border-primary">{categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </div>
      <label className="block text-sm text-secondary">Archivo<input type="file" onChange={onFileChange} accept={accept} className="mt-2 block w-full rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low px-4 py-4 text-sm text-on-surface" /><span className="mt-2 block text-xs">PDF, CAD, DOCX, imágenes o anexos autorizados · máximo 50 MB</span></label>
      {file && <p className="flex items-center gap-2 text-sm text-primary"><span className="material-symbols-outlined text-base">attach_file</span>{file.name}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <div className="flex justify-end"><button type="submit" disabled={busy || !file} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"><span className="material-symbols-outlined text-base">cloud_upload</span>{busy ? "Cargando…" : "Cargar al expediente"}</button></div>
    </form>
  );
}
