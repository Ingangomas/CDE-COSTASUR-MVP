import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSession } from "../context/SessionContext";
import { submitContractorProjectRequest } from "../lib/cde-data";

type ProjectType = "obra_mayor" | "remodelacion" | "reparacion" | "mantenimiento";

type FormState = {
  propertyReference: string;
  projectTitle: string;
  projectType: ProjectType;
  ownerName: string;
  ownerEmail: string;
  contractorName: string;
  contractorEmail: string;
  companyName: string;
  companyPhone: string;
  workItems: string;
  estimatedDuration: string;
};

const emptyForm: FormState = {
  propertyReference: "",
  projectTitle: "",
  projectType: "obra_mayor",
  ownerName: "",
  ownerEmail: "",
  contractorName: "",
  contractorEmail: "",
  companyName: "",
  companyPhone: "",
  workItems: "",
  estimatedDuration: "",
};

export function ContractorNewProjectModal({ open, onClose, onSubmitted }: { open: boolean; onClose: () => void; onSubmitted?: () => void }) {
  const { profile } = useSession();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [startFormFile, setStartFormFile] = useState<File | null>(null);
  const [workItemsFile, setWorkItemsFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm((current) => ({
      ...current,
      contractorName: current.contractorName || profile?.display_name || "",
      contractorEmail: current.contractorEmail || profile?.email || "",
    }));
  }, [open, profile?.display_name, profile?.email]);

  useEffect(() => {
    if (!open) {
      setError("");
      setSuccess("");
    }
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!startFormFile || !workItemsFile) {
      setError("Debes cargar el formulario de inicio de obra y el listado de partidas.");
      return;
    }
    setBusy(true);
    try {
      await submitContractorProjectRequest({ ...form, startFormFile, workItemsFile });
      setSuccess("Solicitud enviada a Legal y Control de Obras para revisión independiente. La obra no se activa automáticamente.");
      setForm(emptyForm);
      setStartFormFile(null);
      setWorkItemsFile(null);
      onSubmitted?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible enviar la solicitud.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="contractor-new-project-title">
        <div className="flex items-start justify-between gap-5 border-b border-outline-variant/20 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Solicitud independiente del contratista</p>
            <h2 id="contractor-new-project-title" className="mt-2 text-2xl font-bold text-primary md:text-3xl">Nuevo proyecto</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">Este formulario se envía en paralelo a Legal y Control de Obras. Ninguna obra se activa hasta completar ambas validaciones.</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-50" aria-label="Cerrar solicitud de nuevo proyecto">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={submit} className="overflow-y-auto px-6 py-6 md:px-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Villa, solar o referencia de propiedad</span><input required value={form.propertyReference} onChange={(event) => update("propertyReference", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" placeholder="Ej. Villa Caleton #57" /></label>
            <label className="md:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Nombre del proyecto</span><input required value={form.projectTitle} onChange={(event) => update("projectTitle", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" placeholder="Ej. Remodelación de terraza y cocina" /></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Tipo de trabajo</span><select required value={form.projectType} onChange={(event) => update("projectType", event.target.value as ProjectType)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none focus:border-primary"><option value="obra_mayor">Obra mayor</option><option value="remodelacion">Remodelación</option><option value="reparacion">Reparaciones</option><option value="mantenimiento">Mantenimiento</option></select></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Tiempo estimado</span><input required value={form.estimatedDuration} onChange={(event) => update("estimatedDuration", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" placeholder="Ej. 12 semanas" /></label>

            <div className="md:col-span-2 mt-2 border-t border-outline-variant/20 pt-5"><p className="text-sm font-bold text-primary">Datos del propietario</p><p className="mt-1 text-xs text-secondary">Legal revisará estos datos de forma independiente.</p></div>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Nombre del propietario</span><input required value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Correo del propietario</span><input required type="email" value={form.ownerEmail} onChange={(event) => update("ownerEmail", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>

            <div className="md:col-span-2 mt-2 border-t border-outline-variant/20 pt-5"><p className="text-sm font-bold text-primary">Datos del contratista y compañía</p><p className="mt-1 text-xs text-secondary">Control de Obras revisará y validará al contratista antes de mostrar el proyecto.</p></div>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Nombre del contratista</span><input required value={form.contractorName} onChange={(event) => update("contractorName", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Correo del contratista</span><input required type="email" value={form.contractorEmail} onChange={(event) => update("contractorEmail", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Compañía</span><input required value={form.companyName} onChange={(event) => update("companyName", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>
            <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Teléfono de compañía</span><input value={form.companyPhone} onChange={(event) => update("companyPhone", event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" /></label>
            <label className="md:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Listado de partidas a ejecutar</span><textarea required value={form.workItems} onChange={(event) => update("workItems", event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none transition focus:border-primary" placeholder="Describe las partidas principales, alcance y cantidades aproximadas." /></label>

            <div className="md:col-span-2 mt-2 border-t border-outline-variant/20 pt-5"><p className="text-sm font-bold text-primary">Documentos para revisión</p><p className="mt-1 text-xs text-secondary">Ambos documentos son obligatorios para enviar la solicitud.</p></div>
            <label className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low p-4"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Formulario de inicio de obra</span><input required type="file" onChange={(event) => setStartFormFile(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-sm text-secondary file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white" /><span className="mt-2 block text-xs text-secondary">{startFormFile?.name ?? "Selecciona el documento"}</span></label>
            <label className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low p-4"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Listado de partidas (documento)</span><input required type="file" onChange={(event) => setWorkItemsFile(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-sm text-secondary file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white" /><span className="mt-2 block text-xs text-secondary">{workItemsFile?.name ?? "Selecciona el documento"}</span></label>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</div>}
          {success && <div className="mt-5 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-success">{success}</div>}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-secondary">La solicitud queda pendiente de validación por ambos departamentos.</p><div className="flex gap-3"><button type="button" onClick={onClose} disabled={busy} className="rounded-full px-5 py-3 text-sm font-semibold text-secondary hover:bg-surface-container-low disabled:opacity-50">Cancelar</button><button type="submit" disabled={busy} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50">{busy ? "Enviando…" : "Enviar solicitud"}</button></div></div>
        </form>
      </div>
    </div>
  );
}

export default ContractorNewProjectModal;
