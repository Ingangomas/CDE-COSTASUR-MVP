import { requireSupabase } from "./supabase";

export type GovernanceRequestType = "new_user" | "role_assignment" | "ownership_transfer";
export type GovernanceRequestStatus = "submitted" | "in_review" | "approved" | "rejected" | "cancelled";

export interface GovernanceRequest {
  id: string;
  request_type: GovernanceRequestType;
  status: GovernanceRequestStatus;
  requested_by: string;
  target_user_id: string | null;
  target_email: string | null;
  target_display_name: string | null;
  target_role: string | null;
  department_id: string | null;
  project_id: string | null;
  property_id: string | null;
  notes: string | null;
  decision_note: string | null;
  created_at: string;
  updated_at: string;
  requester?: { display_name?: string; email?: string } | null;
  project?: { title?: string; project_code?: string } | null;
  property?: { name?: string; property_code?: string } | null;
};

export async function listGovernanceRequests() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("governance_requests")
    .select("*, requester:profiles!governance_requests_requested_by_fkey(display_name,email), project:projects(title,project_code), property:properties(name,property_code)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GovernanceRequest[];
}

export async function createGovernanceRequest(input: Pick<GovernanceRequest, "request_type" | "target_user_id" | "target_email" | "target_display_name" | "target_role" | "department_id" | "project_id" | "property_id" | "notes">) {
  const client = requireSupabase();
  const { data: sessionResult } = await client.auth.getSession();
  const requestedBy = sessionResult.session?.user.id;
  if (!requestedBy) throw new Error("Debes iniciar sesión para enviar una solicitud.");
  const { data, error } = await client.from("governance_requests").insert({ ...input, requested_by: requestedBy }).select("*").single();
  if (error) throw error;
  return data as GovernanceRequest;
}

export async function resolveGovernanceRequest(requestId: string, status: "approved" | "rejected" | "cancelled", decisionNote?: string) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("resolve_governance_request", {
    p_request_id: requestId,
    p_status: status,
    p_decision_note: decisionNote ?? null,
  });
  if (error) throw error;
  return data as GovernanceRequest;
}
