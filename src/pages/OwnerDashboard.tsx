import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { getOwnerPortfolio, type PortfolioRow } from "../lib/cde-data";

export function OwnerDashboard() {
  const { profile } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    getOwnerPortfolio(profile.id)
      .then(setPortfolio)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No fue posible cargar tus propiedades."))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const property = portfolio[0];
  const project = property?.projects[0];
  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-secondary mb-3">Portal del propietario</p>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight">Mis Propiedades</h1>
          <p className="text-base text-secondary mt-3">Seguimiento visual, financiero y documental de tus propiedades autorizadas.</p>
        </div>
        <div className="text-right text-sm text-secondary">
          <p>Sesión activa</p>
          <p className="font-semibold text-primary">{profile?.display_name ?? "Propietario"}</p>
        </div>
      </div>

      {loading && <div className="glass-panel p-8 text-center text-secondary">Cargando expediente persistente…</div>}
      {error && <div className="glass-panel p-6 border border-error/30 text-error">{error}</div>}
      {!loading && !error && !property && (
        <div className="glass-panel p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-warning mb-4">home_work</span>
          <h2 className="text-2xl font-semibold text-on-surface">Aún no tienes propiedades autorizadas</h2>
          <p className="mt-3 text-secondary">El Administrador General debe validar tu propiedad y activar tu membresía del CDE.</p>
        </div>
      )}

      {!loading && property && (
        <section className="space-y-8">
          <div className="glass-panel overflow-hidden border border-outline-variant/30 rounded-[2rem] bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 min-h-[280px] bg-surface-container-low relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85" alt="Villa Costasur" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">Propiedad autorizada</p>
                  <h2 className="text-3xl font-bold mt-2">{property.name}</h2>
                </div>
              </div>
              <div className="lg:col-span-7 p-7 md:p-9">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-secondary">{property.property_code}</p>
                    <p className="text-sm text-secondary mt-2 flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span>{property.address ?? "Ubicación pendiente de registrar"}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-success/10 text-success px-3 py-1.5 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-success" />Activa</span>
                </div>
                {project ? (
                  <div className="mt-9 border-t border-outline-variant/30 pt-7">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-secondary">Expediente de proyecto</p>
                        <h3 className="text-2xl font-bold text-on-surface mt-2">{project.title}</h3>
                      </div>
                      <Link to={`/propietario/mis-propiedades/${project.id}`} className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Ver expediente <span className="material-symbols-outlined text-base">arrow_forward</span></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
                      <Progress label="Avance físico" value={Number(project.progress_percent)} tone="primary" />
                      <Progress label="Avance financiero" value={Number(project.financial_progress_percent)} tone="success" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-9 rounded-2xl bg-warning/10 px-5 py-4 text-sm text-warning">El expediente de proyecto aún está pendiente de creación.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Progress({ label, value, tone }: { label: string; value: number; tone: "primary" | "success" }) {
  const color = tone === "success" ? "bg-success" : "bg-primary";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2"><span className="text-secondary">{label}</span><span className="font-bold text-on-surface">{value.toFixed(0)}%</span></div>
      <div className="h-2 rounded-full bg-surface-container-low overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
    </div>
  );
}
