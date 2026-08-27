import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { createOwnerProjectWorkflow, getOwnerPortfolio, uploadProjectDocument, type PortfolioRow } from "../lib/cde-data";

type ProjectType = "obra_nueva" | "remodelacion" | "ampliacion" | "renovacion" | "area_anexa" | "otro";

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  obra_nueva: "Obra nueva",
  remodelacion: "Remodelación",
  ampliacion: "Ampliación",
  renovacion: "Renovación",
  area_anexa: "Área anexa",
  otro: "Otro",
};

const PHASE_LABELS: Record<string, string> = {
  autorizacion_inicial: "Autorización inicial",
  anteproyecto: "Anteproyecto",
  revision_tecnica: "Revisión técnica",
  planos_tecnicos: "Planos técnicos",
  inicio_obra: "Inicio de obra",
  obra_activa: "Obra activa",
  cierre: "Cierre",
  archivo: "Archivo",
};

const DEMO_OWNER_EMAIL = "owner.demo@costasur.com";

function getDemoProperties(ownerId: string): PortfolioRow[] {
  return [
    { id: "demo-property-tamarindo-13", property_code: "TAMARINDO-13", property_type: "villa", name: "Tamarindo #13", address: "Casa de Campo · La Romana", owner_user_id: ownerId, area_m2: 420, latitude: null, longitude: null, status: "active", projects: [] },
    { id: "demo-property-caleton-57", property_code: "CALETON-57", property_type: "terreno", name: "Solar Caleton #57", address: "Casa de Campo · La Romana", owner_user_id: ownerId, area_m2: 510, latitude: null, longitude: null, status: "active", projects: [] },
    { id: "demo-property-las-canas-24", property_code: "LAS-CAÑAS-I-24", property_type: "villa", name: "Las Cañas I #24", address: "Casa de Campo · La Romana", owner_user_id: ownerId, area_m2: 385, latitude: null, longitude: null, status: "active", projects: [] },
  ];
}

export function OwnerDashboard() {
  const { profile } = useSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [authorizationFile, setAuthorizationFile] = useState<File | null>(null);
  const [form, setForm] = useState<{ propertyId: string; projectCode: string; title: string; projectType: ProjectType; architectEmail: string }>({
    propertyId: "",
    projectCode: "",
    title: "",
    projectType: "obra_nueva",
    architectEmail: "architect.demo@costasur.com",
  });
  const isDemoOwner = profile?.is_demo === true && profile.email.toLowerCase() === DEMO_OWNER_EMAIL;
  const visiblePortfolio = isDemoOwner && profile ? [...portfolio, ...getDemoProperties(profile.id)] : portfolio;

  const loadPortfolio = async () => {
    if (!profile?.id) return;
    setLoading(true);
    setError("");
    try {
      setPortfolio(await getOwnerPortfolio(profile.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar tus propiedades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPortfolio(); }, [profile?.id]);

  const openCreate = () => {
    const firstProperty = visiblePortfolio[0];
    if (!firstProperty) return;
    setForm({ propertyId: firstProperty.id, projectCode: `${firstProperty.property_code}-PROY-${String(Date.now()).slice(-6)}`, title: "", projectType: "obra_nueva", architectEmail: "architect.demo@costasur.com" });
    setAuthorizationFile(null);
    setCreateError("");
    setShowCreate(true);
  };

  useEffect(() => {
    if (searchParams.get("nuevo") === "1" && visiblePortfolio.length > 0 && !showCreate) openCreate();
  }, [searchParams, visiblePortfolio.length, showCreate]);

  const closeCreate = () => {
    setShowCreate(false);
    setCreateError("");
    setAuthorizationFile(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("nuevo");
    setSearchParams(nextParams, { replace: true });
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedProperty = portfolio.find((item) => item.id === form.propertyId);
    const generatedProjectCode = form.projectCode.trim() || `${selectedProperty?.property_code ?? "PROPIEDAD"}-PROY-${String(Date.now()).slice(-6)}`;
    const generatedProjectTitle = form.title.trim() || `Proyecto ${selectedProperty?.name ?? "Costasur"}`;
    if (!form.propertyId || !form.architectEmail.trim() || !authorizationFile) {
      setCreateError("Completa la propiedad, el correo del arquitecto y adjunta la carta de autorización.");
      return;
    }
    if (form.propertyId.startsWith("demo-property-")) {
      setCreateError("Esta propiedad es una demostración visual; utiliza la propiedad registrada para crear el expediente.");
      return;
    }
    if (authorizationFile.size > 50 * 1024 * 1024) {
      setCreateError("La carta de autorización supera el límite de 50 MB.");
      return;
    }
    setSaving(true);
    setCreateError("");
    try {
      const project = await createOwnerProjectWorkflow({ propertyId: form.propertyId, projectCode: generatedProjectCode, title: generatedProjectTitle, projectType: form.projectType, architectEmail: form.architectEmail.trim() });
      await uploadProjectDocument({ projectId: project.id, category: "autorizacion", title: `Carta de autorización — ${generatedProjectTitle}`, file: authorizationFile, visibleToOwner: true });
      await loadPortfolio();
      closeCreate();
      navigate(`/propietario/mis-propiedades/${project.id}`);
    } catch (reason) {
      console.error("[OwnerDashboard] workflow creation failed", reason);
      const message = reason && typeof reason === "object" && "message" in reason ? String((reason as { message?: unknown }).message ?? "") : "";
      setCreateError(message || "No fue posible crear el expediente y registrar la carta de autorización.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-secondary mb-3">Portal del propietario</p>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Mis Propiedades</h1>
          <p className="text-base text-secondary mt-3">Historial, estado físico y documentos de tus propiedades autorizadas.</p>
        </div>
        <div className="text-right text-sm text-secondary"><p>Sesión activa</p><p className="font-semibold text-primary">{profile?.display_name ?? "Propietario"}</p></div>
      </div>

      {loading && <div className="glass-panel p-8 text-center text-secondary">Cargando inventario persistente…</div>}
      {error && <div className="glass-panel p-6 border border-error/30 text-error">{error}</div>}
      {!loading && !error && !visiblePortfolio.length && <div className="glass-panel p-10 text-center"><span className="material-symbols-outlined text-4xl text-warning mb-4">home_work</span><h2 className="text-2xl font-semibold text-on-surface">Aún no tienes propiedades autorizadas</h2><p className="mt-3 text-secondary">El Administrador General debe validar tu propiedad y activar tu membresía del CDE.</p></div>}

      {!loading && !error && visiblePortfolio.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {visiblePortfolio.map((property) => <PropertyCard key={property.id} property={property} onOpenProject={(projectId) => navigate(`/propietario/mis-propiedades/${projectId}`)} />)}
        </section>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
          <form onSubmit={submitCreate} className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-white p-7 md:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">Nuevo expediente</p><h2 id="new-project-title" className="text-2xl font-bold text-on-surface mt-2">Iniciar proyecto en mi propiedad</h2><p className="text-sm text-secondary mt-2">Costasur generará automáticamente el nombre y número del expediente. La carta será revisada antes de habilitar al arquitecto.</p></div><button type="button" onClick={closeCreate} className="p-2 rounded-full text-secondary hover:bg-surface-container-low" aria-label="Cerrar"><span className="material-symbols-outlined">close</span></button></div>
            <div className="space-y-5 mt-7">
              <label className="block text-sm font-medium text-on-surface">Propiedad<select value={form.propertyId} onChange={(event) => setForm((current) => ({ ...current, propertyId: event.target.value }))} className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none focus:border-primary">{visiblePortfolio.map((item) => <option key={item.id} value={item.id}>{item.property_code} — {item.name}</option>)}</select></label>
              <label className="block text-sm font-medium text-on-surface">Correo del arquitecto<input required type="email" value={form.architectEmail} onChange={(event) => setForm((current) => ({ ...current, architectEmail: event.target.value }))} placeholder="architect@costasur.com" className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-white px-4 py-3 outline-none focus:border-primary" /><span className="block text-xs text-secondary mt-2">El arquitecto quedará pendiente hasta que Arquitectura apruebe la carta.</span></label>
              <label className="block text-sm font-medium text-on-surface">Carta de autorización<input required type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg" onChange={(event: ChangeEvent<HTMLInputElement>) => setAuthorizationFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low px-4 py-4 text-sm" /><span className="block text-xs text-secondary mt-2">Documento obligatorio · PDF, DOCX o imagen · máximo 50 MB</span></label>
              {authorizationFile && <p className="text-sm text-primary flex items-center gap-2"><span className="material-symbols-outlined text-base">attach_file</span>{authorizationFile.name}</p>}
            </div>
            {createError && <p className="mt-5 text-sm text-error">{createError}</p>}
            <div className="flex justify-end gap-3 mt-7"><button type="button" onClick={closeCreate} className="rounded-full border border-outline-variant/40 px-5 py-3 text-sm font-semibold text-secondary hover:bg-surface-container-low">Cancelar</button><button type="submit" disabled={saving} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">{saving ? "Iniciando obra…" : "Iniciar obra"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, onOpenProject }: { key?: string; property: PortfolioRow; onOpenProject: (projectId: string) => void }) {
  const project = property.projects[0];
  return <article className="glass-panel overflow-hidden border border-outline-variant/30 rounded-[2rem] bg-white"><div className="h-44 bg-surface-container-low relative overflow-hidden"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85" alt={property.name} className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" /><div className="absolute bottom-5 left-6 text-white"><p className="text-xs uppercase tracking-[0.2em] opacity-80">Propiedad registrada desde el día uno</p><h2 className="text-2xl font-bold mt-2">{property.name}</h2></div></div><div className="p-6 md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-secondary">{property.property_code}</p><p className="text-sm text-secondary mt-2 flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span>{property.address ?? "Ubicación pendiente de registrar"}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-success/10 text-success px-3 py-1.5 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-success" />{property.property_type === "terreno" ? "Lote vacío" : "Construcción existente"}</span></div><div className="mt-5 flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-5">{project ? <button type="button" onClick={() => onOpenProject(project.id)} className="group flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-primary transition-colors hover:text-primary/75"><span>Entrar al proyecto</span><span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span></button> : <span className="text-sm text-warning">Sin expediente de obra registrado todavía.</span>}</div></div></article>;
}

function Progress({ label, value }: { label: string; value: number }) {
  return <div className="mt-4"><div className="flex items-center justify-between text-sm mb-2"><span className="text-secondary">{label}</span><span className="font-bold text-on-surface">{value.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-surface-container-low overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div></div>;
}
