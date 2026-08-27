import { requireSupabase } from "./supabase";
import { uploadProjectDocument } from "./cde-data";

export type CalendarActivityType = "directorio" | "reunion" | "cita_propietario" | "cita_arquitecto" | "cita_contratista" | "visita" | "inspeccion" | "revision" | "seguimiento" | "otra";
export type CalendarActivityStatus = "draft" | "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
export type CalendarVisibility = "department_internal" | "project_members" | "participants";

export interface CalendarActivity {
  id: string;
  project_id: string | null;
  project_code: string | null;
  project_title: string | null;
  property_name: string | null;
  department_id: string | null;
  department_name: string | null;
  organizer_id: string;
  organizer_name: string;
  assigned_supervisor_id: string | null;
  supervisor_name: string | null;
  activity_type: CalendarActivityType;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  status: CalendarActivityStatus;
  visibility: CalendarVisibility;
  contractor_request_id: string | null;
  inspection_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarSupervisor {
  id: string;
  display_name: string;
  email: string;
  department_id: string | null;
  role_key: string;
}

export interface AvailabilitySlot {
  starts_at: string;
  ends_at: string;
}

export interface CalendarDepartment {
  id: string;
  slug: string;
  name: string;
}

export interface CalendarProjectMember {
  user_id: string;
  membership_role: string;
  profiles?: { display_name?: string; email?: string } | null;
}

export interface CreateCalendarActivityInput {
  projectId?: string | null;
  departmentId?: string | null;
  assignedSupervisorId?: string | null;
  activityType: CalendarActivityType;
  title: string;
  startsAt: string;
  endsAt: string;
  description?: string | null;
  allDay?: boolean;
  location?: string | null;
  visibility?: CalendarVisibility;
  contractorRequestId?: string | null;
  inspectionId?: string | null;
}

export interface ProjectSupervisorAssignment {
  id: string;
  project_id: string;
  supervisor_id: string;
  assigned_by: string;
  is_primary: boolean;
  status: "active" | "revoked";
  assigned_at: string;
  revoked_at: string | null;
  notes: string | null;
  profiles?: { display_name?: string; email?: string } | null;
}

export interface EnforcementAction {
  id: string;
  project_id: string;
  activity_id: string | null;
  incident_id: string | null;
  action_type: "amonestacion" | "sancion";
  status: "draft" | "issued" | "responded" | "appealed" | "resolved" | "cancelled";
  title: string;
  description: string;
  recipient_id: string | null;
  issued_by: string | null;
  approved_by: string | null;
  due_at: string | null;
  issued_at: string | null;
  resolved_at: string | null;
  resolution: string | null;
  created_by: string;
  created_at: string;
}

function throwCalendarError(error: { message?: string; details?: string | null } | null) {
  if (!error) return;
  if (error.message?.includes("CALENDAR_CONFLICT")) {
    const conflict = new Error("La fecha u hora seleccionada ya está ocupada para este proyecto o supervisor.");
    conflict.name = "CalendarConflictError";
    throw conflict;
  }
  throw new Error(error.message || "No fue posible completar la operación de calendario.");
}

export async function getCalendarActivities(input: { from: string; to: string; departmentId?: string | null; projectId?: string | null }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("get_calendar_activities", {
    p_from: input.from,
    p_to: input.to,
    p_department_id: input.departmentId ?? null,
    p_project_id: input.projectId ?? null,
  });
  throwCalendarError(error);
  return (data ?? []) as CalendarActivity[];
}

export async function createCalendarActivity(input: CreateCalendarActivityInput) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("create_calendar_activity", {
    p_project_id: input.projectId ?? null,
    p_department_id: input.departmentId ?? null,
    p_assigned_supervisor_id: input.assignedSupervisorId ?? null,
    p_activity_type: input.activityType,
    p_title: input.title,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_description: input.description ?? null,
    p_all_day: input.allDay ?? false,
    p_location: input.location ?? null,
    p_visibility: input.visibility ?? "project_members",
    p_contractor_request_id: input.contractorRequestId ?? null,
    p_inspection_id: input.inspectionId ?? null,
  });
  throwCalendarError(error);
  return data as CalendarActivity;
}

export async function rescheduleCalendarActivity(activityId: string, startsAt: string, endsAt: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("reschedule_calendar_activity", { p_activity_id: activityId, p_starts_at: startsAt, p_ends_at: endsAt });
  throwCalendarError(error);
  return data as CalendarActivity;
}

export async function updateCalendarActivityStatus(activityId: string, status: "scheduled" | "in_progress" | "completed" | "cancelled") {
  const client = requireSupabase();
  const { data, error } = await client.rpc("update_calendar_activity_status", { p_activity_id: activityId, p_status: status });
  throwCalendarError(error);
  return data as CalendarActivity;
}

export async function findAvailableActivitySlots(input: { projectId?: string | null; supervisorId?: string | null; departmentId?: string | null; durationMinutes: number; startDate: string; limit?: number }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("find_available_activity_slots", {
    p_project_id: input.projectId ?? null,
    p_supervisor_id: input.supervisorId ?? null,
    p_department_id: input.departmentId ?? null,
    p_duration_minutes: input.durationMinutes,
    p_start_date: input.startDate,
    p_limit: input.limit ?? 5,
  });
  throwCalendarError(error);
  return (data ?? []) as AvailabilitySlot[];
}

export async function listCalendarSupervisors(departmentId?: string | null) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_calendar_supervisors", { p_department_id: departmentId ?? null });
  throwCalendarError(error);
  return (data ?? []) as CalendarSupervisor[];
}

export async function getCalendarDepartments() {
  const client = requireSupabase();
  const { data, error } = await client.from("departments").select("id,slug,name").eq("is_active", true).order("name");
  if (error) throw error;
  return (data ?? []) as CalendarDepartment[];
}

export async function getCalendarProjects() {
  const client = requireSupabase();
  const { data, error } = await client.from("projects").select("id,project_code,title,property_id,properties(name,address)").neq("cde_status", "archive").order("title");
  if (error) throw error;
  return (data ?? []) as Array<{ id: string; project_code: string; title: string; property_id: string; properties?: { name?: string; address?: string } | null }>;
}

export async function getCalendarProjectMembers(projectId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("project_members").select("user_id,membership_role,profiles(display_name,email)").eq("project_id", projectId).eq("status", "active").order("membership_role");
  if (error) throw error;
  return (data ?? []) as CalendarProjectMember[];
}

export async function addCalendarActivityParticipant(activityId: string, userId: string, participantRole: "attendee" | "observer" = "attendee") {
  const client = requireSupabase();
  const { data, error } = await client.rpc("add_calendar_activity_participant", { p_activity_id: activityId, p_user_id: userId, p_participant_role: participantRole });
  throwCalendarError(error);
  return data;
}

export async function getActiveProjectSupervisor(projectId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("project_supervisor_assignments").select("*,profiles:supervisor_id(display_name,email)").eq("project_id", projectId).eq("status", "active").eq("is_primary", true).maybeSingle();
  if (error) throw error;
  return data as ProjectSupervisorAssignment | null;
}

export async function assignProjectSupervisor(projectId: string, supervisorId: string, notes?: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("assign_project_supervisor", { p_project_id: projectId, p_supervisor_id: supervisorId, p_notes: notes ?? null });
  throwCalendarError(error);
  return data as ProjectSupervisorAssignment;
}

export async function scheduleProjectInspection(input: { requestId: string; supervisorId: string; startsAt: string; endsAt: string; title: string; description?: string }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("schedule_project_inspection", {
    p_request_id: input.requestId,
    p_supervisor_id: input.supervisorId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_title: input.title,
    p_description: input.description ?? null,
  });
  throwCalendarError(error);
  return data as CalendarActivity;
}

export async function uploadActivityEvidence(input: { activityId: string; projectId: string; title: string; file: File }) {
  const uploaded = await uploadProjectDocument({ projectId: input.projectId, title: input.title, category: "fotografia", file: input.file, visibleToOwner: false });
  const client = requireSupabase();
  const { error } = await client.rpc("link_activity_document", { p_activity_id: input.activityId, p_document_id: uploaded.document.id, p_relation_type: "evidence" });
  throwCalendarError(error);
  return uploaded;
}

export async function createProjectIncident(input: { projectId: string; activityId?: string | null; severity: "low" | "medium" | "high" | "critical"; title: string; description: string; assignedTo?: string | null }) {
  const client = requireSupabase();
  const user = (await client.auth.getUser()).data.user;
  if (!user) throw new Error("La sesión no está disponible.");
  const { data, error } = await client.from("incidents").insert({
    project_id: input.projectId,
    reporter_id: user.id,
    assigned_to: input.assignedTo ?? null,
    severity: input.severity,
    status: "open",
    title: input.title.trim(),
    description: input.description.trim(),
  }).select("*").single();
  if (error) throw error;
  if (input.activityId) {
    await client.from("workflow_events").insert({ project_id: input.projectId, actor_id: user.id, actor_role: "control_obras", event_type: "incident_reported_from_activity", entity_type: "incident", entity_id: data.id, comment: input.title, metadata: { activity_id: input.activityId } });
  }
  return data;
}

export async function getProjectEnforcementActions(projectId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("project_enforcement_actions").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EnforcementAction[];
}

export async function createEnforcementAction(input: { projectId: string; activityId?: string | null; incidentId?: string | null; actionType: "amonestacion" | "sancion"; title: string; description: string; recipientId?: string | null; dueAt?: string | null }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("create_enforcement_action", {
    p_project_id: input.projectId,
    p_activity_id: input.activityId ?? null,
    p_incident_id: input.incidentId ?? null,
    p_action_type: input.actionType,
    p_title: input.title,
    p_description: input.description,
    p_recipient_id: input.recipientId ?? null,
    p_due_at: input.dueAt ?? null,
  });
  throwCalendarError(error);
  return data as EnforcementAction;
}
