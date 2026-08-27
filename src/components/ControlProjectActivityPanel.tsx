import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  assignProjectSupervisor,
  createCalendarActivity,
  createEnforcementAction,
  createProjectIncident,
  findAvailableActivitySlots,
  getActiveProjectSupervisor,
  getCalendarActivities,
  getCalendarDepartments,
  getCalendarProjectMembers,
  getProjectEnforcementActions,
  listCalendarSupervisors,
  updateCalendarActivityStatus,
  uploadActivityEvidence,
  type AvailabilitySlot,
  type CalendarActivity,
  type CalendarProjectMember,
  type CalendarSupervisor,
  type EnforcementAction,
  type ProjectSupervisorAssignment,
} from "../lib/calendar-data";

const TIME_ZONE = "America/Santo_Domingo";

function toIso(date: string, time: string) {
  return new Date(`${date}T${time}:00-04:00`).toISOString();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

interface IncidentPreview { id: string; title: string; description: string; severity: string; status: string; created_at: string; }

export function ControlProjectActivityPanel({ projectId, projectTitle, onIncidentCreated }: { projectId: string; projectTitle: string; onIncidentCreated?: (incident: IncidentPreview) => void }) {
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [supervisors, setSupervisors] = useState<CalendarSupervisor[]>([]);
  const [members, setMembers] = useState<CalendarProjectMember[]>([]);
  const [assignment, setAssignment] = useState<ProjectSupervisorAssignment | null>(null);
  const [enforcement, setEnforcement] = useState<EnforcementAction[]>([]);
  const [controlDepartmentId, setControlDepartmentId] = useState<string | null>(null);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [visit, setVisit] = useState({ type: "visita" as "visita" | "inspeccion", title: "Visita programada", date: todayKey(), time: "09:00", duration: 60, description: "", location: "" });
  const [suggestions, setSuggestions] = useState<AvailabilitySlot[]>([]);
  const [incident, setIncident] = useState({ title: "", description: "", severity: "medium" as "low" | "medium" | "high" | "critical", activityId: "" });
  const [measure, setMeasure] = useState({ actionType: "amonestacion" as "amonestacion" | "sancion", title: "", description: "", recipientId: "", activityId: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const departments = await getCalendarDepartments();
      const controlId = departments.find((department) => department.slug === "control_obras")?.id ?? null;
      setControlDepartmentId(controlId);
      const from = new Date();
      from.setMonth(from.getMonth() - 1);
      const to = new Date();
      to.setFullYear(to.getFullYear() + 1);
      const [nextActivities, nextSupervisors, nextAssignment, nextMembers, nextEnforcement] = await Promise.all([
        getCalendarActivities({ from: from.toISOString(), to: to.toISOString(), projectId }),
        listCalendarSupervisors(controlId),
        getActiveProjectSupervisor(projectId),
        getCalendarProjectMembers(projectId),
        getProjectEnforcementActions(projectId),
      ]);
      setActivities(nextActivities);
      setSupervisors(nextSupervisors);
      setAssignment(nextAssignment);
      setMembers(nextMembers);
      setEnforcement(nextEnforcement);
      setSelectedSupervisorId(nextAssignment?.supervisor_id ?? nextSupervisors[0]?.id ?? "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar la agenda operativa del proyecto.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const activeActivities = useMemo(() => activities.filter((activity) => activity.status !== "cancelled"), [activities]);
  const visitActivities = useMemo(() => activeActivities.filter((activity) => activity.activity_type === "visita" || activity.activity_type === "inspeccion"), [activeActivities]);

  const assignSupervisor = async () => {
    if (!selectedSupervisorId) { setError("Selecciona un supervisor de Control de Obras."); return; }
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const next = await assignProjectSupervisor(projectId, selectedSupervisorId, "Asignación realizada desde el expediente operativo.");
      setAssignment(next);
      setFeedback("Supervisor principal asignado al proyecto.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible asignar el supervisor.");
    } finally { setBusy(false); }
  };

  const recommend = async () => {
    setBusy(true);
    setError("");
    try {
      const next = await findAvailableActivitySlots({ projectId, supervisorId: selectedSupervisorId || null, departmentId: controlDepartmentId, durationMinutes: visit.duration, startDate: visit.date });
      setSuggestions(next);
      if (!next.length) setError("No hay espacios disponibles en los próximos días laborables.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible recomendar horarios.");
    } finally { setBusy(false); }
  };

  const scheduleVisit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    const startsAt = toIso(visit.date, visit.time);
    const endsAt = new Date(new Date(startsAt).getTime() + visit.duration * 60_000).toISOString();
    try {
      await createCalendarActivity({
        projectId,
        departmentId: controlDepartmentId,
        assignedSupervisorId: selectedSupervisorId || null,
        activityType: visit.type,
        title: visit.title,
        startsAt,
        endsAt,
        description: visit.description || null,
        location: visit.location || null,
        visibility: "project_members",
      });
      setFeedback("Visita programada y visible en el calendario del proyecto.");
      setSuggestions([]);
      await load();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No fue posible programar la visita.";
      setError(message);
      if (reason instanceof Error && reason.name === "CalendarConflictError") await recommend();
    } finally { setBusy(false); }
  };

  const applySuggestion = (slot: AvailabilitySlot) => {
    const value = new Date(slot.starts_at);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(value);
    const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    setVisit((current) => ({ ...current, date: `${read("year")}-${read("month")}-${read("day")}`, time: `${read("hour")}:${read("minute")}` }));
    setSuggestions([]);
  };

  const uploadEvidence = async (activity: CalendarActivity, file: File | null) => {
    if (!file) return;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await uploadActivityEvidence({ activityId: activity.id, projectId, title: `Evidencia de ${activity.title}`, file });
      setFeedback("Fotografía cargada y vinculada a la visita o inspección.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar la fotografía.");
    } finally { setBusy(false); }
  };

  const saveIncident = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const created = await createProjectIncident({ projectId, activityId: incident.activityId || null, severity: incident.severity, title: incident.title, description: incident.description });
      onIncidentCreated?.(created as IncidentPreview);
      setIncident({ title: "", description: "", severity: "medium", activityId: "" });
      setFeedback("Incidente registrado en el expediente.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible registrar el incidente.");
    } finally { setBusy(false); }
  };

  const saveMeasure = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await createEnforcementAction({ projectId, activityId: measure.activityId || null, actionType: measure.actionType, title: measure.title, description: measure.description, recipientId: measure.recipientId || null });
      setMeasure({ actionType: "amonestacion", title: "", description: "", recipientId: "", activityId: "" });
      setFeedback("Medida registrada. Las sanciones creadas por Control de Obras permanecen en borrador hasta decisión administrativa.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible registrar la medida.");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="rounded-3xl border border-outline-variant/30 bg-white p-10 text-center text-secondary">Cargando agenda operativa…</div>;

  return <div className="space-y-7">
    {error && <div className="rounded-2xl border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</div>}
    {feedback && <div className="rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-success">{feedback}</div>}

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-outline-variant/30 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Responsable del proyecto</p>
        <h2 className="mt-2 text-2xl font-bold text-on-surface">Supervisor de Control de Obras</h2>
        <p className="mt-2 text-sm text-secondary">La asignación específica se añade sin reemplazar la membresía departamental existente.</p>
        {assignment && <div className="mt-5 rounded-2xl bg-surface-container-low p-4"><p className="text-xs uppercase tracking-wider text-secondary">Asignación actual</p><p className="mt-1 font-bold text-on-surface">{assignment.profiles?.display_name ?? assignment.profiles?.email ?? "Supervisor asignado"}</p></div>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><select value={selectedSupervisorId} onChange={(event) => setSelectedSupervisorId(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Seleccionar supervisor</option>{supervisors.map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.display_name}</option>)}</select><button type="button" disabled={busy || !selectedSupervisorId} onClick={() => void assignSupervisor()} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Asignar</button></div>
      </div>

      <form onSubmit={scheduleVisit} className="rounded-3xl border border-outline-variant/30 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Agenda del expediente</p>
        <h2 className="mt-2 text-2xl font-bold text-on-surface">Programar visita o inspección</h2>
        <p className="mt-2 text-sm text-secondary">{projectTitle}</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"><select value={visit.type} onChange={(event) => setVisit((current) => ({ ...current, type: event.target.value as "visita" | "inspeccion", title: event.target.value === "inspeccion" ? "Inspección programada" : "Visita programada" }))} className="rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="visita">Visita</option><option value="inspeccion">Inspección</option></select><input required value={visit.title} onChange={(event) => setVisit((current) => ({ ...current, title: event.target.value }))} className="rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Nombre de la actividad" /><input required type="date" value={visit.date} onChange={(event) => setVisit((current) => ({ ...current, date: event.target.value }))} className="rounded-xl border border-outline-variant/40 px-4 py-3" /><input required type="time" value={visit.time} onChange={(event) => setVisit((current) => ({ ...current, time: event.target.value }))} className="rounded-xl border border-outline-variant/40 px-4 py-3" /><select value={visit.duration} onChange={(event) => setVisit((current) => ({ ...current, duration: Number(event.target.value) }))} className="rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value={30}>30 minutos</option><option value={60}>1 hora</option><option value={90}>1 hora 30 minutos</option><option value={120}>2 horas</option></select><input value={visit.location} onChange={(event) => setVisit((current) => ({ ...current, location: event.target.value }))} className="rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Ubicación" /><textarea value={visit.description} onChange={(event) => setVisit((current) => ({ ...current, description: event.target.value }))} className="min-h-20 rounded-xl border border-outline-variant/40 px-4 py-3 sm:col-span-2" placeholder="Objetivo e instrucciones" /></div>
        {suggestions.length > 0 && <div className="mt-4 rounded-2xl bg-warning/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-warning">Espacios recomendados</p><div className="mt-3 flex flex-wrap gap-2">{suggestions.map((slot) => <button type="button" key={slot.starts_at} onClick={() => applySuggestion(slot)} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm">{formatDate(slot.starts_at)}</button>)}</div></div>}
        <div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" disabled={busy} onClick={() => void recommend()} className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-secondary">Recomendar horario</button><button type="submit" disabled={busy || !selectedSupervisorId} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Programar</button></div>
      </form>
    </section>

    <section className="rounded-3xl border border-outline-variant/30 bg-white p-6">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Visitas del proyecto</p><h2 className="mt-2 text-2xl font-bold text-on-surface">Agenda y evidencias</h2></div><span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{visitActivities.length} actividades</span></div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">{visitActivities.length ? visitActivities.map((activity) => <article key={activity.id} className="rounded-2xl border border-outline-variant/30 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-secondary">{activity.activity_type === "inspeccion" ? "Inspección" : "Visita"}</p><h3 className="mt-1 font-bold text-on-surface">{activity.title}</h3><p className="mt-2 text-sm text-secondary">{formatDate(activity.starts_at)}</p><p className="mt-1 text-xs text-secondary">{activity.supervisor_name ?? "Supervisor por definir"}</p></div><span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-secondary">{activity.status.replaceAll("_", " ")}</span></div><div className="mt-5 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-outline-variant/40 px-3 py-2 text-xs font-semibold text-secondary"><span className="material-symbols-outlined text-[18px]">add_a_photo</span>Agregar fotos<input type="file" accept="image/*" multiple={false} className="hidden" disabled={busy} onChange={(event) => void uploadEvidence(activity, event.target.files?.[0] ?? null)} /></label><button type="button" disabled={busy} onClick={() => void updateCalendarActivityStatus(activity.id, "completed").then(load)} className="rounded-full bg-success/10 px-3 py-2 text-xs font-semibold text-success disabled:opacity-50">Marcar realizada</button></div></article>) : <div className="rounded-2xl bg-surface-container-low p-8 text-center text-secondary lg:col-span-2">No hay visitas o inspecciones programadas todavía.</div>}</div>
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <form onSubmit={saveIncident} className="rounded-3xl border border-outline-variant/30 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Trazabilidad</p><h2 className="mt-2 text-2xl font-bold text-on-surface">Reportar incidente</h2><div className="mt-5 space-y-4"><input required value={incident.title} onChange={(event) => setIncident((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Título del incidente" /><select value={incident.severity} onChange={(event) => setIncident((current) => ({ ...current, severity: event.target.value as typeof incident.severity }))} className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select><select value={incident.activityId} onChange={(event) => setIncident((current) => ({ ...current, activityId: event.target.value }))} className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Sin actividad relacionada</option>{visitActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title} · {formatDate(activity.starts_at)}</option>)}</select><textarea required value={incident.description} onChange={(event) => setIncident((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Descripción y hallazgos" /><button type="submit" disabled={busy} className="rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Registrar incidente</button></div></form>

      <form onSubmit={saveMeasure} className="rounded-3xl border border-outline-variant/30 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Cumplimiento</p><h2 className="mt-2 text-2xl font-bold text-on-surface">Amonestaciones y sanciones</h2><p className="mt-2 text-sm text-secondary">Control de Obras registra borradores; la emisión definitiva queda reservada a Administración hasta definir la autoridad final.</p><div className="mt-5 space-y-4"><select value={measure.actionType} onChange={(event) => setMeasure((current) => ({ ...current, actionType: event.target.value as "amonestacion" | "sancion" }))} className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="amonestacion">Amonestación</option><option value="sancion">Sanción</option></select><input required value={measure.title} onChange={(event) => setMeasure((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Título de la medida" /><select value={measure.recipientId} onChange={(event) => setMeasure((current) => ({ ...current, recipientId: event.target.value }))} className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Sin destinatario específico</option>{members.map((member) => <option key={member.user_id} value={member.user_id}>{member.profiles?.display_name ?? member.profiles?.email ?? member.membership_role}</option>)}</select><select value={measure.activityId} onChange={(event) => setMeasure((current) => ({ ...current, activityId: event.target.value }))} className="w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Sin actividad relacionada</option>{visitActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}</select><textarea required value={measure.description} onChange={(event) => setMeasure((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Fundamento y observaciones" /><button type="submit" disabled={busy} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Registrar medida</button></div></form>
    </section>

    {enforcement.length > 0 && <section className="rounded-3xl border border-outline-variant/30 bg-white p-6"><h2 className="text-2xl font-bold text-on-surface">Medidas registradas</h2><div className="mt-5 divide-y divide-outline-variant/20">{enforcement.map((action) => <div key={action.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-secondary">{action.action_type}</p><p className="mt-1 font-bold text-on-surface">{action.title}</p></div><span className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-secondary">{action.status}</span></div>)}</div></section>}
  </div>;
}
