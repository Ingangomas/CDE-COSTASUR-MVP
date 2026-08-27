import { useState, type FormEvent } from "react";
import { createGovernanceRequest, type GovernanceRequestType } from "../lib/governance-data";

export function GovernanceRequestComposer({ projectId, propertyId, defaultType = "role_assignment", defaultRole = "arquitecto" }: { projectId?: string; propertyId?: string; defaultType?: GovernanceRequestType; defaultRole?: string }) {
  const [type, setType] = useState<GovernanceRequestType>(defaultType);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setNotice(""); setError("");
    try {
      await createGovernanceRequest({ request_type: type, target_user_id: null, target_email: email.trim() || null, target_display_name: name.trim() || null, target_role: type === "ownership_transfer" ? null : role, department_id: null, project_id: projectId ?? null, property_id: propertyId ?? null, notes: notes.trim() || null });
      setEmail(""); setName(""); setNotes(""); setNotice("Solicitud enviada a Gobernanza y vinculada al expediente.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo enviar la solicitud."); }
    finally { setSaving(false); }
  };

  return <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5"><div className="flex items-start gap-3"><span className="material-symbols-outlined text-primary">forward_to_inbox</span><div><h3 className="font-semibold text-primary">Solicitar intervención de Gobernanza</h3><p className="mt-1 text-xs leading-5 text-secondary">Envía una solicitud desde este expediente. La decisión y el usuario no se activan hasta que Gobernanza la revise.</p></div></div><form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold text-secondary">Tipo<select value={type} onChange={(event) => setType(event.target.value as GovernanceRequestType)} className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm"><option value="role_assignment">Asignar rol a usuario</option><option value="new_user">Registrar nuevo usuario</option><option value="ownership_transfer">Cambio de titularidad validado</option></select></label><label className="text-xs font-semibold text-secondary">Rol solicitado<select value={role} onChange={(event) => setRole(event.target.value)} disabled={type === "ownership_transfer"} className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm"><option value="arquitecto">Arquitecto</option><option value="contratista">Contratista</option><option value="control_obras">Control de Obras</option><option value="revision_tecnica">Revisión Técnica</option></select></label><label className="text-xs font-semibold text-secondary">Correo del usuario<input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm" placeholder="usuario@costasur.com" /></label><label className="text-xs font-semibold text-secondary">Nombre<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm" placeholder="Nombre del usuario" /></label><label className="text-xs font-semibold text-secondary md:col-span-2">Detalle / validación<input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm" placeholder="Indica la propiedad, proyecto o validación correspondiente" /></label><div className="md:col-span-2 flex items-center justify-between gap-3"><p className="text-xs text-secondary">Proyecto: {projectId ? "vinculado" : "sin proyecto"} · Propiedad: {propertyId ? "vinculada" : "sin propiedad"}</p><button disabled={saving} type="submit" className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Enviando…" : "Enviar a Gobernanza"}</button></div></form>{notice && <p className="mt-3 text-sm text-success">{notice}</p>}{error && <p className="mt-3 text-sm text-error">{error}</p>}</section>;
}
