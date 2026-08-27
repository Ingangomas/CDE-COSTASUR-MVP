import { useCallback, useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useSession } from "../context/SessionContext";
import {
  addCalendarActivityParticipant,
  createCalendarActivity,
  findAvailableActivitySlots,
  getCalendarActivities,
  getCalendarDepartments,
  getCalendarProjectMembers,
  getCalendarProjects,
  listCalendarSupervisors,
  updateCalendarActivityStatus,
  type AvailabilitySlot,
  type CalendarActivity,
  type CalendarActivityType,
  type CalendarDepartment,
  type CalendarProjectMember,
  type CalendarSupervisor,
} from "../lib/calendar-data";

const TIME_ZONE = "America/Santo_Domingo";
const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const activityLabels: Record<CalendarActivityType, string> = {
  directorio: "Directorio",
  reunion: "Reunión",
  cita_propietario: "Cita con propietario",
  cita_arquitecto: "Cita con arquitecto",
  cita_contratista: "Cita con contratista",
  visita: "Visita",
  inspeccion: "Inspección",
  revision: "Revisión",
  seguimiento: "Seguimiento",
  otra: "Otra actividad",
};
const activityColors: Record<CalendarActivityType, string> = {
  directorio: "bg-primary text-white",
  reunion: "bg-[#74543f] text-white",
  cita_propietario: "bg-[#49705b] text-white",
  cita_arquitecto: "bg-[#46697a] text-white",
  cita_contratista: "bg-[#7a6846] text-white",
  visita: "bg-[#315d75] text-white",
  inspeccion: "bg-warning text-white",
  revision: "bg-[#5d527a] text-white",
  seguimiento: "bg-[#547056] text-white",
  otra: "bg-secondary text-white",
};
const statusLabels: Record<string, string> = {
  draft: "Borrador",
  scheduled: "Programada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
  rescheduled: "Reprogramada",
};

type CalendarProject = Awaited<ReturnType<typeof getCalendarProjects>>[number];
type CalendarView = "month" | "agenda";

function dateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(typeof value === "string" ? new Date(value) : value);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-DO", { timeZone: TIME_ZONE, dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-DO", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function monthLabel(value: Date) {
  return new Intl.DateTimeFormat("es-DO", { timeZone: TIME_ZONE, month: "long", year: "numeric" }).format(value);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(value: Date, months: number) {
  const next = new Date(value);
  next.setMonth(next.getMonth() + months, 1);
  return next;
}

function calendarGridStart(value: Date) {
  const first = new Date(value.getFullYear(), value.getMonth(), 1);
  const mondayIndex = (first.getDay() + 6) % 7;
  return addDays(first, -mondayIndex);
}

function toSantoDomingoIso(date: string, time: string) {
  return new Date(`${date}T${time}:00-04:00`).toISOString();
}

function createDefaultForm(date = dateKey(new Date())) {
  return {
    title: "",
    activityType: "reunion" as CalendarActivityType,
    projectId: "",
    departmentId: "",
    supervisorId: "",
    date,
    startTime: "09:00",
    durationMinutes: 60,
    description: "",
    location: "",
    visibility: "project_members" as "department_internal" | "project_members" | "participants",
    participantIds: [] as string[],
  };
}

export function CalendarPage() {
  const { primaryRole, roles, profile } = useSession();
  const isAdmin = primaryRole === "admin_general";
  const ownDepartmentId = roles.find((role) => role.is_active && role.department_id)?.department_id ?? null;
  const [viewDate, setViewDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [adminScope, setAdminScope] = useState<"mine" | "all">("mine");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activities, setActivities] = useState<CalendarActivity[]>([]);
  const [departments, setDepartments] = useState<CalendarDepartment[]>([]);
  const [projects, setProjects] = useState<CalendarProject[]>([]);
  const [supervisors, setSupervisors] = useState<CalendarSupervisor[]>([]);
  const [members, setMembers] = useState<CalendarProjectMember[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<CalendarActivity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createDefaultForm());
  const [suggestions, setSuggestions] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const rangeStart = useMemo(() => calendarGridStart(viewDate), [viewDate]);
  const rangeEnd = useMemo(() => addDays(rangeStart, 42), [rangeStart]);
  const effectiveDepartmentId = isAdmin
    ? adminScope === "all" ? departmentFilter || null : ownDepartmentId
    : ownDepartmentId;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextActivities, nextDepartments, nextProjects, nextSupervisors] = await Promise.all([
        getCalendarActivities({ from: rangeStart.toISOString(), to: rangeEnd.toISOString(), departmentId: effectiveDepartmentId }),
        getCalendarDepartments(),
        getCalendarProjects(),
        listCalendarSupervisors(effectiveDepartmentId),
      ]);
      setActivities(nextActivities);
      setDepartments(nextDepartments);
      setProjects(nextProjects);
      setSupervisors(nextSupervisors);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }, [effectiveDepartmentId, rangeEnd, rangeStart]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!form.projectId) { setMembers([]); return; }
    void getCalendarProjectMembers(form.projectId).then(setMembers).catch(() => setMembers([]));
  }, [form.projectId]);

  useEffect(() => {
    if (!showForm) return;
    setForm((current) => ({
      ...current,
      departmentId: current.departmentId || effectiveDepartmentId || "",
      supervisorId: current.supervisorId || (primaryRole === "control_obras" ? profile?.id ?? "" : ""),
    }));
  }, [effectiveDepartmentId, primaryRole, profile?.id, showForm]);

  const gridDays = useMemo(() => Array.from({ length: 42 }, (_, index) => addDays(rangeStart, index)), [rangeStart]);
  const activitiesByDay = useMemo(() => {
    const grouped = new Map<string, CalendarActivity[]>();
    for (const activity of activities) {
      const key = dateKey(activity.starts_at);
      grouped.set(key, [...(grouped.get(key) ?? []), activity]);
    }
    return grouped;
  }, [activities]);

  const upcoming = useMemo(() => activities.filter((activity) => new Date(activity.ends_at) >= new Date()).slice(0, 8), [activities]);
  const directorioCount = useMemo(() => activities.filter((activity) => activity.activity_type === "directorio" && new Date(activity.starts_at).getFullYear() === viewDate.getFullYear()).length, [activities, viewDate]);

  const openNewActivity = (date?: string) => {
    setForm(createDefaultForm(date ?? dateKey(new Date())));
    setSuggestions([]);
    setError("");
    setFeedback("");
    setShowForm(true);
  };

  const applySuggestion = (slot: AvailabilitySlot) => {
    const start = new Date(slot.starts_at);
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(start);
    const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    setForm((current) => ({ ...current, date: `${read("year")}-${read("month")}-${read("day")}`, startTime: `${read("hour")}:${read("minute")}` }));
    setSuggestions([]);
  };

  const recommendSlots = async () => {
    setBusy(true);
    setError("");
    try {
      const next = await findAvailableActivitySlots({
        projectId: form.projectId || null,
        supervisorId: form.supervisorId || null,
        departmentId: form.departmentId || null,
        durationMinutes: form.durationMinutes,
        startDate: form.date,
      });
      setSuggestions(next);
      if (!next.length) setError("No encontramos espacios disponibles en los próximos días laborables.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible recomendar horarios.");
    } finally {
      setBusy(false);
    }
  };

  const saveActivity = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    const startsAt = toSantoDomingoIso(form.date, form.startTime);
    const endsAt = new Date(new Date(startsAt).getTime() + form.durationMinutes * 60_000).toISOString();
    try {
      const created = await createCalendarActivity({
        projectId: form.projectId || null,
        departmentId: form.departmentId || null,
        assignedSupervisorId: form.supervisorId || null,
        activityType: form.activityType,
        title: form.title,
        startsAt,
        endsAt,
        description: form.description || null,
        location: form.location || null,
        visibility: form.projectId ? form.visibility : "department_internal",
      });
      await Promise.all(form.participantIds.map((userId) => addCalendarActivityParticipant(created.id, userId)));
      setFeedback("Actividad programada y conectada al calendario del CDE.");
      setShowForm(false);
      setSelectedActivity(created);
      await load();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "No fue posible guardar la actividad.";
      setError(message);
      if (reason instanceof Error && reason.name === "CalendarConflictError") await recommendSlots();
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    if (!selectedActivity) return;
    setBusy(true);
    setError("");
    try {
      const updated = await updateCalendarActivityStatus(selectedActivity.id, status);
      setSelectedActivity({ ...selectedActivity, ...updated });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible actualizar la actividad.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-8 md:px-10 md:py-12 max-w-[1500px] mx-auto space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-secondary">Agenda operativa nativa</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-on-surface md:text-5xl">Calendario de Actividades</h1>
          <p className="mt-3 max-w-3xl text-base text-secondary">Actividades departamentales y de proyectos, con disponibilidad y conflictos controlados por el CDE.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && <div className="flex rounded-full bg-surface-container-low p-1"><button type="button" onClick={() => setAdminScope("mine")} className={`rounded-full px-4 py-2 text-sm font-semibold ${adminScope === "mine" ? "bg-primary text-white" : "text-secondary"}`}>Mi agenda</button><button type="button" onClick={() => setAdminScope("all")} className={`rounded-full px-4 py-2 text-sm font-semibold ${adminScope === "all" ? "bg-primary text-white" : "text-secondary"}`}>Todos los departamentos</button></div>}
          <button type="button" onClick={() => openNewActivity()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.97]"><span className="material-symbols-outlined text-[20px]">add</span>Nueva actividad</button>
        </div>
      </header>

      {isAdmin && adminScope === "all" && <div className="rounded-2xl border border-outline-variant/30 bg-white p-4"><label className="text-xs font-bold uppercase tracking-wider text-secondary">Filtrar departamento</label><select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm md:max-w-md"><option value="">Todos los departamentos</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div>}

      {primaryRole === "revision_tecnica" && <section className="rounded-3xl border border-outline-variant/30 bg-primary-container p-6 text-white"><div className="flex items-center justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.18em] text-white/65">Directorio anual</p><h2 className="mt-2 text-2xl font-bold">{directorioCount} de 12 fechas registradas</h2><p className="mt-2 text-sm text-white/75">Las sesiones de Directorio se administran como actividades explícitas y reprogramables.</p></div><span className="material-symbols-outlined text-5xl text-white/80">event_available</span></div></section>}

      {error && <div className="rounded-2xl border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</div>}
      {feedback && <div className="rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-success">{feedback}</div>}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white soft-shadow">
          <div className="flex flex-col gap-4 border-b border-outline-variant/20 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2"><button type="button" onClick={() => setViewDate(addMonths(viewDate, -1))} className="grid h-10 w-10 place-items-center rounded-full border border-outline-variant/30 text-secondary hover:text-primary" aria-label="Mes anterior"><span className="material-symbols-outlined">chevron_left</span></button><button type="button" onClick={() => setViewDate(new Date())} className="rounded-full border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-secondary hover:text-primary">Hoy</button><button type="button" onClick={() => setViewDate(addMonths(viewDate, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-outline-variant/30 text-secondary hover:text-primary" aria-label="Mes siguiente"><span className="material-symbols-outlined">chevron_right</span></button><h2 className="ml-2 text-xl font-bold capitalize text-on-surface">{monthLabel(viewDate)}</h2></div>
            <div className="flex rounded-full bg-surface-container-low p-1"><button type="button" onClick={() => setView("month")} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "month" ? "bg-white text-primary shadow-sm" : "text-secondary"}`}>Mes</button><button type="button" onClick={() => setView("agenda")} className={`rounded-full px-4 py-2 text-sm font-semibold ${view === "agenda" ? "bg-white text-primary shadow-sm" : "text-secondary"}`}>Agenda</button></div>
          </div>

          {loading ? <div className="p-16 text-center text-secondary">Cargando agenda…</div> : view === "month" ? <div className="overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-7 border-b border-outline-variant/20 bg-surface-container-low">{DAY_NAMES.map((day) => <div key={day} className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-secondary">{day}</div>)}</div><div className="grid grid-cols-7">{gridDays.map((day) => { const key = dateKey(day); const dayActivities = activitiesByDay.get(key) ?? []; const inMonth = day.getMonth() === viewDate.getMonth(); const today = key === dateKey(new Date()); return <button type="button" key={key} onClick={() => dayActivities.length ? setSelectedActivity(dayActivities[0]) : openNewActivity(key)} className={`min-h-[126px] border-b border-r border-outline-variant/20 p-2 text-left align-top hover:bg-surface-container-low ${inMonth ? "bg-white" : "bg-surface-container-low/50"}`}><span className={`inline-grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${today ? "bg-primary text-white" : inMonth ? "text-on-surface" : "text-secondary/50"}`}>{day.getDate()}</span><div className="mt-2 space-y-1">{dayActivities.slice(0, 3).map((activity) => <span key={activity.id} onClick={(event) => { event.stopPropagation(); setSelectedActivity(activity); }} className={`block truncate rounded-md px-2 py-1 text-[11px] font-semibold ${activityColors[activity.activity_type]}`}>{formatTime(activity.starts_at)} · {activity.title}</span>)}{dayActivities.length > 3 && <span className="block px-2 text-[11px] font-semibold text-secondary">+{dayActivities.length - 3} actividades</span>}</div></button>; })}</div></div></div> : <div className="divide-y divide-outline-variant/20">{activities.length ? activities.map((activity) => <button type="button" key={activity.id} onClick={() => setSelectedActivity(activity)} className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface-container-low"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${activityColors[activity.activity_type]}`}><span className="material-symbols-outlined">event</span></span><div className="min-w-0 flex-1"><h3 className="truncate font-bold text-on-surface">{activity.title}</h3><p className="mt-1 text-sm text-secondary">{formatDateTime(activity.starts_at)} · {activity.project_title ?? activity.department_name ?? "Actividad interna"}</p></div><span className="material-symbols-outlined text-secondary">arrow_forward</span></button>) : <div className="p-16 text-center text-secondary">No hay actividades en este rango.</div>}</div>}
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-outline-variant/30 bg-white p-6 soft-shadow"><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Próximas actividades</p><div className="mt-5 space-y-3">{upcoming.length ? upcoming.map((activity) => <button type="button" key={activity.id} onClick={() => setSelectedActivity(activity)} className="w-full rounded-2xl border border-outline-variant/30 p-4 text-left hover:border-primary/40"><div className="flex items-start gap-3"><span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${activityColors[activity.activity_type].split(" ")[0]}`} /><div className="min-w-0"><p className="truncate text-sm font-bold text-on-surface">{activity.title}</p><p className="mt-1 text-xs text-secondary">{formatDateTime(activity.starts_at)}</p><p className="mt-1 truncate text-xs text-secondary">{activity.project_title ?? activity.department_name ?? "Actividad interna"}</p></div></div></button>) : <p className="text-sm text-secondary">No hay actividades próximas.</p>}</div></section>
          <section className="rounded-3xl bg-primary-container p-6 text-white"><span className="material-symbols-outlined text-3xl">schedule</span><h3 className="mt-4 text-xl font-bold">Disponibilidad controlada</h3><p className="mt-2 text-sm leading-relaxed text-white/75">El CDE evita solapamientos del supervisor y del proyecto. Si existe un conflicto, recomienda los próximos espacios laborables.</p></section>
        </aside>
      </div>

      {selectedActivity && <ActivityDetail activity={selectedActivity} busy={busy} onClose={() => setSelectedActivity(null)} onStatus={changeStatus} />}
      {showForm && <ActivityForm form={form} setForm={setForm} projects={projects} departments={departments} supervisors={supervisors} members={members} suggestions={suggestions} busy={busy} isAdmin={isAdmin} onClose={() => setShowForm(false)} onSubmit={saveActivity} onRecommend={() => void recommendSlots()} onSuggestion={applySuggestion} />}
    </div>
  );
}

function ActivityDetail({ activity, busy, onClose, onStatus }: { activity: CalendarActivity; busy: boolean; onClose: () => void; onStatus: (status: "scheduled" | "in_progress" | "completed" | "cancelled") => void }) {
  return <div className="fixed inset-0 z-[70] flex items-end justify-end bg-black/30 p-0 backdrop-blur-sm md:p-5" role="dialog" aria-modal="true"><div className="h-full w-full max-w-lg overflow-y-auto bg-white p-7 shadow-2xl md:h-auto md:max-h-[calc(100vh-2.5rem)] md:rounded-3xl"><div className="flex items-start justify-between gap-5"><div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activityColors[activity.activity_type]}`}>{activityLabels[activity.activity_type]}</span><h2 className="mt-4 text-3xl font-bold text-on-surface">{activity.title}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-low text-secondary" aria-label="Cerrar"><span className="material-symbols-outlined">close</span></button></div><div className="mt-7 space-y-4 text-sm"><DetailRow icon="schedule" label="Fecha y hora" value={`${formatDateTime(activity.starts_at)} — ${formatTime(activity.ends_at)}`} /><DetailRow icon="folder_open" label="Proyecto" value={activity.project_title ?? "Actividad sin proyecto"} /><DetailRow icon="corporate_fare" label="Departamento" value={activity.department_name ?? "Sin departamento"} /><DetailRow icon="engineering" label="Responsable" value={activity.supervisor_name ?? activity.organizer_name} /><DetailRow icon="location_on" label="Ubicación" value={activity.location ?? activity.property_name ?? "Por definir"} /><DetailRow icon="info" label="Estado" value={statusLabels[activity.status] ?? activity.status} /></div>{activity.description && <div className="mt-6 rounded-2xl bg-surface-container-low p-5 text-sm leading-relaxed text-secondary">{activity.description}</div>}<div className="mt-7 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => onStatus("in_progress")} className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-secondary disabled:opacity-50">Iniciar</button><button type="button" disabled={busy} onClick={() => onStatus("completed")} className="rounded-full bg-success/10 px-4 py-2 text-sm font-semibold text-success disabled:opacity-50">Completar</button><button type="button" disabled={busy} onClick={() => onStatus("cancelled")} className="rounded-full bg-error/10 px-4 py-2 text-sm font-semibold text-error disabled:opacity-50">Cancelar</button></div></div></div>;
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="flex gap-3"><span className="material-symbols-outlined text-primary">{icon}</span><div><p className="text-xs font-bold uppercase tracking-wider text-secondary">{label}</p><p className="mt-1 font-semibold text-on-surface">{value}</p></div></div>;
}

function ActivityForm({ form, setForm, projects, departments, supervisors, members, suggestions, busy, isAdmin, onClose, onSubmit, onRecommend, onSuggestion }: {
  form: ReturnType<typeof createDefaultForm>;
  setForm: Dispatch<SetStateAction<ReturnType<typeof createDefaultForm>>>;
  projects: CalendarProject[];
  departments: CalendarDepartment[];
  supervisors: CalendarSupervisor[];
  members: CalendarProjectMember[];
  suggestions: AvailabilitySlot[];
  busy: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onRecommend: () => void;
  onSuggestion: (slot: AvailabilitySlot) => void;
}) {
  const toggleParticipant = (userId: string) => setForm((current) => ({ ...current, participantIds: current.participantIds.includes(userId) ? current.participantIds.filter((id) => id !== userId) : [...current.participantIds, userId] }));
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><form onSubmit={onSubmit} className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Agenda nativa del CDE</p><h2 className="mt-2 text-3xl font-bold text-on-surface">Nueva actividad</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-surface-container-low text-secondary" aria-label="Cerrar"><span className="material-symbols-outlined">close</span></button></div><div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2"><label className="md:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Título</span><input required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Ej. Visita de inspección a Villa Demo" /></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Tipo de actividad</span><select value={form.activityType} onChange={(event) => setForm((current) => ({ ...current, activityType: event.target.value as CalendarActivityType }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3">{Object.entries(activityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Proyecto</span><select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value, participantIds: [] }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Actividad interna sin proyecto</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.project_code} · {project.title}</option>)}</select></label>{isAdmin && <label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Departamento</span><select value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value, supervisorId: "" }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Agenda administrativa</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>}<label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Responsable</span><select value={form.supervisorId} onChange={(event) => setForm((current) => ({ ...current, supervisorId: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value="">Sin responsable asignado</option>{supervisors.map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.display_name}</option>)}</select></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Fecha</span><input required type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3" /></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Hora de inicio</span><input required type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3" /></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Duración</span><select value={form.durationMinutes} onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3"><option value={30}>30 minutos</option><option value={60}>1 hora</option><option value={90}>1 hora 30 minutos</option><option value={120}>2 horas</option><option value={180}>3 horas</option></select></label><label><span className="text-xs font-bold uppercase tracking-wider text-secondary">Ubicación</span><input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Propiedad, sala o ubicación" /></label><label className="md:col-span-2"><span className="text-xs font-bold uppercase tracking-wider text-secondary">Descripción</span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-outline-variant/40 px-4 py-3" placeholder="Objetivo, temas o instrucciones" /></label></div>{form.projectId && members.length > 0 && <fieldset className="mt-6 rounded-2xl border border-outline-variant/30 p-5"><legend className="px-2 text-xs font-bold uppercase tracking-wider text-secondary">Participantes del proyecto</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{members.map((member) => <label key={member.user_id} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3"><input type="checkbox" checked={form.participantIds.includes(member.user_id)} onChange={() => toggleParticipant(member.user_id)} /><span className="text-sm"><strong className="block text-on-surface">{member.profiles?.display_name ?? member.profiles?.email ?? "Miembro"}</strong><span className="text-xs text-secondary">{member.membership_role.replaceAll("_", " ")}</span></span></label>)}</div></fieldset>}{suggestions.length > 0 && <section className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-5"><p className="text-sm font-bold text-on-surface">Horarios disponibles recomendados</p><div className="mt-3 flex flex-wrap gap-2">{suggestions.map((slot) => <button type="button" key={slot.starts_at} onClick={() => onSuggestion(slot)} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm">{formatDateTime(slot.starts_at)}</button>)}</div></section>}<div className="mt-7 flex flex-col-reverse gap-3 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between"><button type="button" disabled={busy} onClick={onRecommend} className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/40 px-5 py-3 text-sm font-semibold text-secondary disabled:opacity-50"><span className="material-symbols-outlined text-[20px]">schedule</span>Recomendar horario</button><div className="flex gap-3"><button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm font-semibold text-secondary">Cancelar</button><button type="submit" disabled={busy} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50">{busy ? "Guardando…" : "Programar actividad"}</button></div></div></form></div>;
}
