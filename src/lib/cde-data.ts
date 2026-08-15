import { requireSupabase } from "./supabase";
import type { DocumentAnnotation, DocumentRecord, DocumentVersion, ProjectRecord, PropertyRecord } from "./cde-types";

export interface PortfolioRow extends PropertyRecord {
  projects: ProjectRecord[];
}

export interface ProjectWorkspace {
  project: ProjectRecord;
  property: PropertyRecord | null;
  documents: DocumentRecord[];
  events: Array<{ id: string; event_type: string; comment: string | null; created_at: string; actor_role: string | null }>;
}

export async function getOwnerPortfolio(userId: string): Promise<PortfolioRow[]> {
  const client = requireSupabase();
  const { data: properties, error: propertyError } = await client
    .from("properties")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true });
  if (propertyError) throw propertyError;
  const propertyRows = (properties ?? []) as PropertyRecord[];
  if (!propertyRows.length) return [];
  const { data: projects, error: projectError } = await client
    .from("projects")
    .select("*")
    .in("property_id", propertyRows.map((property) => property.id))
    .order("created_at", { ascending: true });
  if (projectError) throw projectError;
  const projectRows = (projects ?? []) as ProjectRecord[];
  return propertyRows.map((property) => ({
    ...property,
    projects: projectRows.filter((project) => project.property_id === property.id),
  }));
}

export async function getProjectWorkspace(projectId: string): Promise<ProjectWorkspace> {
  const client = requireSupabase();
  const { data: project, error: projectError } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) throw new Error("El proyecto solicitado no existe o no está disponible para este usuario.");
  const typedProject = project as ProjectRecord;
  const [{ data: property }, { data: documents }, { data: events }] = await Promise.all([
    client.from("properties").select("*").eq("id", typedProject.property_id).maybeSingle(),
    client.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: true }),
    client.from("workflow_events").select("id,event_type,comment,created_at,actor_role").eq("project_id", projectId).order("created_at", { ascending: false }).limit(20),
  ]);
  return {
    project: typedProject,
    property: (property as PropertyRecord | null) ?? null,
    documents: (documents as DocumentRecord[] | null) ?? [],
    events: events ?? [],
  };
}

export async function getAdminProjects(): Promise<ProjectRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("projects").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRecord[];
}

export function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date(value));
}


export async function getDocumentViewerData(documentId: string) {
  const client = requireSupabase();
  const { data: document, error: documentError } = await client.from("documents").select("*").eq("id", documentId).maybeSingle();
  if (documentError) throw documentError;
  if (!document) throw new Error("Documento no disponible para este usuario.");
  const { data: versions, error: versionsError } = await client.from("document_versions").select("*").eq("document_id", documentId).order("version_number", { ascending: false });
  if (versionsError) throw versionsError;
  const current = (versions as DocumentVersion[] | null)?.[0] ?? null;
  if (!current) return { document: document as DocumentRecord, version: null, signedUrl: null, annotations: [] as DocumentAnnotation[] };
  const { data: signed, error: signedError } = await client.storage.from("cde-documents").createSignedUrl(current.storage_path, 3600);
  if (signedError) throw signedError;
  const { data: annotations, error: annotationsError } = await client.from("document_annotations").select("*").eq("document_version_id", current.id).order("created_at", { ascending: true });
  if (annotationsError) throw annotationsError;
  return { document: document as DocumentRecord, version: current, signedUrl: signed.signedUrl, annotations: (annotations ?? []) as DocumentAnnotation[] };
}

export async function createPdfAnnotation(input: { documentVersionId: string; authorId: string; pageNumber: number; x: number; y: number; content: string }) {
  const client = requireSupabase();
  const { data, error } = await client.from("document_annotations").insert({ document_version_id: input.documentVersionId, author_id: input.authorId, page_number: input.pageNumber, annotation_type: "comment", x: input.x, y: input.y, content: input.content, visibility: "project_members", status: "open" }).select("*").single();
  if (error) throw error;
  return data as DocumentAnnotation;
}

export async function getFirstProjectForUser(userId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from("project_members").select("project_id").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.project_id ?? null;
}
