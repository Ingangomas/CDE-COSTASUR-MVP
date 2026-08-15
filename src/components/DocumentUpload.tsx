import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSession } from "../context/SessionContext";
import { requireSupabase } from "../lib/supabase";

interface DocumentUploadProps {
  projectId: string;
  onUploaded?: () => void;
}

export function DocumentUpload({ projectId, onUploaded }: DocumentUploadProps) {
  const { profile } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("anteproyecto");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile?.id || !file || !title.trim()) { setError("Indica un título y selecciona un archivo."); return; }
    if (file.size > 50 * 1024 * 1024) { setError("El archivo supera el límite de 50 MB."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const client = requireSupabase();
      const { data: document, error: documentError } = await client.from("documents").insert({ project_id: projectId, category, title: title.trim(), cde_state: "wip", visible_to_owner: false, created_by: profile.id }).select("*").single();
      if (documentError) throw documentError;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${projectId}/${document.id}/v1_${safeName}`;
      const { error: uploadError } = await client.storage.from("cde-documents").upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (uploadError) throw uploadError;
      const { error: versionError } = await client.from("document_versions").insert({ document_id: document.id, version_number: 1, original_filename: file.name, storage_path: storagePath, mime_type: file.type || "application/octet-stream", file_size_bytes: file.size, cde_state: "wip", uploaded_by: profile.id });
      if (versionError) throw versionError;
      setTitle(""); setFile(null); setMessage("Documento cargado y registrado como versión 1."); onUploaded?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar el documento.");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-outline-variant/30 bg-white p-6 space-y-5">
      <div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Repositorio CDE</p><h3 className="text-xl font-bold text-primary mt-2">Cargar documento real</h3><p className="text-sm text-secondary mt-2">El archivo quedará privado, versionado y vinculado al expediente seleccionado.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm text-secondary">Título<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="Ej. Anteproyecto Villa Demo" /></label>
        <label className="text-sm text-secondary">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3 text-on-surface outline-none focus:border-primary"><option value="anteproyecto">Anteproyecto</option><option value="arquitectonico">Arquitectónico</option><option value="estructural">Estructural</option><option value="electrico">Eléctrico</option><option value="hidrosanitario">Hidrosanitario</option><option value="climatizacion">Climatización</option><option value="memoria_descriptiva">Memoria descriptiva</option><option value="cad">CAD</option><option value="otro">Otro</option></select></label>
      </div>
      <label className="block text-sm text-secondary">Archivo<input type="file" onChange={onFileChange} accept=".pdf,.dwg,.dxf,.doc,.docx,image/png,image/jpeg" className="mt-2 block w-full rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low px-4 py-4 text-sm text-on-surface" /><span className="block text-xs mt-2">PDF, CAD, DOCX o imágenes · máximo 50 MB</span></label>
      {file && <p className="text-sm text-primary flex items-center gap-2"><span className="material-symbols-outlined text-base">attach_file</span>{file.name}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {message && <p className="text-sm text-success">{message}</p>}
      <div className="flex justify-end"><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"><span className="material-symbols-outlined text-base">cloud_upload</span>{busy ? "Cargando…" : "Cargar al expediente"}</button></div>
    </form>
  );
}
